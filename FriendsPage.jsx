"import { useState, useEffect } from \"react\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Avatar, AvatarFallback, AvatarImage } from \"@/components/ui/avatar\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { toast } from \"sonner\";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Trash2,
  Loader2,
  Mail
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function FriendsPage() {
  const { user, token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(\"\");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/friends`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/friends/requests`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error(\"Error fetching friends:\", error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await axios.get(
        `${API}/users/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data);
    } catch (error) {
      toast.error(\"Eroare la căutare\");
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      await axios.post(
        `${API}/friends/request?to_user_id=${toUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Cerere de prietenie trimisă!\");
      setSearchResults(prev => prev.filter(u => u.user_id !== toUserId));
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare\");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(
        `${API}/friends/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Cerere acceptată!\");
      await fetchFriendsData();
    } catch (error) {
      toast.error(\"Eroare la acceptare\");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(
        `${API}/friends/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Cerere respinsă\");
      await fetchFriendsData();
    } catch (error) {
      toast.error(\"Eroare\");
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(
        `${API}/friends/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Prieten șters\");
      setFriends(prev => prev.filter(f => f.user_id !== friendId));
    } catch (error) {
      toast.error(\"Eroare\");
    }
  };

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mb-8\"
        >
          <h1 className=\"text-3xl font-bold text-white mb-2\">Prieteni</h1>
          <p className=\"text-zinc-400\">Gestionează lista ta de prieteni și invită jucători noi.</p>
        </motion.div>

        <Tabs defaultValue=\"friends\" className=\"w-full\">
          <TabsList className=\"bg-zinc-900 border border-zinc-800 p-1 mb-6\">
            <TabsTrigger 
              value=\"friends\" 
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <Users className=\"w-4 h-4 mr-2\" />
              Prieteni ({friends.length})
            </TabsTrigger>
            <TabsTrigger 
              value=\"requests\"
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <Mail className=\"w-4 h-4 mr-2\" />
              Cereri ({requests.length})
            </TabsTrigger>
            <TabsTrigger 
              value=\"search\"
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <UserPlus className=\"w-4 h-4 mr-2\" />
              Adaugă
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value=\"friends\">
            {loading ? (
              <div className=\"space-y-3\">
                {[1, 2, 3].map((i) => (
                  <div key={i} className=\"glass-card p-4 animate-pulse\">
                    <div className=\"flex items-center space-x-4\">
                      <div className=\"w-12 h-12 bg-zinc-800 rounded-full\"></div>
                      <div className=\"flex-1 space-y-2\">
                        <div className=\"h-4 bg-zinc-800 rounded w-32\"></div>
                        <div className=\"h-3 bg-zinc-800 rounded w-24\"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : friends.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=\"text-center py-16\"
              >
                <Users className=\"w-16 h-16 text-zinc-600 mx-auto mb-4\" />
                <h3 className=\"text-xl font-semibold text-white mb-2\">Niciun prieten încă</h3>
                <p className=\"text-zinc-400\">Caută jucători și trimite cereri de prietenie.</p>
              </motion.div>
            ) : (
              <div className=\"space-y-3\">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className=\"glass-card p-4 flex items-center justify-between\"
                  >
                    <div className=\"flex items-center space-x-4\">
                      <Avatar className=\"w-12 h-12\">
                        <AvatarImage src={friend.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.user_id}`} />
                        <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className=\"font-medium text-white\">{friend.name}</p>
                        <p className=\"text-sm text-zinc-400\">{friend.email}</p>
                      </div>
                    </div>
                    <Button
                      variant=\"ghost\"
                      size=\"icon\"
                      onClick={() => removeFriend(friend.user_id)}
                      className=\"text-zinc-400 hover:text-red-500\"
                    >
                      <Trash2 className=\"w-5 h-5\" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Friend Requests */}
          <TabsContent value=\"requests\">
            {requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=\"text-center py-16\"
              >
                <Mail className=\"w-16 h-16 text-zinc-600 mx-auto mb-4\" />
                <h3 className=\"text-xl font-semibold text-white mb-2\">Nicio cerere</h3>
                <p className=\"text-zinc-400\">Nu ai cereri de prietenie în așteptare.</p>
              </motion.div>
            ) : (
              <div className=\"space-y-3\">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.request_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className=\"glass-card p-4 flex items-center justify-between\"
                  >
                    <div className=\"flex items-center space-x-4\">
                      <Avatar className=\"w-12 h-12\">
                        <AvatarImage src={request.from_user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.from_user_id}`} />
                        <AvatarFallback>{request.from_user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className=\"font-medium text-white\">{request.from_user?.name}</p>
                        <p className=\"text-sm text-zinc-400\">{request.from_user?.email}</p>
                      </div>
                    </div>
                    <div className=\"flex space-x-2\">
                      <Button
                        size=\"icon\"
                        onClick={() => acceptRequest(request.request_id)}
                        className=\"bg-emerald-500 hover:bg-emerald-600\"
                      >
                        <Check className=\"w-4 h-4\" />
                      </Button>
                      <Button
                        size=\"icon\"
                        variant=\"outline\"
                        onClick={() => rejectRequest(request.request_id)}
                        className=\"border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500\"
                      >
                        <X className=\"w-4 h-4\" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Search & Add Friends */}
          <TabsContent value=\"search\">
            <div className=\"space-y-6\">
              <div className=\"flex space-x-3\">
                <div className=\"relative flex-1\">
                  <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500\" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === \"Enter\" && searchUsers()}
                    placeholder=\"Caută după nume sau email...\"
                    className=\"pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600\"
                  />
                </div>
                <Button
                  onClick={searchUsers}
                  disabled={searching}
                  className=\"bg-emerald-500 hover:bg-emerald-600\"
                >
                  {searching ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : \"Caută\"}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className=\"space-y-3\">
                  {searchResults.map((resultUser, index) => {
                    const isFriend = friends.some(f => f.user_id === resultUser.user_id);
                    return (
                      <motion.div
                        key={resultUser.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className=\"glass-card p-4 flex items-center justify-between\"
                      >
                        <div className=\"flex items-center space-x-4\">
                          <Avatar className=\"w-12 h-12\">
                            <AvatarImage src={resultUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${resultUser.user_id}`} />
                            <AvatarFallback>{resultUser.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className=\"font-medium text-white\">{resultUser.name}</p>
                            <p className=\"text-sm text-zinc-400\">{resultUser.email}</p>
                          </div>
                        </div>
                        {isFriend ? (
                          <span className=\"text-sm text-emerald-400\">Deja prieten</span>
                        ) : (
                          <Button
                            onClick={() => sendFriendRequest(resultUser.user_id)}
                            className=\"bg-emerald-500 hover:bg-emerald-600\"
                          >
                            <UserPlus className=\"w-4 h-4 mr-2\" />
                            Adaugă
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
"