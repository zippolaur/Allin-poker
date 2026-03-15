"import { useState, useEffect } from \"react\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Badge } from \"@/components/ui/badge\";
import { Avatar, AvatarFallback, AvatarImage } from \"@/components/ui/avatar\";
import {
  Trophy,
  Medal,
  Crown,
  Coins,
  TrendingUp
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error(\"Error fetching leaderboard:\", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className=\"w-6 h-6 text-amber-500\" />;
    if (rank === 2) return <Medal className=\"w-6 h-6 text-zinc-300\" />;
    if (rank === 3) return <Medal className=\"w-6 h-6 text-amber-700\" />;
    return <span className=\"text-lg font-bold text-zinc-500\">#{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return \"bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/50\";
    if (rank === 2) return \"bg-gradient-to-r from-zinc-400/10 to-zinc-500/10 border-zinc-400/30\";
    if (rank === 3) return \"bg-gradient-to-r from-amber-700/10 to-amber-800/10 border-amber-700/30\";
    return \"\";
  };

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"text-center mb-10\"
        >
          <div className=\"inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl mb-4\">
            <Trophy className=\"w-8 h-8 text-amber-500\" />
          </div>
          <h1 className=\"text-4xl font-bold text-white mb-2\">Clasament</h1>
          <p className=\"text-zinc-400\">Top jucători după câștiguri totale</p>
        </motion.div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=\"flex items-end justify-center gap-4 mb-10\"
          >
            {/* 2nd place */}
            <div className=\"text-center\">
              <div className=\"relative\">
                <Avatar className=\"w-20 h-20 border-4 border-zinc-300 mx-auto\">
                  <AvatarImage src={leaderboard[1]?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[1]?.user_id}`} />
                  <AvatarFallback>{leaderboard[1]?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center text-black font-bold\">
                  2
                </div>
              </div>
              <div className=\"mt-4 p-4 bg-zinc-800/50 rounded-xl h-24\">
                <p className=\"font-semibold text-white truncate max-w-24\">{leaderboard[1]?.name}</p>
                <p className=\"text-sm text-amber-400\">{formatCoins(leaderboard[1]?.total_earnings || 0)}</p>
              </div>
            </div>

            {/* 1st place */}
            <div className=\"text-center -mt-8\">
              <div className=\"relative\">
                <div className=\"absolute -top-6 left-1/2 -translate-x-1/2\">
                  <Crown className=\"w-8 h-8 text-amber-500\" />
                </div>
                <Avatar className=\"w-28 h-28 border-4 border-amber-500 mx-auto ring-4 ring-amber-500/30\">
                  <AvatarImage src={leaderboard[0]?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[0]?.user_id}`} />
                  <AvatarFallback>{leaderboard[0]?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold\">
                  1
                </div>
              </div>
              <div className=\"mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl h-28\">
                <p className=\"font-semibold text-white truncate max-w-28\">{leaderboard[0]?.name}</p>
                <p className=\"text-lg font-bold text-amber-400\">{formatCoins(leaderboard[0]?.total_earnings || 0)}</p>
                <Badge className=\"mt-1 bg-amber-500/20 text-amber-400 border-amber-500/30\">
                  Campion
                </Badge>
              </div>
            </div>

            {/* 3rd place */}
            <div className=\"text-center\">
              <div className=\"relative\">
                <Avatar className=\"w-20 h-20 border-4 border-amber-700 mx-auto\">
                  <AvatarImage src={leaderboard[2]?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[2]?.user_id}`} />
                  <AvatarFallback>{leaderboard[2]?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className=\"absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold\">
                  3
                </div>
              </div>
              <div className=\"mt-4 p-4 bg-zinc-800/50 rounded-xl h-24\">
                <p className=\"font-semibold text-white truncate max-w-24\">{leaderboard[2]?.name}</p>
                <p className=\"text-sm text-amber-400\">{formatCoins(leaderboard[2]?.total_earnings || 0)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard list */}
        <div className=\"glass-card overflow-hidden\">
          <div className=\"p-4 border-b border-zinc-800\">
            <div className=\"grid grid-cols-12 text-sm text-zinc-500 font-medium\">
              <div className=\"col-span-1\">#</div>
              <div className=\"col-span-5\">Jucător</div>
              <div className=\"col-span-3 text-center\">Victorii</div>
              <div className=\"col-span-3 text-right\">Câștiguri</div>
            </div>
          </div>

          {loading ? (
            <div className=\"p-4 space-y-3\">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className=\"h-16 bg-zinc-800 rounded animate-pulse\"></div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className=\"p-12 text-center\">
              <TrendingUp className=\"w-12 h-12 text-zinc-600 mx-auto mb-4\" />
              <h3 className=\"text-lg font-semibold text-white mb-2\">Clasament gol</h3>
              <p className=\"text-zinc-400\">Fii primul care intră în clasament!</p>
            </div>
          ) : (
            <div className=\"divide-y divide-zinc-800/50\">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === user?.user_id;
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`grid grid-cols-12 items-center p-4 hover:bg-zinc-800/30 transition-colors ${getRankStyle(entry.rank)} ${
                      isCurrentUser ? \"ring-1 ring-emerald-500/50 bg-emerald-500/5\" : \"\"
                    }`}
                  >
                    <div className=\"col-span-1 flex items-center justify-center\">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className=\"col-span-5 flex items-center space-x-3\">
                      <Avatar className={`w-10 h-10 ${isCurrentUser ? \"ring-2 ring-emerald-500\" : \"\"}`}>
                        <AvatarImage src={entry.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user_id}`} />
                        <AvatarFallback>{entry.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-medium ${isCurrentUser ? \"text-emerald-400\" : \"text-white\"}`}>
                          {entry.name}
                          {isCurrentUser && <span className=\"text-xs text-zinc-500 ml-2\">(Tu)</span>}
                        </p>
                      </div>
                    </div>
                    <div className=\"col-span-3 text-center\">
                      <div className=\"flex items-center justify-center space-x-1\">
                        <Trophy className=\"w-4 h-4 text-emerald-500\" />
                        <span className=\"text-zinc-300\">{entry.total_wins}</span>
                      </div>
                    </div>
                    <div className=\"col-span-3 text-right\">
                      <div className=\"flex items-center justify-end space-x-1\">
                        <Coins className=\"w-4 h-4 text-amber-500\" />
                        <span className=\"text-amber-400 font-semibold\">{formatCoins(entry.total_earnings)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"