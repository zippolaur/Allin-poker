"import { useState } from \"react\";
import { Link, useLocation, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/App\";
import { Button } from \"@/components/ui/button\";
import { Avatar, AvatarFallback, AvatarImage } from \"@/components/ui/avatar\";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from \"@/components/ui/dropdown-menu\";
import {
  Users,
  Trophy,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Coins,
  Menu,
  X,
  Home,
  Crown,
  Shield
} from \"lucide-react\";

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(\"/\");
  };

  const formatCoins = (coins) => {
    return new Intl.NumberFormat(\"ro-RO\").format(coins);
  };

  const navLinks = [
    { href: \"/lobby\", label: \"Lobby\", icon: Home },
    { href: \"/leaderboard\", label: \"Clasament\", icon: Trophy },
    { href: \"/friends\", label: \"Prieteni\", icon: Users },
    { href: \"/shop\", label: \"Shop\", icon: ShoppingCart },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className=\"fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div className=\"flex items-center justify-between h-16\">
          {/* Logo */}
          <Link to=\"/lobby\" className=\"flex items-center space-x-2\">
            <div className=\"w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center\">
              <span className=\"text-white font-black text-sm\">A</span>
            </div>
            <span className=\"text-xl font-bold text-white tracking-tight\">
              ALL<span className=\"text-emerald-500\">in</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className=\"hidden md:flex items-center space-x-1\">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant=\"ghost\"
                  className={`${
                    isActive(link.href)
                      ? \"text-emerald-500 bg-emerald-500/10\"
                      : \"text-zinc-400 hover:text-white\"
                  }`}
                >
                  <link.icon className=\"w-4 h-4 mr-2\" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {user?.role && [\"admin\", \"administrator\"].includes(user.role) && (
              <Link to=\"/admin\">
                <Button
                  variant=\"ghost\"
                  className={`${
                    isActive(\"/admin\")
                      ? \"text-red-500 bg-red-500/10\"
                      : \"text-zinc-400 hover:text-white\"
                  }`}
                >
                  <Shield className=\"w-4 h-4 mr-2\" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className=\"flex items-center space-x-4\">
            {/* Coins display */}
            <Link to=\"/shop\">
              <div className=\"hidden sm:flex items-center space-x-2 px-4 py-2 bg-zinc-800/50 rounded-full border border-zinc-700 hover:border-emerald-500/50 transition-colors cursor-pointer\">
                <Coins className=\"w-4 h-4 text-amber-500\" />
                <span className=\"font-medium text-white\">{formatCoins(user?.coins || 0)}</span>
              </div>
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant=\"ghost\" className=\"relative h-10 w-10 rounded-full p-0\">
                  <Avatar className=\"h-10 w-10 border-2 border-zinc-700\">
                    <AvatarImage src={user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`} />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className=\"w-56 bg-zinc-900 border-zinc-800\" align=\"end\">
                <div className=\"px-3 py-2\">
                  <p className=\"text-sm font-medium text-white\">{user?.name}</p>
                  <p className=\"text-xs text-zinc-400\">{user?.email}</p>
                  {user?.role && user.role !== \"user\" && (
                    <div className=\"mt-1\">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.role === \"administrator\" 
                          ? \"bg-amber-500/20 text-amber-400\" 
                          : \"bg-red-500/20 text-red-400\"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className=\"bg-zinc-800\" />
                <DropdownMenuItem 
                  className=\"cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800\"
                  onClick={() => navigate(\"/profile\")}
                >
                  <User className=\"w-4 h-4 mr-2\" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className=\"cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800\"
                  onClick={() => navigate(\"/shop\")}
                >
                  <ShoppingCart className=\"w-4 h-4 mr-2\" />
                  Cumpără Monezi
                </DropdownMenuItem>
                {user?.role && [\"admin\", \"administrator\"].includes(user.role) && (
                  <DropdownMenuItem 
                    className=\"cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800\"
                    onClick={() => navigate(\"/admin\")}
                  >
                    <Shield className=\"w-4 h-4 mr-2\" />
                    Panou Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className=\"bg-zinc-800\" />
                <DropdownMenuItem 
                  className=\"cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10\"
                  onClick={handleLogout}
                >
                  <LogOut className=\"w-4 h-4 mr-2\" />
                  Deconectare
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant=\"ghost\"
              size=\"icon\"
              className=\"md:hidden text-zinc-400\"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className=\"md:hidden border-t border-zinc-800 bg-zinc-900\">
          <div className=\"px-4 py-4 space-y-2\">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive(link.href)
                    ? \"bg-emerald-500/10 text-emerald-500\"
                    : \"text-zinc-400 hover:bg-zinc-800 hover:text-white\"
                }`}
              >
                <link.icon className=\"w-5 h-5\" />
                <span>{link.label}</span>
              </Link>
            ))}
            {user?.role && [\"admin\", \"administrator\"].includes(user.role) && (
              <Link
                to=\"/admin\"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive(\"/admin\")
                    ? \"bg-red-500/10 text-red-500\"
                    : \"text-zinc-400 hover:bg-zinc-800 hover:text-white\"
                }`}
              >
                <Shield className=\"w-5 h-5\" />
                <span>Admin</span>
              </Link>
            )}
            
            {/* Mobile coins display */}
            <div className=\"px-4 py-3 border-t border-zinc-800 mt-2\">
              <div className=\"flex items-center justify-between\">
                <span className=\"text-zinc-400\">Monezile tale:</span>
                <div className=\"flex items-center space-x-2\">
                  <Coins className=\"w-4 h-4 text-amber-500\" />
                  <span className=\"font-bold text-white\">{formatCoins(user?.coins || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
"