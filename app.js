"import { useState, useEffect, createContext, useContext, useRef } from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from \"react-router-dom\";
import axios from \"axios\";
import { Toaster } from \"@/components/ui/sonner\";
import { toast } from \"sonner\";

// Pages
import LandingPage from \"@/pages/LandingPage\";
import LoginPage from \"@/pages/LoginPage\";
import RegisterPage from \"@/pages/RegisterPage\";
import LobbyPage from \"@/pages/LobbyPage\";
import TablePage from \"@/pages/TablePage\";
import ShopPage from \"@/pages/ShopPage\";
import ProfilePage from \"@/pages/ProfilePage\";
import LeaderboardPage from \"@/pages/LeaderboardPage\";
import FriendsPage from \"@/pages/FriendsPage\";
import AdminPage from \"@/pages/AdminPage\";
import ShopSuccessPage from \"@/pages/ShopSuccessPage\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(\"useAuth must be used within AuthProvider\");
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(\"token\"));

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    // Skip auth check if returning from OAuth callback
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(\"token\");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem(\"token\");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem(\"token\", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, name });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem(\"token\", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/lobby';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = () => {
    localStorage.removeItem(\"token\");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error(\"Error refreshing user:\", error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
    setUser,
    setToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth Callback - handles Google OAuth redirect
function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post(`${API}/auth/session`, { session_id: sessionId });
        const { token, user } = response.data;
        
        localStorage.setItem(\"token\", token);
        setToken(token);
        setUser(user);
        
        toast.success(`Bun venit, ${user.name}!`);
        navigate('/lobby', { replace: true });
      } catch (error) {
        console.error(\"Auth error:\", error);
        toast.error(\"Eroare la autentificare\");
        navigate('/login');
      }
    };

    processSession();
  }, []);

  return (
    <div className=\"min-h-screen bg-[#09090b] flex items-center justify-center\">
      <div className=\"text-center\">
        <div className=\"w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div>
        <p className=\"text-zinc-400\">Se procesează autentificarea...</p>
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className=\"min-h-screen bg-[#09090b] flex items-center justify-center\">
        <div className=\"w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin\"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to=\"/login\" state={{ from: location }} replace />;
  }

  if (adminOnly && ![\"admin\", \"administrator\"].includes(user.role)) {
    return <Navigate to=\"/lobby\" replace />;
  }

  return children;
}

// App Router
function AppRouter() {
  const location = useLocation();

  // Check for OAuth callback synchronously before any routing
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path=\"/\" element={<LandingPage />} />
      <Route path=\"/login\" element={<LoginPage />} />
      <Route path=\"/register\" element={<RegisterPage />} />
      <Route
        path=\"/lobby\"
        element={
          <ProtectedRoute>
            <LobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/table/:tableId\"
        element={
          <ProtectedRoute>
            <TablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/shop\"
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/shop/success\"
        element={
          <ProtectedRoute>
            <ShopSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/profile\"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/profile/:userId\"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/leaderboard\"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/friends\"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=\"/admin\"
        element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster 
          position=\"top-right\" 
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fafafa'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
"