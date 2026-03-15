"import { useState, useEffect } from \"react\";
import { useSearchParams, useNavigate, Link } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { toast } from \"sonner\";
import {
  CheckCircle,
  Coins,
  Loader2,
  XCircle,
  ArrowRight,
  Sparkles
} from \"lucide-react\";

export default function ShopSuccessPage() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(\"loading\"); // loading, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get(\"session_id\");
    if (!sessionId) {
      navigate(\"/shop\");
      return;
    }

    pollPaymentStatus(sessionId);
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus(\"timeout\");
      return;
    }

    setPollCount(attempts + 1);

    try {
      const response = await axios.get(
        `${API}/shop/checkout/status/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      if (data.payment_status === \"paid\") {
        setStatus(\"success\");
        setPaymentData(data);
        await refreshUser();
        toast.success(\"Plată procesată cu succes!\");
        return;
      } else if (data.status === \"expired\" || data.payment_status === \"failed\") {
        setStatus(\"failed\");
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error(\"Error checking status:\", error);
      if (attempts >= maxAttempts - 1) {
        setStatus(\"failed\");
      } else {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  return (
    <div className=\"min-h-screen bg-[#09090b] flex items-center justify-center px-4\">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className=\"glass-card p-8 max-w-md w-full text-center\"
      >
        {status === \"loading\" && (
          <>
            <div className=\"w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6\">
              <Loader2 className=\"w-10 h-10 text-emerald-500 animate-spin\" />
            </div>
            <h1 className=\"text-2xl font-bold text-white mb-2\">
              Se procesează plata...
            </h1>
            <p className=\"text-zinc-400 mb-4\">
              Verificăm statusul tranzacției tale.
            </p>
            <div className=\"flex items-center justify-center space-x-1\">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= pollCount ? \"bg-emerald-500\" : \"bg-zinc-700\"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {status === \"success\" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: \"spring\", stiffness: 300, damping: 20 }}
              className=\"w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6\"
            >
              <CheckCircle className=\"w-10 h-10 text-white\" />
            </motion.div>
            <h1 className=\"text-2xl font-bold text-white mb-2\">
              Plată Reușită!
            </h1>
            <p className=\"text-zinc-400 mb-6\">
              Monezile au fost adăugate în contul tău.
            </p>

            {paymentData?.coins_added && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className=\"bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6\"
              >
                <div className=\"flex items-center justify-center space-x-2 mb-2\">
                  <Sparkles className=\"w-5 h-5 text-emerald-500\" />
                  <span className=\"text-emerald-400 font-medium\">Ai primit:</span>
                </div>
                <div className=\"flex items-center justify-center space-x-2\">
                  <Coins className=\"w-8 h-8 text-amber-500\" />
                  <span className=\"text-4xl font-black text-white\">
                    +{formatCoins(paymentData.coins_added)}
                  </span>
                </div>
              </motion.div>
            )}

            <div className=\"text-sm text-zinc-400 mb-6\">
              Balanță nouă:{\" \"}
              <span className=\"text-emerald-400 font-bold\">
                {formatCoins(user?.coins || 0)}
              </span>
            </div>

            <div className=\"flex flex-col space-y-3\">
              <Link to=\"/lobby\">
                <Button className=\"w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6\">
                  Mergi la Lobby
                  <ArrowRight className=\"w-5 h-5 ml-2\" />
                </Button>
              </Link>
              <Link to=\"/shop\">
                <Button variant=\"outline\" className=\"w-full border-zinc-700 text-zinc-300\">
                  Cumpără Mai Mult
                </Button>
              </Link>
            </div>
          </>
        )}

        {(status === \"failed\" || status === \"timeout\") && (
          <>
            <div className=\"w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6\">
              <XCircle className=\"w-10 h-10 text-red-500\" />
            </div>
            <h1 className=\"text-2xl font-bold text-white mb-2\">
              {status === \"timeout\" ? \"Timeout\" : \"Plată Eșuată\"}
            </h1>
            <p className=\"text-zinc-400 mb-6\">
              {status === \"timeout\"
                ? \"Verificarea plății a durat prea mult. Verifică-ți contul sau încearcă din nou.\"
                : \"A apărut o problemă cu plata ta. Te rugăm să încerci din nou.\"}
            </p>
            <div className=\"flex flex-col space-y-3\">
              <Link to=\"/shop\">
                <Button className=\"w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6\">
                  Încearcă Din Nou
                </Button>
              </Link>
              <Link to=\"/lobby\">
                <Button variant=\"outline\" className=\"w-full border-zinc-700 text-zinc-300\">
                  Înapoi la Lobby
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
"