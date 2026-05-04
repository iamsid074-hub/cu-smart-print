import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DesktopDock from "@/components/DesktopDock";
import DesktopMenuBar from "@/components/DesktopMenuBar";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white bg-[url('/eos-v3-wallpaper-mobile.png')] md:bg-[url('/eos-v3-wallpaper-desktop.jpg')] bg-cover bg-center bg-no-repeat bg-fixed relative overflow-hidden">
      
      {/* EOS v3 Desktop UI Elements */}
      <div className="hidden md:block">
        <DesktopMenuBar />
        <DesktopDock />
      </div>

      {/* 
        Home page cleared for EOS v3 redesign. 
        Only the wallpaper and global components (like Dynamic Island rendered in App.tsx) will show.
      */}
    </div>
  );
}
