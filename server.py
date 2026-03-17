from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend.env')

# MongoDB connection
mongo_url = os.environ["mongodb://localhost:27017"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["test_database"]]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', "allin_poker_super_secret_key_2024")
JWT_ALGORITHM = \"HS256\"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Stripe Config
STRIPE_API_KEY = os.environ.get(sk_test_emergent)

# Create the main app
app = FastAPI(title=\"ALLin Poker API\")
api_router = APIRouter(prefix=\"/api\")
security = HTTPBearer(auto_error=False)

# Coin Packages - FIXED PRICES (server-side only)
COIN_PACKAGES = {
    \"starter\": {\"name\": \"Starter Pack\", \"coins\": 10000, \"price\": 4.99, \"bonus\": 0},
    \"popular\": {\"name\": \"Popular Pack\", \"coins\": 50000, \"price\": 19.99, \"bonus\": 5000},
    \"premium\": {\"name\": \"Premium Pack\", \"coins\": 150000, \"price\": 49.99, \"bonus\": 25000},
    \"vip\": {\"name\": \"VIP Pack\", \"coins\": 500000, \"price\": 99.99, \"bonus\": 100000}
}

# =============== MODELS ===============
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    coins: int = 10000
    role: str = \"user\"  # user, admin, administrator
    created_at: datetime
    total_games: int = 0
    total_wins: int = 0
    total_earnings: int = 0

class TableCreate(BaseModel):
    name: str
    small_blind: int
    big_blind: int
    min_buy_in: int
    max_buy_in: int
    max_players: int = 9

class PokerTable(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    table_id: str
    name: str
    small_blind: int
    big_blind: int
    min_buy_in: int
    max_buy_in: int
    max_players: int
    current_players: int = 0
    status: str = \"waiting\"  # waiting, playing, paused
    created_by: str
    created_at: datetime
    players: List[Dict[str, Any]] = []

class TournamentCreate(BaseModel):
    name: str
    buy_in: int
    starting_chips: int
    max_players: int
    start_time: datetime
    prize_pool_percentage: int = 100

class Tournament(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    tournament_id: str
    name: str
    buy_in: int
    starting_chips: int
    max_players: int
    current_players: int = 0
    start_time: datetime
    status: str = \"registration\"  # registration, running, finished, cancelled
    prize_pool: int = 0
    prize_pool_percentage: int
    created_by: str
    created_at: datetime
    participants: List[str] = []

class FriendRequest(BaseModel):
    request_id: str
    from_user_id: str
    to_user_id: str
    status: str = \"pending\"  # pending, accepted, rejected
    created_at: datetime

class ChatMessage(BaseModel):
    message_id: str
    table_id: str
    user_id: str
    user_name: str
    message: str
    created_at: datetime

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    transaction_id: str
    user_id: str
    session_id: str
    package_id: str
    amount: float
    currency: str
    coins: int
    bonus_coins: int
    payment_method: str  # stripe, paypal
    status: str  # pending, completed, failed, expired
    created_at: datetime
    completed_at: Optional[datetime] = None

class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    picture: Optional[str]
    total_wins: int
    total_earnings: int
    rank: int

# =============== AUTH HELPERS ===============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        \"user_id\": user_id,
        \"exp\": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None), request: Request = None) -> Optional[User]:
    token = None
    
    # Check Authorization header
    if authorization and authorization.startswith(\"Bearer \"):
        token = authorization.split(\" \")[1]
    
    # Check cookies
    if not token and request:
        token = request.cookies.get(\"session_token\")
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get(\"user_id\")
        if not user_id:
            return None
        
        user_doc = await db.users.find_one({\"user_id\": user_id}, {\"_id\": 0})
        if not user_doc:
            return None
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def require_auth(authorization: Optional[str] = Header(None), request: Request = None) -> User:
    user = await get_current_user(authorization, request)
    if not user:
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    return user

async def require_admin(authorization: Optional[str] = Header(None), request: Request = None) -> User:
    user = await require_auth(authorization, request)
    if user.role not in [\"admin\", \"administrator\"]:
        raise HTTPException(status_code=403, detail=\"Admin access required\")
    return user

# =============== AUTH ROUTES ===============
@api_router.post(\"/auth/register\")
async def register(data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({\"email\": data.email})
    if existing:
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    
    user_id = f\"user_{uuid.uuid4().hex[:12]}\"
    user_doc = {
        \"user_id\": user_id,
        \"email\": data.email,
        \"name\": data.name,
        \"password_hash\": hash_password(data.password),
        \"picture\": f\"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}\",
        \"coins\": 10000,  # Starting coins
        \"role\": \"user\",
        \"created_at\": datetime.now(timezone.utc).isoformat(),
        \"total_games\": 0,
        \"total_wins\": 0,
        \"total_earnings\": 0
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    
    user_response = {k: v for k, v in user_doc.items() if k != \"password_hash\"}
    return {\"token\": token, \"user\": user_response}

@api_router.post(\"/auth/login\")
async def login(data: UserLogin):
    user_doc = await db.users.find_one({\"email\": data.email}, {\"_id\": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail=\"Invalid credentials\")
    
    if not verify_password(data.password, user_doc.get(\"password_hash\", \"\")):
        raise HTTPException(status_code=401, detail=\"Invalid credentials\")
    
    token = create_token(user_doc[\"user_id\"])
    user_response = {k: v for k, v in user_doc.items() if k != \"password_hash\"}
    return {\"token\": token, \"user\": user_response}

@api_router.get(\"/auth/me\")
async def get_me(user: User = Depends(require_auth)):
    return user.model_dump()

@api_router.post(\"/auth/session\")
async def process_google_session(request: Request):
    \"\"\"Process Emergent Google OAuth session\"\"\"
    data = await request.json()
    session_id = data.get(\"session_id\")
    
    if not session_id:
        raise HTTPException(status_code=400, detail=\"Session ID required\")
    
    # Exchange session_id for user data from Emergent Auth
    async with httpx.AsyncClient() as client_http:
        response = await client_http.get(
            \"https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data\",
            headers={\"X-Session-ID\": session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail=\"Invalid session\")
        
        oauth_data = response.json()
    
    email = oauth_data.get(\"email\")
    name = oauth_data.get(\"name\")
    picture = oauth_data.get(\"picture\")
    
    # Check if user exists
    existing_user = await db.users.find_one({\"email\": email}, {\"_id\": 0})
    
    if existing_user:
        # Update user data
        await db.users.update_one(
            {\"email\": email},
            {\"$set\": {\"name\": name, \"picture\": picture}}
        )
        user_id = existing_user[\"user_id\"]
    else:
        # Create new user
        user_id = f\"user_{uuid.uuid4().hex[:12]}\"
        user_doc = {
            \"user_id\": user_id,
            \"email\": email,
            \"name\": name,
            \"picture\": picture or f\"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}\",
            \"coins\": 10000,
            \"role\": \"user\",
            \"created_at\": datetime.now(timezone.utc).isoformat(),
            \"total_games\": 0,
            \"total_wins\": 0,
            \"total_earnings\": 0
        }
        await db.users.insert_one(user_doc)
    
    # Create session token
    session_token = create_token(user_id)
    
    # Store session
    await db.user_sessions.insert_one({
        \"user_id\": user_id,
        \"session_token\": session_token,
        \"expires_at\": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        \"created_at\": datetime.now(timezone.utc).isoformat()
    })
    
    # Get updated user
    user_doc = await db.users.find_one({\"user_id\": user_id}, {\"_id\": 0})
    user_response = {k: v for k, v in user_doc.items() if k != \"password_hash\"}
    
    return {\"token\": session_token, \"user\": user_response}

# =============== TABLE ROUTES ===============
@api_router.get(\"/tables\", response_model=List[PokerTable])
async def get_tables():
    tables = await db.tables.find({}, {\"_id\": 0}).to_list(100)
    return tables

@api_router.get(\"/tables/{table_id}\")
async def get_table(table_id: str):
    table = await db.tables.find_one({\"table_id\": table_id}, {\"_id\": 0})
    if not table:
        raise HTTPException(status_code=404, detail=\"Table not found\")
    return table

@api_router.post(\"/tables\", response_model=PokerTable)
async def create_table(data: TableCreate, user: User = Depends(require_admin)):
    table_id = f\"table_{uuid.uuid4().hex[:8]}\"
    table_doc = {
        \"table_id\": table_id,
        \"name\": data.name,
        \"small_blind\": data.small_blind,
        \"big_blind\": data.big_blind,
        \"min_buy_in\": data.min_buy_in,
        \"max_buy_in\": data.max_buy_in,
        \"max_players\": data.max_players,
        \"current_players\": 0,
        \"status\": \"waiting\",
        \"created_by\": user.user_id,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
        \"players\": []
    }
    
    await db.tables.insert_one(table_doc)
    return PokerTable(**table_doc)

@api_router.delete(\"/tables/{table_id}\")
async def delete_table(table_id: str, user: User = Depends(require_admin)):
    result = await db.tables.delete_one({\"table_id\": table_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Table not found\")
    return {\"message\": \"Table deleted\"}

@api_router.post(\"/tables/{table_id}/join\")
async def join_table(table_id: str, buy_in: int, user: User = Depends(require_auth)):
    table = await db.tables.find_one({\"table_id\": table_id}, {\"_id\": 0})
    if not table:
        raise HTTPException(status_code=404, detail=\"Table not found\")
    
    if table[\"current_players\"] >= table[\"max_players\"]:
        raise HTTPException(status_code=400, detail=\"Table is full\")
    
    if buy_in < table[\"min_buy_in\"] or buy_in > table[\"max_buy_in\"]:
        raise HTTPException(status_code=400, detail=\"Invalid buy-in amount\")
    
    if user.coins < buy_in:
        raise HTTPException(status_code=400, detail=\"Not enough coins\")
    
    # Check if already at table
    for player in table.get(\"players\", []):
        if player[\"user_id\"] == user.user_id:
            raise HTTPException(status_code=400, detail=\"Already at this table\")
    
    # Deduct coins
    await db.users.update_one(
        {\"user_id\": user.user_id},
        {\"$inc\": {\"coins\": -buy_in}}
    )
    
    # Add player to table
    player_data = {
        \"user_id\": user.user_id,
        \"name\": user.name,
        \"picture\": user.picture,
        \"chips\": buy_in,
        \"seat\": len(table.get(\"players\", [])) + 1,
        \"status\": \"active\"
    }
    
    await db.tables.update_one(
        {\"table_id\": table_id},
        {
            \"$push\": {\"players\": player_data},
            \"$inc\": {\"current_players\": 1}
        }
    )
    
    return {\"message\": \"Joined table\", \"seat\": player_data[\"seat\"], \"chips\": buy_in}

@api_router.post(\"/tables/{table_id}/leave\")
async def leave_table(table_id: str, user: User = Depends(require_auth)):
    table = await db.tables.find_one({\"table_id\": table_id}, {\"_id\": 0})
    if not table:
        raise HTTPException(status_code=404, detail=\"Table not found\")
    
    player = None
    for p in table.get(\"players\", []):
        if p[\"user_id\"] == user.user_id:
            player = p
            break
    
    if not player:
        raise HTTPException(status_code=400, detail=\"Not at this table\")
    
    # Return chips to user
    await db.users.update_one(
        {\"user_id\": user.user_id},
        {\"$inc\": {\"coins\": player[\"chips\"]}}
    )
    
    # Remove player from table
    await db.tables.update_one(
        {\"table_id\": table_id},
        {
            \"$pull\": {\"players\": {\"user_id\": user.user_id}},
            \"$inc\": {\"current_players\": -1}
        }
    )
    
    return {\"message\": \"Left table\", \"coins_returned\": player[\"chips\"]}

# =============== TOURNAMENT ROUTES ===============
@api_router.get(\"/tournaments\", response_model=List[Tournament])
async def get_tournaments():
    tournaments = await db.tournaments.find({}, {\"_id\": 0}).to_list(100)
    return tournaments

@api_router.get(\"/tournaments/{tournament_id}\")
async def get_tournament(tournament_id: str):
    tournament = await db.tournaments.find_one({\"tournament_id\": tournament_id}, {\"_id\": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail=\"Tournament not found\")
    return tournament

@api_router.post(\"/tournaments\", response_model=Tournament)
async def create_tournament(data: TournamentCreate, user: User = Depends(require_admin)):
    tournament_id = f\"tourn_{uuid.uuid4().hex[:8]}\"
    tournament_doc = {
        \"tournament_id\": tournament_id,
        \"name\": data.name,
        \"buy_in\": data.buy_in,
        \"starting_chips\": data.starting_chips,
        \"max_players\": data.max_players,
        \"current_players\": 0,
        \"start_time\": data.start_time.isoformat(),
        \"status\": \"registration\",
        \"prize_pool\": 0,
        \"prize_pool_percentage\": data.prize_pool_percentage,
        \"created_by\": user.user_id,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
        \"participants\": []
    }
    
    await db.tournaments.insert_one(tournament_doc)
    return Tournament(**tournament_doc)

@api_router.delete(\"/tournaments/{tournament_id}\")
async def delete_tournament(tournament_id: str, user: User = Depends(require_admin)):
    result = await db.tournaments.delete_one({\"tournament_id\": tournament_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Tournament not found\")
    return {\"message\": \"Tournament deleted\"}

@api_router.post(\"/tournaments/{tournament_id}/register\")
async def register_tournament(tournament_id: str, user: User = Depends(require_auth)):
    tournament = await db.tournaments.find_one({\"tournament_id\": tournament_id}, {\"_id\": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail=\"Tournament not found\")
    
    if tournament[\"status\"] != \"registration\":
        raise HTTPException(status_code=400, detail=\"Registration closed\")
    
    if tournament[\"current_players\"] >= tournament[\"max_players\"]:
        raise HTTPException(status_code=400, detail=\"Tournament is full\")
    
    if user.user_id in tournament.get(\"participants\", []):
        raise HTTPException(status_code=400, detail=\"Already registered\")
    
    if user.coins < tournament[\"buy_in\"]:
        raise HTTPException(status_code=400, detail=\"Not enough coins\")
    
    # Deduct buy-in
    await db.users.update_one(
        {\"user_id\": user.user_id},
        {\"$inc\": {\"coins\": -tournament[\"buy_in\"]}}
    )
    
    # Add to tournament
    prize_contribution = int(tournament[\"buy_in\"] * tournament[\"prize_pool_percentage\"] / 100)
    await db.tournaments.update_one(
        {\"tournament_id\": tournament_id},
        {
            \"$push\": {\"participants\": user.user_id},
            \"$inc\": {\"current_players\": 1, \"prize_pool\": prize_contribution}
        }
    )
    
    return {\"message\": \"Registered for tournament\"}

# =============== SHOP / PAYMENTS ROUTES ===============
@api_router.get(\"/shop/packages\")
async def get_packages():
    return COIN_PACKAGES

@api_router.post(\"/shop/checkout/stripe\")
async def create_stripe_checkout(request: Request, user: User = Depends(require_auth)):
    data = await request.json()
    package_id = data.get(\"package_id\")
    origin_url = data.get(\"origin_url\")
    
    if package_id not in COIN_PACKAGES:
        raise HTTPException(status_code=400, detail=\"Invalid package\")
    
    package = COIN_PACKAGES[package_id]
    
    if not origin_url:
        raise HTTPException(status_code=400, detail=\"Origin URL required\")
    
    # Create URLs
    success_url = f\"{origin_url}/shop/success?session_id={{CHECKOUT_SESSION_ID}}\"
    cancel_url = f\"{origin_url}/shop\"
    
    # Create Stripe checkout
    host_url = str(request.base_url)
    webhook_url = f\"{host_url}api/webhook/stripe\"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=float(package[\"price\"]),
        currency=\"usd\",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            \"user_id\": user.user_id,
            \"package_id\": package_id,
            \"coins\": str(package[\"coins\"]),
            \"bonus\": str(package[\"bonus\"])
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create pending transaction
    transaction_doc = {
        \"transaction_id\": f\"txn_{uuid.uuid4().hex[:12]}\",
        \"user_id\": user.user_id,
        \"session_id\": session.session_id,
        \"package_id\": package_id,
        \"amount\": package[\"price\"],
        \"currency\": \"usd\",
        \"coins\": package[\"coins\"],
        \"bonus_coins\": package[\"bonus\"],
        \"payment_method\": \"stripe\",
        \"status\": \"pending\",
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {\"url\": session.url, \"session_id\": session.session_id}

@api_router.get(\"/shop/checkout/status/{session_id}\")
async def get_checkout_status(session_id: str, user: User = Depends(require_auth)):
    # Get transaction
    transaction = await db.payment_transactions.find_one(
        {\"session_id\": session_id, \"user_id\": user.user_id},
        {\"_id\": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail=\"Transaction not found\")
    
    # If already completed, return status
    if transaction[\"status\"] == \"completed\":
        return {\"status\": \"complete\", \"payment_status\": \"paid\", \"message\": \"Payment already processed\"}
    
    # Check Stripe status
    host_url = \"https://allin-high-stakes.preview.emergentagent.com/\"
    webhook_url = f\"{host_url}api/webhook/stripe\"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        if status.payment_status == \"paid\" and transaction[\"status\"] != \"completed\":
            # Update transaction
            await db.payment_transactions.update_one(
                {\"session_id\": session_id},
                {
                    \"$set\": {
                        \"status\": \"completed\",
                        \"completed_at\": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Add coins to user
            total_coins = transaction[\"coins\"] + transaction[\"bonus_coins\"]
            await db.users.update_one(
                {\"user_id\": user.user_id},
                {\"$inc\": {\"coins\": total_coins}}
            )
            
            return {\"status\": status.status, \"payment_status\": status.payment_status, \"coins_added\": total_coins}
        
        return {\"status\": status.status, \"payment_status\": status.payment_status}
    except Exception as e:
        logging.error(f\"Error checking stripe status: {e}\")
        return {\"status\": transaction[\"status\"], \"payment_status\": \"unknown\"}

@api_router.post(\"/webhook/stripe\")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get(\"Stripe-Signature\")
    
    host_url = str(request.base_url)
    webhook_url = f\"{host_url}api/webhook/stripe\"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == \"paid\":
            session_id = webhook_response.session_id
            
            # Get transaction
            transaction = await db.payment_transactions.find_one(
                {\"session_id\": session_id},
                {\"_id\": 0}
            )
            
            if transaction and transaction[\"status\"] != \"completed\":
                # Update transaction
                await db.payment_transactions.update_one(
                    {\"session_id\": session_id},
                    {
                        \"$set\": {
                            \"status\": \"completed\",
                            \"completed_at\": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # Add coins
                total_coins = transaction[\"coins\"] + transaction[\"bonus_coins\"]
                await db.users.update_one(
                    {\"user_id\": transaction[\"user_id\"]},
                    {\"$inc\": {\"coins\": total_coins}}
                )
        
        return {\"status\": \"processed\"}
    except Exception as e:
        logging.error(f\"Webhook error: {e}\")
        return {\"status\": \"error\"}

# =============== FRIENDS ROUTES ===============
@api_router.get(\"/friends\")
async def get_friends(user: User = Depends(require_auth)):
    # Get accepted friend requests
    sent = await db.friend_requests.find(
        {\"from_user_id\": user.user_id, \"status\": \"accepted\"},
        {\"_id\": 0}
    ).to_list(100)
    
    received = await db.friend_requests.find(
        {\"to_user_id\": user.user_id, \"status\": \"accepted\"},
        {\"_id\": 0}
    ).to_list(100)
    
    friend_ids = [r[\"to_user_id\"] for r in sent] + [r[\"from_user_id\"] for r in received]
    
    friends = await db.users.find(
        {\"user_id\": {\"$in\": friend_ids}},
        {\"_id\": 0, \"password_hash\": 0}
    ).to_list(100)
    
    return friends

@api_router.get(\"/friends/requests\")
async def get_friend_requests(user: User = Depends(require_auth)):
    requests = await db.friend_requests.find(
        {\"to_user_id\": user.user_id, \"status\": \"pending\"},
        {\"_id\": 0}
    ).to_list(100)
    
    # Get user info for each request
    for req in requests:
        from_user = await db.users.find_one(
            {\"user_id\": req[\"from_user_id\"]},
            {\"_id\": 0, \"password_hash\": 0}
        )
        req[\"from_user\"] = from_user
    
    return requests

@api_router.post(\"/friends/request\")
async def send_friend_request(to_user_id: str, user: User = Depends(require_auth)):
    if to_user_id == user.user_id:
        raise HTTPException(status_code=400, detail=\"Cannot add yourself\")
    
    # Check if user exists
    target = await db.users.find_one({\"user_id\": to_user_id})
    if not target:
        raise HTTPException(status_code=404, detail=\"User not found\")
    
    # Check if request already exists
    existing = await db.friend_requests.find_one({
        \"$or\": [
            {\"from_user_id\": user.user_id, \"to_user_id\": to_user_id},
            {\"from_user_id\": to_user_id, \"to_user_id\": user.user_id}
        ]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail=\"Friend request already exists\")
    
    request_doc = {
        \"request_id\": f\"freq_{uuid.uuid4().hex[:12]}\",
        \"from_user_id\": user.user_id,
        \"to_user_id\": to_user_id,
        \"status\": \"pending\",
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    
    await db.friend_requests.insert_one(request_doc)
    return {\"message\": \"Friend request sent\"}

@api_router.post(\"/friends/accept/{request_id}\")
async def accept_friend_request(request_id: str, user: User = Depends(require_auth)):
    request_doc = await db.friend_requests.find_one(
        {\"request_id\": request_id, \"to_user_id\": user.user_id, \"status\": \"pending\"}
    )
    
    if not request_doc:
        raise HTTPException(status_code=404, detail=\"Request not found\")
    
    await db.friend_requests.update_one(
        {\"request_id\": request_id},
        {\"$set\": {\"status\": \"accepted\"}}
    )
    
    return {\"message\": \"Friend request accepted\"}

@api_router.post(\"/friends/reject/{request_id}\")
async def reject_friend_request(request_id: str, user: User = Depends(require_auth)):
    result = await db.friend_requests.delete_one(
        {\"request_id\": request_id, \"to_user_id\": user.user_id, \"status\": \"pending\"}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Request not found\")
    
    return {\"message\": \"Friend request rejected\"}

@api_router.delete(\"/friends/{friend_id}\")
async def remove_friend(friend_id: str, user: User = Depends(require_auth)):
    result = await db.friend_requests.delete_one({
        \"$or\": [
            {\"from_user_id\": user.user_id, \"to_user_id\": friend_id, \"status\": \"accepted\"},
            {\"from_user_id\": friend_id, \"to_user_id\": user.user_id, \"status\": \"accepted\"}
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Friend not found\")
    
    return {\"message\": \"Friend removed\"}

# =============== LEADERBOARD ROUTES ===============
@api_router.get(\"/leaderboard\")
async def get_leaderboard(limit: int = 50):
    users = await db.users.find(
        {},
        {\"_id\": 0, \"password_hash\": 0}
    ).sort(\"total_earnings\", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for i, user in enumerate(users):
        leaderboard.append({
            \"rank\": i + 1,
            \"user_id\": user[\"user_id\"],
            \"name\": user[\"name\"],
            \"picture\": user.get(\"picture\"),
            \"total_wins\": user.get(\"total_wins\", 0),
            \"total_earnings\": user.get(\"total_earnings\", 0)
        })
    
    return leaderboard

# =============== CHAT ROUTES ===============
@api_router.get(\"/chat/{table_id}\")
async def get_chat_messages(table_id: str, limit: int = 50):
    messages = await db.chat_messages.find(
        {\"table_id\": table_id},
        {\"_id\": 0}
    ).sort(\"created_at\", -1).limit(limit).to_list(limit)
    
    return list(reversed(messages))

@api_router.post(\"/chat/{table_id}\")
async def send_chat_message(table_id: str, message: str, user: User = Depends(require_auth)):
    message_doc = {
        \"message_id\": f\"msg_{uuid.uuid4().hex[:12]}\",
        \"table_id\": table_id,
        \"user_id\": user.user_id,
        \"user_name\": user.name,
        \"message\": message,
        \"created_at\": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_messages.insert_one(message_doc)
    return message_doc

# =============== USER ROUTES ===============
@api_router.get(\"/users/search\")
async def search_users(query: str, user: User = Depends(require_auth)):
    users = await db.users.find(
        {
            \"$or\": [
                {\"name\": {\"$regex\": query, \"$options\": \"i\"}},
                {\"email\": {\"$regex\": query, \"$options\": \"i\"}}
            ],
            \"user_id\": {\"$ne\": user.user_id}
        },
        {\"_id\": 0, \"password_hash\": 0}
    ).limit(20).to_list(20)
    
    return users

@api_router.get(\"/users/{user_id}\")
async def get_user_profile(user_id: str):
    user_doc = await db.users.find_one(
        {\"user_id\": user_id},
        {\"_id\": 0, \"password_hash\": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail=\"User not found\")
    
    return user_doc

# =============== ADMIN ROUTES ===============
@api_router.get(\"/admin/stats\")
async def get_admin_stats(user: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_tables = await db.tables.count_documents({})
    total_tournaments = await db.tournaments.count_documents({})
    active_tables = await db.tables.count_documents({\"current_players\": {\"$gt\": 0}})
    
    return {
        \"total_users\": total_users,
        \"total_tables\": total_tables,
        \"total_tournaments\": total_tournaments,
        \"active_tables\": active_tables
    }

@api_router.post(\"/admin/set-role\")
async def set_user_role(target_user_id: str, role: str, user: User = Depends(require_admin)):
    if role not in [\"user\", \"admin\", \"administrator\"]:
        raise HTTPException(status_code=400, detail=\"Invalid role\")
    
    if user.role != \"administrator\" and role == \"administrator\":
        raise HTTPException(status_code=403, detail=\"Only administrators can create administrators\")
    
    result = await db.users.update_one(
        {\"user_id\": target_user_id},
        {\"$set\": {\"role\": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=\"User not found\")
    
    return {\"message\": f\"User role updated to {role}\"}

# =============== ROOT ===============
@api_router.get(\"/\")
async def root():
    return {\"message\": \"ALLin Poker API\", \"version\": \"1.0.0\"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
import uvicorn
import os

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
