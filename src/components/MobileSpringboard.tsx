import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Wallet as WalletIcon, ShieldAlert } from "lucide-react";

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
  { name: "Shops",    img: "/dock-shops.webp",       path: "/shops",            wiggleDelay: 0,    wiggleDuration: 0.18 },
  { name: "Vending",  icon: Coffee,   iconBg: "#0d2d25", iconColor: "#10B981",   path: "/search",   wiggleDelay: 0.08, wiggleDuration: 0.17 },
  { name: "Grocery",  img: "/cc_grocery.png",        path: "/grocery",          wiggleDelay: 0.03, wiggleDuration: 0.21 },
  { name: "Cart",     img: "/dock-cart.webp",        path: "/cart",             wiggleDelay: 0.07, wiggleDuration: 0.19 },
  { name: "Games",    img: "/dock-games.webp",       path: "/games",            wiggleDelay: 0.02, wiggleDuration: 0.18 },
  { name: "Wallet",   img: "/cc_wallet.png",         path: "/wallet",           wiggleDelay: 0.05, wiggleDuration: 0.18 },
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
  { name: "Home",     img: "/dock-home.webp",        path: "/home",     wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Combos",   img: "/dock-combos.webp",      path: "/search",   wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Profile",  img: "/dock-profile.webp",     path: "/profile",  wiggleDelay: 0, wiggleDuration: 0.18 },
  { name: "Settings", img: "/dock-settings-v2.webp", path: "/settings", wiggleDelay: 0, wiggleDuration: 0.18 },
];



import MobileAppLibrary from "./MobileAppLibrary";

export default function MobileSpringboard() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isSuperAdmin = user?.email === "iamsid074@gmail.com";
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isWiggling, setIsWiggling]   = useState(false);
  const [time, setTime]               = useState(new Date());
  
  const longPressRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY                   = useRef(0);

  // Chunk apps into pages of 9 (3x3 grid looks best)
  const allApps = [...GRID_APPS, ...(isSuperAdmin ? [ADMIN_APP] : [])];
  const APPS_PER_PAGE = 9;
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
    navigate(path);
  }, [isWiggling, navigate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => isWiggling && setIsWiggling(false)}
    >
      {/* Wallpaper */}
      <img
        src="/eos-v3-wallpaper-mobile.webp"
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
        {/* ── Paged Content ───────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          <motion.div
            className="flex h-full"
            drag="x"
            dragConstraints={{ left: -(totalPageCount - 1) * window.innerWidth, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold && currentPage < totalPageCount - 1) {
                setCurrentPage(prev => prev + 1);
              } else if (info.offset.x > threshold && currentPage > 0) {
                setCurrentPage(prev => prev - 1);
              }
            }}
            animate={{ x: -currentPage * window.innerWidth }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Standard App Pages */}
            {contentPages.map((pageApps, pageIdx) => (
              <div
                key={pageIdx}
                className="w-screen flex-shrink-0 flex flex-col h-full"
              >


                <div className={`grid grid-cols-3 gap-y-10 gap-x-2 px-6 ${pageIdx === 0 ? 'pt-28' : 'pt-32'} content-start`}>
                  {pageApps.map((app, i) => (
                    <AppIcon
                      key={app.name}
                      app={app}
                      index={i}
                      isWiggling={isWiggling}
                      onTap={handleAppTap}
                      size={58}
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
        <div className="flex justify-center gap-2 pb-6">
          {Array.from({ length: totalPageCount }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage ? "bg-white w-3" : "bg-white/30"
              }`}
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
            {/* Dock items - strictly 4 icons */}
            {DOCK_APPS_BASE.map((app, i) => (
              <AppIcon
                key={app.name}
                app={app}
                index={i}
                isWiggling={false}
                onTap={handleAppTap}
                size={50}
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
  // Responsive size: on a real phone use viewport-relative sizing, fallback to prop
  const iconSize = `min(${size}px, calc((100vw - 96px) / 3))`;

  return (
    <motion.div
      className="flex flex-col items-center gap-[6px]"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.02,           // cut stagger in half — feels instant
        type: "spring",
        stiffness: 700,
        damping: 30,
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
            boxShadow: "0 1px 0px rgba(255,255,255,0.22) inset, 0 0 0 0.5px rgba(0,0,0,0.15)",
            transform: "translateZ(0)",   // GPU layer
            WebkitTransform: "translateZ(0)",
            touchAction: "manipulation",  // kills 300ms tap delay on mobile
            transition: "transform 0.1s ease",
          }}
          onClick={(e) => { e.stopPropagation(); if (!isWiggling) onTap(app.path); }}
          onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(0.84)"; }}
          onPointerUp={(e)   => { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(1)"; }}
          onPointerLeave={(e)=> { (e.currentTarget as HTMLDivElement).style.transform = "translateZ(0) scale(1)"; }}
        >
          {app.img ? (
            <div className="w-full h-full bg-white">
              <img
                src={app.img}
                alt={app.name}
                className="w-full h-full object-cover"
                draggable={false}
                loading="eager"
                decoding="async"
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: app.iconBg || "#1a1a2e" }}
            >
              {app.icon && (
                <app.icon
                  style={{ color: app.iconColor || "#fff", width: "44%", height: "44%" }}
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
}
