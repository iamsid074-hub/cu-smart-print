import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, Wallet, ShoppingBag, Settings,
  Gamepad2, Search, Grid, Bell, Package, ShoppingCart, Wifi, Zap,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemStatus } from "@/hooks/useSystemStatus";

// Glassmorphic tile — translucent + blur, light gradient overlay
const GLASS = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)",
  backdropFilter: "blur(24px) saturate(1.6)",
  WebkitBackdropFilter: "blur(24px) saturate(1.6)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
};

const OPEN_Y = 0;
const getClosedY = () => -window.innerHeight;

// Removed runSpring - switching to CSS transitions for 100% GPU accelerated smoothness



export default function ControlCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const path = location.pathname.toLowerCase();
  const isExcludedPage = path === "/" || path === "/login" || path.startsWith("/admin");

  const isSuperAdmin = user?.email === "iamsid074@gmail.com";
  const [showCards, setShowCards] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartPanelY = useRef(0);
  const dragStartTime = useRef(0);
  const currentPanelY = useRef(getClosedY());
  const isDragging = useRef(false);

  // ── CSS Transition Config ──
  const SPRING_OPEN = "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1.05)";
  const SPRING_CLOSE = "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)";
  const FADE_TRANSITION = "opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1)";

  // Direct DOM write — zero React overhead + Force GPU Acceleration
  const setY = useCallback((y: number, useTransition: boolean = false) => {
    currentPanelY.current = y;
    if (!panelRef.current || !backdropRef.current) return;
    
    // Apply transitions if requested, otherwise disable them for instant 1:1 drag tracking
    if (useTransition) {
      panelRef.current.style.transition = y === OPEN_Y ? SPRING_OPEN : SPRING_CLOSE;
      backdropRef.current.style.transition = FADE_TRANSITION;
    } else {
      panelRef.current.style.transition = "none";
      backdropRef.current.style.transition = "none";
    }

    panelRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
    
    // Calculate opacity (1 when fully open, 0 when fully closed)
    const pct = Math.max(0, Math.min(1, 1 + y / window.innerHeight));
    backdropRef.current.style.opacity = String(pct);
  }, []);

  const open = useCallback(() => {
    isOpenRef.current = true;
    if (panelRef.current) panelRef.current.style.pointerEvents = "auto";
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
    setShowCards(true);
    
    // Trigger CSS animation to open
    setY(OPEN_Y, true);
  }, [setY]);

  const close = useCallback(() => {
    isOpenRef.current = false;
    setShowCards(false);
    if (panelRef.current) panelRef.current.style.pointerEvents = "none";
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "none";
    document.body.style.overflow = "";
    
    // Trigger CSS animation to close
    setY(getClosedY(), true);
  }, [setY]);

  // Page exclusion handlers
  useEffect(() => {
    if (isExcludedPage && isOpenRef.current) {
      close();
    }
  }, [isExcludedPage, close]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Pointer events (unified mouse + touch) ──────────────────────────────
  const onPointerDown = useCallback((e: PointerEvent) => {
    if (isOpenRef.current) return;
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartPanelY.current = currentPanelY.current;
    dragStartTime.current = performance.now();
    
    // Lock the current position and disable transition to start 1:1 drag
    setY(currentPanelY.current, false);
    
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, [setY]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || isOpenRef.current) return;
    const dy = e.clientY - dragStartY.current;
    
    // Smooth progress based pull down
    const targetDragDistance = 350; // Pull down 350px to fully open
    const pct = Math.max(0, Math.min(1, dy / targetDragDistance));
    const closedY = getClosedY();
    const newY = closedY + pct * Math.abs(closedY);
    
    setY(newY, false); // instant drag tracking
  }, [setY]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = e.clientY - dragStartY.current;
    const dt = performance.now() - dragStartTime.current;
    const vel = dy / dt;
    if (vel > 0.25 || dy > 100) open(); else close();
  }, [open, close]);

  // ── Panel drag-up to close ──────────────────────────────────────────────
  const onPanelPointerDown = useCallback((e: PointerEvent) => {
    if (!isOpenRef.current) return;
    // Ignore taps on interactive elements
    const tag = (e.target as HTMLElement).closest("button,[data-action]");
    if (tag) return;
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartPanelY.current = 0; // panel is at 0 when open
    dragStartTime.current = performance.now();
    
    setY(0, false); // lock instantly
    
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, [setY]);

  const onPanelPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !isOpenRef.current) return;
    const dy = e.clientY - dragStartY.current;
    let newY = dy; // only upward (dy will be negative)
    if (newY > 0) newY = newY * 0.08; // resist downward
    setY(newY, false);
  }, [setY]);

  const onPanelPointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !isOpenRef.current) return;
    isDragging.current = false;
    const dy = e.clientY - dragStartY.current;
    const dt = performance.now() - dragStartTime.current;
    const vel = dy / dt;
    if (vel < -0.25 || dy < -80) close(); else open();
  }, [open, close]);

  // ── Hit area ref ────────────────────────────────────────────────────────
  const hitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    hit.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      hit.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.addEventListener("pointerdown", onPanelPointerDown, { passive: true });
    window.addEventListener("pointermove", onPanelPointerMove, { passive: true });
    window.addEventListener("pointerup", onPanelPointerUp, { passive: true });
    return () => {
      panel.removeEventListener("pointerdown", onPanelPointerDown);
      window.removeEventListener("pointermove", onPanelPointerMove);
      window.removeEventListener("pointerup", onPanelPointerUp);
    };
  }, [onPanelPointerDown, onPanelPointerMove, onPanelPointerUp]);

  // ESC to close, C to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") close(); 
      if (e.key.toLowerCase() === "c") {
        // Only toggle if not typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          if (isOpenRef.current) close(); else open();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  // Initial position
  useEffect(() => {
    setY(getClosedY());
  }, [setY]);

  const go = (to: string | null) => {
    if (!to) return;
    close();
    setTimeout(() => navigate(to), 250);
  };

  // Card variants — fast, simultaneous pop-in
  const card = {
    hidden: { opacity: 0, scale: 0.88, y: 8 },
    show: (i: number) => ({
      opacity: 1, scale: 1, y: 0,
      transition: { type: "spring" as const, stiffness: 500, damping: 32, delay: i * 0.03 },
    }),
    hide: { opacity: 0, scale: 0.9, transition: { duration: 0.12 } },
  };

  if (isExcludedPage) return null;

  return (
    <>
      {/* Hit zone — time-side (left) top bar zone (Time is on the left) */}
      <div
        ref={hitRef}
        className="fixed top-0 left-0 z-[100001]"
        style={{
          height: 48,
          touchAction: "none",
          cursor: "ns-resize",
          width: 140, // Left 140px (exactly where time is rendered)
        }}
      />

      {/* Backdrop — semi-transparent overlay, no blur */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[99997]"
        onClick={close}
        style={{
          opacity: 0,
          pointerEvents: "none",
          background: "rgba(0,0,0,0.3)",
          willChange: "opacity",
        }}
      />

      {/* Panel — centred on mobile, right-anchored on desktop */}
      <div
        ref={panelRef}
        className="fixed top-0 bottom-0 z-[99999]"
        style={{
          // Mobile: full width. Desktop: fixed width anchored to the right
          right: 0,
          left: 0,
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 64px)",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 32,
          pointerEvents: "none",
          willChange: "transform",
          transform: `translate3d(0, ${getClosedY()}px, 0)`,
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Inner: centred on mobile, right-aligned on desktop */}
        <div className="w-full h-full flex flex-col gap-3 md:items-end">

          {/* Cards wrapper — max-w-sm centred on mobile, right-aligned on desktop */}
          <div className="w-full max-w-sm md:ml-auto flex flex-col gap-3">



          {/* Row 1 */}
          <div className="flex gap-3 h-[152px]">
            <AnimatePresence>
              {showCards && (
                <>
                  <motion.div
                    key="grid"
                    custom={0}
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="hide"
                    className={`flex-1 rounded-[36px] p-3 grid ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}
                    style={GLASS}
                  >
                    {([
                      { icon: User,        bg: "#7B6FA8", to: "/profile",      label: "Profile"  },
                      { icon: Wallet,      bg: "#30A85A", to: "/wallet",       label: "Wallet"   },
                      { icon: ShoppingBag, bg: "#C97840", to: "/transactions", label: "Orders"   },
                      { icon: Settings,    bg: "#5C5C5E", to: "/settings",     label: "Settings" },
                      ...(isSuperAdmin ? [{ icon: ShieldAlert, bg: "#E11D48", to: "/admin", label: "Admin" }] : [])
                    ] as const).map(({ icon: Icon, bg, to, label }) => (
                      <button
                        key={to}
                        data-action="true"
                        onClick={() => go(to)}
                        className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform duration-100"
                      >
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                          style={{ background: bg }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white/80 text-[10px] font-medium tracking-tight leading-none">{label}</span>
                      </button>
                    ))}
                  </motion.div>

                  <motion.button
                    key="sections"
                    custom={1}
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="hide"
                    data-action="true"
                    className="flex-1 rounded-[36px] p-4 flex flex-col justify-between text-left active:scale-95 transition-transform duration-100"
                    style={GLASS}
                    onClick={() => go("/sections")}
                  >
                    <div className="flex justify-end">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(191,90,242,0.2)" }}>
                        <Grid className="w-4 h-4" style={{ color: "#BF5AF2" }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg leading-tight tracking-tight">Sections</p>
                      <p className="text-white/50 text-sm font-medium">All Categories</p>
                    </div>
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Row 2 */}
          <div className="flex gap-3 h-[68px]">
            <AnimatePresence>
              {showCards && (
                <>
                  <motion.button
                    key="search"
                    custom={2}
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="hide"
                    data-action="true"
                    className="flex-[2] rounded-[36px] px-5 flex items-center gap-3 active:scale-95 transition-transform duration-100"
                    style={GLASS}
                    onClick={() => go("/search")}
                  >
                    <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                    <span className="text-white font-semibold text-base tracking-tight">Search Items</span>
                  </motion.button>

                  <motion.button
                    key="bell"
                    custom={3}
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="hide"
                    data-action="true"
                    className="flex-1 rounded-[36px] flex items-center justify-center active:scale-95 transition-transform duration-100"
                    style={GLASS}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,69,58,0.2)" }}>
                      <Bell className="w-5 h-5" style={{ color: "#FF453A" }} />
                    </div>
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Row 3 */}
          <div className="flex gap-3 h-[152px]">
            <AnimatePresence>
              {showCards && (
                <>
                  {[
                   { key: "games",   Icon: Gamepad2,     bg: "#D93B30",  label: "Games",   sub: "Play & Win",  to: "/games",   i: 4 },
                    { key: "grocery", Icon: ShoppingCart, bg: "#34A853",  label: "Grocery", sub: "Essentials",  to: "/grocery", i: 5 },
                  ].map(({ key, Icon, bg, label, sub, to, i }) => (
                    <motion.button
                      key={key}
                      custom={i}
                      variants={card}
                      initial="hidden"
                      animate="show"
                      exit="hide"
                      data-action="true"
                      className="flex-1 rounded-[36px] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform duration-100"
                      style={GLASS}
                      onClick={() => go(to)}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: bg }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold tracking-tight">{label}</p>
                        <p className="text-white/50 text-xs font-medium">{sub}</p>
                      </div>
                    </motion.button>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          </div> {/* end cards wrapper */}

          {/* Handle — mobile only */}
          <div className="flex justify-center mt-auto pt-2 md:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </>
  );
}
