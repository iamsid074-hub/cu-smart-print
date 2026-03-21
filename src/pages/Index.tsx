import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MessageCircle, Heart, Truck, Star } from "lucide-react";

// ─── Brand Tokens ───────────────────────────────────────────────────────────────
const BRAND = "#231942";
const BRAND_MID = "#5E548E";
const BRAND_LIGHT = "#9F86C0";
const BG = "#0A0812";

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

// ─── Premium letter-by-letter reveal component ──────────────────────────────────
function RevealText({ text, delay = 0 }: { text: string; delay?: number }) {
  const letters = text.split("");
  return (
    <span className="inline-flex" aria-label={text}>
      {letters.map((letter, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Index() {
  const [curtainDone, setCurtainDone] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useEffect(() => {
    // Curtain starts opening after a brief pause
    const t1 = setTimeout(() => setCurtainDone(true), 1600);
    // Show page content slightly before curtain fully gone
    const t2 = setTimeout(() => setShowContent(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const features = [
    { icon: Truck, title: "Room Delivery", desc: "Food and products delivered straight to your hostel room. No need to step out." },
    { icon: ShieldCheck, title: "Zero Fees", desc: "No commission, no hidden charges. Keep 100% of every rupee you earn." },
    { icon: MessageCircle, title: "Food Delivery", desc: "Order from campus shops like Chatori Chai and get hot food at your door." },
    { icon: Heart, title: "Campus Trust", desc: "Every user is a verified CU student. Trade with people you actually know." },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Students" },
    { value: 200, suffix: "+", label: "Items Listed" },
    { value: 100, suffix: "%", label: "Campus Only" },
  ];

  const testimonials = [
    { name: "Arjun S.", text: "Sold my old laptop in 2 hours. No hassle at all.", rating: 5 },
    { name: "Priya M.", text: "Found textbooks at half price. This is a lifesaver.", rating: 5 },
    { name: "Rahul K.", text: "The food delivery feature is chef's kiss.", rating: 5 },
  ];

  return (
    <div className="relative overflow-x-hidden min-h-screen" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: BG }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CURTAIN ANIMATION — Real horizontal theatre curtains (left + right)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {!curtainDone && (
          <>
            {/* Left curtain panel */}
            <motion.div
              key="curtain-left"
              className="fixed top-0 left-0 w-1/2 h-full z-[500]"
              style={{ backgroundColor: BRAND }}
              initial={{ x: "0%" }}
              animate={{ x: "-100%" }}
              transition={{ duration: 1.2, delay: 0.35, ease: [0.76, 0, 0.24, 1] }}
              exit={{ opacity: 0 }}
            >
              {/* Curtain fold lines */}
              <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-1 border-r" style={{ borderColor: "rgba(255,255,255,0.04)" }} />
                ))}
              </div>
              {/* Edge shadow */}
              <div className="absolute top-0 right-0 w-8 h-full" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.3), transparent)" }} />
            </motion.div>

            {/* Right curtain panel */}
            <motion.div
              key="curtain-right"
              className="fixed top-0 right-0 w-1/2 h-full z-[500]"
              style={{ backgroundColor: BRAND }}
              initial={{ x: "0%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, delay: 0.35, ease: [0.76, 0, 0.24, 1] }}
              exit={{ opacity: 0 }}
            >
              {/* Curtain fold lines */}
              <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-1 border-l" style={{ borderColor: "rgba(255,255,255,0.04)" }} />
                ))}
              </div>
              {/* Edge shadow */}
              <div className="absolute top-0 left-0 w-8 h-full" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.3), transparent)" }} />
            </motion.div>

            {/* Center seam glow while curtain is visible */}
            <motion.div
              key="curtain-seam"
              className="fixed top-0 left-1/2 -translate-x-1/2 w-px h-full z-[501]"
              style={{ background: "linear-gradient(to bottom, transparent 10%, rgba(159,134,192,0.3) 50%, transparent 90%)" }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />

            {/* Logo flash on curtain */}
            <motion.div
              key="curtain-logo"
              className="fixed inset-0 z-[502] flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <motion.img
                src="/cb_gold_logo_v1.webp"
                alt="CU Bazzar"
                className="w-16 h-16 rounded-full shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO SECTION
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Studio Lighting — dim angled cones */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Left cone */}
          <div className="absolute" style={{
            top: "-5%", left: "20%", width: "280px", height: "110%",
            background: "linear-gradient(to bottom, rgba(159,134,192,0.12) 0%, transparent 60%)",
            transform: "rotate(-14deg)", filter: "blur(50px)", transformOrigin: "top center",
          }} />
          {/* Right cone */}
          <div className="absolute" style={{
            top: "-5%", right: "20%", width: "240px", height: "110%",
            background: "linear-gradient(to bottom, rgba(159,134,192,0.09) 0%, transparent 60%)",
            transform: "rotate(14deg)", filter: "blur(50px)", transformOrigin: "top center",
          }} />
          {/* Center pool — warm glow on the heading */}
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px]" style={{
            background: "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(94,84,142,0.18) 0%, transparent 80%)",
          }} />
          {/* Subtle floor reflection */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]" style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(94,84,142,0.06) 0%, transparent 70%)",
          }} />
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        >
          {/* Eyebrow line */}
          {showContent && (
            <motion.div
              className="flex items-center gap-3 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-8 h-px" style={{ backgroundColor: BRAND_MID }} />
              <p className="text-[10px] uppercase tracking-[0.4em] font-medium" style={{ color: BRAND_LIGHT }}>
                Chandigarh University
              </p>
              <div className="w-8 h-px" style={{ backgroundColor: BRAND_MID }} />
            </motion.div>
          )}

          {/* ─── MAIN HEADING — Premium letter-by-letter reveal ─── */}
          {showContent && (
            <h1
              className="font-black leading-[0.9] tracking-tighter mb-4 select-none"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(4rem, 13vw, 11rem)",
                color: "#FFFFFF",
                letterSpacing: "-0.05em",
              }}
            >
              <RevealText text="CU" delay={0.15} />
              <br />
              <RevealText text="BAZZAR" delay={0.35} />
            </h1>
          )}

          {/* Thin horizontal accent */}
          {showContent && (
            <motion.div
              className="h-px mb-8 mt-4"
              style={{ background: `linear-gradient(to right, transparent, ${BRAND_MID}, transparent)` }}
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
            />
          )}

          {/* Subtext */}
          {showContent && (
            <motion.p
              className="text-sm sm:text-base max-w-md leading-relaxed mb-14"
              style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300, letterSpacing: "0.01em" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
            >
              We deliver to your room — food, products, and everything campus. Buy, sell, and discover with zero fees.
            </motion.p>
          )}

          {/* CTA */}
          {showContent && (
            <motion.div
              className="flex items-center gap-6 flex-wrap justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.3 }}
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-9 py-3.5 rounded-full font-semibold text-[13px] text-white group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_MID}, ${BRAND})`,
                    boxShadow: "0 0 40px rgba(94,84,142,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                    fontFamily: "'Montserrat', sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {/* Shine sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Enter Marketplace</span>
                  <ArrowRight className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/login">
                <motion.span
                  className="text-xs font-medium cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}
                  whileHover={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Sign in instead
                </motion.span>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll indicator */}
        {showContent && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <motion.div
              className="w-[1px] h-10 origin-top"
              style={{ background: `linear-gradient(to bottom, ${BRAND_LIGHT}50, transparent)` }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-[9px] uppercase tracking-[0.3em] font-light" style={{ color: "rgba(159,134,192,0.5)" }}>
              Scroll
            </p>
          </motion.div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24" style={{ background: `linear-gradient(to bottom, transparent, ${BRAND_MID}40)` }} />

        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 sm:gap-16 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-black text-3xl sm:text-6xl text-white mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.04em" }}>
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] font-medium" style={{ color: BRAND_LIGHT }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto h-px" style={{ background: `linear-gradient(to right, transparent, ${BRAND_MID}25, transparent)` }} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURES — Why CU Bazzar
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: BRAND_LIGHT }}>
              Why CU Bazzar
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.03em" }}>
              Everything you need.
            </h2>
            <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
              Built specifically for life on campus. No bloat, no gimmicks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-2xl p-7 sm:p-8 relative overflow-hidden cursor-default"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "border-color 0.3s, background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(159,134,192,0.2)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(94,84,142,0.2)", border: "1px solid rgba(159,134,192,0.15)" }}>
                  <f.icon className="w-5 h-5" style={{ color: BRAND_LIGHT }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 tracking-tight"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.32)", fontWeight: 300 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto h-px" style={{ background: `linear-gradient(to right, transparent, ${BRAND_MID}25, transparent)` }} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TESTIMONIALS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.p
            className="text-[10px] uppercase tracking-[0.4em] text-center mb-16"
            style={{ color: BRAND_LIGHT }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What students say
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl p-7 relative"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: "#FFD166" }} />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300, fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <p className="text-[11px] font-semibold text-white tracking-wide">
                  {t.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FINAL CTA
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-36 px-6 relative overflow-hidden">
        {/* CTA ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 55% at 50% 0%, rgba(94,84,142,0.15) 0%, transparent 80%)" }} />

        <motion.div
          className="max-w-2xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-6 h-px" style={{ backgroundColor: BRAND_MID }} />
            <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: BRAND_LIGHT }}>
              Ready?
            </p>
            <div className="w-6 h-px" style={{ backgroundColor: BRAND_MID }} />
          </div>

          <h2 className="font-black text-white text-3xl sm:text-5xl mb-5 tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.03em" }}>
            Your campus.<br />Your marketplace.
          </h2>

          <p className="text-[13px] leading-relaxed mb-12 max-w-sm mx-auto"
            style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
            Join hundreds of Chandigarh University students already trading on CU Bazzar.
          </p>

          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-semibold text-[13px] text-white group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BRAND_MID}, ${BRAND})`,
                boxShadow: "0 0 50px rgba(94,84,142,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Explore the Marketplace</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="py-10 px-6 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="CU Bazzar" className="w-6 h-6 rounded-lg object-cover opacity-60" />
            <span className="text-[11px] font-light" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.02em" }}>
              &copy; 2026 CU BAZZAR
            </span>
          </div>
          <div className="flex gap-8">
            <Link to="/terms" className="text-[11px] transition-opacity hover:opacity-60 font-light"
              style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
              Terms
            </Link>
            <Link to="/" className="text-[11px] transition-opacity hover:opacity-60 font-light"
              style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
              Privacy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
