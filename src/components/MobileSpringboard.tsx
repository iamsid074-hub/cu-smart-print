import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

interface FolderDef {
  name: string;
  isFolder: true;
  apps: AppDef[];
  wiggleDelay: number;
  wiggleDuration: number;
}

const GRID_APPS: (AppDef | FolderDef)[] = [
  {
    name: "Services",
    isFolder: true,
    wiggleDelay: 0.05,
    wiggleDuration: 0.18,
    apps: [
      { name: "Shops",    img: "/logoshop_opt.webp",       path: "/shops",            wiggleDelay: 0,    wiggleDuration: 0.18 },
      { name: "Grocery",  img: "/dock-grocery.webp",        path: "/grocery",          wiggleDelay: 0.03, wiggleDuration: 0.21 },
      { name: "Wallet",   img: "/logowallet_opt.webp",         path: "/wallet",           wiggleDelay: 0.05, wiggleDuration: 0.18 },
      { name: "Lock",      icon: Lock,      iconBg: "#1e293b",  iconColor: "#fff",      path: "lock",       wiggleDelay: 0.04, wiggleDuration: 0.19 },
    ]
  },
  { name: "Cart",     img: "/logocart_opt.webp",        path: "/cart",             wiggleDelay: 0.07, wiggleDuration: 0.19 },
  { name: "Games",    img: "/dock-games.webp",       path: "/games",            wiggleDelay: 0.02, wiggleDuration: 0.18 },
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
  const [activeFolder, setActiveFolder] = useState<FolderDef | null>(null);
  
  const longPressRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX                   = useRef(0);
  const touchStartY                   = useRef(0);
  const swipeDirectionLocked          = useRef<'horizontal' | 'vertical' | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const sliderRef                     = useRef<HTMLDivElement>(null);
  const dragOffsetRef                 = useRef(0);
  const lastTouchX                    = useRef(0);
  const lastTouchTime                 = useRef(0);
  const velocityRef                   = useRef(0);

  const currentPageRef                = useRef(currentPage);
  const totalPageCountRef             = useRef(0);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  // Cache window.innerWidth to avoid layout reads during drag gestures
  const screenWidth                   = useRef(typeof window !== 'undefined' ? window.innerWidth : 390);

  // Flatten apps for App Library
  const flattenedApps = useMemo(() => {
    const list: AppDef[] = [];
    GRID_APPS.forEach(item => {
      if ('isFolder' in item && item.isFolder) {
        list.push(...item.apps);
      } else {
        list.push(item as AppDef);
      }
    });
    if (isSuperAdmin) list.push(ADMIN_APP);
    return list;
  }, [isSuperAdmin]);

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

  useEffect(() => {
    totalPageCountRef.current = totalPageCount;
  }, [totalPageCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      lastTouchX.current = e.touches[0].clientX;
      lastTouchTime.current = e.timeStamp;
      velocityRef.current = 0;
      swipeDirectionLocked.current = null;
      longPressRef.current = setTimeout(() => setIsWiggling(true), 550);
    };

    const onTouchMove = (e: TouchEvent) => {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const dx = clientX - touchStartX.current;
      const dy = clientY - touchStartY.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if ((absDx > 8 || absDy > 8) && longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }

      if (!swipeDirectionLocked.current && (absDx > 6 || absDy > 6)) {
        swipeDirectionLocked.current = absDx > absDy ? 'horizontal' : 'vertical';
      }

      if (swipeDirectionLocked.current === 'horizontal') {
        if (e.cancelable) e.preventDefault();

        // Track velocity
        const dt = e.timeStamp - lastTouchTime.current;
        if (dt > 0) {
          velocityRef.current = (clientX - lastTouchX.current) / dt; // px/ms
        }
        lastTouchX.current = clientX;
        lastTouchTime.current = e.timeStamp;

        // Live-track: base position + drag delta, with rubber-band at edges
        const curr = currentPageRef.current;
        const total = totalPageCountRef.current;
        const sw = screenWidth.current;
        const baseX = -(curr * sw);
        let rawX = baseX + dx;

        // Rubber-band clamp at edges
        const minX = -((total - 1) * sw);
        const maxX = 0;
        if (rawX > maxX) {
          rawX = rawX * 0.25; // compress beyond left edge
        } else if (rawX < minX) {
          const over = rawX - minX;
          rawX = minX + over * 0.25; // compress beyond right edge
        }

        dragOffsetRef.current = rawX;

        // Directly mutate DOM for zero-lag, zero-rerender tracking
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'none';
          sliderRef.current.style.transform = `translateX(${rawX}px)`;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (longPressRef.current) clearTimeout(longPressRef.current);

      if (swipeDirectionLocked.current !== 'horizontal') {
        swipeDirectionLocked.current = null;
        return;
      }

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const velocity = velocityRef.current; // px/ms
      const threshold = screenWidth.current * 0.15; // 15% threshold
      const velocityThreshold = 0.3; // px/ms — fast flick

      const curr = currentPageRef.current;
      const total = totalPageCountRef.current;

      let nextPage = curr;
      if ((dx < -threshold || velocity < -velocityThreshold) && curr < total - 1) {
        nextPage = curr + 1;
      } else if ((dx > threshold || velocity > velocityThreshold) && curr > 0) {
        nextPage = curr - 1;
      }

      // Snap with spring-feel transition
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)';
        sliderRef.current.style.transform = `translateX(${-(nextPage * screenWidth.current)}px)`;
      }

      setCurrentPage(nextPage);
      swipeDirectionLocked.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
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
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
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
          <div
            ref={sliderRef}
            className="flex h-full"
            style={{
              width: `${totalPageCount * 100}%`,
              transform: `translateX(-${currentPage * screenWidth.current}px)`,
              transition: 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform',
            }}
          >
            {/* Standard App Pages */}
            {contentPages.map((pageApps, pageIdx) => (
              <div
                key={pageIdx}
                className="w-screen flex-shrink-0 flex flex-col h-full overflow-y-auto pb-[150px] scrollbar-hide"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)"
                }}
              >
                <div className={`grid grid-cols-4 gap-y-7 gap-x-2 px-5 ${pageIdx === 0 ? 'pt-28' : 'pt-32'} content-start`}>
                  {pageApps.map((app, i) => (
                    <AppIcon
                      key={app.name}
                      app={app}
                      index={i}
                      isWiggling={isWiggling}
                      onTap={handleAppTap}
                      onOpenFolder={setActiveFolder}
                      size={60}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Final Page: App Library */}
            <div className="w-screen flex-shrink-0 h-full overflow-hidden">
              <MobileAppLibrary apps={flattenedApps} onTap={handleAppTap} />
            </div>
          </div>
        </div>

        {/* ── Page Indicators ─────────────────────────────── */}
        {currentPage !== totalPageCount - 1 && (
          <div className="flex justify-center mb-2.5 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/8 backdrop-blur-xl border border-slate-800/5 shadow-sm">
              {Array.from({ length: totalPageCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentPage 
                      ? "bg-slate-800 scale-110 shadow-sm" 
                      : "bg-slate-800/35"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Search Pill ── */}
        {currentPage !== totalPageCount - 1 && (
          <div className="flex justify-center mb-3 relative z-10">
            <div 
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800/10 backdrop-blur-2xl border border-slate-800/10 shadow-sm cursor-pointer active:scale-95 transition-transform" 
              onClick={() => navigate("/search")}
            >
              <Search size={14} className="text-slate-800/80 drop-shadow-sm" />
              <span className="text-slate-800/80 text-[13px] font-medium drop-shadow-md">Search</span>
            </div>
          </div>
        )}

        {/* ── Dock ──────────────────────────────────────────── */}
        {currentPage !== totalPageCount - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: ease.apple }}
            className="px-5 pb-6"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 16px)" }}
          >
            <div
              className="flex items-center justify-around px-4 py-3 rounded-[28px] border border-slate-800/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              style={{
                background: "rgba(30, 41, 59, 0.08)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
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
        )}
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

      {/* Folder Overlay Modal */}
      <AnimatePresence>
        {activeFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
            }}
            onClick={() => setActiveFolder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-[340px] rounded-[36px] p-6 flex flex-col items-center"
              style={{
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(25px)",
                WebkitBackdropFilter: "blur(25px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Folder Title */}
              <h2 className="text-white text-[28px] font-black tracking-tight mb-7 self-start px-2 drop-shadow-md">
                {activeFolder.name}
              </h2>

              {/* Grid of Apps inside folder */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-7 justify-items-center w-full max-h-[400px] overflow-y-auto pb-2">
                {activeFolder.apps.map((app, i) => (
                  <AppIcon
                    key={app.name}
                    app={app}
                    index={i}
                    isWiggling={isWiggling}
                    onTap={(path) => {
                      setActiveFolder(null);
                      handleAppTap(path);
                    }}
                    size={64}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── AppIcon sub-component ─────────────────────────────────────────────── */
interface AppIconProps {
  app: AppDef | FolderDef;
  index: number;
  isWiggling: boolean;
  onTap: (path: string) => void;
  onOpenFolder?: (folder: FolderDef) => void;
  size?: number;
  showLabel?: boolean;
}

const AppIcon = memo(function AppIcon({ app, index, isWiggling, onTap, onOpenFolder, size = 60, showLabel = true }: AppIconProps) {
  const iconSize = `min(${size}px, calc((100vw - 88px) / 4))`;
  const isFolder = 'isFolder' in app && app.isFolder;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWiggling) return;
    if (isFolder) {
      if (onOpenFolder) onOpenFolder(app as FolderDef);
    } else {
      onTap((app as AppDef).path);
    }
  };

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
            boxShadow: isFolder ? "none" : "0 1px 0px rgba(255,255,255,0.22) inset",
            transform: "translateZ(0)",   // GPU layer
            WebkitTransform: "translateZ(0)",
            touchAction: "manipulation",  // kills 300ms tap delay on mobile
            transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onClick={handleClick}
          onPointerDown={(e) => { e.currentTarget.style.transform = "translateZ(0) scale(0.92)"; }}
          onPointerUp={(e)   => { e.currentTarget.style.transform = "translateZ(0) scale(1)"; }}
          onPointerLeave={(e)=> { e.currentTarget.style.transform = "translateZ(0) scale(1)"; }}
        >
          {isFolder ? (
            /* Translucent iOS Folder Container */
            <div 
              className="w-full h-full grid grid-cols-3 gap-1.5 p-2.5 items-center justify-items-center"
              style={{
                background: "rgba(255, 255, 255, 0.62)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.45)",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
              }}
            >
              {(app as FolderDef).apps.slice(0, 9).map((miniApp, i) => (
                <div key={i} className="w-[14px] h-[14px] aspect-square rounded-[4px] overflow-hidden flex-shrink-0 relative">
                  {miniApp.img ? (
                    <img src={miniApp.img} className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: miniApp.iconBg || "#334155" }}>
                      {miniApp.icon && <miniApp.icon style={{ color: miniApp.iconColor || "#fff", width: "60%", height: "60%" }} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Standard App Icon */
            <div className="w-full h-full">
              {(app as AppDef).img ? (
                <img
                  src={(app as AppDef).img}
                  alt={app.name}
                  className={`w-full h-full object-cover ${app.name === "Grocery" ? "scale-125" : "scale-[1.18]"}`}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: (app as AppDef).iconBg || "transparent" }}
                >
                  {(app as AppDef).icon && (
                    <div className="w-full h-full flex items-center justify-center">
                      <app.icon
                        style={{ 
                          color: (app as AppDef).iconColor || "#fff", 
                          width: app.name === "Shops" || app.name === "Home" || app.name === "Combos" || app.name === "Profile" || app.name === "Settings" ? "100%" : "44%", 
                          height: app.name === "Shops" || app.name === "Home" || app.name === "Combos" || app.name === "Profile" || app.name === "Settings" ? "100%" : "44%" 
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gloss Sheen (only for apps, folders are matte) */}
          {!isFolder && (
            <div
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: "45%",
                borderRadius: "22% 22% 0 0",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.03) 100%)",
              }}
            />
          )}
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
