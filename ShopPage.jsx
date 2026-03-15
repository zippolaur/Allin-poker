"import { useState, useEffect } from \"react\";
import { useNavigate, useSearchParams } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import axios from \"axios\";
import { useAuth, API } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Badge } from \"@/components/ui/badge\";
import { toast } from \"sonner\";
import {
  Coins,
  CreditCard,
  Gift,
  Sparkles,
  Check,
  Star,
  ShieldCheck
} from \"lucide-react\";
import NavBar from \"@/components/NavBar\";

export default function ShopPage() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/shop/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error(\"Error fetching packages:\", error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseWithStripe = async (packageId) => {
    setPurchasing(packageId);
    
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/shop/checkout/stripe`,
        { 
          package_id: packageId,
          origin_url: originUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || \"Eroare la procesarea plății\");
      setPurchasing(null);
    }
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  const packageOrder = [\"starter\", \"popular\", \"premium\", \"vip\"];

  return (
    <div className=\"min-h-screen bg-[#09090b]\">
      <NavBar />

      <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"text-center mb-12\"
        >
          <div className=\"inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6\">
            <Sparkles className=\"w-4 h-4 text-emerald-500\" />
            <span className=\"text-emerald-400 text-sm font-medium\">Cele mai bune oferte</span>
          </div>
          <h1 className=\"text-4xl md:text-5xl font-bold text-white mb-4\">
            Cumpără <span className=\"text-emerald-500\">Monezi</span>
          </h1>
          <p className=\"text-zinc-400 max-w-xl mx-auto\">
            Alege pachetul potrivit pentru stilul tău de joc. Cu cât cumperi mai mult, cu atât primești mai multe bonusuri!
          </p>
        </motion.div>

        {/* Current balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className=\"glass-card p-6 mb-8 flex items-center justify-between max-w-md mx-auto\"
        >
          <div className=\"flex items-center space-x-4\">
            <div className=\"w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center\">
              <Coins className=\"w-6 h-6 text-emerald-500\" />
            </div>
            <div>
              <p className=\"text-sm text-zinc-400\">Balanța ta</p>
              <p className=\"text-2xl font-bold text-white\">{formatCoins(user?.coins || 0)}</p>
            </div>
          </div>
        </motion.div>

        {/* Packages */}
        {loading ? (
          <div className=\"grid md:grid-cols-2 lg:grid-cols-4 gap-6\">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className=\"glass-card p-6 animate-pulse\">
                <div className=\"h-8 bg-zinc-800 rounded mb-4\"></div>
                <div className=\"h-12 bg-zinc-800 rounded mb-4\"></div>
                <div className=\"h-4 bg-zinc-800 rounded w-2/3 mb-2\"></div>
                <div className=\"h-4 bg-zinc-800 rounded w-1/2\"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className=\"grid md:grid-cols-2 lg:grid-cols-4 gap-6\">
            {packageOrder.map((key, index) => {
              const pkg = packages[key];
              if (!pkg) return null;

              const isPopular = key === \"popular\";
              const isPremium = key === \"premium\";
              const isVip = key === \"vip\";

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative glass-card p-6 hover:border-emerald-500/30 transition-all ${
                    isPopular ? \"ring-2 ring-emerald-500 border-emerald-500/50\" : \"\"
                  } ${isVip ? \"ring-2 ring-amber-500 border-amber-500/50\" : \"\"}`}
                >
                  {isPopular && (
                    <Badge className=\"absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white\">
                      <Star className=\"w-3 h-3 mr-1\" />
                      Popular
                    </Badge>
                  )}
                  {isVip && (
                    <Badge className=\"absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black\">
                      <Star className=\"w-3 h-3 mr-1\" />
                      VIP
                    </Badge>
                  )}

                  <div className=\"text-center mb-6\">
                    <h3 className=\"text-xl font-bold text-white mb-2\">{pkg.name}</h3>
                    <div className=\"flex items-center justify-center space-x-2\">
                      <Coins className=\"w-6 h-6 text-amber-500\" />
                      <span className=\"text-3xl font-black text-white\">
                        {formatCoins(pkg.coins)}
                      </span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className=\"mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 rounded-full\">
                        <Gift className=\"w-4 h-4 text-emerald-500\" />
                        <span className=\"text-emerald-400 text-sm font-medium\">
                          +{formatCoins(pkg.bonus)} bonus
                        </span>
                      </div>
                    )}
                  </div>

                  <div className=\"space-y-3 mb-6\">
                    <div className=\"flex items-center space-x-2 text-sm text-zinc-400\">
                      <Check className=\"w-4 h-4 text-emerald-500\" />
                      <span>Transfer instant</span>
                    </div>
                    <div className=\"flex items-center space-x-2 text-sm text-zinc-400\">
                      <Check className=\"w-4 h-4 text-emerald-500\" />
                      <span>Tranzacție securizată</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className=\"flex items-center space-x-2 text-sm text-zinc-400\">
                        <Check className=\"w-4 h-4 text-emerald-500\" />
                        <span>{Math.round(pkg.bonus / pkg.coins * 100)}% bonus</span>
                      </div>
                    )}
                  </div>

                  <div className=\"text-center mb-4\">
                    <span className=\"text-4xl font-black text-white\">
                      ${pkg.price.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    data-testid={`buy-package-${key}`}
                    onClick={() => purchaseWithStripe(key)}
                    disabled={purchasing === key}
                    className={`w-full ${
                      isVip 
                        ? \"bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black\"
                        : isPopular
                        ? \"bg-emerald-500 hover:bg-emerald-600 text-white\"
                        : \"bg-zinc-700 hover:bg-zinc-600 text-white\"
                    } font-bold py-6`}
                  >
                    {purchasing === key ? (
                      <span className=\"flex items-center\">
                        <svg className=\"animate-spin -ml-1 mr-3 h-5 w-5\" viewBox=\"0 0 24 24\">
                          <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\" fill=\"none\" />
                          <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\" />
                        </svg>
                        Procesare...
                      </span>
                    ) : (
                      <>
                        <CreditCard className=\"w-5 h-5 mr-2\" />
                        Cumpără Acum
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className=\"mt-12 text-center\"
        >
          <div className=\"inline-flex items-center space-x-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full\">
            <ShieldCheck className=\"w-5 h-5 text-emerald-500\" />
            <span className=\"text-zinc-400 text-sm\">
              Plăți securizate prin <span className=\"text-white font-medium\">Stripe</span>
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
"