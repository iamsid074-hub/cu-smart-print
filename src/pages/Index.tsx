import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Star, Store, ShoppingBag, ChevronDown } from "lucide-react";

// ─── Google Font Import (Space Grotesk + Inter) ───────────────────────────────
const fontDisplay: React.CSSProperties = {
  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  letterSpacing: "-0.04em",
};
const fontBody: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
};

// ─── Feature Data ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: Store,
    title: "17 Campus Shops",
    desc: "From Chatori Chai to midnight snacks — everything your hostel craves, delivered.",
    accent: "#FF6B35",
    glow: "rgba(255, 107, 53, 0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Eclipsed Wallet",
    desc: "A secure, biometric-protected digital wallet. Pay, earn, and withdraw — all in one place.",
    accent: "#7C3AED",
    glow: "rgba(124, 58, 237, 0.15)",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Room-to-room delivery across all hostel blocks. Track in real-time, every time.",
    accent: "#059669",
    glow: "rgba(5, 150, 105, 0.15)",
  },
  {
    icon: Star,
    title: "Eclipsed Score",
    desc: "Build your campus reputation. High scores unlock hidden menus and VIP perks.",
    accent: "#D97706",
    glow: "rgba(217, 119, 6, 0.15)",
  },
];

// ─── Floating Orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ color, size, top, left, delay }: { color: string; size: number; top: string; left: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        filter: "blur(60px)",
      }}
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// ─── EOS v3 Loader ─────────────────────────────────────────────────────────────
function EOSLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #fdf4ff 100%)" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Ambient Orbs */}
      <FloatingOrb color="rgba(124, 58, 237, 0.25)" size={400} top="-10%" left="-5%" delay={0} />
      <FloatingOrb color="rgba(255, 107, 53, 0.2)" size={350} top="50%" left="60%" delay={1.5} />
      <FloatingOrb color="rgba(5, 150, 105, 0.15)" size={300} top="70%" left="-10%" delay={3} />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 220, delay: 0.1 }}
        className="relative mb-8"
      >
        <div
          className="w-28 h-28 rounded-[2.5rem] overflow-hidden shadow-2xl"
          style={{
            boxShadow: "0 30px 80px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255,255,255,0.8)",
          }}
        >
          <img src="/logo.webp" alt="CU Bazzar" className="w-full h-full object-cover" />
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-[2.5rem]"
          animate={{ boxShadow: ["0 0 0 0px rgba(124,58,237,0.3)", "0 0 0 28px rgba(124,58,237,0)"] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.div>

      {/* Brand */}
      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-3xl font-black tracking-tight mb-1.5"
        style={{ ...fontDisplay, color: "#0F0A1E" }}
      >
        CU BAZZAR
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs font-bold uppercase tracking-[0.3em] mb-12"
        style={{ color: "#7C3AED" }}
      >
        Eclipsed Operating System v3
      </motion.p>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative w-48 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(124, 58, 237, 0.12)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, #7C3AED, #FF6B35)" }}
          initial={{ width: "0%" }}
          animate={{ width: "90%" }}
          transition={{ duration: 1.8, delay: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #fdf4ff 100%)" }}
    >
      {/* EOS v3 Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div key="loader" exit={{ opacity: 0, scale: 1.04, filter: "blur(20px)" }} transition={{ duration: 0.7 }}>
            <EOSLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Ambient Background Orbs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingOrb color="rgba(124, 58, 237, 0.18)" size={700} top="-15%" left="-10%" delay={0} />
        <FloatingOrb color="rgba(255, 107, 53, 0.15)" size={600} top="30%" left="55%" delay={2} />
        <FloatingOrb color="rgba(5, 150, 105, 0.12)" size={500} top="70%" left="5%" delay={4} />
        <FloatingOrb color="rgba(217, 119, 6, 0.1)" size={400} top="80%" left="70%" delay={1} />
      </div>

      {/* ─── Top Navbar ──────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? -20 : 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10"
      >
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <img src="/logo.webp" alt="CU Bazzar" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-sm font-black tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>
            CU BAZZAR
          </span>
        </div>

        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background: "#0F0A1E",
              boxShadow: "0 4px 16px rgba(15,10,30,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            Sign In
          </motion.button>
        </Link>
      </motion.nav>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 z-10"
      >
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center">
          {/* EOS Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.8 : 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10"
            style={{
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7C3AED" }}>
              Eclipsed Operating System v3
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 30 : 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[3.2rem] sm:text-[6rem] leading-[1] font-black tracking-tighter mb-6 max-w-5xl"
            style={{ ...fontDisplay, color: "#0F0A1E" }}
          >
            Your campus.
            <br />
            <span
              className="relative"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reimagined.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-2xl max-w-2xl leading-relaxed mb-12 font-medium"
            style={{ ...fontBody, color: "rgba(15,10,30,0.5)" }}
          >
            17 campus shops, instant hostel delivery, biometric wallet,
            and a campus-wide marketplace — all inside one fluid experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 flex-wrap justify-center"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-[15px] font-bold relative overflow-hidden group"
                style={{
                  background: "#0F0A1E",
                  boxShadow: "0 4px 20px rgba(15,10,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(255,255,255,0.05)" }} />
                Enter Bazzar <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-bold"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  color: "#0F0A1E",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                }}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20 flex flex-col items-center gap-2"
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(15,10,30,0.3)" }}>
              Scroll
            </span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-5 h-5" style={{ color: "rgba(15,10,30,0.3)" }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Floating Stats Strip ────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto grid grid-cols-3 gap-4 p-6 sm:p-8 rounded-[2.5rem]"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
          }}
        >
          {[
            { val: "17", label: "Campus Shops" },
            { val: "500+", label: "Students" },
            { val: "24/7", label: "Delivery" },
          ].map((s) => (
            <div key={s.label} className="text-center py-2">
              <p className="text-3xl sm:text-5xl font-black mb-1" style={{ ...fontDisplay, color: "#0F0A1E" }}>
                {s.val}
              </p>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(15,10,30,0.4)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Feature Cards ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7C3AED" }}>
            What EOS v3 brings
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black tracking-tighter"
            style={{ ...fontDisplay, color: "#0F0A1E" }}
          >
            Built different.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="relative p-8 rounded-[2rem] overflow-hidden group cursor-default"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: `0 12px 40px ${f.glow}`,
              }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle, ${f.glow}, transparent)`, filter: "blur(20px)" }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: f.glow, border: `1px solid ${f.accent}22` }}
              >
                <f.icon className="w-7 h-7" style={{ color: f.accent }} />
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>
                {f.title}
              </h3>
              <p className="text-[15px] leading-relaxed font-medium" style={{ ...fontBody, color: "rgba(15,10,30,0.5)" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl p-12 sm:p-20 rounded-[3rem] relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 30px 80px rgba(124,58,237,0.1)",
          }}
        >
          <FloatingOrb color="rgba(124,58,237,0.2)" size={300} top="-20%" left="-10%" delay={0} />
          <FloatingOrb color="rgba(255,107,53,0.15)" size={250} top="50%" left="60%" delay={2} />

          <img src="/logo.webp" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-8 shadow-xl object-cover" />
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tighter mb-5"
            style={{ ...fontDisplay, color: "#0F0A1E" }}
          >
            Ready to enter
            <br />
            <span style={{ color: "#0F0A1E" }}>
              EOS v3?
            </span>
          </h2>
          <p className="text-[16px] leading-relaxed mb-10" style={{ ...fontBody, color: "rgba(15,10,30,0.5)" }}>
            Join hundreds of Chandigarh University students on the most premium campus experience ever built.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white text-[16px] font-bold mx-auto relative overflow-hidden group"
              style={{
                background: "#0F0A1E",
                boxShadow: "0 4px 24px rgba(15,10,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(255,255,255,0.05)" }} />
              Get Started Free <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer
        className="relative z-10 px-6 py-10"
        style={{ borderTop: "1px solid rgba(15,10,30,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.webp" alt="CU Bazzar" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-black tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>
              CU BAZZAR
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
            >
              EOS v3
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-3">
            {[
              { to: "/about-us", label: "About" },
              { to: "/privacy-policy", label: "Privacy" },
              { to: "/terms", label: "Terms" },
              { to: "/help", label: "Help" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold transition-colors"
                style={{ color: "rgba(15,10,30,0.4)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.3)" }}>
            © 2026 CU Bazzar
          </p>
        </div>
      </footer>
    </div>
  );
}
