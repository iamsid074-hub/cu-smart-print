import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Heart, MessageCircle, Star, CheckCircle } from "lucide-react";

// ─── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#DED4C8",
  card: "#EAE4DB",
  border: "#C9BFB3",
  text: "#2B2621",
  muted: "#8A7E73",
  doodle: "#B8A896",
  accent: "#FF6B6B",
  accentShadow: "rgba(255,107,107,0.3)",
  accentHover: "rgba(255,107,107,0.4)",
};

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── SVG hand-drawn underline ──────────────────────────────────────────────────
function DoodleUnderline() {
  return (
    <svg viewBox="0 0 286 18" fill="none" className="absolute -bottom-3 left-0 w-full" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M2 11C42 4 106 2 142 6C178 10 242 14 284 8"
        stroke={C.accent}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Corner doodle elements ────────────────────────────────────────────────────
function DoodleBook({ className }: { className?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.25, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ opacity: 0.45, scale: 1.1 }}
      viewBox="0 0 60 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 48V14C12 12 14 10 16 10H44C46 10 48 12 48 14V48" stroke={C.doodle} strokeWidth="2" strokeLinecap="round" />
      <path d="M48 48H16C14 48 12 46 12 44C12 42 14 40 16 40H48" stroke={C.doodle} strokeWidth="2" />
      <path d="M22 18H38M22 24H34" stroke={C.doodle} strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

function DoodlePencil({ className }: { className?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, rotate: -20 }}
      animate={{ opacity: 0.2, rotate: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      whileHover={{ opacity: 0.4, rotate: 5 }}
      viewBox="0 0 60 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M38 8L50 20L22 48H10V36L38 8Z" stroke={C.doodle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 14L44 26" stroke={C.doodle} strokeWidth="1.5" />
    </motion.svg>
  );
}

function DoodleCoffee({ className }: { className?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.2, y: 0 }}
      transition={{ delay: 1.4, duration: 0.5 }}
      whileHover={{ opacity: 0.4, y: -3 }}
      viewBox="0 0 60 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 24H40V44C40 48 36 52 32 52H22C18 52 14 48 14 44V24Z" stroke={C.doodle} strokeWidth="2" />
      <path d="M40 28H46C48 28 50 30 50 32V34C50 36 48 38 46 38H40" stroke={C.doodle} strokeWidth="2" />
      <path d="M22 14C22 14 24 10 22 8M28 16C28 16 30 12 28 10M34 14C34 14 36 10 34 8" stroke={C.doodle} strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

function DoodleStar({ className }: { className?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
      animate={{ opacity: 0.2, rotate: 0, scale: 1 }}
      transition={{ delay: 1.6, duration: 0.5 }}
      whileHover={{ opacity: 0.4, rotate: 15 }}
      viewBox="0 0 50 50" fill="none" className={className} xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25 5L30 18H44L33 27L36 42L25 33L14 42L17 27L6 18H20L25 5Z" stroke={C.doodle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ─── Font helpers ──────────────────────────────────────────────────────────────
const fontHeading: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const fontBody: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const doodleParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  const testimonials = [
    { name: "Priya S.", year: "3rd Year, CSE", quote: "Sold my calculus notes in 2 hours!", avatar: "P", color: "from-rose-400 to-orange-400", rotate: -4 },
    { name: "Arjun K.", year: "2nd Year, ECE", quote: "Found a barely-used calculator for ₹200. Absolute steal!", avatar: "A", color: "from-violet-400 to-indigo-400", rotate: 3 },
    { name: "Sneha R.", year: "4th Year, BCA", quote: "Sold all my textbooks before graduating 📚", avatar: "S", color: "from-emerald-400 to-teal-400", rotate: -2 },
    { name: "Rohit M.", year: "1st Year, MBA", quote: "Got my entire stationery kit from a senior!", avatar: "R", color: "from-amber-400 to-yellow-500", rotate: 5 },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Students Trading", emoji: "🎓" },
    { value: 200, suffix: "+", label: "Items Listed", emoji: "📦" },
    { value: 100, suffix: "%", label: "Campus Verified", emoji: "✅" },
  ];

  return (
    <div ref={containerRef} className="relative overflow-x-hidden" style={{ ...fontBody, backgroundColor: C.bg }}>

      {/* ─── Intro Splash ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center flex-col"
            style={{ backgroundColor: C.bg }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl flex items-center justify-center p-1.5" style={{ backgroundColor: C.card, border: `2px solid ${C.border}` }}>
                <img src="/logo.png" alt="CU BAZZAR" className="w-full h-full object-cover rounded-full" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ ...fontHeading, color: C.text }}>
                CU <span style={{ color: C.accent }}>BAZZAR</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0" style={{
          opacity: 0.04,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${C.text} 0.5px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />

        {/* Warm ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${C.accent}12` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(78,205,196,0.06)" }} />

        {/* Corner doodles with parallax */}
        <motion.div style={{ y: doodleParallax }} className="absolute inset-0 pointer-events-none hidden md:block">
          <DoodleBook className="absolute top-[12%] right-[8%] w-16 h-16" />
          <DoodlePencil className="absolute bottom-[18%] left-[6%] w-14 h-14" />
          <DoodleCoffee className="absolute top-[60%] right-[5%] w-14 h-14" />
          <DoodleStar className="absolute top-[25%] left-[12%] w-10 h-10" />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: showIntro ? 0 : 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-sm mb-6"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide" style={{ color: C.muted }}>Live at Chandigarh University</span>
              </motion.div>

              <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-5" style={{ ...fontHeading, color: C.text }}>
                Your Campus.
                <br />
                <span className="relative inline-block">
                  Your Marketplace.
                  <DoodleUnderline />
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-md" style={{ color: C.muted }}>
                Buy textbooks from seniors, sell your stuff, connect with classmates — all within campus.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-sm transition-shadow duration-300"
                    style={{ ...fontHeading, backgroundColor: C.accent, boxShadow: `0 4px 20px ${C.accentShadow}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 6px 28px ${C.accentHover}`)}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 4px 20px ${C.accentShadow}`)}
                  >
                    Explore Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                  style={{ ...fontHeading, color: `${C.text}aa`, border: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.card; e.currentTarget.style.borderColor = C.muted; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = C.border; }}
                >
                  I have an account
                </Link>
              </div>
            </motion.div>

            {/* Right — Testimonial Stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showIntro ? 0 : 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative h-[340px] sm:h-[380px] hidden sm:block"
            >
              {testimonials.slice(0, 3).map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
                  className="absolute rounded-2xl p-5 w-[260px] sm:w-[280px] cursor-default transition-shadow"
                  style={{
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 6px 24px rgba(43,38,33,0.08)",
                    top: i === 0 ? "0%" : i === 1 ? "32%" : "60%",
                    left: i === 0 ? "5%" : i === 1 ? "35%" : "10%",
                    rotate: `${t.rotate}deg`,
                    zIndex: 3 - i,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 36px rgba(43,38,33,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(43,38,33,0.08)")}
                >
                  {/* Tape effect */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-5 rounded-sm rotate-1 shadow-sm" style={{ backgroundColor: "rgba(255,220,130,0.6)" }} />

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.text }}>{t.name}</p>
                      <p className="text-[11px]" style={{ color: C.muted }}>{t.year}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: `${C.text}99` }}>"{t.quote}"</p>

                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/50">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600">Verified CU Student</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 0.5 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5" style={{ border: `2px solid ${C.border}` }}>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1.5 rounded-full"
              style={{ backgroundColor: C.muted }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── 2. TESTIMONIALS ─── */}
      <section className="relative py-20 sm:py-28 px-5 sm:px-8" style={{ backgroundColor: "#D5C9BB" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ ...fontHeading, color: C.text }}>
              Real Students, Real Trades
            </h2>
            <p className="text-base sm:text-lg" style={{ color: C.muted }}>
              Here's what your fellow CU students are saying.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl p-5 transition-shadow"
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 4px 16px rgba(43,38,33,0.06)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(43,38,33,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(43,38,33,0.06)")}
              >
                {/* Tape */}
                <div className="w-10 h-4 rounded-sm mx-auto mb-4 -mt-1" style={{ backgroundColor: "rgba(255,220,130,0.5)", rotate: `${(i % 2 === 0 ? 2 : -2)}deg` }} />

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-sm font-bold text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.text }}>{t.name}</p>
                    <p className="text-[11px] font-medium" style={{ color: C.muted }}>{t.year}</p>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed" style={{ color: `${C.text}88` }}>"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="relative py-20 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: C.bg }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{s.emoji}</div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={{ ...fontHeading, color: C.text }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm font-semibold mt-1" style={{ color: C.muted }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. WHY CU BAZZAR ─── */}
      <section className="relative py-20 sm:py-28 px-5 sm:px-8" style={{ backgroundColor: "#D5C9BB" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ ...fontHeading, color: C.text }}>
              Why CU Bazzar?
            </h2>
            <p className="text-base sm:text-lg" style={{ color: C.muted }}>Built by students, for students.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Zero Commission", desc: "Keep 100% of what you earn. We don't take a single cut.", icon: ShieldCheck, color: "#4ECDC4" },
              { title: "Direct Chat", desc: "Negotiate directly with buyers and sellers on campus.", icon: MessageCircle, color: C.accent },
              { title: "Campus Handoff", desc: "Meet at your hostel or the library. No shipping needed.", icon: Heart, color: "#9B59B6" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl p-6 sm:p-7 transition-all group"
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 4px 16px rgba(43,38,33,0.06)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(43,38,33,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(43,38,33,0.06)")}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: f.color + "15" }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ ...fontHeading, color: C.text }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. CTA FOOTER ─── */}
      <section className="relative py-20 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: C.bg }}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ ...fontHeading, color: C.text }}>
              Ready to start trading?
            </h2>
            <p className="text-base sm:text-lg mb-8" style={{ color: C.muted }}>
              Join your classmates on the campus marketplace.
            </p>

            <Link to="/login">
              <motion.button
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-base transition-shadow duration-300"
                style={{ ...fontHeading, backgroundColor: C.accent, boxShadow: `0 4px 20px ${C.accentShadow}` }}
              >
                Enter Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-5" style={{ backgroundColor: "#D5C9BB", borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: C.muted }}>
          <p>© 2026 CU Bazzar. Built with 💛 for students.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:opacity-70 transition-opacity">Privacy</Link>
            <Link to="/" className="hover:opacity-70 transition-opacity">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
