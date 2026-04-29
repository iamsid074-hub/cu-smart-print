import { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Home, Layers, Gamepad2 } from "lucide-react";

const TABS = [
  { id: "home",     label: "Home",     icon: Home,     path: "/home" },
  { id: "sections", label: "Sections", icon: Layers,   path: "/sections" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Which tab is active based on route
  const activeIndex = TABS.findIndex(t =>
    t.id === "home"
      ? location.pathname === "/home" || location.pathname === "/"
      : location.pathname.startsWith(t.path)
  );
  const currentIndex = activeIndex < 0 ? 0 : activeIndex;

  // Motion value for the sliding indicator X position
  const indicatorX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const pillWidth = useRef(0);

  // Sync indicator to active tab on route change
  useEffect(() => {
    if (!containerRef.current || isDragging.current) return;
    const w = containerRef.current.offsetWidth / 2;
    pillWidth.current = w;
    animate(indicatorX, currentIndex * w, { type: "spring", stiffness: 400, damping: 34, mass: 0.7 });
  }, [currentIndex, location.pathname]);

  // Scroll hide/show
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          if (Math.abs(y - lastScrollY) > 25) {
            setIsVisible(y < lastScrollY - 10 || y < 150);
            setLastScrollY(y);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin")
  ) return null;

  const isCart = location.pathname === "/cart";

  // Drag handlers on the pill container
  const handleDragStart = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const w = containerRef.current ? containerRef.current.offsetWidth / 2 : 150;
    const delta = e.clientX - dragStartX.current;
    const base = currentIndex * w;
    // Clamp with resistance at edges
    const raw = base + delta;
    const maxX = (TABS.length - 1) * w;
    const clamped = Math.max(-w * 0.3, Math.min(maxX + w * 0.3, raw));
    indicatorX.set(clamped);
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const w = containerRef.current ? containerRef.current.offsetWidth / 2 : 150;
    const currentX = indicatorX.get();
    const delta = e.clientX - dragStartX.current;

    // Switch tab based on swipe delta (>15% of pill width)
    let newIndex = currentIndex;
    if (delta < -w * 0.15 && currentIndex < TABS.length - 1) newIndex = currentIndex + 1;
    else if (delta > w * 0.15 && currentIndex > 0) newIndex = currentIndex - 1;

    // Snap back with spring
    animate(indicatorX, newIndex * w, { type: "spring", stiffness: 400, damping: 34, mass: 0.7 });

    if (newIndex !== currentIndex) {
      setTimeout(() => navigate(TABS[newIndex].path), 80);
    }
  };

  // Indicator position as percentage within the pill for the inner selector
  const indicatorLeft = useTransform(indicatorX, x => {
    const w = pillWidth.current || 150;
    const pct = (x / w) * 50; // 0% = left tab, 50% = right tab
    return `${Math.max(0, Math.min(50, pct))}%`;
  });

  return (
    <motion.div
      initial={false}
      animate={{ y: isCart || !isVisible ? 110 : 0, opacity: isCart || !isVisible ? 0 : 1 }}
      transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none will-change-transform"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Bottom blur fade strip */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "130px",
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, transparent 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 50%, transparent 100%)",
        }}
      />

      {/* Nav pills row */}
      <div
        className="relative flex justify-center px-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 10px) + 10px)", paddingTop: "10px" }}
      >
        <div className="w-full max-w-[500px] flex items-center gap-2.5">

          {/* ── Draggable Liquid Glass Pill ── */}
          <div
            ref={containerRef}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="flex-1 flex items-center relative overflow-hidden pointer-events-auto select-none touch-none"
            style={{
              borderRadius: "100px",
              height: "58px",
              background: "rgba(18, 18, 22, 0.72)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              boxShadow: `
                0 0 0 0.5px rgba(255,255,255,0.10),
                0 4px 24px rgba(0,0,0,0.7),
                inset 0 1px 0 rgba(255,255,255,0.10),
                inset 0 -1px 0 rgba(0,0,0,0.5)
              `,
            }}
          >
            {/* Subtle top glint */}
            <div
              className="absolute top-0 left-8 right-8 pointer-events-none"
              style={{
                height: "0.5px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
              }}
            />

            {/* Sliding active indicator (inner pill) */}
            <motion.div
              className="absolute top-[5px] bottom-[5px] pointer-events-none"
              style={{
                left: indicatorLeft,
                width: "50%",
                borderRadius: "100px",
                background: "rgba(255,255,255,0.08)",
                boxShadow: `
                  0 0 0 0.5px rgba(255,255,255,0.12),
                  inset 0 1px 0 rgba(255,255,255,0.15),
                  inset 0 -1px 0 rgba(0,0,0,0.2)
                `,
              }}
            />

            {/* Tab buttons */}
            {TABS.map((tab, idx) => {
              const isActive = idx === currentIndex;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  draggable={false}
                  onClick={e => {
                    // Don't navigate if it was a drag
                    if (Math.abs(dragStartX.current - (e as any).clientX) > 5) {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10 h-full"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{
                      color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)",
                      transition: "color 0.2s, stroke-width 0.2s",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.38)",
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                      transition: "color 0.2s",
                    }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ── Games pill ── */}
          <Link
            to="/games"
            draggable={false}
            className="shrink-0 pointer-events-auto flex flex-col items-center justify-center px-5 active:scale-95 transition-transform duration-100"
            style={{
              borderRadius: "100px",
              height: "58px",
              background: "rgba(80, 30, 200, 0.65)",
              backdropFilter: "blur(24px) saturate(200%)",
              WebkitBackdropFilter: "blur(24px) saturate(200%)",
              boxShadow: `
                0 0 0 0.5px rgba(160,100,255,0.30),
                0 6px 24px rgba(80,30,200,0.55),
                inset 0 1px 0 rgba(255,255,255,0.18),
                inset 0 -1px 0 rgba(0,0,0,0.3)
              `,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Gamepad2 size={21} strokeWidth={2.4} className="text-white mb-1" />
            <span style={{ fontSize: "11px", fontWeight: 900, color: "#fff", letterSpacing: "0.04em", lineHeight: 1, fontStyle: "italic", textTransform: "uppercase" }}>
              Games ↗
            </span>
          </Link>

        </div>
      </div>
    </motion.div>
  );
};

export default memo(BottomNav);
