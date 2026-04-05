import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Heart,
  Truck,
  Star,
} from "lucide-react";

// â”€â”€â”€ Animated counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(start);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// â”€â”€â”€ Premium letter-by-letter reveal component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RevealText({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const letters = text.split("");
  return (
    <span className={`inline-flex ${className}`} aria-label={text}>
      {letters.map((letter, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.03,
              ease: [0.16, 1, 0.3, 1], // Apple-like super smooth ease
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
  const [showContent, setShowContent] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: Truck,
      title: "Room Delivery",
      desc: "Food and products delivered straight to your hostel room. Seamless and fast.",
      color: "#007AFF",
    },
    {
      icon: ShieldCheck,
      title: "Zero Fees",
      desc: "No commission, no hidden charges. Keep 100% of your earnings.",
      color: "#34C759",
    },
    {
      icon: MessageCircle,
      title: "Hot Food",
      desc: "Order from campus shops like Chatori Chai and get hot food at your door.",
      color: "#FF9500",
    },
    {
      icon: Heart,
      title: "Campus Trust",
      desc: "Every user is a verified CU student. Trade with total confidence.",
      color: "#FF3B30",
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Students" },
    { value: 200, suffix: "+", label: "Listings" },
    { value: 100, suffix: "%", label: "Campus Only" },
  ];

  return (
    <div
      className="relative overflow-x-hidden min-h-screen selection:bg-white selection:text-[#231942]"
      style={{ backgroundColor: "#0F0A1E" }}
    >
      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
          HERO SECTION — Apple Product Style
         â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <section
        ref={heroRef}
        className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden pt-20"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, #3B1F6A 0%, #231942 40%, #0F0A1E 100%)",
        }}
      >
        {/* Animated purple/pink orbs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.15, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[700px] h-[700px] rounded-full blur-[110px] opacity-40"
            style={{
              background: "radial-gradient(circle, #9B59B6, transparent 70%)",
              transformOrigin: "38% 38%",
            }}
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.25, 1] }}
            transition={{ duration: 27, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-30"
            style={{
              background: "radial-gradient(circle, #FF6B6B, transparent 70%)",
              transformOrigin: "65% 65%",
            }}
          />
          <motion.div
            animate={{ rotate: 180, scale: [1, 1.1, 1] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-25"
            style={{
              background: "radial-gradient(circle, #4DB8AC, transparent 70%)",
              transformOrigin: "50% 20%",
            }}
          />
        </div>

        {/* Floating Glass Logo Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-8 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <img
            src="/logo.webp"
            alt="CU Bazzar"
            className="w-5 h-5 rounded-md object-cover"
          />
          <span className="text-[11px] font-bold tracking-tight text-white/90">
            CU BAZZAR
          </span>
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        >
          {showContent && (
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p
                className="text-[12px] uppercase tracking-widest font-bold"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Introducing the all-new
              </p>
            </motion.div>
          )}

          {/* â”€â”€â”€ MAIN HEADING â”€â”€â”€ */}
          {showContent && (
            <h1 className="font-bold leading-[1.05] tracking-tighter mb-6 select-none text-white text-5xl sm:text-[7rem] whitespace-nowrap drop-shadow-lg">
              <RevealText text="CU Bazzar" delay={0.4} />
            </h1>
          )}

          {/* Subtext */}
          {showContent && (
            <motion.p
              className="text-lg sm:text-2xl max-w-2xl leading-snug mb-10 font-medium tracking-tight"
              style={{ color: "rgba(255,255,255,0.65)" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              The ultimate campus marketplace. Room delivery, zero fees, and
              everything you need, engineered for Chandigarh University.
            </motion.p>
          )}

          {/* CTA Buttons */}
          {showContent && (
            <motion.div
              className="flex items-center gap-4 flex-wrap justify-center mt-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <Link to="/login">
                <button
                  className="px-8 py-3.5 text-[15px] font-semibold tracking-tight shadow-xl flex items-center gap-2 rounded-full text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #9B59B6, #7D3C98)",
                    boxShadow: "0 8px 32px rgba(155,89,182,0.45)",
                  }}
                >
                  Enter Marketplace
                </button>
              </Link>
              <Link to="/login">
                <button
                  className="text-[15px] font-semibold tracking-tight hover:underline flex items-center gap-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Sign in <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Glass Scroll Indicator */}
        {showContent && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <div
              className="w-8 h-12 rounded-full flex justify-center p-1.5 shadow-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <motion.div
                className="w-1.5 h-3 rounded-full"
                style={{ background: "rgba(255,255,255,0.6)" }}
                animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
          FEATURES BENTO GRID — Glass Cards
         â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <section
        className="py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10"
        style={{ background: "transparent" }}
      >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="text-4xl sm:text-6xl font-bold tracking-tighter mb-4"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Pro features.
            <br />
            Standard.
          </h2>
          <p
            className="text-xl tracking-tight"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Everything you need, beautifully designed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] flex flex-col items-start card-hover cursor-default"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3
                className="text-2xl font-bold tracking-tight mb-3"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-[15px] leading-relaxed font-medium"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
          STATS — Floating Glass Strip
         â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-[40px] p-10 flex flex-col md:flex-row justify-around items-center gap-10 text-center relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(30px)",
          }}
        >
          {/* subtle background flare inside stats */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          {stats.map((s, i) => (
            <div key={s.label} className="relative z-10">
              <p
                className="font-bold text-5xl sm:text-6xl tracking-tighter mb-1"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p
                className="text-[13px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
          FINAL CTA
         â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <section className="py-32 px-6 relative overflow-hidden flex justify-center">
        <motion.div
          className="max-w-3xl text-center relative z-10 p-12 sm:p-20 rounded-[48px]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(30px)",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/logo.webp"
            alt="Logo"
            className="w-16 h-16 rounded-2xl mx-auto mb-8 shadow-md"
          />
          <h2 className="font-bold text-white text-4xl sm:text-6xl mb-6 tracking-tighter leading-tight">
            Your campus.
            <br /> Your marketplace.
          </h2>
          <p
            className="text-[17px] leading-relaxed mb-10 max-w-md mx-auto font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Join hundreds of Chandigarh University students already trading on
            CU Bazzar.
          </p>

          <Link to="/login">
            <button
              className="px-10 py-4 text-[17px] font-semibold tracking-tight rounded-full text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #9B59B6, #7D3C98)",
                boxShadow: "0 8px 32px rgba(155,89,182,0.45)",
              }}
            >
              Get Started for Free
            </button>
          </Link>
        </motion.div>
      </section>

      {/* â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
          FOOTER
         â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â” */}
      <footer
        className="py-12 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-medium"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              &copy; 2026 CU BAZZAR INC.
            </span>
          </div>
          <div className="flex gap-8">
            <Link
              to="/terms"
              className="text-[13px] font-medium hover:underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Terms
            </Link>
            <Link
              to="/"
              className="text-[13px] font-medium hover:underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
