import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Wallet as WalletIcon } from "lucide-react";

interface AppDef {
  name: string;
  img?: string;
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  path: string;
  wiggleDelay: number;
  wiggleDuration: number;
}

const GRID_APPS: AppDef[] = [
  { name: "Shops",    img: "/dock-shops.webp",       path: "/sections/shops",   wiggleDelay: 0,    wiggleDuration: 0.18 },
  { name: "Combos",   img: "/dock-combos.webp",      path: "/sections/combos",  wiggleDelay: 0.04, wiggleDuration: 0.20 },
  { name: "Vending",  icon: Coffee,   iconBg: "#0d2d25", iconColor: "#10B981",   path: "/sections", wiggleDelay: 0.08, wiggleDuration: 0.17 },
  { name: "Grocery",  img: "/cc_grocery.png",        path: "/grocery",          wiggleDelay: 0.03, wiggleDuration: 0.21 },
  { name: "Cart",     img: "/dock-cart.webp",        path: "/cart",             wiggleDelay: 0.07, wiggleDuration: 0.19 },
  { name: "Games",    img: "/dock-games.webp",       path: "/games",            wiggleDelay: 0.02, wiggleDuration: 0.18 },
  { name: "Profile",  img: "/dock-profile.webp",     path: "/profile",          wiggleDelay: 0.06, wiggleDuration: 0.20 },
  { name: "Settings", img: "/dock-settings-v2.webp", path: "/settings",         wiggleDelay: 0.01, wiggleDuration: 0.19 },
  { name: "Wallet",   img: "/cc_wallet.png",         path: "/wallet",           wiggleDelay: 0.05, wiggleDuration: 0.18 },
];

const DOCK_APPS: AppDef[] = [
  { name: "Home",     img: "/dock-home.webp",        path: "/home",     wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Sections", img: "/dock-shops.webp",       path: "/sections", wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Cart",     img: "/dock-cart.webp",        path: "/cart",     wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Profile",  img: "/dock-profile.webp",     path: "/profile",  wiggleDelay: 0, wiggleDuration: 0.18 },
];

function getGreeting(name: string) {
  const h = new Date().getHours();
  if (h < 5)  return `Night owl, ${name} 🦉`;
  if (h < 12) return `Good morning, ${name} ☀️`;
  if (h < 17) return `Good afternoon, ${name} 👋`;
  if (h < 21) return `Good evening, ${name} 🌆`;
  return `Good night, ${name} 🌙`;
}

export default function MobileSpringboard() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [isWiggling, setIsWiggling] = useState(false);
  const [time, setTime]             = useState(new Date());
  const longPressRef                = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY                 = useRef(0);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ||
                    user?.user_metadata?.name?.split(" ")[0] || "there";

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    longPressRef.current = setTimeout(() => setIsWiggling(true), 550);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
      if (longPressRef.current) clearTimeout(longPressRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const handleAppTap = useCallback((path: string) => {
    if (isWiggling) { setIsWiggling(false); return; }
    navigate(path);
  }, [isWiggling, navigate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => isWiggling && setIsWiggling(false)}
    >
      {/* Wallpaper */}
      <img
        src="/eos-v3-wallpaper-mobile.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/35" />

      {/* Safe-area aware content column */}
      <div
        className="relative flex flex-col h-full"
        style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}
      >
        {/* ── Time & Greeting ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="px-8 pt-10 pb-6"
        >
          <p className="text-white/55 text-sm font-medium tracking-wide mb-1">{dateStr}</p>
          <p
            className="text-white font-extralight tracking-tight"
            style={{ fontSize: "clamp(68px, 18vw, 88px)", lineHeight: 1 }}
          >
            {timeStr}
          </p>
          <p className="text-white/65 text-base font-medium mt-4">{getGreeting(firstName)}</p>
        </motion.div>

        {/* ── App Grid ─────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-3 gap-y-8 gap-x-2 px-6 pt-2 content-start overflow-hidden">
          {GRID_APPS.map((app, i) => (
            <AppIcon
              key={app.name}
              app={app}
              index={i}
              isWiggling={isWiggling}
              onTap={handleAppTap}
              size={72}
            />
          ))}
        </div>

        {/* ── Dock ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-6"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 16px)" }}
        >
          <div
            className="flex items-center justify-around px-4 py-3 rounded-[28px] border border-white/20"
            style={{
              background: "rgba(90, 90, 110, 0.35)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
            }}
          >
            {DOCK_APPS.map((app, i) => (
              <AppIcon
                key={app.name}
                app={app}
                index={i}
                isWiggling={false}
                onTap={handleAppTap}
                size={58}
                showLabel={false}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wiggle mode hint */}
      {isWiggling && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 inset-x-0 flex justify-center pointer-events-none"
          style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}
        >
          <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/20">
            <p className="text-white/80 text-xs font-semibold">Tap anywhere to stop</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── AppIcon sub-component ─────────────────────────────────────────────── */
interface AppIconProps {
  app: AppDef;
  index: number;
  isWiggling: boolean;
  onTap: (path: string) => void;
  size?: number;
  showLabel?: boolean;
}

function AppIcon({ app, index, isWiggling, onTap, size = 72, showLabel = true }: AppIconProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-[6px]"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 500,
        damping: 26,
      }}
    >
      {/* Wiggle wrapper */}
      <motion.div
        animate={isWiggling ? { rotate: [-2.5, 2.5] } : { rotate: 0 }}
        transition={
          isWiggling
            ? { repeat: Infinity, repeatType: "mirror", duration: app.wiggleDuration, delay: app.wiggleDelay }
            : { duration: 0.15 }
        }
      >
        <motion.div
          className="rounded-[18px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          style={{ width: size, height: size }}
          whileTap={{ scale: isWiggling ? 1 : 0.85 }}
          onTouchEnd={(e) => { e.stopPropagation(); onTap(app.path); }}
        >
          {app.img ? (
            <img src={app.img} alt={app.name} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: app.iconBg || "#1a1a2e" }}
            >
              {app.icon && (
                <app.icon
                  style={{ color: app.iconColor || "#fff", width: size * 0.44, height: size * 0.44 }}
                />
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {showLabel && (
        <span
          className="text-white text-[11px] font-semibold text-center truncate max-w-[76px]"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
        >
          {app.name}
        </span>
      )}
    </motion.div>
  );
}
