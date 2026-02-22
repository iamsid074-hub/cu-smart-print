import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ListProduct from "./pages/ListProduct";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import UsernameSetup from "./components/UsernameSetup";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user } = useAuth();

  return (
    <>
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Index />} />
        {/* We wrap Home in ProtectedRoute so users are gated there too if they bypass somehow */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />

        {/* Protected Routes */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/list" element={<ProtectedRoute><ListProduct /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
