"import { Link } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import { 
  PlayCircle, 
  Trophy, 
  Users, 
  CreditCard, 
  Shield, 
  Zap,
  ChevronRight,
  Star
} from \"lucide-react\";
import { Button } from \"@/components/ui/button\";

export default function LandingPage() {
  const features = [
    {
      icon: PlayCircle,
      title: \"Texas Hold'em\",
      description: \"Joacă cea mai populară variantă de poker cu jucători din întreaga lume.\"
    },
    {
      icon: Trophy,
      title: \"Turnee Zilnice\",
      description: \"Participă la turnee cu premii mari și urcă în clasamente.\"
    },
    {
      icon: Users,
      title: \"Comunitate Activă\",
      description: \"Conectează-te cu prieteni și joacă la aceleași mese.\"
    },
    {
      icon: Shield,
      title: \"Joc Fair\",
      description: \"Sistem RNG certificat pentru distribuirea corectă a cărților.\"
    }
  ];

  const stats = [
    { value: \"50K+\", label: \"Jucători Activi\" },
    { value: \"100+\", label: \"Mese Disponibile\" },
    { value: \"€1M+\", label: \"Premii Acordate\" },
    { value: \"24/7\", label: \"Suport Live\" }
  ];

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      {/* Navigation */}
      <nav className=\"fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex items-center justify-between h-16\">
            <Link to=\"/\" className=\"flex items-center space-x-2\">
              <div className=\"w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center\">
                <span className=\"text-white font-black text-lg\">A</span>
              </div>
              <span className=\"text-2xl font-bold text-white tracking-tight\">
                ALL<span className=\"text-emerald-500\">in</span>
              </span>
            </Link>

            <div className=\"flex items-center space-x-4\">
              <Link to=\"/login\">
                <Button variant=\"ghost\" className=\"text-zinc-400 hover:text-white\">
                  Autentificare
                </Button>
              </Link>
              <Link to=\"/register\">
                <Button className=\"bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6\">
                  Înregistrare
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className=\"relative min-h-screen flex items-center justify-center overflow-hidden pt-16\">
        {/* Background */}
        <div className=\"absolute inset-0 hero-gradient\"></div>
        <div className=\"absolute inset-0 bg-[url('https://images.unsplash.com/photo-1745473383212-59428c1156bc?w=1920')] bg-cover bg-center opacity-10\"></div>
        
        {/* Content */}
        <div className=\"relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className=\"inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8\">
              <Star className=\"w-4 h-4 text-emerald-500\" />
              <span className=\"text-emerald-400 text-sm font-medium\">Platforma #1 de Poker Online</span>
            </div>

            <h1 className=\"text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight\">
              Joacă Poker la<br />
              <span className=\"gold-gradient\">Cel Mai Înalt Nivel</span>
            </h1>

            <p className=\"text-xl text-zinc-400 max-w-2xl mx-auto mb-10\">
              Alătură-te celei mai mari comunități de poker online. 
              Jocuri cash, turnee și multe alte surprize te așteaptă.
            </p>

            <div className=\"flex flex-col sm:flex-row items-center justify-center gap-4\">
              <Link to=\"/register\">
                <Button 
                  data-testid=\"cta-play-now\"
                  className=\"bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all\"
                >
                  <Zap className=\"w-5 h-5 mr-2\" />
                  Joacă Acum
                </Button>
              </Link>
              <Link to=\"/leaderboard\">
                <Button 
                  variant=\"outline\" 
                  className=\"border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full px-8 py-6 text-lg\"
                >
                  Vezi Clasamente
                  <ChevronRight className=\"w-5 h-5 ml-2\" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className=\"grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto\"
          >
            {stats.map((stat, index) => (
              <div key={index} className=\"text-center\">
                <div className=\"text-3xl md:text-4xl font-bold text-white mb-1\">
                  {stat.value}
                </div>
                <div className=\"text-sm text-zinc-500\">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className=\"absolute bottom-10 left-1/2 -translate-x-1/2\"
        >
          <div className=\"w-6 h-10 border-2 border-zinc-700 rounded-full flex justify-center\">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className=\"w-1.5 h-3 bg-emerald-500 rounded-full mt-2\"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className=\"py-24 relative\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className=\"text-center mb-16\"
          >
            <h2 className=\"text-3xl md:text-5xl font-bold text-white mb-4\">
              De Ce <span className=\"text-emerald-500\">ALLin</span>?
            </h2>
            <p className=\"text-zinc-400 max-w-2xl mx-auto\">
              Oferim cea mai bună experiență de poker online cu tehnologie de ultimă generație.
            </p>
          </motion.div>

          <div className=\"grid md:grid-cols-2 lg:grid-cols-4 gap-6\">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className=\"glass-card p-6 hover:border-emerald-500/30 transition-colors group\"
              >
                <div className=\"w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors\">
                  <feature.icon className=\"w-6 h-6 text-emerald-500\" />
                </div>
                <h3 className=\"text-lg font-semibold text-white mb-2\">{feature.title}</h3>
                <p className=\"text-sm text-zinc-400\">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Poker Table Preview */}
      <section className=\"py-24 relative overflow-hidden\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"grid lg:grid-cols-2 gap-12 items-center\">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className=\"text-3xl md:text-5xl font-bold text-white mb-6\">
                Experiență de Joc<br />
                <span className=\"text-emerald-500\">Premium</span>
              </h2>
              <p className=\"text-zinc-400 mb-8\">
                Masa noastră de poker virtuală îți oferă o experiență autentică 
                cu grafică de înaltă calitate și animații fluide.
              </p>
              <ul className=\"space-y-4 mb-8\">
                {[
                  \"Interfață intuitivă și modernă\",
                  \"Chat în timp real la masă\",
                  \"Statistici detaliate ale jocului\",
                  \"Suport pentru dispozitive mobile\"
                ].map((item, index) => (
                  <li key={index} className=\"flex items-center space-x-3\">
                    <div className=\"w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center\">
                      <svg className=\"w-3 h-3 text-white\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={3} d=\"M5 13l4 4L19 7\" />
                      </svg>
                    </div>
                    <span className=\"text-zinc-300\">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to=\"/register\">
                <Button className=\"bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-3 font-bold\">
                  Începe Să Joci
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className=\"relative\"
            >
              {/* Mini poker table preview */}
              <div className=\"relative aspect-[16/10] rounded-[50px] overflow-hidden\">
                <div className=\"absolute inset-0 table-rail p-4\">
                  <div className=\"w-full h-full rounded-[40px] poker-felt flex items-center justify-center\">
                    <div className=\"text-center\">
                      <img 
                        src=\"https://images.unsplash.com/photo-1765624408968-f50eaac94e2f?w=400\" 
                        alt=\"Cards\" 
                        className=\"w-48 h-auto mx-auto rounded-lg shadow-2xl\"
                      />
                      <p className=\"text-white/80 mt-4 font-semibold\">Texas Hold'em</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=\"py-24 relative\">
        <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className=\"glass-card p-12\"
          >
            <h2 className=\"text-3xl md:text-4xl font-bold text-white mb-4\">
              Gata Să Câștigi?
            </h2>
            <p className=\"text-zinc-400 mb-8 max-w-xl mx-auto\">
              Înregistrează-te acum și primește 10,000 de monezi gratuit 
              pentru a începe aventura ta în lumea pokerului.
            </p>
            <div className=\"flex flex-col sm:flex-row items-center justify-center gap-4\">
              <Link to=\"/register\">
                <Button className=\"bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-10 py-6 text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)]\">
                  <CreditCard className=\"w-5 h-5 mr-2\" />
                  Creează Cont Gratuit
                </Button>
              </Link>
            </div>
            <p className=\"text-zinc-500 text-sm mt-6\">
              Fără card de credit necesar • Înregistrare în 30 de secunde
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className=\"border-t border-zinc-800 py-12\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex flex-col md:flex-row items-center justify-between\">
            <div className=\"flex items-center space-x-2 mb-4 md:mb-0\">
              <div className=\"w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center\">
                <span className=\"text-white font-black text-sm\">A</span>
              </div>
              <span className=\"text-lg font-bold text-white\">
                ALL<span className=\"text-emerald-500\">in</span>
              </span>
            </div>
            <p className=\"text-zinc-500 text-sm\">
              © 2024 ALLin Poker. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
"