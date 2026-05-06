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

export default function Home() {
  const navigate = useNavigate();
  // Keep track of which windows are mounted (active) and which are just hidden (minimized)
  const [activeWindows, setActiveWindows] = useState<WindowId[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<WindowId[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<WindowId[]>([]);

  const handleOpenWindow = (id: string) => {
    // These navigate directly, no window needed
    const navItems: Record<string, string> = {
      Games: "/games",
    };
    if (navItems[id]) {
      navigate(navItems[id]);
      return;
    }

    const winId = id as WindowId;
    
    // If it's not mounted at all, add it to active
    if (!activeWindows.includes(winId)) {
      setActiveWindows((prev) => [...prev, winId]);
    } else {
      // If it is active but minimized, restore it
      if (minimizedWindows.includes(winId)) {
        setMinimizedWindows((prev) => prev.filter((w) => w !== winId));
      } else {
        // Already active and not minimized, we could bring it to front here by re-ordering
        setActiveWindows((prev) => [...prev.filter(w => w !== winId), winId]);
      }
    }
  };

  const handleCloseWindow = (id: WindowId) => {
    setActiveWindows((prev) => prev.filter((w) => w !== id));
    setMinimizedWindows((prev) => prev.filter((w) => w !== id));
    setMaximizedWindows((prev) => prev.filter((w) => w !== id));
  };

  const handleMinimizeWindow = (id: WindowId) => {
    if (!minimizedWindows.includes(id)) {
      setMinimizedWindows((prev) => [...prev, id]);
    }
  };

  const handleMaximizeWindow = (id: WindowId) => {
    setMaximizedWindows((prev) => 
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      {/* Background is now handled globally in index.css for consistency */}
      
      {/* EOS v3 Desktop UI Elements */}
      <div className="hidden md:block relative z-10">
        <DesktopMenuBar />
        <DesktopDock onOpenWindow={handleOpenWindow} />
        <Suspense fallback={null}>
          <AnimatePresence>
            {activeWindows.map((winId) => {
              const isMinimized = minimizedWindows.includes(winId);
              const isMaximized = maximizedWindows.includes(winId);

              // Render the appropriate component
              if (winId === "Shops") {
                return (
                  <DesktopWindowShops
                    key="Shops"
                    onClose={() => handleCloseWindow("Shops")}
                    onMinimize={() => handleMinimizeWindow("Shops")}
                    onMaximize={() => handleMaximizeWindow("Shops")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              if (winId === "Vending") {
                return (
                  <DesktopWindowVending
                    key="Vending"
                    onClose={() => handleCloseWindow("Vending")}
                    onMinimize={() => handleMinimizeWindow("Vending")}
                    onMaximize={() => handleMaximizeWindow("Vending")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              if (winId === "Combos") {
                return (
                  <DesktopWindowCombos
                    key="Combos"
                    onClose={() => handleCloseWindow("Combos")}
                    onMinimize={() => handleMinimizeWindow("Combos")}
                    onMaximize={() => handleMaximizeWindow("Combos")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              if (winId === "Settings") {
                return (
                  <DesktopWindowSettings
                    key="Settings"
                    onClose={() => handleCloseWindow("Settings")}
                    onMinimize={() => handleMinimizeWindow("Settings")}
                    onMaximize={() => handleMaximizeWindow("Settings")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              if (winId === "Cart") {
                return (
                  <DesktopWindowCart
                    key="Cart"
                    onClose={() => handleCloseWindow("Cart")}
                    onMinimize={() => handleMinimizeWindow("Cart")}
                    onMaximize={() => handleMaximizeWindow("Cart")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              if (winId === "Profile") {
                return (
                  <DesktopWindowProfile
                    key="Profile"
                    onClose={() => handleCloseWindow("Profile")}
                    onMinimize={() => handleMinimizeWindow("Profile")}
                    onMaximize={() => handleMaximizeWindow("Profile")}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                  />
                );
              }
              return null;
            })}
          </AnimatePresence>
        </Suspense>
      </div>

      {/* 
        Home page cleared for EOS v3 redesign. 
        Only the wallpaper and global components (like Dynamic Island rendered in App.tsx) will show.
      */}
    </div>
  );
}
