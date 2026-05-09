import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Wrench,
  Clock,
  ShoppingBag,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

/*
  SiteGate — wraps the app to show:
  1. "Under Maintenance" screen when admin toggles maintenance ON
  2. "We're Closed" screen outside operating hours
  
  Operating hours (IST):
    Items:  6:00 AM – 10:00 PM
    Food:   6:00 PM – 12:30 AM

  Admins bypass both gates.
*/

// Helper: get current IST hour + minute
function getIST() {
  const now = new Date();
  // IST = UTC + 5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return { hours: ist.getHours(), minutes: ist.getMinutes() };
}

function isItemsOpen(): boolean {
  return true; // Site is now open 24/7
}

function isFoodOpen(): boolean {
  return true; // Site is now open 24/7
}

function getNextOpenTime(): string {
  const { hours, minutes } = getIST();
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes < 6 * 60) return "6:00 AM";
  if (totalMinutes >= 22 * 60 || totalMinutes < 30) return "6:00 AM";
  return "6:00 PM";
}

// ─── Closed Screen ─────────────────────────────────────────────────────────────
function ClosedScreen() {
  const itemsOpen = isItemsOpen();
  const foodOpen = isFoodOpen();
  const [time, setTime] = useState(getIST());

  useEffect(() => {
    const id = setInterval(() => setTime(getIST()), 60000);
    return () => clearInterval(id);
  }, []);

  const timeStr = `${time.hours % 12 || 12}:${time.minutes
    .toString()
    .padStart(2, "0")} ${time.hours >= 12 ? "PM" : "AM"}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="max-w-md w-full text-center"
      >
        {/* Moon/Sun icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          {time.hours >= 6 && time.hours < 18 ? (
            <Sun className="w-20 h-20 mx-auto text-amber-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
          ) : (
            <Moon className="w-20 h-20 mx-auto text-brand-accent drop-shadow-[0_0_30px_rgba(94,84,142,0.3)]" />
          )}
        </motion.div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <img
            src="/logo.webp"
            alt="CU Bazaar"
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-2xl font-black">
            <span className="text-brand">CU</span>{" "}
            <span className="text-slate-900">BAZZAR</span>
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          We're Closed
        </h1>
        <p className="text-slate-500 mb-8">Come back during business hours!</p>

        {/* Operating hours cards */}
        <div className="space-y-3 mb-8">
          <div
            className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm ${
              itemsOpen
                ? "bg-emerald-50 ring-1 ring-emerald-200"
                : "bg-white ring-1 ring-slate-100"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                itemsOpen ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              <ShoppingBag
                className={`w-6 h-6 ${
                  itemsOpen ? "text-emerald-600" : "text-slate-400"
                }`}
              />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-slate-900">Item Orders</p>
              <p className="text-xs text-slate-500">6:00 AM – 10:00 PM</p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                itemsOpen
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {itemsOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>

          <div
            className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm ${
              foodOpen
                ? "bg-emerald-50 ring-1 ring-emerald-200"
                : "bg-white ring-1 ring-slate-100"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                foodOpen ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              <UtensilsCrossed
                className={`w-6 h-6 ${
                  foodOpen ? "text-emerald-600" : "text-slate-400"
                }`}
              />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-slate-900">Food Orders</p>
              <p className="text-xs text-slate-500">6:00 PM – 12:30 AM</p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                foodOpen
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {foodOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
        </div>

        {/* Current time + next open */}
        <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Current Time (IST)</span>
          </div>
          <p
            className="text-3xl font-black text-slate-900 mb-1"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {timeStr}
          </p>
          <p className="text-xs text-slate-500">
            Opens at{" "}
            <span className="text-brand font-semibold">
              {getNextOpenTime()}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Maintenance Screen ─────────────────────────────────────────────────────────
function MaintenanceScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative overflow-hidden">
      {/* Deep purple atmospheric glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/30 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-700/20 blur-[120px] mix-blend-screen pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="max-w-md w-full text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-[#6B21A8] to-[#D946EF] flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] rotate-3">
             <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#E9D5FF] to-[#A855F7] mb-4 drop-shadow-sm">
          EOS V3
        </h1>
        
        <p className="text-[#E9D5FF]/80 text-lg mb-12 leading-relaxed font-light px-4">
          We are working on EOS V3<br/>
          <span className="font-medium text-white">— new design —</span>
        </p>

        <div className="rounded-[32px] p-[1px] bg-gradient-to-b from-[#C084FC]/50 to-[#581C87]/20 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-[#3B0764]/80 inline-block w-full max-w-[280px]">
          <div className="absolute inset-0 bg-[#1e0a3c]/60" />
          <div className="relative px-8 py-6 rounded-[31px] border border-white/5 bg-gradient-to-b from-white/10 to-transparent flex flex-col items-center">
            <p className="text-[#D8B4FE]/80 text-xs uppercase tracking-widest mb-2 font-medium">Site will reopen on</p>
            <p className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">15 JULY</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Mobile Block Screen ────────────────────────────────────────────────────────
function MobileBlockScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/30 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-700/20 blur-[120px] mix-blend-screen pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="max-w-md w-full text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-[#FF6B35] to-[#7C3AED] flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.4)] rotate-3">
             <Wrench className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#E9D5FF] to-[#A855F7] mb-4 drop-shadow-sm leading-tight">
          Desktop Only
        </h1>
        
        <p className="text-[#E9D5FF]/80 text-[15px] mb-8 leading-relaxed font-light px-4">
          Please use <strong className="text-white">CU Bazzar on a laptop</strong>.<br/>
          We are currently working on the mobile experience.
        </p>

        <div className="rounded-[32px] p-[1px] bg-gradient-to-b from-[#C084FC]/50 to-[#581C87]/20 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-[#3B0764]/80 inline-block w-full max-w-[280px]">
          <div className="absolute inset-0 bg-[#1e0a3c]/60" />
          <div className="relative px-8 py-6 rounded-[31px] border border-white/5 bg-gradient-to-b from-white/10 to-transparent flex flex-col items-center">
            <p className="text-[#D8B4FE]/80 text-[11px] uppercase tracking-widest mb-2 font-medium">Estimated Mobile Reopening</p>
            <p className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">15 JULY</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SiteGate Hook ──────────────────────────────────────────────────────────────
export function useSiteGate() {
  const { isAdmin } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android|ipad|playbook|silk/i.test(userAgent)) {
        setIsMobile(true);
      } else if (/iphone|ipod/i.test(userAgent)) {
        setIsMobile(true);
      } else if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check maintenance flag from Supabase
  useEffect(() => {
    const cacheKey = "cubazzar_maintenance_mode";
    const cached = localStorage.getItem(cacheKey);
    if (cached !== null) {
      setMaintenance(cached === "true");
      setLoaded(true);
    }

    const check = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .single();
        const isMaint = data?.value === true || data?.value === "true";
        setMaintenance(isMaint);
        localStorage.setItem(cacheKey, String(isMaint));
      } catch {
        // Table might not exist yet — assume not in maintenance
        setMaintenance(false);
      }
      setLoaded(true);
    };
    check();

    // Poll every 60s instead of 30s
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  if (isMobile) return { gate: null, loaded: true, isMobile: true };

  // Admins bypass everything
  if (isAdmin) return { gate: null, loaded: true };

  if (!loaded) return { gate: null, loaded: false };

  // Desktop is always open, bypass maintenance mode completely
  return { gate: null, loaded: true };
}

export { ClosedScreen, MaintenanceScreen, MobileBlockScreen };
