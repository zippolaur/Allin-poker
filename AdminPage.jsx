"import { useState, useEffect } from \"react\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { Badge } from \"@/components/ui/badge\";
import { Calendar } from \"@/components/ui/calendar\";
import { Popover, PopoverContent, PopoverTrigger } from \"@/components/ui/popover\";
import { toast } from \"sonner\";
import { format } from \"date-fns\";
import {
  Users,
  Trophy,
  Plus,
  Trash2,
  CalendarIcon,
  Settings,
  BarChart3,
  Loader2,
  Shield,
  Table as TableIcon
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function AdminPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [tables, setTables] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New table form
  const [tableForm, setTableForm] = useState({
    name: \"\",
    small_blind: 10,
    big_blind: 20,
    min_buy_in: 500,
    max_buy_in: 5000,
    max_players: 9
  });

  // New tournament form
  const [tournamentForm, setTournamentForm] = useState({
    name: \"\",
    buy_in: 1000,
    starting_chips: 5000,
    max_players: 50,
    start_time: new Date(),
    prize_pool_percentage: 100
  });

  const [creatingTable, setCreatingTable] = useState(false);
  const [creatingTournament, setCreatingTournament] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, tablesRes, tournamentsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/tables`),
        axios.get(`${API}/tournaments`)
      ]);
      setStats(statsRes.data);
      setTables(tablesRes.data);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error(\"Error fetching admin data:\", error);
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (e) => {
    e.preventDefault();
    setCreatingTable(true);

    try {
      await axios.post(`${API}/tables`, tableForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Masă creată cu succes!\");
      setTableForm({
        name: \"\",
        small_blind: 10,
        big_blind: 20,
        min_buy_in: 500,
        max_buy_in: 5000,
        max_players: 9
      });
      await fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare la creare\");
    } finally {
      setCreatingTable(false);
    }
  };

  const deleteTable = async (tableId) => {
    try {
      await axios.delete(`${API}/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Masă ștearsă\");
      setTables(prev => prev.filter(t => t.table_id !== tableId));
    } catch (error) {
      toast.error(\"Eroare la ștergere\");
    }
  };

  const createTournament = async (e) => {
    e.preventDefault();
    setCreatingTournament(true);

    try {
      await axios.post(`${API}/tournaments`, {
        ...tournamentForm,
        start_time: tournamentForm.start_time.toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Turneu creat cu succes!\");
      setTournamentForm({
        name: \"\",
        buy_in: 1000,
        starting_chips: 5000,
        max_players: 50,
        start_time: new Date(),
        prize_pool_percentage: 100
      });
      await fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare la creare\");
    } finally {
      setCreatingTournament(false);
    }
  };

  const deleteTournament = async (tournamentId) => {
    try {
      await axios.delete(`${API}/tournaments/${tournamentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(\"Turneu șters\");
      setTournaments(prev => prev.filter(t => t.tournament_id !== tournamentId));
    } catch (error) {
      toast.error(\"Eroare la ștergere\");
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"flex items-center justify-between mb-8\"
        >
          <div>
            <div className=\"flex items-center space-x-3 mb-2\">
              <Shield className=\"w-8 h-8 text-red-500\" />
              <h1 className=\"text-3xl font-bold text-white\">Panou Admin</h1>
            </div>
            <p className=\"text-zinc-400\">Gestionează mese și turnee</p>
          </div>
          <Badge className={user?.role === \"administrator\" ? \"bg-amber-500 text-black\" : \"bg-red-600 text-white\"}>
            {user?.role === \"administrator\" ? \"Administrator\" : \"Admin\"}
          </Badge>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-8\"
          >
            <div className=\"glass-card p-4\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center\">
                  <Users className=\"w-5 h-5 text-blue-500\" />
                </div>
                <div>
                  <p className=\"text-sm text-zinc-400\">Total Utilizatori</p>
                  <p className=\"text-2xl font-bold text-white\">{stats.total_users}</p>
                </div>
              </div>
            </div>

            <div className=\"glass-card p-4\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center\">
                  <TableIcon className=\"w-5 h-5 text-emerald-500\" />
                </div>
                <div>
                  <p className=\"text-sm text-zinc-400\">Total Mese</p>
                  <p className=\"text-2xl font-bold text-white\">{stats.total_tables}</p>
                </div>
              </div>
            </div>

            <div className=\"glass-card p-4\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center\">
                  <Trophy className=\"w-5 h-5 text-amber-500\" />
                </div>
                <div>
                  <p className=\"text-sm text-zinc-400\">Total Turnee</p>
                  <p className=\"text-2xl font-bold text-white\">{stats.total_tournaments}</p>
                </div>
              </div>
            </div>

            <div className=\"glass-card p-4\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center\">
                  <BarChart3 className=\"w-5 h-5 text-purple-500\" />
                </div>
                <div>
                  <p className=\"text-sm text-zinc-400\">Mese Active</p>
                  <p className=\"text-2xl font-bold text-white\">{stats.active_tables}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue=\"tables\" className=\"w-full\">
          <TabsList className=\"bg-zinc-900 border border-zinc-800 p-1 mb-6\">
            <TabsTrigger 
              value=\"tables\" 
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <TableIcon className=\"w-4 h-4 mr-2\" />
              Mese
            </TabsTrigger>
            <TabsTrigger 
              value=\"tournaments\"
              className=\"data-[state=active]:bg-emerald-500 data-[state=active]:text-white\"
            >
              <Trophy className=\"w-4 h-4 mr-2\" />
              Turnee
            </TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value=\"tables\">
            <div className=\"grid lg:grid-cols-2 gap-6\">
              {/* Create Table Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=\"glass-card p-6\"
              >
                <h2 className=\"text-xl font-semibold text-white mb-4 flex items-center\">
                  <Plus className=\"w-5 h-5 mr-2 text-emerald-500\" />
                  Creează Masă Nouă
                </h2>
                <form onSubmit={createTable} className=\"space-y-4\">
                  <div>
                    <Label className=\"text-zinc-300\">Nume Masă</Label>
                    <Input
                      value={tableForm.name}
                      onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                      placeholder=\"Ex: High Stakes Table\"
                      className=\"bg-zinc-800 border-zinc-700 text-white\"
                      required
                    />
                  </div>

                  <div className=\"grid grid-cols-2 gap-4\">
                    <div>
                      <Label className=\"text-zinc-300\">Small Blind</Label>
                      <Input
                        type=\"number\"
                        value={tableForm.small_blind}
                        onChange={(e) => setTableForm({ ...tableForm, small_blind: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                    <div>
                      <Label className=\"text-zinc-300\">Big Blind</Label>
                      <Input
                        type=\"number\"
                        value={tableForm.big_blind}
                        onChange={(e) => setTableForm({ ...tableForm, big_blind: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                  </div>

                  <div className=\"grid grid-cols-2 gap-4\">
                    <div>
                      <Label className=\"text-zinc-300\">Min Buy-in</Label>
                      <Input
                        type=\"number\"
                        value={tableForm.min_buy_in}
                        onChange={(e) => setTableForm({ ...tableForm, min_buy_in: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                    <div>
                      <Label className=\"text-zinc-300\">Max Buy-in</Label>
                      <Input
                        type=\"number\"
                        value={tableForm.max_buy_in}
                        onChange={(e) => setTableForm({ ...tableForm, max_buy_in: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className=\"text-zinc-300\">Max Jucători</Label>
                    <Input
                      type=\"number\"
                      value={tableForm.max_players}
                      onChange={(e) => setTableForm({ ...tableForm, max_players: parseInt(e.target.value) })}
                      min={2}
                      max={9}
                      className=\"bg-zinc-800 border-zinc-700 text-white\"
                      required
                    />
                  </div>

                  <Button
                    type=\"submit\"
                    disabled={creatingTable}
                    className=\"w-full bg-emerald-500 hover:bg-emerald-600 text-white\"
                  >
                    {creatingTable ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : \"Creează Masă\"}
                  </Button>
                </form>
              </motion.div>

              {/* Existing Tables */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className=\"space-y-3\"
              >
                <h2 className=\"text-xl font-semibold text-white mb-4\">Mese Existente</h2>
                {tables.length === 0 ? (
                  <div className=\"glass-card p-8 text-center\">
                    <TableIcon className=\"w-12 h-12 text-zinc-600 mx-auto mb-2\" />
                    <p className=\"text-zinc-400\">Nicio masă creată</p>
                  </div>
                ) : (
                  tables.map((table) => (
                    <div key={table.table_id} className=\"glass-card p-4 flex items-center justify-between\">
                      <div>
                        <h3 className=\"font-medium text-white\">{table.name}</h3>
                        <p className=\"text-sm text-zinc-400\">
                          {table.small_blind}/{table.big_blind} • {table.current_players}/{table.max_players} jucători
                        </p>
                      </div>
                      <Button
                        variant=\"ghost\"
                        size=\"icon\"
                        onClick={() => deleteTable(table.table_id)}
                        className=\"text-zinc-400 hover:text-red-500\"
                      >
                        <Trash2 className=\"w-5 h-5\" />
                      </Button>
                    </div>
                  ))
                )}
              </motion.div>
            </div>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value=\"tournaments\">
            <div className=\"grid lg:grid-cols-2 gap-6\">
              {/* Create Tournament Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=\"glass-card p-6\"
              >
                <h2 className=\"text-xl font-semibold text-white mb-4 flex items-center\">
                  <Plus className=\"w-5 h-5 mr-2 text-amber-500\" />
                  Creează Turneu Nou
                </h2>
                <form onSubmit={createTournament} className=\"space-y-4\">
                  <div>
                    <Label className=\"text-zinc-300\">Nume Turneu</Label>
                    <Input
                      value={tournamentForm.name}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                      placeholder=\"Ex: Sunday Million\"
                      className=\"bg-zinc-800 border-zinc-700 text-white\"
                      required
                    />
                  </div>

                  <div className=\"grid grid-cols-2 gap-4\">
                    <div>
                      <Label className=\"text-zinc-300\">Buy-in</Label>
                      <Input
                        type=\"number\"
                        value={tournamentForm.buy_in}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, buy_in: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                    <div>
                      <Label className=\"text-zinc-300\">Starting Chips</Label>
                      <Input
                        type=\"number\"
                        value={tournamentForm.starting_chips}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, starting_chips: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                  </div>

                  <div className=\"grid grid-cols-2 gap-4\">
                    <div>
                      <Label className=\"text-zinc-300\">Max Jucători</Label>
                      <Input
                        type=\"number\"
                        value={tournamentForm.max_players}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, max_players: parseInt(e.target.value) })}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                    <div>
                      <Label className=\"text-zinc-300\">% Premii</Label>
                      <Input
                        type=\"number\"
                        value={tournamentForm.prize_pool_percentage}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, prize_pool_percentage: parseInt(e.target.value) })}
                        min={1}
                        max={100}
                        className=\"bg-zinc-800 border-zinc-700 text-white\"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className=\"text-zinc-300\">Data Start</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=\"outline\"
                          className=\"w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700\"
                        >
                          <CalendarIcon className=\"mr-2 h-4 w-4\" />
                          {tournamentForm.start_time ? format(tournamentForm.start_time, \"PPP HH:mm\") : \"Selectează data\"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=\"w-auto p-0 bg-zinc-900 border-zinc-800\">
                        <Calendar
                          mode=\"single\"
                          selected={tournamentForm.start_time}
                          onSelect={(date) => date && setTournamentForm({ ...tournamentForm, start_time: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    type=\"submit\"
                    disabled={creatingTournament}
                    className=\"w-full bg-amber-500 hover:bg-amber-600 text-black font-bold\"
                  >
                    {creatingTournament ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : \"Creează Turneu\"}
                  </Button>
                </form>
              </motion.div>

              {/* Existing Tournaments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className=\"space-y-3\"
              >
                <h2 className=\"text-xl font-semibold text-white mb-4\">Turnee Existente</h2>
                {tournaments.length === 0 ? (
                  <div className=\"glass-card p-8 text-center\">
                    <Trophy className=\"w-12 h-12 text-zinc-600 mx-auto mb-2\" />
                    <p className=\"text-zinc-400\">Niciun turneu creat</p>
                  </div>
                ) : (
                  tournaments.map((tournament) => (
                    <div key={tournament.tournament_id} className=\"glass-card p-4 flex items-center justify-between\">
                      <div>
                        <h3 className=\"font-medium text-white\">{tournament.name}</h3>
                        <p className=\"text-sm text-zinc-400\">
                          Buy-in: {formatCoins(tournament.buy_in)} • {tournament.current_players}/{tournament.max_players} jucători
                        </p>
                        <Badge className={
                          tournament.status === \"registration\" 
                            ? \"bg-emerald-500/20 text-emerald-400 mt-1\"
                            : \"bg-zinc-700 mt-1\"
                        }>
                          {tournament.status}
                        </Badge>
                      </div>
                      <Button
                        variant=\"ghost\"
                        size=\"icon\"
                        onClick={() => deleteTournament(tournament.tournament_id)}
                        className=\"text-zinc-400 hover:text-red-500\"
                      >
                        <Trash2 className=\"w-5 h-5\" />
                      </Button>
                    </div>
                  ))
                )}
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
"