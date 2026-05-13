import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// ── Boot version stamp — bump this to force re-play of the animation ──────────
const EOS_BOOT_VERSION = "v3.7";
(function clearStaleBootFlag() {
  try {
    const stored = sessionStorage.getItem("eos_boot_version");
    if (stored !== EOS_BOOT_VERSION) {
      sessionStorage.removeItem("eos_booted");
      sessionStorage.setItem("eos_boot_version", EOS_BOOT_VERSION);
    }
  } catch { /* storage unavailable */ }
})();


// Lazy-loaded pages for performance
const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const Browse = lazy(() => import("./pages/Browse"));

const ListProduct = lazy(() => import("./pages/ListProduct"));
const Tracking = lazy(() => import("./pages/Tracking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Grocery = lazy(() => import("./pages/Grocery"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const QuickStore = lazy(() => import("./pages/QuickStore"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));


// Core pages to preload for flawless switching
const preloadCoreRoutes = () => {
  const doPreload = () => {
    // Bottom Nav items
    import("./pages/Home");
    import("./pages/Grocery");
    import("./pages/Wallet");
    import("./pages/Settings");
    // Frequent interactions
    import("./pages/SearchPage");
    import("./pages/Profile");
    import("./pages/QuickStore");
  };
  // Use requestIdleCallback to avoid blocking initial render
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(doPreload, { timeout: 3000 });
  } else {
    setTimeout(doPreload, 1500);
  }
};
// FoodSearch replaced by new /search flow
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const RestaurantPage = lazy(() => import("./pages/RestaurantPage"));
const PastaOfferPage = lazy(() => import("./pages/PastaOfferPage"));
const Cart = lazy(() => import("./pages/Cart"));
const Admin = lazy(() => import("./pages/Admin"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Download = lazy(() => import("./pages/Download"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

const Settings = lazy(() => import("./pages/Settings"));
const Transactions = lazy(() => import("./pages/Transactions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const WalletPayment = lazy(() => import("./pages/WalletPayment"));
const WalletReset = lazy(() => import("./pages/WalletReset"));
const Games = lazy(() => import("./pages/Games"));
const RealCrash = lazy(() => import("./pages/games/RealCrash"));
const RealMines = lazy(() => import("./pages/games/RealMines"));
const Sections = lazy(() => import("./pages/Sections"));
const MobileFoodPortal = lazy(() => import("./components/MobileFoodPortal"));
const WallpaperApp = lazy(() => import("./pages/WallpaperApp"));

import Navbar from "./components/Navbar";
// import BottomNav from "./components/BottomNav";
import AppUpdater from "./components/AppUpdater";
import UsernameSetup from "./components/UsernameSetup";
import ScrollToTop from "./components/ScrollToTop";
import StickyStripBanner from "./components/StickyStripBanner";

const ControlCenter = lazy(() => import("./components/ControlCenter"));
const TutorialSystem = lazy(() => import("./components/TutorialSystem"));



// Lazy-load non-critical-path components
const LiveOrderBanner = lazy(() => import("./components/LiveOrderBanner"));

import ErrorBoundary from "./components/ErrorBoundary";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { AdminPushService } from "./services/AdminPushService";
import {
  useSiteGate,
  ClosedScreen,
  MaintenanceScreen,
  MobileBlockScreen,
} from "./components/SiteGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { posthog } from "./lib/posthog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // 1 min before refetch
      gcTime: 5 * 60_000,    // 5 min cache retention
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const BrandedLoading = () => null;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <BrandedLoading />;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profile } = useAuth();
  // Show spinner while auth OR profile is still loading
  if (loading) return <BrandedLoading />;
  if (!user) return <Navigate to="/login" replace />;
  // If user exists but profile hasn't arrived yet — wait briefly with a visual indicator
  if (!profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#231942]">
        <div className="font-bold text-2xl text-white">
          Loading admin profile...
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-2xl bg-white/10 text-sm text-white hover:bg-white/20 transition-colors border border-white/20"
        >
          Retry
        </button>
      </div>
    );
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { gate, loaded: gateLoaded } = useSiteGate();
  
  // Initial boot is always finished for instant entry
  const [initialBootFinished, setInitialBootFinished] = useState(true);

  useEffect(() => {
    if (!authLoading && gateLoaded) {
      (window as any).hasBooted = true;
      preloadCoreRoutes();
    }
  }, [authLoading, gateLoaded]);

  useEffect(() => {
    posthog.capture("$pageview");
  }, [location]);

  // Admin Push Notifications initialization remains the same...
  useEffect(() => {
    if (isAdmin && user && !authLoading) {
      AdminPushService.initialize(user.id);
    }
    if (!user && !authLoading) {
      AdminPushService.stopListening();
    }
  }, [isAdmin, user, authLoading]);

  const isLanding = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isResetPassword = location.pathname === "/reset-password";
  const isAdminPath = location.pathname.startsWith("/admin");
  const isDownload = location.pathname === "/download";
  const isDriverPage = location.pathname === "/driver";
  const isSections = location.pathname.startsWith("/sections");

  // Removed BrandedLoading return for instant entry

  // Gate screens — apply to all non-admin users on all devices
  if (
    !authLoading &&
    gate &&
    !isAdminPath &&
    !isLogin &&
    !isLanding &&
    !isResetPassword &&
    !isDownload &&
    !isDriverPage
  ) {
    if (gate === "maintenance") return <MaintenanceScreen />;
    if (gate === "closed") return <ClosedScreen />;
  }

  return (
    <>
      <AppUpdater />
      <Suspense fallback={null}>
        <ControlCenter />
        <TutorialSystem />
      </Suspense>
      {!isLanding && !isLogin && !isAdminPath && !isDownload && !isDriverPage && (
        <>
          {location.pathname !== "/pasta-offer" && <Navbar />}
          {/* BottomNav removed permanently as requested */}
        </>
      )}
      <ErrorBoundary>
        <Suspense fallback={initialBootFinished ? null : <BrandedLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                Capacitor.isNativePlatform() ? (
                  user ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Login />
                  )
                ) : (
                  <Index />
                )
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search/results"
              element={
                <ProtectedRoute>
                  <SearchResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:id"
              element={
                <ProtectedRoute>
                  <RestaurantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/home" replace /> : <Login />}
            />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <ListProduct />
                </ProtectedRoute>
              }
            />
            <Route path="/sell" element={<Navigate to="/list" replace />} />
            <Route
              path="/tracking"
              element={
                <ProtectedRoute>
                  <Tracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sections"
              element={
                <ProtectedRoute>
                  <Sections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shops"
              element={
                <ProtectedRoute>
                  <MobileFoodPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/crash"
              element={
                <ProtectedRoute>
                  <RealCrash />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/mines"
              element={
                <ProtectedRoute>
                  <RealMines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet-payment"
              element={
                <ProtectedRoute>
                  <WalletPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet-reset"
              element={
                <ProtectedRoute>
                  <WalletReset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grocery"
              element={
                <ProtectedRoute>
                  <Grocery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quick-store"
              element={
                <ProtectedRoute>
                  <QuickStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-search"
              element={<Navigate to="/search" replace />}
            />
            <Route
              path="/pasta-offer"
              element={
                <ProtectedRoute>
                  <PastaOfferPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />

            <Route 
              path="/driver" 
              element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/download" element={<Download />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/faq" element={<FAQ />} />

            <Route
              path="/wallpaper"
              element={
                <ProtectedRoute>
                  <WallpaperApp />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
            <TooltipProvider>
              <ScrollToTop />
              <AppLayout />
            </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
