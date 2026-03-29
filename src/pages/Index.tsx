import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MessageCircle, Heart, Truck, Star } from "lucide-react";

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
  const [showContent, setShowContent] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Truck, title: "Room Delivery", desc: "Food and products delivered straight to your hostel room. Seamless and fast.", color: "#F0C040" },
    { icon: ShieldCheck, title: "Zero Fees", desc: "No commission, no hidden charges. Keep 100% of your earnings.", color: "#4DB8AC" },
    { icon: MessageCircle, title: "Hot Food", desc: "Order from campus shops like Chatori Chai and get hot food at your door.", color: "#FF6B6B" },
    { icon: Heart, title: "Campus Trust", desc: "Every user is a verified CU student. Trade with total confidence.", color: "#9B59B6" },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Students" },
    { value: 200, suffix: "+", label: "Listings" },
    { value: 100, suffix: "%", label: "Campus Only" },
  ];

  return (
    <div className="relative overflow-x-hidden min-h-screen" style={{ backgroundColor: "#231942" }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO SECTION
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={heroRef}
        className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 60% 30%, #3B1F6A 0%, #231942 55%, #140F0D 100%)" }}
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
            style={{ background: "radial-gradient(circle, #9B59B6, transparent 70%)" }}
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
            style={{ background: "radial-gradient(circle, #FF6B6B, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full blur-[90px] opacity-20"
            style={{ background: "radial-gradient(circle, #4DB8AC, transparent 70%)" }}
          />
        </div>

        {/* Logo pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-8 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}
        >
          <img src="/logo.webp" alt="CU Bazzar" className="w-5 h-5 rounded-md object-cover" />
          <span className="text-[11px] font-bold tracking-widest text-white/80">CU BAZZAR</span>
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-20"
        >
          {showContent && (
            <motion.p
              className="text-[12px] uppercase tracking-[0.25em] font-semibold mb-5"
              style={{ color: "rgba(255,255,255,0.40)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Introducing the all-new
            </motion.p>
          )}

          {showContent && (
            <motion.h1
              className="font-black tracking-tighter mb-6 select-none text-white text-6xl sm:text-[8rem] leading-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ textShadow: "0 0 60px rgba(155,89,182,0.5)" }}
            >
              CU Bazzar
            </motion.h1>
          )}

          {showContent && (
            <motion.p
              className="text-lg sm:text-2xl max-w-2xl leading-relaxed mb-10 font-medium"
              style={{ color: "rgba(255,255,255,0.55)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              The ultimate campus marketplace. Room delivery, zero fees, and everything you need, engineered for Chandigarh University.
            </motion.p>
          )}

          {showContent && (
            <motion.div
              className="flex items-center gap-4 flex-wrap justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-3.5 rounded-full text-white font-bold text-[15px] tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)",
                    boxShadow: "0 8px 32px rgba(155,89,182,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  Enter Marketplace
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-1.5 font-semibold text-[15px]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Sign in <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll indicator */}
        {showContent && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <div
              className="w-8 h-12 rounded-full flex justify-center p-1.5"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <motion.div
                className="w-1.5 h-3 rounded-full"
                style={{ background: "rgba(255,255,255,0.5)" }}
                animate={{ y: [0, 12, 0], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURES
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4">
            Pro features.<br />Standard.
          </h2>
          <p className="text-xl font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
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
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-8 sm:p-10 rounded-[32px] flex flex-col items-start cursor-default"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">{f.title}</h3>
              <p className="text-[15px] leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-[40px] p-10 flex flex-col md:flex-row justify-around items-center gap-10 text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(30px)",
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-black text-5xl sm:text-6xl text-white tracking-tighter mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FINAL CTA
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 px-6 flex justify-center">
        <motion.div
          className="max-w-3xl w-full text-center p-12 sm:p-20 rounded-[48px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(30px)",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/logo.webp" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-8 shadow-lg" />
          <h2 className="font-black text-white text-4xl sm:text-6xl mb-6 tracking-tighter leading-tight">
            Your campus.<br />Your marketplace.
          </h2>
          <p className="text-[17px] leading-relaxed mb-10 max-w-md mx-auto font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Join hundreds of Chandigarh University students already trading on CU Bazzar.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="px-10 py-4 text-[17px] font-bold rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)",
                boxShadow: "0 8px 32px rgba(155,89,182,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Get Started for Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
            &copy; 2026 CU BAZZAR INC.
          </span>
          <div className="flex gap-8">
            <Link to="/terms" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              Terms
            </Link>
            <Link to="/" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
