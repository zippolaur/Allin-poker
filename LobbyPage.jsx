"import { useState, useEffect } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { Badge } from \"@/components/ui/badge\";
import { toast } from \"sonner\";
import {
  Users,
  Trophy,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Coins,
  Clock,
  DollarSign,
  Play,
  Crown,
  Star,
  Menu,
  X
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function LobbyPage() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, tournamentsRes] = await Promise.all([
        axios.get(`${API}/tables`),
        axios.get(`${API}/tournaments`)
      ]);
      setTables(tablesRes.data);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error(\"Error fetching data:\", error);
    } finally {
      setLoading(false);
    }
  };

  const joinTable = (tableId) => {
    navigate(`/table/${tableId}`);
  };

  const registerTournament = async (tournamentId) => {
    try {
      await axios.post(
        `${API}/tournaments/${tournamentId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(\"Te-ai înregistrat cu succes la turneu!\");
      await Promise.all([fetchData(), refreshUser()]);
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare la înregistrare\");
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(\"ro-RO\", {
      day: \"numeric\",
      month: \"short\",
      hour: \"2-digit\",
      minute: \"2-digit\"
    });
  };

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mb-8\"
        >
          <h1 className=\"text-3xl font-bold text-white mb-2\">
            Bun venit, <span className=\"text-emerald-500\">{user?.name}</span>!
          </h1>
          <p className=\"text-zinc-400\">Alege o masă sau înscrie-te la un turneu.</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-8\"
        >
          <div className=\"glass-card p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center\">
                <Coins className=\"w-5 h-5 text-emerald-500\" />
              </div>
              <div>
                <p className=\"text-sm text-zinc-400\">Monezi</p>
                <p className=\"text-xl font-bold text-white\">{formatCoins(user?.coins || 0)}</p>
              </div>
            </div>
          </div>

          <div className=\"glass-card p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center\">
                <Trophy className=\"w-5 h-5 text-amber-500\" />
              </div>
              <div>
                <p className=\"text-sm text-zinc-400\">Victorii</p>
                <p className=\"text-xl font-bold text-white\">{user?.total_wins || 0}</p>
              </div>
            </div>
          </div>

          <div className=\"glass-card p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center\">
                <Play className=\"w-5 h-5 text-blue-500\" />
              </div>
              <div>
                <p className=\"text-sm text-zinc-400\">Jocuri</p>
                <p className=\"text-xl font-bold text-white\">{user?.total_games || 0}</p>
              </div>
            </div>
          </div>

          <div className=\"glass-card p-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center\">
                <DollarSign className=\"w-5 h-5 text-purple-500\" />
              </div>
              <div>
                <p className=\"text-sm text-zinc-400\">Câștiguri</p>
                <p className=\"text-xl font-bold text-white\">{formatCoins(user?.total_earnings || 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tables and Tournaments Tabs */}
        <Tabs defaultValue=\"tables\" className=\"w-full\">
          <TabsList className=\"bg-zinc-900 border border-zinc-800 p-1 mb-6\">
            <TabsTrigger 
              value=\"tables\" 
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <Users className=\"w-4 h-4 mr-2\" />
              Mese Cash
            </TabsTrigger>
            <TabsTrigger 
              value=\"tournaments\"
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <Trophy className=\"w-4 h-4 mr-2\" />
              Turnee
            </TabsTrigger>
          </TabsList>

          <TabsContent value=\"tables\">
            {loading ? (
              <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-4\">
                {[1, 2, 3].map((i) => (
                  <div key={i} className=\"glass-card p-6 animate-pulse\">
                    <div className=\"h-6 bg-zinc-800 rounded mb-4\"></div>
                    <div className=\"h-4 bg-zinc-800 rounded w-2/3 mb-2\"></div>
                    <div className=\"h-4 bg-zinc-800 rounded w-1/2\"></div>
                  </div>
                ))}
              </div>
            ) : tables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=\"text-center py-16\"
              >
                <div className=\"w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4\">
                  <Users className=\"w-8 h-8 text-zinc-600\" />
                </div>
                <h3 className=\"text-xl font-semibold text-white mb-2\">Nicio masă disponibilă</h3>
                <p className=\"text-zinc-400\">Mesele vor fi create de administratori.</p>
              </motion.div>
            ) : (
              <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-4\">
                {tables.map((table, index) => (
                  <motion.div
                    key={table.table_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className=\"glass-card p-6 hover:border-emerald-500/30 transition-all group\"
                  >
                    <div className=\"flex items-start justify-between mb-4\">
                      <div>
                        <h3 className=\"text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors\">
                          {table.name}
                        </h3>
                        <p className=\"text-sm text-zinc-400\">Texas Hold'em</p>
                      </div>
                      <Badge 
                        variant={table.current_players > 0 ? \"default\" : \"secondary\"}
                        className={table.current_players > 0 ? \"bg-emerald-500/20 text-emerald-400 border-emerald-500/30\" : \"\"}
                      >
                        {table.current_players}/{table.max_players}
                      </Badge>
                    </div>

                    <div className=\"space-y-2 mb-4\">
                      <div className=\"flex justify-between text-sm\">
                        <span className=\"text-zinc-500\">Blinduri</span>
                        <span className=\"text-zinc-300\">{formatCoins(table.small_blind)}/{formatCoins(table.big_blind)}</span>
                      </div>
                      <div className=\"flex justify-between text-sm\">
                        <span className=\"text-zinc-500\">Buy-in</span>
                        <span className=\"text-zinc-300\">{formatCoins(table.min_buy_in)} - {formatCoins(table.max_buy_in)}</span>
                      </div>
                    </div>

                    <Button
                      data-testid={`join-table-${table.table_id}`}
                      onClick={() => joinTable(table.table_id)}
                      className=\"w-full bg-emerald-500 hover:bg-emerald-600 text-white\"
                      disabled={table.current_players >= table.max_players}
                    >
                      {table.current_players >= table.max_players ? \"Masă Plină\" : \"Intră la Masă\"}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value=\"tournaments\">
            {loading ? (
              <div className=\"grid md:grid-cols-2 gap-4\">
                {[1, 2].map((i) => (
                  <div key={i} className=\"glass-card p-6 animate-pulse\">
                    <div className=\"h-6 bg-zinc-800 rounded mb-4\"></div>
                    <div className=\"h-4 bg-zinc-800 rounded w-2/3 mb-2\"></div>
                    <div className=\"h-4 bg-zinc-800 rounded w-1/2\"></div>
                  </div>
                ))}
              </div>
            ) : tournaments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=\"text-center py-16\"
              >
                <div className=\"w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4\">
                  <Trophy className=\"w-8 h-8 text-zinc-600\" />
                </div>
                <h3 className=\"text-xl font-semibold text-white mb-2\">Niciun turneu disponibil</h3>
                <p className=\"text-zinc-400\">Turneele vor fi anunțate în curând.</p>
              </motion.div>
            ) : (
              <div className=\"grid md:grid-cols-2 gap-4\">
                {tournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.tournament_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className=\"glass-card p-6 hover:border-amber-500/30 transition-all\"
                  >
                    <div className=\"flex items-start justify-between mb-4\">
                      <div className=\"flex items-center space-x-3\">
                        <div className=\"w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center\">
                          <Crown className=\"w-6 h-6 text-amber-500\" />
                        </div>
                        <div>
                          <h3 className=\"text-lg font-semibold text-white\">{tournament.name}</h3>
                          <p className=\"text-sm text-zinc-400\">Texas Hold'em</p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          tournament.status === \"registration\" 
                            ? \"bg-emerald-500/20 text-emerald-400 border-emerald-500/30\"
                            : tournament.status === \"running\"
                            ? \"bg-blue-500/20 text-blue-400 border-blue-500/30\"
                            : \"bg-zinc-800\"
                        }
                      >
                        {tournament.status === \"registration\" ? \"Înregistrare\" : 
                         tournament.status === \"running\" ? \"În desfășurare\" : \"Finalizat\"}
                      </Badge>
                    </div>

                    <div className=\"grid grid-cols-2 gap-4 mb-4\">
                      <div className=\"bg-zinc-900/50 rounded-lg p-3\">
                        <p className=\"text-xs text-zinc-500 mb-1\">Buy-in</p>
                        <p className=\"text-lg font-bold text-white\">{formatCoins(tournament.buy_in)}</p>
                      </div>
                      <div className=\"bg-zinc-900/50 rounded-lg p-3\">
                        <p className=\"text-xs text-zinc-500 mb-1\">Premii</p>
                        <p className=\"text-lg font-bold text-amber-500\">{formatCoins(tournament.prize_pool)}</p>
                      </div>
                    </div>

                    <div className=\"flex items-center justify-between text-sm mb-4\">
                      <div className=\"flex items-center space-x-2 text-zinc-400\">
                        <Users className=\"w-4 h-4\" />
                        <span>{tournament.current_players}/{tournament.max_players} jucători</span>
                      </div>
                      <div className=\"flex items-center space-x-2 text-zinc-400\">
                        <Clock className=\"w-4 h-4\" />
                        <span>{formatDate(tournament.start_time)}</span>
                      </div>
                    </div>

                    <Button
                      data-testid={`register-tournament-${tournament.tournament_id}`}
                      onClick={() => registerTournament(tournament.tournament_id)}
                      className=\"w-full bg-amber-500 hover:bg-amber-600 text-black font-bold\"
                      disabled={
                        tournament.status !== \"registration\" ||
                        tournament.current_players >= tournament.max_players ||
                        tournament.participants?.includes(user?.user_id)
                      }
                    >
                      {tournament.participants?.includes(user?.user_id) 
                        ? \"Înregistrat\" 
                        : tournament.status !== \"registration\"
                        ? \"Înregistrare Închisă\"
                        : \"Înscrie-te\"}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
"