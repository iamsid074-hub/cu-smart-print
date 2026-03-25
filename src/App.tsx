import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { lazy, Suspense, useEffect } from "react";
import { Navigate } from "react-router-dom";

// Lazy-loaded pages for performance
const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const Browse = lazy(() => import("./pages/Browse"));

// Prefetch critical routes
const prefetchRoutes = () => {
    import("./pages/Home");
    import("./pages/Browse");
};

const ListProduct = lazy(() => import("./pages/ListProduct"));
const Tracking = lazy(() => import("./pages/Tracking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Grocery = lazy(() => import("./pages/Grocery"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const FoodMenu = lazy(() => import("./pages/FoodMenu"));
const PastaOfferPage = lazy(() => import("./pages/PastaOfferPage"));
const Cart = lazy(() => import("./pages/Cart"));
const Admin = lazy(() => import("./pages/Admin"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Download = lazy(() => import("./pages/Download"));

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppUpdater from "./components/AppUpdater";
import LiveOrderBanner from "./components/LiveOrderBanner";
import UsernameSetup from "./components/UsernameSetup";
import ScrollToTop from "./components/ScrollToTop";
import StickyStripBanner from "./components/StickyStripBanner";
import FloatingMiniBanner from "./components/FloatingMiniBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useSiteGate, ClosedScreen, MaintenanceScreen } from "./components/SiteGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";


const queryClient = new QueryClient();

const BrandedLoading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#08051a] overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-[36px] p-[48px_32px]">
        <div className="flex items-center justify-center leading-none">
          <span className="cb-letter-c">C</span>
          <span className="cb-letter-b">B</span>
        </div>

        <div className="flex flex-col items-center gap-[12px] w-[140px]">
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#7F77DD] rounded-full w-0 cb-progress-fill"></div>
          </div>
          <div className="flex items-center gap-[5px]">
            <span className="font-['Cormorant_Garamond'] text-[13px] text-[#4e4880] tracking-[3px] uppercase">loading</span>
            <span className="cb-dot cb-dot-1">.</span>
            <span className="cb-dot cb-dot-2">.</span>
            <span className="cb-dot cb-dot-3">.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          {location.pathname !== "/pasta-offer" && <Navbar />}
          {location.pathname !== "/pasta-offer" && <BottomNav />}
          <FloatingMiniBanner />
        </>
      )}
      <ErrorBoundary>
        <Suspense fallback={<BrandedLoading />}>
          <Routes>
          <Route path="/" element={Capacitor.isNativePlatform() ? (user ? <Navigate to="/home" replace /> : <Login />) : <Index />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/list" element={<ProtectedRoute><ListProduct /></ProtectedRoute>} />
          <Route path="/sell" element={<Navigate to="/list" replace />} />
          <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/grocery" element={<ProtectedRoute><Grocery /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/food" element={<ProtectedRoute><FoodMenu /></ProtectedRoute>} />
          <Route path="/pasta-offer" element={<ProtectedRoute><PastaOfferPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/download" element={<Download />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
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
