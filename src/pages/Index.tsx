import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MessageCircle, Heart } from "lucide-react";

// ─── Brand Tokens ───────────────────────────────────────────────────────────────
const BRAND = "#231942";
const BRAND_MID = "#5E548E";
const BRAND_LIGHT = "#9F86C0";

// ─── Animated counter ────────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else setCount(start);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Index() {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    // Short pause then open the curtains
    const t = setTimeout(() => setCurtainOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  const curtainEase = [0.76, 0, 0.24, 1] as [number, number, number, number];
  const curtainVariants: Variants = {
    closed: { scaleY: 1 },
    open: { scaleY: 0, transition: { duration: 1.1, ease: curtainEase } },
  };

  const features = [
    { icon: ShieldCheck, title: "Zero Platform Fees", desc: "Keep every rupee from your sales. No commission, no middlemen." },
    { icon: MessageCircle, title: "Direct Chat", desc: "Talk directly with buyers and sellers. Negotiate, ask questions, close the deal." },
    { icon: Heart, title: "Campus Only", desc: "Exclusively for CU students. Trusted faces, familiar places." },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Students" },
    { value: 200, suffix: "+", label: "Items Listed" },
    { value: 100, suffix: "%", label: "Campus Only" },
  ];

  return (
    <div ref={containerRef} className="relative overflow-x-hidden bg-[#0D0A14] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── CURTAIN ANIMATION ─── */}
      <AnimatePresence>
        {!curtainOpen && (
          <div className="fixed inset-0 z-[500] pointer-events-none flex flex-col">
            {/* Top curtain panel */}
            <motion.div
              key="curtain-top"
              className="flex-1 origin-top"
              style={{ backgroundColor: BRAND }}
              variants={curtainVariants}
              initial="closed"
              animate="open"
            />
            {/* Bottom curtain panel */}
            <motion.div
              key="curtain-bottom"
              className="flex-1 origin-bottom"
              style={{ backgroundColor: BRAND }}
              variants={curtainVariants}
              initial="closed"
              animate="open"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Curtain logo center-flash before it opens */}
      <AnimatePresence>
        {!curtainOpen && (
          <motion.div
            key="curtain-logo"
            className="fixed inset-0 z-[501] flex flex-col items-center justify-center pointer-events-none"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.img
              src="/logo.webp"
              alt="CU Bazzar"
              className="w-16 h-16 rounded-2xl shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <motion.p
              className="text-white/40 text-xs font-light tracking-[0.3em] uppercase mt-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              CU BAZZAR
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO SECTION ─── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Studio Dim Lights — subtle angled cones staying near the heading */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Left cone light */}
          <div
            className="absolute top-0 left-[15%] w-[1px] h-full origin-top"
            style={{
              background: "linear-gradient(to bottom, rgba(159,134,192,0.18) 0%, transparent 55%)",
              transform: "rotate(-12deg)",
              width: "200px",
              filter: "blur(40px)",
            }}
          />
          {/* Right cone light */}
          <div
            className="absolute top-0 right-[15%] w-[1px] h-full origin-top"
            style={{
              background: "linear-gradient(to bottom, rgba(159,134,192,0.14) 0%, transparent 55%)",
              transform: "rotate(12deg)",
              width: "180px",
              filter: "blur(40px)",
            }}
          />
          {/* Center ambient radial — keeps the heading zone lit */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
            style={{
              background: "radial-gradient(ellipse 55% 45% at 50% 0%, rgba(94,84,142,0.22) 0%, transparent 75%)",
            }}
          />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.p
            className="text-[11px] uppercase tracking-[0.4em] font-medium mb-10"
            style={{ color: BRAND_LIGHT }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: curtainOpen ? 1 : 0, y: curtainOpen ? 0 : 16 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Chandigarh University · Campus Marketplace
          </motion.p>

          {/* Main Title — "CU BAZZAR" */}
          <motion.h1
            className="font-black leading-none tracking-tighter mb-8 select-none"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(4.5rem, 14vw, 12rem)",
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: curtainOpen ? 1 : 0, y: curtainOpen ? 0 : 40 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            CU BAZZAR
          </motion.h1>

          {/* Thin rule */}
          <motion.div
            className="w-12 h-px mb-8"
            style={{ backgroundColor: BRAND_MID }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: curtainOpen ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />

          {/* Subtext */}
          <motion.p
            className="text-base sm:text-lg max-w-md leading-relaxed mb-12"
            style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300, letterSpacing: "0.01em" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: curtainOpen ? 1 : 0, y: curtainOpen ? 0 : 16 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            Buy, sell, and discover amazing items from your classmates — all within campus.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center gap-5 flex-wrap justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: curtainOpen ? 1 : 0, y: curtainOpen ? 0 : 16 }}
            transition={{ duration: 0.7, delay: 1.25 }}
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm text-white group"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_MID}, ${BRAND})`,
                  boxShadow: "0 0 32px rgba(94,84,142,0.35)",
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                Enter Marketplace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/login">
              <motion.button
                whileHover={{ opacity: 1 }}
                className="text-sm font-medium transition-opacity"
                style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}
              >
                Already have an account
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: curtainOpen ? 1 : 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <motion.div
            className="w-px h-12"
            style={{ background: `linear-gradient(to bottom, ${BRAND_LIGHT}, transparent)` }}
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: BRAND_LIGHT }}>
            Scroll
          </p>
        </motion.div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-28 px-6 relative">
        {/* Divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20" style={{ background: `linear-gradient(to bottom, transparent, ${BRAND_MID})` }} />

        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 sm:gap-16 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="font-black text-4xl sm:text-6xl text-white mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.04em" }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium" style={{ color: BRAND_LIGHT }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Horizontal divider */}
      <div className="w-full max-w-5xl mx-auto h-px" style={{ background: `linear-gradient(to right, transparent, ${BRAND_MID}30, transparent)` }} />

      {/* ─── FEATURES SECTION ─── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <motion.p
            className="text-[10px] uppercase tracking-[0.4em] text-center mb-16"
            style={{ color: BRAND_LIGHT }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why CU Bazzar
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Subtle corner accent */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-10 blur-2xl"
                  style={{ background: BRAND_LIGHT }}
                />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(94,84,142,0.25)", border: "1px solid rgba(159,134,192,0.2)" }}
                >
                  <f.icon className="w-5 h-5" style={{ color: BRAND_LIGHT }} />
                </div>

                <h3
                  className="text-base font-semibold text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─── */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Ambient spotlight for CTA */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[300px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(94,84,142,0.18) 0%, transparent 80%)",
          }}
        />

        <motion.div
          className="max-w-2xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: BRAND_LIGHT }}>
            Ready to start?
          </p>

          <h2
            className="font-black text-white text-4xl sm:text-6xl mb-6 tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.04em" }}
          >
            Your campus.<br />Your market.
          </h2>

          <p className="text-sm leading-relaxed mb-12 max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
            Join hundreds of students already trading, buying, and selling on CU Bazzar.
          </p>

          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-semibold text-sm text-white group"
              style={{
                background: `linear-gradient(135deg, ${BRAND_MID}, ${BRAND})`,
                boxShadow: "0 0 40px rgba(94,84,142,0.35)",
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              Explore the Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="CU Bazzar" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>
              © 2026 CU BAZZAR. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8">
            <Link to="/terms" className="text-xs transition-opacity hover:opacity-100" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.03em" }}>
              Terms
            </Link>
            <Link to="/" className="text-xs transition-opacity hover:opacity-100" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.03em" }}>
              Privacy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
