"import { useState, useEffect, useRef } from \"react\";
import { useParams, useNavigate } from \"react-router-dom\";
import { motion, AnimatePresence } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { ScrollArea } from \"@/components/ui/scroll-area\";
import { toast } from \"sonner\";
import {
  ArrowLeft,
  Send,
  Users,
  Coins,
  MessageCircle,
  LogOut,
  User as UserIcon
} from \"lucide-react\";

// Playing card component
function PlayingCard({ card, faceDown = false, small = false }) {
  const sizeClass = small ? \"w-10 h-14\" : \"w-16 h-22\";
  
  if (faceDown) {
    return (
      <div className={`${sizeClass} rounded-lg bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-800 shadow-xl`}>
        <div className=\"w-full h-full rounded-lg\" style={{
          backgroundImage: \"repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)\"
        }}></div>
      </div>
    );
  }

  if (!card) {
    return <div className={`${sizeClass} rounded-lg bg-zinc-800/50 border-2 border-dashed border-zinc-700`}></div>;
  }

  const isRed = card.suit === \"hearts\" || card.suit === \"diamonds\";
  const suitSymbols = {
    hearts: \"♥\",
    diamonds: \"♦\",
    clubs: \"♣\",
    spades: \"♠\"
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${sizeClass} rounded-lg bg-white shadow-xl flex flex-col items-center justify-center`}
    >
      <span className={`text-lg font-bold ${isRed ? \"text-red-600\" : \"text-zinc-900\"}`}>
        {card.rank}
      </span>
      <span className={`text-xl ${isRed ? \"text-red-600\" : \"text-zinc-900\"}`}>
        {suitSymbols[card.suit]}
      </span>
    </motion.div>
  );
}

// Poker chip component
function PokerChip({ amount, size = \"md\" }) {
  const sizeClass = size === \"sm\" ? \"w-8 h-8 text-xs\" : \"w-12 h-12 text-sm\";
  
  let colorClass = \"bg-zinc-100 border-zinc-300 text-zinc-900\";
  if (amount >= 100000) colorClass = \"bg-zinc-900 border-zinc-700 text-white\";
  else if (amount >= 10000) colorClass = \"bg-blue-600 border-blue-800 text-white\";
  else if (amount >= 1000) colorClass = \"bg-emerald-600 border-emerald-800 text-white\";
  else if (amount >= 100) colorClass = \"bg-red-600 border-red-800 text-white\";

  return (
    <div className={`${sizeClass} rounded-full border-4 flex items-center justify-center font-bold shadow-lg ${colorClass}`}>
      {amount >= 1000 ? `${Math.floor(amount / 1000)}K` : amount}
    </div>
  );
}

// Player seat component
function PlayerSeat({ player, position, isCurrentUser, isDealer, isTurn }) {
  const positionStyles = {
    0: \"bottom-4 left-1/2 -translate-x-1/2\",
    1: \"bottom-20 left-8\",
    2: \"top-1/2 left-4 -translate-y-1/2\",
    3: \"top-20 left-8\",
    4: \"top-4 left-1/2 -translate-x-1/2\",
    5: \"top-20 right-8\",
    6: \"top-1/2 right-4 -translate-y-1/2\",
    7: \"bottom-20 right-8\",
    8: \"bottom-4 right-1/4\"
  };

  if (!player) {
    return (
      <div className={`absolute ${positionStyles[position]}`}>
        <div className=\"w-20 h-20 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-zinc-800/30\">
          <UserIcon className=\"w-8 h-8 text-zinc-600\" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`absolute ${positionStyles[position]}`}
    >
      <div className={`relative ${isTurn ? \"animate-pulse-glow\" : \"\"}`}>
        {isDealer && (
          <div className=\"absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-black z-10\">
            D
          </div>
        )}
        
        <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${
          isCurrentUser ? \"border-emerald-500\" : \"border-zinc-700\"
        } ${isTurn ? \"ring-4 ring-emerald-500/50\" : \"\"}`}>
          <img 
            src={player.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user_id}`}
            alt={player.name}
            className=\"w-full h-full object-cover\"
          />
        </div>
        
        <div className=\"absolute -bottom-6 left-1/2 -translate-x-1/2 text-center w-24\">
          <p className=\"text-xs font-medium text-white truncate\">{player.name}</p>
          <div className=\"flex items-center justify-center space-x-1 mt-1\">
            <Coins className=\"w-3 h-3 text-amber-500\" />
            <span className=\"text-xs text-amber-400\">{player.chips?.toLocaleString()}</span>
          </div>
        </div>

        {/* Player cards */}
        <div className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 flex -space-x-2\">
          <PlayingCard faceDown={!isCurrentUser} small />
          <PlayingCard faceDown={!isCurrentUser} small />
        </div>
      </div>
    </motion.div>
  );
}

export default function TablePage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(\"\");
  const [showBuyIn, setShowBuyIn] = useState(false);
  const [buyInAmount, setBuyInAmount] = useState(\"\");
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTable();
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchTable();
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [tableId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: \"smooth\" });
  }, [messages]);

  const fetchTable = async () => {
    try {
      const response = await axios.get(`${API}/tables/${tableId}`);
      setTable(response.data);
      
      // Check if user is at table
      const isAtTable = response.data.players?.some(p => p.user_id === user?.user_id);
      if (!isAtTable && !showBuyIn) {
        setShowBuyIn(true);
        setBuyInAmount(response.data.min_buy_in.toString());
      }
    } catch (error) {
      toast.error(\"Masă negăsită\");
      navigate(\"/lobby\");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/${tableId}`);
      setMessages(response.data);
    } catch (error) {
      console.error(\"Error fetching messages:\", error);
    }
  };

  const joinTable = async () => {
    const amount = parseInt(buyInAmount);
    if (isNaN(amount) || amount < table.min_buy_in || amount > table.max_buy_in) {
      toast.error(`Buy-in trebuie să fie între ${table.min_buy_in} și ${table.max_buy_in}`);
      return;
    }

    if (amount > user.coins) {
      toast.error(\"Nu ai suficiente monezi\");
      return;
    }

    try {
      await axios.post(
        `${API}/tables/${tableId}/join`,
        { buy_in: amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Ai intrat la masă!\");
      setShowBuyIn(false);
      await Promise.all([fetchTable(), refreshUser()]);
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare\");
    }
  };

  const leaveTable = async () => {
    try {
      await axios.post(
        `${API}/tables/${tableId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Ai părăsit masa\");
      await refreshUser();
      navigate(\"/lobby\");
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare\");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `${API}/chat/${tableId}?message=${encodeURIComponent(newMessage)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage(\"\");
      await fetchMessages();
    } catch (error) {
      toast.error(\"Eroare la trimiterea mesajului\");
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-[#09090b] flex items-center justify-center\">
        <div className=\"w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin\"></div>
      </div>
    );
  }

  const isAtTable = table?.players?.some(p => p.user_id === user?.user_id);

  return (
    <div className=\"min-h-screen bg-[#09090b] flex flex-col\">
      {/* Header */}
      <header className=\"h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-4\">
        <div className=\"flex items-center space-x-4\">
          <Button
            variant=\"ghost\"
            size=\"icon\"
            onClick={() => navigate(\"/lobby\")}
            className=\"text-zinc-400 hover:text-white\"
          >
            <ArrowLeft className=\"w-5 h-5\" />
          </Button>
          <div>
            <h1 className=\"font-semibold text-white\">{table?.name}</h1>
            <p className=\"text-xs text-zinc-400\">
              Blinduri: {table?.small_blind}/{table?.big_blind}
            </p>
          </div>
        </div>

        <div className=\"flex items-center space-x-4\">
          <div className=\"flex items-center space-x-2 text-zinc-400\">
            <Users className=\"w-4 h-4\" />
            <span className=\"text-sm\">{table?.current_players}/{table?.max_players}</span>
          </div>
          
          {isAtTable && (
            <Button
              variant=\"destructive\"
              size=\"sm\"
              onClick={leaveTable}
              className=\"bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30\"
            >
              <LogOut className=\"w-4 h-4 mr-2\" />
              Părăsește
            </Button>
          )}

          <Button
            variant=\"ghost\"
            size=\"icon\"
            onClick={() => setChatOpen(!chatOpen)}
            className={chatOpen ? \"text-emerald-500\" : \"text-zinc-400\"}
          >
            <MessageCircle className=\"w-5 h-5\" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className=\"flex-1 flex\">
        {/* Poker table */}
        <div className=\"flex-1 flex items-center justify-center p-8\">
          <div className=\"relative w-full max-w-4xl aspect-[16/10]\">
            {/* Table rail */}
            <div className=\"absolute inset-0 table-rail rounded-[60px] p-4\">
              {/* Felt surface */}
              <div className=\"w-full h-full rounded-[50px] poker-felt relative overflow-hidden\">
                {/* Table logo */}
                <div className=\"absolute inset-0 flex items-center justify-center opacity-20\">
                  <div className=\"text-center\">
                    <span className=\"text-6xl font-black text-white/30\">ALLin</span>
                  </div>
                </div>

                {/* Community cards */}
                <div className=\"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2\">
                  <div className=\"flex space-x-2\">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <PlayingCard key={i} card={null} />
                    ))}
                  </div>
                  {/* Pot */}
                  <div className=\"flex items-center justify-center mt-4 space-x-2\">
                    <span className=\"text-white font-semibold\">Pot:</span>
                    <span className=\"text-amber-400 font-bold\">0</span>
                  </div>
                </div>

                {/* Player seats */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => {
                  const player = table?.players?.find(p => p.seat === position + 1);
                  return (
                    <PlayerSeat
                      key={position}
                      position={position}
                      player={player}
                      isCurrentUser={player?.user_id === user?.user_id}
                      isDealer={position === 0}
                      isTurn={false}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className=\"border-l border-zinc-800 bg-zinc-900/50 flex flex-col\"
            >
              <div className=\"p-4 border-b border-zinc-800\">
                <h2 className=\"font-semibold text-white flex items-center\">
                  <MessageCircle className=\"w-4 h-4 mr-2 text-emerald-500\" />
                  Chat
                </h2>
              </div>

              <ScrollArea className=\"flex-1 p-4\">
                <div className=\"space-y-3\">
                  {messages.map((msg) => (
                    <div key={msg.message_id} className=\"text-sm\">
                      <span className={`font-medium ${msg.user_id === user?.user_id ? \"text-emerald-400\" : \"text-zinc-300\"}`}>
                        {msg.user_name}:
                      </span>
                      <span className=\"text-zinc-400 ml-2\">{msg.message}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={sendMessage} className=\"p-4 border-t border-zinc-800\">
                <div className=\"flex space-x-2\">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder=\"Scrie un mesaj...\"
                    className=\"bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500\"
                  />
                  <Button type=\"submit\" size=\"icon\" className=\"bg-emerald-500 hover:bg-emerald-600\">
                    <Send className=\"w-4 h-4\" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buy-in modal */}
      <AnimatePresence>
        {showBuyIn && !isAtTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className=\"fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50\"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className=\"glass-card p-8 max-w-md w-full mx-4\"
            >
              <h2 className=\"text-2xl font-bold text-white mb-2\">Intră la masă</h2>
              <p className=\"text-zinc-400 mb-6\">
                Buy-in: {table?.min_buy_in?.toLocaleString()} - {table?.max_buy_in?.toLocaleString()} monezi
              </p>

              <div className=\"space-y-4 mb-6\">
                <div>
                  <label className=\"text-sm text-zinc-400 mb-2 block\">Buy-in Amount</label>
                  <Input
                    type=\"number\"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    min={table?.min_buy_in}
                    max={Math.min(table?.max_buy_in, user?.coins)}
                    className=\"bg-zinc-800 border-zinc-700 text-white\"
                  />
                </div>

                <div className=\"flex items-center justify-between text-sm\">
                  <span className=\"text-zinc-400\">Monezile tale:</span>
                  <span className=\"text-emerald-400 font-medium\">{user?.coins?.toLocaleString()}</span>
                </div>
              </div>

              <div className=\"flex space-x-3\">
                <Button
                  variant=\"outline\"
                  onClick={() => navigate(\"/lobby\")}
                  className=\"flex-1 border-zinc-700 text-zinc-300\"
                >
                  Anulează
                </Button>
                <Button
                  onClick={joinTable}
                  className=\"flex-1 bg-emerald-500 hover:bg-emerald-600 text-white\"
                >
                  Intră
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"