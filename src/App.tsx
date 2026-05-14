import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";

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
    // Bottom Nav items — Home is already the entry route, no need to preload
    import("./pages/Grocery");     // ~10KB, frequent
    import("./pages/Cart");        // ~57KB, very frequent  
    import("./pages/Settings");    // ~21KB, moderate
    // Frequent interactions after initial load
    import("./pages/SearchPage");  // ~24KB, very frequent
    import("./pages/QuickStore");  // ~18KB, frequent
    // Defer large pages until user has settled
    // Profile (47KB) and Wallet (71KB) are preloaded lazily after 5s
    setTimeout(() => {
      import("./pages/Profile");
      import("./pages/Wallet");
    }, 5000);
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
import DynamicWallpaper from "./components/DynamicWallpaper";

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
import { WallpaperProvider } from "./contexts/WallpaperContext";
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
      <DynamicWallpaper />
      <AppUpdater />
      <Suspense fallback={null}>
        <ControlCenter />
        <TutorialSystem />
      </Suspense>
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={initialBootFinished ? null : <BrandedLoading />}>
          {/* position:relative + overflow:hidden so AnimatePresence absolute children stack correctly */}
          <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.key}>
              <Route
                path="/"
                element={
                  <PageTransition locationKey="/">
                    {Capacitor.isNativePlatform() ? (
                      user ? (
                        <Navigate to="/home" replace />
                      ) : (
                        <Login />
                      )
                    ) : (
                      <Index />
                    )}
                  </PageTransition>
                }
              />
              <Route
                path="/home"
                element={
                  <PageTransition locationKey="/home">
                    <ProtectedRoute><Home /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/search"
                element={
                  <PageTransition locationKey="/search">
                    <ProtectedRoute><SearchPage /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/search/results"
                element={
                  <PageTransition locationKey="/search/results">
                    <ProtectedRoute><SearchResultsPage /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/shop/:id"
                element={
                  <PageTransition locationKey="/shop">
                    <ProtectedRoute><RestaurantPage /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/login"
                element={
                  <PageTransition locationKey="/login">
                    {user ? <Navigate to="/home" replace /> : <Login />}
                  </PageTransition>
                }
              />
              <Route path="/reset-password" element={<PageTransition locationKey="/reset-password"><ResetPassword /></PageTransition>} />
              <Route
                path="/list"
                element={
                  <PageTransition locationKey="/list">
                    <ProtectedRoute><ListProduct /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route path="/sell" element={<Navigate to="/list" replace />} />
              <Route
                path="/tracking"
                element={
                  <PageTransition locationKey="/tracking">
                    <ProtectedRoute><Tracking /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition locationKey="/profile">
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/wallet"
                element={
                  <PageTransition locationKey="/wallet">
                    <ProtectedRoute><Wallet /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/games"
                element={
                  <PageTransition locationKey="/games">
                    <ProtectedRoute><Games /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/sections"
                element={
                  <PageTransition locationKey="/sections">
                    <ProtectedRoute><Sections /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/shops"
                element={
                  <PageTransition locationKey="/shops">
                    <ProtectedRoute><MobileFoodPortal /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/games/crash"
                element={
                  <PageTransition locationKey="/games/crash">
                    <ProtectedRoute><RealCrash /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/games/mines"
                element={
                  <PageTransition locationKey="/games/mines">
                    <ProtectedRoute><RealMines /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/wallet-payment"
                element={
                  <PageTransition locationKey="/wallet-payment">
                    <ProtectedRoute><WalletPayment /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/wallet-reset"
                element={
                  <PageTransition locationKey="/wallet-reset">
                    <ProtectedRoute><WalletReset /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/browse"
                element={
                  <PageTransition locationKey="/browse">
                    <ProtectedRoute><Browse /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/grocery"
                element={
                  <PageTransition locationKey="/grocery">
                    <ProtectedRoute><Grocery /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <PageTransition locationKey="/product">
                    <ProtectedRoute><ProductDetail /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/quick-store"
                element={
                  <PageTransition locationKey="/quick-store">
                    <ProtectedRoute><QuickStore /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route path="/food-search" element={<Navigate to="/search" replace />} />
              <Route
                path="/pasta-offer"
                element={
                  <PageTransition locationKey="/pasta-offer">
                    <ProtectedRoute><PastaOfferPage /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/cart"
                element={
                  <PageTransition locationKey="/cart">
                    <ProtectedRoute><Cart /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/admin"
                element={
                  <PageTransition locationKey="/admin">
                    <AdminRoute><Admin /></AdminRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/driver"
                element={
                  <PageTransition locationKey="/driver">
                    <ProtectedRoute><DriverDashboard /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/settings"
                element={
                  <PageTransition locationKey="/settings">
                    <ProtectedRoute><Settings /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/transactions"
                element={
                  <PageTransition locationKey="/transactions">
                    <ProtectedRoute><Transactions /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route path="/terms" element={<PageTransition locationKey="/terms"><TermsAndConditions /></PageTransition>} />
              <Route path="/help" element={<PageTransition locationKey="/help"><HelpCenter /></PageTransition>} />
              <Route path="/download" element={<PageTransition locationKey="/download"><Download /></PageTransition>} />
              <Route path="/privacy-policy" element={<PageTransition locationKey="/privacy-policy"><PrivacyPolicy /></PageTransition>} />
              <Route path="/about-us" element={<PageTransition locationKey="/about-us"><AboutUs /></PageTransition>} />
              <Route path="/shipping-policy" element={<PageTransition locationKey="/shipping-policy"><ShippingPolicy /></PageTransition>} />
              <Route path="/faq" element={<PageTransition locationKey="/faq"><FAQ /></PageTransition>} />
              <Route
                path="/wallpaper"
                element={
                  <PageTransition locationKey="/wallpaper">
                    <ProtectedRoute><WallpaperApp /></ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          </div>
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
          <WallpaperProvider>
            <TooltipProvider>
              <ScrollToTop />
              <AppLayout />
            </TooltipProvider>
          </WallpaperProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
