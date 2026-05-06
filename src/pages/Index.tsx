import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Star, Store, ChevronDown } from "lucide-react";

// ─── Static CSS Orbs — pure CSS keyframes, zero JS per frame ─────────────────
const orbStyles = `
@keyframes orbFloat1 {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.6; }
  50% { transform: translate3d(0, -18px, 0) scale(1.08); opacity: 0.85; }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.5; }
  50% { transform: translate3d(8px, -12px, 0) scale(1.06); opacity: 0.75; }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.4; }
  50% { transform: translate3d(-6px, -10px, 0) scale(1.05); opacity: 0.65; }
}
@keyframes chevronBounce {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, 6px, 0); }
}
`;

const fontDisplay: React.CSSProperties = {
  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  letterSpacing: "-0.04em",
};
const fontBody: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
};

const features = [
  { icon: Store, title: "17 Campus Shops", desc: "From Chatori Chai to midnight snacks — everything your hostel craves, delivered.", accent: "#FF6B35", glow: "rgba(255, 107, 53, 0.15)" },
  { icon: ShieldCheck, title: "Eclipsed Wallet", desc: "A secure, biometric-protected digital wallet. Pay, earn, and withdraw — all in one place.", accent: "#7C3AED", glow: "rgba(124, 58, 237, 0.15)" },
  { icon: Zap, title: "Instant Delivery", desc: "Room-to-room delivery across all hostel blocks. Track in real-time, every time.", accent: "#059669", glow: "rgba(5, 150, 105, 0.15)" },
  { icon: Star, title: "Eclipsed Score", desc: "Build your campus reputation. High scores unlock hidden menus and VIP perks.", accent: "#D97706", glow: "rgba(217, 119, 6, 0.15)" },
];

// ─── EOS v3 Loader ─────────────────────────────────────────────────────────────
// Component removed for instant-entry experience as requested.

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      {/* Inject CSS keyframes */}
      <style>{orbStyles}</style>
      {/* Additional keyframe for pulse ring */}
      <style>{`
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0px rgba(124,58,237,0.3); }
          100% { box-shadow: 0 0 0 28px rgba(124,58,237,0); }
        }
      `}</style>

      {/* ─── Ambient Orbs — pure CSS, zero JS ──────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{ position: "absolute", width: 700, height: 700, top: "-15%", left: "-10%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(124,58,237,0.16), transparent 70%)", filter: "blur(70px)", animation: "orbFloat1 10s ease-in-out infinite", willChange: "transform, opacity" }} />
        <div style={{ position: "absolute", width: 600, height: 600, top: "30%", left: "55%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(255,107,53,0.13), transparent 70%)", filter: "blur(70px)", animation: "orbFloat2 12s ease-in-out infinite 2s", willChange: "transform, opacity" }} />
        <div style={{ position: "absolute", width: 500, height: 500, top: "70%", left: "5%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(5,150,105,0.10), transparent 70%)", filter: "blur(70px)", animation: "orbFloat3 14s ease-in-out infinite 4s", willChange: "transform, opacity" }} />
      </div>

      {/* ─── Navbar ────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <img src="/logo.webp" alt="CU Bazzar" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-sm font-black tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>CU BAZZAR</span>
        </div>
        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: "#0F0A1E", boxShadow: "0 4px 16px rgba(15,10,30,0.18), inset 0 1px 0 rgba(255,255,255,0.08)", willChange: "transform" }}
          >
            Sign In
          </motion.button>
        </Link>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 z-10">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", willChange: "transform, opacity" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7C3AED" }}>Eclipsed Operating System v3</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="text-[3.2rem] sm:text-[6rem] leading-[1] font-black tracking-tighter mb-6 max-w-5xl"
            style={{ ...fontDisplay, color: "#0F0A1E", willChange: "transform, opacity" }}
          >
            Your campus.
            <br />
            <span style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Reimagined.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-2xl max-w-2xl leading-relaxed mb-12 font-medium"
            style={{ ...fontBody, color: "rgba(15,10,30,0.5)", willChange: "transform, opacity" }}
          >
            17 campus shops, instant hostel delivery, biometric wallet, and a campus-wide marketplace — all inside one fluid experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 flex-wrap justify-center"
            style={{ willChange: "transform, opacity" }}
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-[15px] font-bold"
                style={{ background: "#0F0A1E", boxShadow: "0 4px 20px rgba(15,10,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)", willChange: "transform" }}
              >
                Enter Bazzar <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-bold"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", color: "#0F0A1E", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", willChange: "transform" }}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-20 flex flex-col items-center gap-2"
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(15,10,30,0.3)" }}>Scroll</span>
            {/* CSS bounce — no JS loop */}
            <ChevronDown className="w-5 h-5" style={{ color: "rgba(15,10,30,0.3)", animation: "chevronBounce 1.8s ease-in-out infinite", willChange: "transform" }} />
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Strip ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto grid grid-cols-3 gap-4 p-6 sm:p-8 rounded-[2.5rem]"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)", willChange: "transform, opacity" }}
        >
          {[{ val: "17", label: "Campus Shops" }, { val: "500+", label: "Students" }, { val: "24/7", label: "Delivery" }].map((s) => (
            <div key={s.label} className="text-center py-2">
              <p className="text-3xl sm:text-5xl font-black mb-1" style={{ ...fontDisplay, color: "#0F0A1E" }}>{s.val}</p>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(15,10,30,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Feature Cards ────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          style={{ willChange: "transform, opacity" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7C3AED" }}>What EOS v3 brings</p>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter" style={{ ...fontDisplay, color: "#0F0A1E" }}>Built different.</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative p-8 rounded-[2rem] overflow-hidden group cursor-default"
              style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: `0 12px 40px ${f.glow}`, willChange: "transform" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: f.glow, border: `1px solid ${f.accent}22` }}>
                <f.icon className="w-7 h-7" style={{ color: f.accent }} />
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>{f.title}</h3>
              <p className="text-[15px] leading-relaxed font-medium" style={{ ...fontBody, color: "rgba(15,10,30,0.5)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl p-12 sm:p-20 rounded-[3rem] relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 30px 80px rgba(124,58,237,0.1)", willChange: "transform, opacity" }}
        >
          <img src="/logo.webp" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-8 shadow-xl object-cover" />
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-5" style={{ ...fontDisplay, color: "#0F0A1E" }}>
            Ready to enter<br /><span style={{ color: "#0F0A1E" }}>EOS v3?</span>
          </h2>
          <p className="text-[16px] leading-relaxed mb-10" style={{ ...fontBody, color: "rgba(15,10,30,0.5)" }}>
            Join hundreds of Chandigarh University students on the most premium campus experience ever built.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white text-[16px] font-bold mx-auto"
              style={{ background: "#0F0A1E", boxShadow: "0 4px 24px rgba(15,10,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)", willChange: "transform" }}
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-10" style={{ borderTop: "1px solid rgba(15,10,30,0.06)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.webp" alt="CU Bazzar" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-black tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>CU BAZZAR</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>EOS v3</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-3">
            {[{ to: "/about-us", label: "About" }, { to: "/privacy-policy", label: "Privacy" }, { to: "/terms", label: "Terms" }, { to: "/help", label: "Help" }].map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-semibold" style={{ color: "rgba(15,10,30,0.4)" }}>{link.label}</Link>
            ))}
          </div>
          <p className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.3)" }}>© 2026 CU Bazzar</p>
        </div>
      </footer>
    </div>
  );
}
