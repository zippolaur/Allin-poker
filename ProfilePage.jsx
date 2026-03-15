"import { useState, useEffect } from \"react\";
import { useParams } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Badge } from \"@/components/ui/badge\";
import {
  User,
  Trophy,
  Coins,
  Play,
  Calendar,
  Crown,
  Target
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === user?.user_id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const id = userId || user?.user_id;
      const response = await axios.get(`${API}/users/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error(\"Error fetching profile:\", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return \"N/A\";
    const date = new Date(dateStr);
    return date.toLocaleDateString(\"ro-RO\", {
      year: \"numeric\",
      month: \"long\",
      day: \"numeric\"
    });
  };

  const winRate = profile?.total_games > 0 
    ? Math.round((profile.total_wins / profile.total_games) * 100) 
    : 0;

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {loading ? (
          <div className=\"animate-pulse space-y-6\">
            <div className=\"glass-card p-8\">
              <div className=\"flex items-center space-x-6\">
                <div className=\"w-24 h-24 bg-zinc-800 rounded-full\"></div>
                <div className=\"space-y-3\">
                  <div className=\"h-8 bg-zinc-800 rounded w-48\"></div>
                  <div className=\"h-4 bg-zinc-800 rounded w-32\"></div>
                </div>
              </div>
            </div>
          </div>
        ) : !profile ? (
          <div className=\"text-center py-16\">
            <User className=\"w-16 h-16 text-zinc-600 mx-auto mb-4\" />
            <h2 className=\"text-xl font-semibold text-white\">Utilizator negăsit</h2>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=\"space-y-6\"
          >
            {/* Profile header */}
            <div className=\"glass-card p-8\">
              <div className=\"flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8\">
                <div className=\"relative\">
                  <div className=\"w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500\">
                    <img 
                      src={profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`}
                      alt={profile.name}
                      className=\"w-full h-full object-cover\"
                    />
                  </div>
                  {profile.role === \"admin\" && (
                    <Badge className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white\">
                      <Crown className=\"w-3 h-3 mr-1\" />
                      Admin
                    </Badge>
                  )}
                  {profile.role === \"administrator\" && (
                    <Badge className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black\">
                      <Crown className=\"w-3 h-3 mr-1\" />
                      Administrator
                    </Badge>
                  )}
                </div>

                <div className=\"flex-1 text-center md:text-left\">
                  <h1 className=\"text-3xl font-bold text-white mb-2\">{profile.name}</h1>
                  <p className=\"text-zinc-400 mb-4\">{profile.email}</p>
                  
                  <div className=\"flex flex-wrap justify-center md:justify-start gap-3\">
                    <div className=\"flex items-center space-x-2 px-4 py-2 bg-zinc-800 rounded-full\">
                      <Calendar className=\"w-4 h-4 text-zinc-500\" />
                      <span className=\"text-sm text-zinc-400\">
                        Membru din {formatDate(profile.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className=\"text-center md:text-right\">
                    <p className=\"text-sm text-zinc-400 mb-1\">Balanță</p>
                    <div className=\"flex items-center justify-center md:justify-end space-x-2\">
                      <Coins className=\"w-6 h-6 text-amber-500\" />
                      <span className=\"text-2xl font-bold text-white\">
                        {formatCoins(profile.coins)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className=\"glass-card p-6\"
              >
                <div className=\"flex items-center space-x-3 mb-2\">
                  <div className=\"w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center\">
                    <Play className=\"w-5 h-5 text-blue-500\" />
                  </div>
                  <span className=\"text-sm text-zinc-400\">Jocuri</span>
                </div>
                <p className=\"text-3xl font-bold text-white\">{profile.total_games || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className=\"glass-card p-6\"
              >
                <div className=\"flex items-center space-x-3 mb-2\">
                  <div className=\"w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center\">
                    <Trophy className=\"w-5 h-5 text-emerald-500\" />
                  </div>
                  <span className=\"text-sm text-zinc-400\">Victorii</span>
                </div>
                <p className=\"text-3xl font-bold text-white\">{profile.total_wins || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className=\"glass-card p-6\"
              >
                <div className=\"flex items-center space-x-3 mb-2\">
                  <div className=\"w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center\">
                    <Coins className=\"w-5 h-5 text-amber-500\" />
                  </div>
                  <span className=\"text-sm text-zinc-400\">Câștiguri</span>
                </div>
                <p className=\"text-3xl font-bold text-white\">{formatCoins(profile.total_earnings || 0)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className=\"glass-card p-6\"
              >
                <div className=\"flex items-center space-x-3 mb-2\">
                  <div className=\"w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center\">
                    <Target className=\"w-5 h-5 text-purple-500\" />
                  </div>
                  <span className=\"text-sm text-zinc-400\">Rată Victorie</span>
                </div>
                <p className=\"text-3xl font-bold text-white\">{winRate}%</p>
              </motion.div>
            </div>

            {/* Win rate visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className=\"glass-card p-6\"
            >
              <h2 className=\"text-lg font-semibold text-white mb-4\">Performanță</h2>
              <div className=\"space-y-4\">
                <div>
                  <div className=\"flex justify-between text-sm mb-2\">
                    <span className=\"text-zinc-400\">Rată Victorie</span>
                    <span className=\"text-emerald-400 font-medium\">{winRate}%</span>
                  </div>
                  <div className=\"h-3 bg-zinc-800 rounded-full overflow-hidden\">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${winRate}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className=\"h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full\"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
"