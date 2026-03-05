import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";

import ListProduct from "./pages/ListProduct";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import FoodMenu from "./pages/FoodMenu";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import TermsAndConditions from "./pages/TermsAndConditions";
import HelpCenter from "./pages/HelpCenter";
import Navbar from "./components/Navbar";
import UsernameSetup from "./components/UsernameSetup";
import { useSiteGate, ClosedScreen, MaintenanceScreen } from "./components/SiteGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Navigate } from "react-router-dom";


const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-neon-cyan">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      {children}
      {user && profile && !profile.username && (
        <UsernameSetup onComplete={() => window.location.reload()} />
      )}
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profile } = useAuth();
  // Show spinner while auth OR profile is still loading
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-neon-cyan">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // If user exists but profile hasn't arrived yet — wait briefly with a visual indicator
  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="font-bold text-2xl text-neon-cyan">Loading admin profile...</div>
      <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors">
        Retry
      </button>
    </div>
  );
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}


function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isAdmin = location.pathname.startsWith("/admin");
  const { user } = useAuth();
  const { gate } = useSiteGate();

  // Show gate screens for non-admin, non-login, non-landing pages
  if (gate && !isAdmin && !isLogin && !isLanding) {
    if (gate === "maintenance") return <MaintenanceScreen />;
    if (gate === "closed") return <ClosedScreen />;
  }

  return (
    <>
      {!isLanding && !isLogin && !isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Index />} />
        {/* We wrap Home in ProtectedRoute so users are gated there too if they bypass somehow */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />

        {/* Protected Routes */}

        <Route path="/list" element={<ProtectedRoute><ListProduct /></ProtectedRoute>} />
        <Route path="/sell" element={<Navigate to="/list" replace />} />
        <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/food" element={<ProtectedRoute><FoodMenu /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        {/* Public Pages */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/help" element={<HelpCenter />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
