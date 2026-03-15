"import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import { useAuth } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { toast } from \"sonner\";
import { Mail, Lock, User, ArrowRight, Loader2 } from \"lucide-react\";

export default function RegisterPage() {
  const [name, setName] = useState(\"\");
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [confirmPassword, setConfirmPassword] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(\"Parolele nu coincid\");
      return;
    }

    if (password.length < 6) {
      toast.error(\"Parola trebuie să aibă minim 6 caractere\");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      toast.success(\"Cont creat cu succes! Ai primit 10,000 monezi bonus!\");
      navigate(\"/lobby\");
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare la înregistrare\");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-[#09090b] flex\">
      {/* Left side - Image */}
      <div className=\"hidden lg:flex flex-1 relative\">
        <div className=\"absolute inset-0 bg-gradient-to-l from-[#09090b] to-transparent z-10\"></div>
        <div 
          className=\"absolute inset-0 bg-cover bg-center opacity-50\"
          style={{ backgroundImage: \"url('https://images.unsplash.com/photo-1765624408968-f50eaac94e2f?w=1200')\" }}
        ></div>
        <div className=\"absolute inset-0 flex items-center justify-center z-20\">
          <div className=\"text-center px-12\">
            <h2 className=\"text-4xl font-bold text-white mb-4\">
              Începe Aventura<br />
              <span className=\"text-emerald-500\">Poker</span>
            </h2>
            <p className=\"text-zinc-400\">
              Primești 10,000 monezi gratuit<br />
              la crearea contului!
            </p>
            <div className=\"mt-8 inline-flex items-center px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full\">
              <span className=\"text-emerald-400 font-bold text-2xl\">🎁 10,000</span>
              <span className=\"text-zinc-400 ml-2\">monezi bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className=\"flex-1 flex items-center justify-center p-8\">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"w-full max-w-md\"
        >
          <Link to=\"/\" className=\"flex items-center space-x-2 mb-10\">
            <div className=\"w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center\">
              <span className=\"text-white font-black text-lg\">A</span>
            </div>
            <span className=\"text-2xl font-bold text-white tracking-tight\">
              ALL<span className=\"text-emerald-500\">in</span>
            </span>
          </Link>

          <h1 className=\"text-3xl font-bold text-white mb-2\">Creează un cont</h1>
          <p className=\"text-zinc-400 mb-8\">Alătură-te comunității de jucători profesioniști.</p>

          <form onSubmit={handleSubmit} className=\"space-y-5\">
            <div className=\"space-y-2\">
              <Label htmlFor=\"name\" className=\"text-zinc-300\">Nume</Label>
              <div className=\"relative\">
                <User className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500\" />
                <Input
                  id=\"name\"
                  data-testid=\"register-name-input\"
                  type=\"text\"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=\"Numele tău\"
                  className=\"pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500\"
                  required
                />
              </div>
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"email\" className=\"text-zinc-300\">Email</Label>
              <div className=\"relative\">
                <Mail className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500\" />
                <Input
                  id=\"email\"
                  data-testid=\"register-email-input\"
                  type=\"email\"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=\"email@exemplu.com\"
                  className=\"pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500\"
                  required
                />
              </div>
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"password\" className=\"text-zinc-300\">Parolă</Label>
              <div className=\"relative\">
                <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500\" />
                <Input
                  id=\"password\"
                  data-testid=\"register-password-input\"
                  type=\"password\"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=\"••••••••\"
                  className=\"pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500\"
                  required
                />
              </div>
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"confirmPassword\" className=\"text-zinc-300\">Confirmă Parola</Label>
              <div className=\"relative\">
                <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500\" />
                <Input
                  id=\"confirmPassword\"
                  data-testid=\"register-confirm-password-input\"
                  type=\"password\"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=\"••••••••\"
                  className=\"pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500\"
                  required
                />
              </div>
            </div>

            <Button
              type=\"submit\"
              data-testid=\"register-submit-btn\"
              disabled={loading}
              className=\"w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-6 font-bold\"
            >
              {loading ? (
                <Loader2 className=\"w-5 h-5 animate-spin\" />
              ) : (
                <>
                  Creează Cont
                  <ArrowRight className=\"w-5 h-5 ml-2\" />
                </>
              )}
            </Button>
          </form>

          <div className=\"relative my-6\">
            <div className=\"absolute inset-0 flex items-center\">
              <div className=\"w-full border-t border-zinc-800\"></div>
            </div>
            <div className=\"relative flex justify-center text-sm\">
              <span className=\"px-4 bg-[#09090b] text-zinc-500\">sau continuă cu</span>
            </div>
          </div>

          <Button
            type=\"button\"
            data-testid=\"register-google-btn\"
            onClick={loginWithGoogle}
            variant=\"outline\"
            className=\"w-full border-zinc-700 text-white hover:bg-zinc-800 rounded-lg py-6\"
          >
            <svg className=\"w-5 h-5 mr-2\" viewBox=\"0 0 24 24\">
              <path
                fill=\"currentColor\"
                d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"
              />
            </svg>
            Continuă cu Google
          </Button>

          <p className=\"text-center text-zinc-400 mt-6\">
            Ai deja cont?{\" \"}
            <Link to=\"/login\" className=\"text-emerald-500 hover:text-emerald-400 font-medium\">
              Autentifică-te
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
"