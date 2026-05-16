import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Wallet as WalletIcon, ShieldAlert, Lock, Search, Image as ImageIcon } from "lucide-react";
import { useWallpaper } from "../contexts/WallpaperContext";
import { IosHomeIcon, IosCombosIcon, IosProfileIcon, IosSettingsIcon } from "./HighFidelityIcons";
import { ease, spring as motionSpring } from "@/lib/motion";

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
  { name: "Shops",    img: "/logoshop_opt.webp",       path: "/shops",            wiggleDelay: 0,    wiggleDuration: 0.18 },
  { name: "Grocery",  img: "/dock-grocery.webp",        path: "/grocery",          wiggleDelay: 0.03, wiggleDuration: 0.21 },
  { name: "Cart",     img: "/logocart_opt.webp",        path: "/cart",             wiggleDelay: 0.07, wiggleDuration: 0.19 },
  { name: "Games",    img: "/dock-games.webp",       path: "/games",            wiggleDelay: 0.02, wiggleDuration: 0.18 },
  { name: "Wallet",   img: "/logowallet_opt.webp",         path: "/wallet",           wiggleDelay: 0.05, wiggleDuration: 0.18 },
  { name: "Lock",      icon: Lock,      iconBg: "#1e293b",  iconColor: "#fff",      path: "lock",       wiggleDelay: 0.04, wiggleDuration: 0.19 },
  { name: "Wallpaper", icon: ImageIcon,  iconBg: "#4c1d95",  iconColor: "#c4b5fd",  path: "/wallpaper", wiggleDelay: 0.06, wiggleDuration: 0.20 },
];

const ADMIN_APP: AppDef = { 
  name: "Admin",    
  icon: ShieldAlert, 
  iconBg: "#E11D48", 
  iconColor: "#fff", 
  path: "/admin", 
  wiggleDelay: 0.05, 
  wiggleDuration: 0.20 
};


const DOCK_APPS_BASE: AppDef[] = [
  { name: "Home",     img: "/logohome_opt.webp",    path: "/home",     wiggleDelay: 0,    wiggleDuration: 0.18 },
  { name: "Combos",   img: "/logo2_opt.webp",  path: "/combos",   wiggleDelay: 0.05, wiggleDuration: 0.18 },
  { name: "Profile",  img: "/logo3_opt.webp", path: "/profile",  wiggleDelay: 0.02, wiggleDuration: 0.18 },
  { name: "Settings", img: "/logosettings_opt.webp", path: "/settings", wiggleDelay: 0.07, wiggleDuration: 0.18 },
];



import MobileAppLibrary from "./MobileAppLibrary";

export default function MobileSpringboard() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isSuperAdmin = user?.email === "iamsid074@gmail.com";
  
  const wallpaper = useWallpaper();
  const [currentPage, setCurrentPage] = useState(0);
  const [isWiggling, setIsWiggling]   = useState(false);
  const [time, setTime]               = useState(new Date());
  
  const longPressRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY                   = useRef(0);
  // Cache window.innerWidth to avoid layout reads during drag gestures
  const screenWidth                   = useRef(typeof window !== 'undefined' ? window.innerWidth : 390);

  // Chunk apps into pages of 24 (4x6 grid looks best for iOS)
  const allApps = [...GRID_APPS, ...(isSuperAdmin ? [ADMIN_APP] : [])];
  const APPS_PER_PAGE = 24;
  const contentPages = [];
  for (let i = 0; i < allApps.length; i += APPS_PER_PAGE) {
    contentPages.push(allApps.slice(i, i + APPS_PER_PAGE));
  }

  // Add the App Library as the final "extreme" page
  const totalPageCount = contentPages.length + 1;

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
    if (path === "lock") {
      window.dispatchEvent(new CustomEvent("trigger-lock"));
      return;
    }
    navigate(path);
  }, [isWiggling, navigate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => isWiggling && setIsWiggling(false)}
    >
      <div className="absolute inset-0 bg-black/0" />

      {/* Safe-area aware content column */}
      <div
        className="relative flex flex-col h-full"
        style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}
      >
        {/* ── Paged Content ───────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          <motion.div
            className="flex h-full"
            drag="x"
            dragConstraints={{ left: -(totalPageCount - 1) * screenWidth.current, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const swipePower = info.offset.x + info.velocity.x * 0.2;
              if (swipePower < -50 && currentPage < totalPageCount - 1) {
                setCurrentPage(prev => prev + 1);
              } else if (swipePower > 50 && currentPage > 0) {
                setCurrentPage(prev => prev - 1);
              }
            }}
            animate={{ x: -currentPage * screenWidth.current }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
          >
            {/* Standard App Pages */}
            {contentPages.map((pageApps, pageIdx) => (
              <div
                key={pageIdx}
                className="w-screen flex-shrink-0 flex flex-col h-full overflow-y-auto pb-[150px]"
              >
                <div className={`grid grid-cols-4 gap-y-7 gap-x-2 px-5 ${pageIdx === 0 ? 'pt-28' : 'pt-32'} content-start`}>
                  {pageApps.map((app, i) => (
                    <AppIcon
                      key={app.name}
                      app={app}
                      index={i}
                      isWiggling={isWiggling}
                      onTap={handleAppTap}
                      size={60}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Final Page: App Library */}
            <div className="w-screen flex-shrink-0 h-full overflow-hidden">
              <MobileAppLibrary apps={allApps} onTap={handleAppTap} />
            </div>
          </motion.div>
        </div>

        {/* ── Page Indicators ─────────────────────────────── */}
        <div className="flex justify-center gap-2 pb-3 relative z-10">
          {Array.from({ length: totalPageCount }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === currentPage ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* ── Search Pill ── */}
        <div className="flex justify-center mb-3 relative z-10">
          <div 
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md shadow-sm cursor-pointer active:scale-95 transition-transform" 
            onClick={() => navigate("/search")}
          >
            <Search size={14} className="text-white drop-shadow-md" />
            <span className="text-white text-[13px] font-medium drop-shadow-md">Search</span>
          </div>
        </div>

        {/* ── Dock ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: ease.apple }}
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
            {/* Dock items - strictly 4 icons */}
            {DOCK_APPS_BASE.map((app, i) => (
              <AppIcon
                key={app.name}
                app={app}
                index={i}
                isWiggling={false}
                onTap={handleAppTap}
                size={60}
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

const AppIcon = memo(function AppIcon({ app, index, isWiggling, onTap, size = 60, showLabel = true }: AppIconProps) {
  // Responsive size: on a real phone use viewport-relative sizing, fallback to prop
  // 4 columns padding adjustment
  const iconSize = `min(${size}px, calc((100vw - 88px) / 4))`;

  return (
    <motion.div
      className="flex flex-col items-center gap-[6px]"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.018,
        ...motionSpring.dock,
      }}
      style={{ willChange: "transform" }}
    >
      {/* Wiggle wrapper */}
      <motion.div
        animate={isWiggling ? { rotate: [-2.5, 2.5] } : { rotate: 0 }}
        transition={
          isWiggling
            ? { repeat: Infinity, repeatType: "mirror", duration: app.wiggleDuration, delay: app.wiggleDelay }
            : { duration: 0.12 }
        }
      >
        {/* Icon shell — CSS active scale for zero-lag tap feedback */}
        <div
          className="relative overflow-hidden cursor-pointer select-none"
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: "22%",          // squircle proportional to size
            boxShadow: "0 1px 0px rgba(255,255,255,0.22) inset",
            transform: "translateZ(0)",   // GPU layer
            WebkitTransform: "translateZ(0)",
            touchAction: "manipulation",  // kills 300ms tap delay on mobile
            transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onClick={(e) => { e.stopPropagation(); if (!isWiggling) onTap(app.path); }}
          onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(0.92)"; }}
          onPointerUp={(e)   => { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(1)"; }}
          onPointerLeave={(e)=> { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(1)"; }}
        >
          {app.img ? (
            <div className="w-full h-full">
              <img
                src={app.img}
                alt={app.name}
                className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`}
                draggable={false}
                loading="eager"
                decoding="async"
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: app.iconBg || "transparent" }}
            >
              {app.icon && (
                <app.icon
                  style={{ 
                    color: app.iconColor || "#fff", 
                    width: app.name === "Shops" || app.name === "Home" || app.name === "Combos" || app.name === "Profile" || app.name === "Settings" ? "100%" : "44%", 
                    height: app.name === "Shops" || app.name === "Home" || app.name === "Combos" || app.name === "Profile" || app.name === "Settings" ? "100%" : "44%" 
                  }}
                />
              )}
            </div>
          )}

          {/* iOS specular top-glass sheen */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{
              height: "45%",
              borderRadius: "22% 22% 0 0",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.03) 100%)",
            }}
          />
        </div>
      </motion.div>

      {showLabel && (
        <span
          className="text-white text-[11px] font-semibold text-center truncate"
          style={{
            maxWidth: iconSize,
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {app.name}
        </span>
      )}
    </motion.div>
  );
});
