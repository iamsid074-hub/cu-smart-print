import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Wallet, ShoppingBag, Settings,
  Gamepad2, Search, Grid, Bell, Package, ShoppingCart, Wifi, Zap
} from "lucide-react";

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

// Pure-JS spring (runs on rAF, never blocks React)
function runSpring(
  fromY: number,
  toY: number,
  onUpdate: (y: number) => void,
  onDone?: () => void,
) {
  let pos = fromY;
  let vel = 0;
  const stiffness = 380;
  const damping = 40;
  let last = performance.now();
  let id = 0;

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.032);
    last = now;
    vel += (-stiffness * (pos - toY) - damping * vel) * dt;
    pos += vel * dt;
    onUpdate(pos);
    if (Math.abs(pos - toY) < 0.8 && Math.abs(vel) < 0.8) {
      onUpdate(toY);
      onDone?.();
      return;
    }
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

// ─── Real-time iOS Status Bar ────────────────────────────────────────────────
const IosStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);

          battery.addEventListener('levelchange', () => setBatteryLevel(battery.level));
          battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
        } catch (e) {
          console.error("Battery API not supported:", e);
        }
      }
    };
    getBattery();
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '');

  return (
    <div className="flex items-center justify-between px-2 pb-6 pt-2 w-full">
      <div className="text-white font-semibold text-[15px] tracking-tight ml-2">
        {formattedTime}
      </div>
      <div className="flex items-center gap-1.5 mr-1">
        {/* Cellular Bars */}
        <div className="flex items-end gap-[2px] h-[10px] pb-[1px]">
          <div className="w-[3px] h-[4px] bg-white rounded-sm" />
          <div className="w-[3px] h-[6px] bg-white rounded-sm" />
          <div className="w-[3px] h-[8px] bg-white rounded-sm" />
          <div className="w-[3px] h-[10px] bg-white rounded-sm" />
        </div>
        <Wifi className="w-[15px] h-[15px] text-white ml-0.5 stroke-[2.5]" />
        
        {/* Battery */}
        <div className="relative flex items-center ml-1">
          <div className="w-[22px] h-[11px] border border-white/40 rounded-[4px] p-[1px] flex items-center relative overflow-hidden">
            <div 
              className={`h-full rounded-[1px] transition-all duration-300 ${batteryLevel <= 0.2 && !isCharging ? 'bg-[#FF453A]' : 'bg-white'}`} 
              style={{ width: `${Math.max(5, batteryLevel * 100)}%` }} 
            />
            {isCharging && (
              <Zap className="w-2 h-2 text-black absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-current drop-shadow-sm" />
            )}
          </div>
          <div className="w-[1px] h-[4px] bg-white/40 rounded-r-sm ml-[1px]" />
        </div>
      </div>
    </div>
  );
};

export default function ControlCenter() {
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cancelSpring = useRef<(() => void) | null>(null);
  const isOpenRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartPanelY = useRef(0);
  const dragStartTime = useRef(0);
  const currentPanelY = useRef(getClosedY());
  const isDragging = useRef(false);

  // Direct DOM write — zero React overhead
  const setY = useCallback((y: number) => {
    currentPanelY.current = y;
    if (!panelRef.current) return;
    panelRef.current.style.transform = `translateY(${y}px)`;
    const pct = Math.max(0, Math.min(1, 1 + y / window.innerHeight));
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(pct);
    }
  }, []);

  const open = useCallback(() => {
    cancelSpring.current?.();
    isOpenRef.current = true;
    if (panelRef.current) panelRef.current.style.pointerEvents = "auto";
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
    // Show cards immediately so they are visible as panel arrives
    setShowCards(true);
    cancelSpring.current = runSpring(currentPanelY.current, OPEN_Y, setY);
  }, [setY]);

  const close = useCallback(() => {
    cancelSpring.current?.();
    isOpenRef.current = false;
    setShowCards(false);
    if (panelRef.current) panelRef.current.style.pointerEvents = "none";
    if (backdropRef.current) backdropRef.current.style.pointerEvents = "none";
    document.body.style.overflow = "";
    cancelSpring.current = runSpring(currentPanelY.current, getClosedY(), setY);
  }, [setY]);

  // ── Pointer events (unified mouse + touch) ──────────────────────────────
  const onPointerDown = useCallback((e: PointerEvent) => {
    // Only start from top 50px when closed
    if (isOpenRef.current) return;
    if (e.clientY > 50) return;
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartPanelY.current = currentPanelY.current;
    dragStartTime.current = performance.now();
    cancelSpring.current?.();
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || isOpenRef.current) return;
    const dy = e.clientY - dragStartY.current;
    let newY = dragStartPanelY.current + dy;
    if (newY > 0) newY = newY * 0.08; // resistance
    setY(newY);
  }, [setY]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dy = e.clientY - dragStartY.current;
    const dt = performance.now() - dragStartTime.current;
    const vel = dy / dt;
    if (vel > 0.25 || dy > 80) open(); else close();
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
    cancelSpring.current?.();
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, []);

  const onPanelPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !isOpenRef.current) return;
    const dy = e.clientY - dragStartY.current;
    let newY = dy; // only upward (dy will be negative)
    if (newY > 0) newY = newY * 0.08; // resist downward
    setY(newY);
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

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

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

  return (
    <>
      {/* Hit zone — always present, top 50px */}
      <div
        ref={hitRef}
        className="fixed top-0 inset-x-0 z-[100001]"
        style={{ height: 50, touchAction: "none", cursor: "ns-resize" }}
      />

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[99997]"
        onClick={close}
        style={{
          opacity: 0,
          pointerEvents: "none",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          willChange: "opacity",
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 top-0 bottom-0 z-[99999]"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 20px) + 44px)",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 32,
          pointerEvents: "none",
          willChange: "transform",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <div className="w-full h-full max-w-sm mx-auto flex flex-col gap-3">

          <AnimatePresence>
            {showCards && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IosStatusBar />
              </motion.div>
            )}
          </AnimatePresence>

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
                    className="flex-1 rounded-[36px] p-3 grid grid-cols-2 grid-rows-2 gap-2"
                    style={GLASS}
                  >
                    {([
                      { icon: User,        bg: "#7B6FA8", to: "/profile",      label: "Profile"  },
                      { icon: Wallet,      bg: "#30A85A", to: "/wallet",       label: "Wallet"   },
                      { icon: ShoppingBag, bg: "#C97840", to: "/transactions", label: "Orders"   },
                      { icon: Settings,    bg: "#5C5C5E", to: "/settings",     label: "Settings" },
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

          {/* Handle */}
          <div className="flex justify-center mt-auto pt-2">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </>
  );
}
