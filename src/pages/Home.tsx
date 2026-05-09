import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DesktopDock from "@/components/DesktopDock";
import DesktopMenuBar from "@/components/DesktopMenuBar";
import { motion, AnimatePresence } from "framer-motion";

const DesktopWindowShops = lazy(() => import("@/components/DesktopWindowShops"));
const DesktopWindowVending = lazy(() => import("@/components/DesktopWindowVending"));
const DesktopWindowCombos = lazy(() => import("@/components/DesktopWindowCombos"));
const DesktopWindowSettings = lazy(() => import("@/components/DesktopWindowSettings"));
const DesktopWindowCart = lazy(() => import("@/components/DesktopWindowCart"));
const DesktopWindowProfile = lazy(() => import("@/components/DesktopWindowProfile"));
import DesktopStageManager from "@/components/DesktopStageManager";
import DesktopWidgetSpace from "@/components/DesktopWidgetSpace";
const FloatingLocationWidget = lazy(() => import("@/components/FloatingLocationWidget"));
const FloatingGroceryWidget = lazy(() => import("@/components/FloatingGroceryWidget"));
const FloatingWalletWidget = lazy(() => import("@/components/FloatingWalletWidget"));
import {
  Search,
  Loader2,
  ArrowUpRight,
  Utensils,
  Clock,
  Flame,
  Star,
} from "lucide-react";
import { shops } from "@/config/shopMenus";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { LayoutGrid, Boxes } from "lucide-react";

const VendingMachine = lazy(() => import("@/components/VendingMachine"));
const HomeSpecialSections = lazy(() => import("@/components/HomeSpecialSections"));
const BlinkitZomatoTransition = lazy(() => import("@/components/BlinkitZomatoTransition"));
const BlinkitAnnounceModal = lazy(() => import("@/components/BlinkitAnnounceModal"));
const ThreeDStreet = lazy(() => import("@/components/ThreeDStreet"));
const CombosSection = lazy(() => import("@/components/CombosSection"));
const LiquidToggle = lazy(() => import("@/components/LiquidToggle"));

const categories = [
  { id: "All", label: "All" },
  { id: "Electronics", label: "Electronics" },
  { id: "Books", label: "Books" },
  { id: "Fashion", label: "Fashion" },
  { id: "Sports", label: "Sports" },
  { id: "Furniture", label: "Furniture" },
];

function HeroSpotlight() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-[2.5rem] overflow-hidden mb-12 group cursor-pointer" onClick={() => navigate('/browse')}>
      <motion.img 
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=70&w=1200&auto=format&fit=crop" 
        alt="Spotlight" 
        loading="eager"
        fetchPriority="high"
        decoding="async"
        style={{ willChange: "transform" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[#000000]" />
      
      <div className="absolute inset-x-6 bottom-12 z-10 flex flex-col items-center text-center">
        <div className="relative flex flex-col items-center mt-4">
          <motion.span
            initial={{y: 20, opacity: 0, rotate: -6}}
            animate={{y: 0, opacity: 1, rotate: -6}}
            transition={{delay: 0.4, type: "spring"}}
            className="absolute -top-10 sm:-top-16 text-[3rem] sm:text-[4.5rem] text-orange-400 font-medium whitespace-nowrap z-20 select-none"
            style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", textShadow: "0px 10px 20px rgba(0,0,0,0.8)" }}
          >
            The Campus
          </motion.span>
          <motion.h1 
            initial={{y: 20, opacity: 0}} 
            animate={{y: 0, opacity: 1}} 
            transition={{delay: 0.3}} 
            className="text-[4.5rem] sm:text-[7.5rem] font-black text-white tracking-tighter leading-[0.8] text-center uppercase relative z-10 drop-shadow-2xl mb-4"
          >
            Bazzar
          </motion.h1>
        </div>
      </div>
    </div>
  );
}

type WindowId = "Shops" | "Vending" | "Combos" | "Games" | "Cart" | "Profile" | "Settings" | null;

const EOSBootAnimation = lazy(() => import("@/components/EOSBootAnimation"));

export default function Home() {
  const navigate = useNavigate();
  const [activeWindows, setActiveWindows] = useState<WindowId[]>([]);
  const [zStack, setZStack] = useState<WindowId[]>([]); // New state for focus order
  const [minimizedWindows, setMinimizedWindows] = useState<WindowId[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<WindowId[]>([]);

  // Boot animation: show once per browser tab session, desktop only
  const [showBoot, setShowBoot] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.innerWidth <= 768) return false;
    // Check flag set in this exact session
    return !sessionStorage.getItem("eos_booted");
  });
  const [uiReady, setUiReady] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!sessionStorage.getItem("eos_booted");
  });

  const [shopStatusMsg, setShopStatusMsg] = useState<string | null>(null);

  // Time check helper
  const isShopOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // 11:30 AM (690 mins) to 11:30 PM (1410 mins)
    return totalMinutes >= 690 && totalMinutes < 1410;
  };

  // Global window opener listener
  useEffect(() => {
    const handleGlobalOpen = (e: any) => {
      const id = e.detail;
      if (id === "Shops" && !isShopOpen()) {
        setShopStatusMsg("all shops are closed, will open at 11 : 30 am");
        setTimeout(() => setShopStatusMsg(null), 4000);
        return;
      }
      if (id) handleOpenWindow(id);
    };
    const handleReplayBoot = () => {
      sessionStorage.removeItem("eos_booted");
      setShowBoot(true);
      setUiReady(false);
    };

    window.addEventListener("open-window", handleGlobalOpen);
    window.addEventListener("replay-boot", handleReplayBoot);
    return () => {
      window.removeEventListener("open-window", handleGlobalOpen);
      window.removeEventListener("replay-boot", handleReplayBoot);
    };
  }, [activeWindows, minimizedWindows]); // Re-bind to capture current state

  // Internal opener needs check too
  const safeOpenWindow = (id: string) => {
    if (id === "Shops" && !isShopOpen()) {
      setShopStatusMsg("all shops are closed, will open at 11 : 30 am");
      setTimeout(() => setShopStatusMsg(null), 4000);
      return;
    }
    handleOpenWindow(id);
  };

  const handleBootComplete = () => {
    sessionStorage.setItem("eos_booted", "1");
    setShowBoot(false);
    setUiReady(true);
    // Signal tutorial system to show prompt after UI settles
    setTimeout(() => window.dispatchEvent(new CustomEvent("eos-boot-complete")), 900);
  };

  const handleOpenWindow = (id: string) => {
    const navItems: Record<string, string> = { Games: "/games" };
    if (navItems[id]) { navigate(navItems[id]); return; }
    const winId = id as WindowId;
    if (!activeWindows.includes(winId)) {
      setActiveWindows((prev) => [...prev, winId]);
      setZStack((prev) => [...prev, winId]);
    } else {
      if (minimizedWindows.includes(winId)) {
        setMinimizedWindows((prev) => prev.filter((w) => w !== winId));
      }
      // Focus it either way
      setZStack((prev) => [...prev.filter(w => w !== winId), winId]);
    }
  };

  const handleCloseWindow    = (id: WindowId) => { 
    setActiveWindows(p => p.filter(w => w !== id)); 
    setZStack(p => p.filter(w => w !== id));
    setMinimizedWindows(p => p.filter(w => w !== id)); 
    setMaximizedWindows(p => p.filter(w => w !== id)); 
  };
  const handleMinimizeWindow = (id: WindowId) => { if (!minimizedWindows.includes(id)) setMinimizedWindows(p => [...p, id]); };
  const handleMaximizeWindow = (id: WindowId) => { setMaximizedWindows(p => p.includes(id) ? p.filter(w => w !== id) : [...p, id]); };
  const handleFocusWindow    = (id: WindowId) => { setZStack(p => [...p.filter(w => w !== id), id]); };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">

      {/* ─── Cinematic Boot Animation (desktop only, once per session) ─── */}
      <AnimatePresence>
        {showBoot && (
          <Suspense fallback={null}>
            <EOSBootAnimation onComplete={handleBootComplete} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* ─── EOS v3 Desktop UI (hidden on mobile) ─────────────────────── */}
      <div className="hidden md:block relative z-10">
        {/* Menu bar slides in from top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={uiReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <DesktopMenuBar notification={shopStatusMsg} />
        </motion.div>

        {/* Dock springs up from bottom */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.88 }}
          animate={uiReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.88 }}
          transition={{ duration: 0.65, delay: 0.22, type: "spring", stiffness: 240, damping: 22 }}
        >
          <DesktopDock onOpenWindow={safeOpenWindow} />
        </motion.div>
        <div className="flex-1 relative">
          {/* Stage Manager (Desktop Only) */}
          <div className="hidden md:block">
            <DesktopStageManager 
              activeWindows={activeWindows} 
              zStack={zStack} 
              onFocus={handleFocusWindow} 
            />
          </div>

          {/* Desktop windows */}
          <Suspense fallback={null}>
            <AnimatePresence>
              {activeWindows.map((winId) => {
                const isMinimized = minimizedWindows.includes(winId);
                const isMaximized = maximizedWindows.includes(winId);
                const zIndex = (zStack.indexOf(winId) + 1) * 10 + 100; // Base z-index 100, stack by 10s
                
                if (winId === "Shops")    return <DesktopWindowShops    key="Shops"    onClose={() => handleCloseWindow("Shops")}    onMinimize={() => handleMinimizeWindow("Shops")}    onMaximize={() => handleMaximizeWindow("Shops")}    onFocus={() => handleFocusWindow("Shops")}    zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                if (winId === "Vending")  return <DesktopWindowVending  key="Vending"  onClose={() => handleCloseWindow("Vending")}  onMinimize={() => handleMinimizeWindow("Vending")}  onMaximize={() => handleMaximizeWindow("Vending")}  onFocus={() => handleFocusWindow("Vending")}  zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                if (winId === "Combos")   return <DesktopWindowCombos   key="Combos"    onClose={() => handleCloseWindow("Combos")}   onMinimize={() => handleMinimizeWindow("Combos")}   onMaximize={() => handleMaximizeWindow("Combos")}   onFocus={() => handleFocusWindow("Combos")}   zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                if (winId === "Settings") return <DesktopWindowSettings key="Settings" onClose={() => handleCloseWindow("Settings")} onMinimize={() => handleMinimizeWindow("Settings")} onMaximize={() => handleMaximizeWindow("Settings")} onFocus={() => handleFocusWindow("Settings")} zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                if (winId === "Cart")     return <DesktopWindowCart     key="Cart"     onClose={() => handleCloseWindow("Cart")}     onMinimize={() => handleMinimizeWindow("Cart")}     onMaximize={() => handleMaximizeWindow("Cart")}     onFocus={() => handleFocusWindow("Cart")}     zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                if (winId === "Profile")  return <DesktopWindowProfile  key="Profile"  onClose={() => handleCloseWindow("Profile")}  onMinimize={() => handleMinimizeWindow("Profile")}  onMaximize={() => handleMaximizeWindow("Profile")}  onFocus={() => handleFocusWindow("Profile")}  zIndex={zIndex} isMinimized={isMinimized} isMaximized={isMaximized} />;
                return null;
              })}
            </AnimatePresence>

            {/* Floating Location Widget (Desktop only, hidden when apps are open) */}
            <AnimatePresence>
              {activeWindows.length === 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FloatingLocationWidget />
                    <FloatingGroceryWidget />
                    <FloatingWalletWidget />
                  </motion.div>
                  <DesktopWidgetSpace />
                </>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
