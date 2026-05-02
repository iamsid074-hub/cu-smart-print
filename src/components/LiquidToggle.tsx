import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface Option {
  id: string;
  label: string;
}

interface LiquidToggleProps {
  options: Option[];
  active: string;
  onChange: (id: string) => void;
}

export default function LiquidToggle({ options, active, onChange }: LiquidToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = options.length;
  const activeIndex = options.findIndex((o) => o.id === active);

  // Live motion values
  const pillX = useMotionValue(0); // in px from container left
  const pillScaleX = useMotionValue(1);
  const pillScaleY = useMotionValue(1);

  const [dragging, setDragging] = useState(false);
  const [pillWidth, setPillWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container on mount/resize
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setContainerWidth(w);
      const pw = w / count - 8;
      setPillWidth(pw);
      // Snap pill to active index without animation on mount
      pillX.set(getTargetX(activeIndex, w, count));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [count]);

  // When active changes externally (click), animate to new position
  useEffect(() => {
    if (dragging || containerWidth === 0) return;
    const targetX = getTargetX(activeIndex, containerWidth, count);
    animateToX(targetX);
  }, [activeIndex, containerWidth]);

  function getTargetX(idx: number, cw: number, n: number) {
    const pw = cw / n - 8;
    return idx * (cw / n) + 4;
  }

  async function animateToX(targetX: number, fromDrag = false) {
    const currentX = pillX.get();
    if (!fromDrag) {
      // Lift up
      await animate(pillScaleY, 1.28, { duration: 0.1, ease: "easeOut" });
      await animate(pillScaleX, 1.15, { duration: 0.08, ease: "easeOut" });
    }
    // Slide
    await animate(pillX, targetX, {
      duration: fromDrag ? 0.25 : 0.2,
      ease: fromDrag ? [0.34, 1.56, 0.64, 1] : [0.4, 0, 0.2, 1],
    });
    // Land squish
    await animate(pillScaleY, 0.88, { duration: 0.08, ease: "easeIn" });
    await animate(pillScaleX, 1.1, { duration: 0.08, ease: "easeIn" });
    // Bounce settle
    animate(pillScaleY, 1, { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] });
    animate(pillScaleX, 1, { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] });
  }

  // ─── POINTER DRAG HANDLERS ───────────────────────────────────────────────
  const pointerStartX = useRef(0);
  const pillStartX = useRef(0);
  const isDragMove = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    pointerStartX.current = e.clientX;
    pillStartX.current = pillX.get();
    isDragMove.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Lift the pill on press
    animate(pillScaleY, 1.28, { duration: 0.1, ease: "easeOut" });
    animate(pillScaleX, 1.12, { duration: 0.1, ease: "easeOut" });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const dx = e.clientX - pointerStartX.current;
    if (Math.abs(dx) > 3) isDragMove.current = true;

    const cw = containerRef.current.offsetWidth;
    const pw = cw / count - 8;
    const minX = 4;
    const maxX = cw - pw - 4;

    // Move pill live with the finger
    const newX = Math.max(minX, Math.min(maxX, pillStartX.current + dx));
    pillX.set(newX);

    // Slight stretch based on velocity direction
    const stretchX = 1 + Math.min(Math.abs(dx) * 0.003, 0.18);
    const squishY = 1 / stretchX;
    pillScaleX.set(stretchX);
    pillScaleY.set(squishY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    setDragging(false);

    const dx = e.clientX - pointerStartX.current;
    const cw = containerRef.current.offsetWidth;

    if (!isDragMove.current) {
      // It was a tap — find which tab was tapped
      const rect = containerRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const tappedIndex = Math.floor(relX / (cw / count));
      const clampedIndex = Math.max(0, Math.min(count - 1, tappedIndex));
      const targetX = getTargetX(clampedIndex, cw, count);
      onChange(options[clampedIndex].id);
      animateToX(targetX, true);
      return;
    }

    // Snap to nearest tab
    const currentX = pillX.get();
    const pw = cw / count - 8;
    // Find nearest tab index by current pill center
    const pillCenter = currentX + pw / 2;
    const nearestIndex = Math.round((pillCenter / cw) * count - 0.5);
    const clampedIndex = Math.max(0, Math.min(count - 1, nearestIndex));
    const snapX = getTargetX(clampedIndex, cw, count);

    onChange(options[clampedIndex].id);
    animateToX(snapX, true);
  };

  const isCombo = active === "combos";

  return (
    <>
      {/* Goo SVG filter — scoped to pill only */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="liquid-goo-toggle" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
            />
          </filter>
        </defs>
      </svg>

      {/* Outer container */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: "440px",
          margin: "0 auto",
          height: "52px",
          borderRadius: "100px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)",
          userSelect: "none",
          touchAction: "none",
          cursor: "grab",
          overflow: "hidden",
        }}
      >
        {/* Goo filter layer — BOTH track + pill must be inside so their edges bleed/merge */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            filter: "url(#liquid-goo-toggle)",
            overflow: "hidden",
            borderRadius: "100px",
          }}
        >
          {/* The container track background — same shape as outer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "100px",
              background: "rgba(40,40,48,0.92)",
            }}
          />

          {/* The liquid pill */}
          <motion.div
            style={{
              position: "absolute",
              top: "4px",
              bottom: "4px",
              width: pillWidth || `calc(100% / ${count} - 8px)`,
              x: pillX,
              scaleX: pillScaleX,
              scaleY: pillScaleY,
              borderRadius: "100px",
              background: isCombo
                ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                : "#ffffff",
              transformOrigin: "center center",
              willChange: "transform",
              left: 0,
            }}
          />
        </div>

        {/* Glass highlight layer — on top of goo, outside filter, mirrors pill transform */}
        <motion.div
          style={{
            position: "absolute",
            top: "4px",
            bottom: "4px",
            width: pillWidth || `calc(100% / ${count} - 8px)`,
            x: pillX,
            scaleX: pillScaleX,
            scaleY: pillScaleY,
            borderRadius: "100px",
            pointerEvents: "none",
            zIndex: 1,
            left: 0,
            transformOrigin: "center center",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 58%)",
            boxShadow: isCombo
              ? "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 12px rgba(124,58,237,0.4)"
              : "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.06), 0 3px 14px rgba(0,0,0,0.35)",
          }}
        />

        {/* Tab labels — outside filter so they're always visible */}
        {options.map((opt) => {
          const isActive = opt.id === active;
          return (
            <div
              key={opt.id}
              style={{
                flex: 1,
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isActive
                  ? isCombo
                    ? "#fff"
                    : "#000"
                  : "rgba(255,255,255,0.45)",
                transition: "color 0.25s ease",
                pointerEvents: "none", // handled by container
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
