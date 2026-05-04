import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Wallet, ShoppingBag, Settings,
  Gamepad2, Search, Grid, Bell, Package,
} from "lucide-react";

// ─── Spring physics (pure JS, no React re-renders during drag) ───────────────
function springTo(
  from: number,
  to: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
  stiffness = 300,
  damping = 35,
) {
  let pos = from;
  let vel = 0;
  let rafId = 0;
  let lastTime = performance.now();

  const step = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, 0.04); // cap at 40ms
    lastTime = now;
    const force = -stiffness * (pos - to) - damping * vel;
    vel += force * dt;
    pos += vel * dt;
    onUpdate(pos);
    if (Math.abs(pos - to) < 0.5 && Math.abs(vel) < 0.5) {
      onUpdate(to);
      onDone?.();
      return;
    }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}

// ─── Section tiles config ────────────────────────────────────────────────────
const SECTIONS = [
  // row 0: 2x2 icon grid
  { id: "profile",      icon: User,       color: "#0A84FF", label: null,        to: "/profile"      },
  { id: "wallet",       icon: Wallet,     color: "#30D158", label: null,        to: "/wallet"       },
  { id: "orders",       icon: ShoppingBag,color: "#FF9F0A", label: null,        to: "/transactions" },
  { id: "settings",     icon: Settings,   color: "#8E8E93", label: null,        to: "/settings"     },
  // row 0 right: sections card
  { id: "sections",     icon: Grid,       color: "#BF5AF2", label: "Sections",  sub: "All Categories", to: "/sections" },
  // row 1: search pill + bell
  { id: "search",       icon: Search,     color: "#FFFFFF80",label: "Search Items", to: "/search"  },
  { id: "bell",         icon: Bell,       color: "#FF453A", label: null,        to: null            },
  // row 2: games + grocery
  { id: "games",        icon: Gamepad2,   gradient: ["#FF453A","#FF9F0A"], label: "Games",   sub: "Play & Win",  to: "/games"   },
  { id: "grocery",      icon: Package,    gradient: ["#30D158","#32ADE6"], label: "Grocery", sub: "Essentials",  to: "/grocery" },
];

const TILE_BG = "rgba(44,44,46,0.85)";

export default function ControlCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const navigate = useNavigate();

  // Refs for direct DOM manipulation (zero React overhead during drag)
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cancelSpring = useRef<(() => void) | null>(null);

  // Touch state
  const touchStart = useRef({ y: 0, time: 0 });
  const currentY = useRef(-window.innerHeight);
  const isDragging = useRef(false);
  const isOpenRef = useRef(false);

  // ── Direct DOM update (no React state) ──────────────────────────────────
  const applyY = useCallback((y: number) => {
    currentY.current = y;
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${y}px)`;
    }
    // Backdrop opacity: 0 when fully closed, 1 when fully open
    const pct = Math.max(0, Math.min(1, (y + window.innerHeight) / window.innerHeight));
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(pct);
      backdropRef.current.style.pointerEvents = pct > 0.05 ? "auto" : "none";
    }
  }, []);

  const openPanel = useCallback(() => {
    isOpenRef.current = true;
    setIsOpen(true);
    if (panelRef.current) panelRef.current.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
    cancelSpring.current?.();
    cancelSpring.current = springTo(
      currentY.current, 0, applyY,
      () => setShowCards(true),
      320, 38
    );
  }, [applyY]);

  const closePanel = useCallback(() => {
    isOpenRef.current = false;
    setShowCards(false);
    setIsOpen(false);
    if (panelRef.current) panelRef.current.style.pointerEvents = "none";
    document.body.style.overflow = "";
    cancelSpring.current?.();
    cancelSpring.current = springTo(
      currentY.current, -window.innerHeight, applyY,
      undefined, 320, 38
    );
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "none";
  }, [applyY]);

  // ── Touch handlers on the hit area (top 50px, only when closed) ──────────
  const handleHitTouchStart = useCallback((e: TouchEvent) => {
    if (isOpenRef.current) return;
    const t = e.touches[0];
    if (t.clientY > 50) return;
    isDragging.current = true;
    touchStart.current = { y: t.clientY, time: performance.now() };
    cancelSpring.current?.();
    // Set panel visible with pointer-events but stay off-screen
    if (panelRef.current) panelRef.current.style.pointerEvents = "none";
  }, []);

  const handleHitTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || isOpenRef.current) return;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (dy < 0) return;
    // Resistance beyond full open
    const raw = -window.innerHeight + dy;
    const clamped = raw > 0 ? raw * 0.1 : raw;
    applyY(clamped);
  }, [applyY]);

  const handleHitTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging.current || isOpenRef.current) return;
    isDragging.current = false;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = performance.now() - touchStart.current.time;
    const velocity = dy / dt; // px/ms
    if (velocity > 0.3 || dy > 80) {
      openPanel();
    } else {
      closePanel();
    }
  }, [openPanel, closePanel]);

  // ── Touch handlers on the panel itself (swipe up to close) ──────────────
  const handlePanelTouchStart = useCallback((e: TouchEvent) => {
    if (!isOpenRef.current) return;
    isDragging.current = true;
    touchStart.current = { y: e.touches[0].clientY, time: performance.now() };
    setShowCards(false);
    cancelSpring.current?.();
  }, []);

  const handlePanelTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !isOpenRef.current) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - touchStart.current.y;
    // Only allow dragging up
    const raw = dy;
    const clamped = raw > 0 ? raw * 0.1 : raw;
    applyY(clamped);
  }, [applyY]);

  const handlePanelTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !isOpenRef.current) return;
    isDragging.current = false;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = performance.now() - touchStart.current.time;
    const velocity = dy / dt;
    if (velocity < -0.3 || dy < -80) {
      closePanel();
    } else {
      openPanel();
    }
  }, [openPanel, closePanel]);

  // ── Mouse fallback for desktop testing ───────────────────────────────────
  const handleHitMouseDown = useCallback((e: MouseEvent) => {
    if (isOpenRef.current || e.clientY > 50) return;
    isDragging.current = true;
    touchStart.current = { y: e.clientY, time: performance.now() };
    cancelSpring.current?.();

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dy = ev.clientY - touchStart.current.y;
      const raw = -window.innerHeight + dy;
      applyY(raw > 0 ? raw * 0.1 : raw);
    };
    const onUp = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const dy = ev.clientY - touchStart.current.y;
      const dt = performance.now() - touchStart.current.time;
      const velocity = dy / dt;
      if (velocity > 0.3 || dy > 80) openPanel(); else closePanel();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [applyY, openPanel, closePanel]);

  // ── ESC key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpenRef.current) closePanel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel]);

  // ── Register hit-area listeners ──────────────────────────────────────────
  const hitRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = hitRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleHitTouchStart, { passive: true });
    el.addEventListener("touchmove", handleHitTouchMove, { passive: true });
    el.addEventListener("touchend", handleHitTouchEnd, { passive: true });
    el.addEventListener("mousedown", handleHitMouseDown as any);
    return () => {
      el.removeEventListener("touchstart", handleHitTouchStart);
      el.removeEventListener("touchmove", handleHitTouchMove);
      el.removeEventListener("touchend", handleHitTouchEnd);
      el.removeEventListener("mousedown", handleHitMouseDown as any);
    };
  }, [handleHitTouchStart, handleHitTouchMove, handleHitTouchEnd, handleHitMouseDown]);

  // ── Register panel drag listeners ────────────────────────────────────────
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handlePanelTouchStart, { passive: true });
    el.addEventListener("touchmove", handlePanelTouchMove, { passive: false });
    el.addEventListener("touchend", handlePanelTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handlePanelTouchStart);
      el.removeEventListener("touchmove", handlePanelTouchMove);
      el.removeEventListener("touchend", handlePanelTouchEnd);
    };
  }, [handlePanelTouchStart, handlePanelTouchMove, handlePanelTouchEnd]);

  // ── Initial position ─────────────────────────────────────────────────────
  useEffect(() => {
    applyY(-window.innerHeight);
  }, [applyY]);

  // ── Navigate helper ──────────────────────────────────────────────────────
  const go = (to: string | null) => {
    if (!to) return;
    closePanel();
    setTimeout(() => navigate(to), 300);
  };

  // ── Stagger variants ─────────────────────────────────────────────────────
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 10 },
    visible: (i: number) => ({
      opacity: 1, scale: 1, y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30, delay: i * 0.04 },
    }),
    exit: (i: number) => ({
      opacity: 0, scale: 0.88, y: 6,
      transition: { duration: 0.15, delay: i * 0.02 },
    }),
  };

  return (
    <>
      {/* Hit zone - top 50px, always mounted */}
      <div
        ref={hitRef}
        className="fixed top-0 inset-x-0 h-[50px] z-[100001]"
        style={{ touchAction: "none" }}
      />

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[99997]"
        style={{
          opacity: 0,
          pointerEvents: "none",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(55px)",
          WebkitBackdropFilter: "blur(55px)",
          willChange: "opacity",
        }}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 top-0 bottom-0 z-[99999] px-4 pb-8"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 20px) + 48px)",
          transform: `translateY(-${window.innerHeight}px)`,
          pointerEvents: "none",
          willChange: "transform",
          touchAction: "none",
        }}
      >
        <div className="w-full h-full max-w-sm mx-auto flex flex-col gap-3">

          {/* ── Row 1: 2x2 icons + Sections ── */}
          <div className="flex gap-3 h-[155px]">
            <AnimatePresence>
              {showCards && (
                <>
                  {/* 2×2 icon grid */}
                  <motion.div
                    key="grid"
                    custom={0}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex-1 rounded-[28px] p-3 grid grid-cols-2 grid-rows-2 gap-2"
                    style={{ background: TILE_BG, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                  >
                    {[
                      { icon: User,        color: "#0A84FF", to: "/profile"      },
                      { icon: Wallet,      color: "#30D158", to: "/wallet"       },
                      { icon: ShoppingBag, color: "#FF9F0A", to: "/transactions" },
                      { icon: Settings,    color: "#8E8E93", to: "/settings"     },
                    ].map(({ icon: Icon, color, to }) => (
                      <button
                        key={to}
                        onClick={() => go(to)}
                        className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ background: color }}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    ))}
                  </motion.div>

                  {/* Sections card */}
                  <motion.div
                    key="sections"
                    custom={1}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex-1 rounded-[28px] p-4 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
                    style={{ background: TILE_BG, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onClick={() => go("/sections")}
                  >
                    <div className="flex justify-end">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(191,90,242,0.18)" }}>
                        <Grid className="w-4.5 h-4.5" style={{ color: "#BF5AF2" }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg leading-tight tracking-tight">Sections</p>
                      <p className="text-white/50 text-sm font-medium">All Categories</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* ── Row 2: Search + Bell ── */}
          <div className="flex gap-3 h-[70px]">
            <AnimatePresence>
              {showCards && (
                <>
                  <motion.div
                    key="search"
                    custom={2}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex-[2] rounded-[22px] px-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    style={{ background: TILE_BG, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onClick={() => go("/search")}
                  >
                    <Search className="w-5 h-5 text-white/60" />
                    <span className="text-white font-semibold text-base tracking-tight">Search Items</span>
                  </motion.div>

                  <motion.div
                    key="bell"
                    custom={3}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex-1 rounded-[22px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    style={{ background: TILE_BG, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,69,58,0.18)" }}>
                      <Bell className="w-5 h-5" style={{ color: "#FF453A" }} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* ── Row 3: Games + Grocery ── */}
          <div className="flex gap-3 h-[155px]">
            <AnimatePresence>
              {showCards && (
                <>
                  {[
                    { key: "games",   icon: Gamepad2, gradient: ["#FF453A","#FF9F0A"], label: "Games",   sub: "Play & Win",  to: "/games",   delay: 4 },
                    { key: "grocery", icon: Package,  gradient: ["#30D158","#32ADE6"], label: "Grocery", sub: "Essentials",  to: "/grocery", delay: 5 },
                  ].map(({ key, icon: Icon, gradient, label, sub, to, delay }) => (
                    <motion.div
                      key={key}
                      custom={delay}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex-1 rounded-[28px] p-4 flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform"
                      style={{ background: TILE_BG, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                      onClick={() => go(to)}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold tracking-tight">{label}</p>
                        <p className="text-white/50 text-xs font-medium">{sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Handle bar */}
          <div className="flex justify-center mt-auto pt-2">
            <div className="w-10 h-1 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
    </>
  );
}
