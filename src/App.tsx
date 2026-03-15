import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Index from "./pages/Index";
import { Capacitor } from "@capacitor/core";
import Home from "./pages/Home";

import ListProduct from "./pages/ListProduct";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import Grocery from "./pages/Grocery";
import ProductDetail from "./pages/ProductDetail";
import FoodMenu from "./pages/FoodMenu";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import TermsAndConditions from "./pages/TermsAndConditions";
import HelpCenter from "./pages/HelpCenter";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppUpdater from "./components/AppUpdater";
import LiveOrderBanner from "./components/LiveOrderBanner";
import UsernameSetup from "./components/UsernameSetup";
import ScrollToTop from "./components/ScrollToTop";
import Download from "./pages/Download";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useSiteGate, ClosedScreen, MaintenanceScreen } from "./components/SiteGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";


const queryClient = new QueryClient();

const BrandedLoading = () => {
  useEffect(() => {
    // Pre-fetch critical images while loading
    const imagesToPreload = [
      '/cb_gold_logo_v1.png',
      '/banners/community.png',
      '/banners/sell.png',
      '/banners/delivery.png',
      '/cricket_bg_desktop.png'
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#231942] relative overflow-hidden">
      {"/* Decorative background glow */"}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-white rounded-3xl p-2 mb-6 shadow-[0_10px_0_#000] border-4 border-black rotate-[-3deg]">
          <img src="/logo.png" alt="Logo" className="w-full h-full rounded-2xl object-cover" />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_0_#FF4D4D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          CU BAZZAR
        </h1>
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i} 
              className="w-3 h-3 rounded-full bg-white shadow-[0_3px_0_#000]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <BrandedLoading />;
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
  if (loading) return <BrandedLoading />;
  if (!user) return <Navigate to="/login" replace />;
  // If user exists but profile hasn't arrived yet — wait briefly with a visual indicator
  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#231942]">
      <div className="font-bold text-2xl text-white">Loading admin profile...</div>
      <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-2xl bg-white/10 text-sm text-white hover:bg-white/20 transition-colors border border-white/20">
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
  const isResetPassword = location.pathname === "/reset-password";
  const isAdmin = location.pathname.startsWith("/admin");
  const { user } = useAuth();
  const { gate, loaded } = useSiteGate();

  const isDownload = location.pathname === "/download";

  // If site gate logic is still loading, show branded loading to avoid layout shifts or white flashes
  if (!loaded && !isLanding && !isLogin && !isAdmin && !isDownload && !isResetPassword) {
    return <BrandedLoading />;
  }

  // Show gate screens for non-admin, non-login, non-landing pages
  if (gate && !isAdmin && !isLogin && !isLanding && !isResetPassword && !isDownload) {
    if (gate === "maintenance") return <MaintenanceScreen />;
    if (gate === "closed") return <ClosedScreen />;
  }

  return (
    <>
      <AppUpdater />
      {!isLanding && !isLogin && !isAdmin && !isDownload && (
        <>
          <Navbar />
          <LiveOrderBanner />
          <BottomNav />
        </>
      )}
      <Routes>
        <Route path="/" element={Capacitor.isNativePlatform() ? (user ? <Navigate to="/home" replace /> : <Login />) : <Index />} />
        {/* We wrap Home in ProtectedRoute so users are gated there too if they bypass somehow */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}

        <Route path="/list" element={<ProtectedRoute><ListProduct /></ProtectedRoute>} />
        <Route path="/sell" element={<Navigate to="/list" replace />} />
        <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/grocery" element={<ProtectedRoute><Grocery /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/food" element={<ProtectedRoute><FoodMenu /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        {/* Public Pages */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/download" element={<Download />} />

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
          <BrowserRouter>
            <ScrollToTop />
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
