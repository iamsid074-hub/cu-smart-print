import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShoppingBag, Star, TrendingUp, BookOpen, Grid3X3, Laptop } from "lucide-react";

const floatingStats = [
  { label: "Active Students", value: "12K+", icon: Star },
  { label: "Items Listed", value: "48K+", icon: ShoppingBag },
  { label: "Deals Done", value: "6K+", icon: TrendingUp },
];

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Hold intro for 1.8 seconds, then trigger exit
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">

      {/* 1. WELCOME INTRO ANIMATION */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center flex-col"
          >
            {/* Background elements for intro */}
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/20 blur-[120px] rounded-full" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-fire flex items-center justify-center shadow-neon-fire">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center gap-2">
                <span className="text-neon-fire">CU</span>
                <span className="text-foreground">BAZZAR</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2 & 3. LANDING PAGE REVEAL & HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 perspective-1000">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop" alt="hero" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-orange/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-cyan/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

        {/* Floating Background Cards (3D Parallax/Float) */}
        {!showIntro && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block" style={{ perspective: '1200px' }}>
            <motion.div
              initial={{ opacity: 0, y: 100, rotateX: 45, rotateY: -30 }}
              animate={{ opacity: 1, y: [0, -30, 0], rotateX: [15, 25, 15], rotateY: [-20, -10, -20] }}
              transition={{ opacity: { delay: 0.8, duration: 1 }, y: { repeat: Infinity, duration: 7, ease: "easeInOut" }, rotateX: { repeat: Infinity, duration: 8, ease: "easeInOut" }, rotateY: { repeat: Infinity, duration: 9, ease: "easeInOut" } }}
              className="absolute top-1/4 left-[10%] glass-heavy p-5 rounded-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] transform-gpu"
            >
              <div className="w-14 h-14 rounded-xl bg-neon-orange/20 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,100,0,0.3)]"><BookOpen className="w-7 h-7 text-neon-orange" /></div>
              <div className="w-24 h-2 bg-white/20 rounded-full shadow-inner shadow-black/50"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100, rotateX: -45, rotateY: 30 }}
              animate={{ opacity: 1, y: [0, -40, 0], rotateX: [-15, -25, -15], rotateY: [20, 10, 20] }}
              transition={{ opacity: { delay: 1, duration: 1 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }, rotateX: { repeat: Infinity, duration: 9, ease: "easeInOut" }, rotateY: { repeat: Infinity, duration: 7, ease: "easeInOut" } }}
              className="absolute top-1/3 right-[12%] glass border border-white/20 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.15)] backdrop-blur-md bg-black/60 transform-gpu"
            >
              <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,200,255,0.3)]"><Laptop className="w-8 h-8 text-neon-cyan" /></div>
              <div className="w-28 h-2.5 bg-white/20 rounded-full mb-3 shadow-inner shadow-black/50"></div>
              <div className="w-20 h-2 bg-white/10 rounded-full shadow-inner shadow-black/50"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateZ: -45 }}
              animate={{ opacity: 1, scale: [1, 1.1, 1], y: [0, -25, 0], rotateZ: [-10, 10, -10], rotateX: [10, -10, 10] }}
              transition={{ opacity: { delay: 1.2, duration: 1 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut" }, scale: { repeat: Infinity, duration: 5, ease: "easeInOut" }, rotateZ: { repeat: Infinity, duration: 15, ease: "linear" } }}
              className="absolute bottom-1/4 left-[18%] w-28 h-28 rounded-[2rem] border-4 border-neon-pink/30 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_20px_50px_rgba(255,0,150,0.15),inset_0_5px_15px_rgba(255,255,255,0.1)] transform-gpu"
            >
              <Grid3X3 className="w-10 h-10 text-neon-pink/70 drop-shadow-[0_0_10px_rgba(255,0,150,0.5)]" />
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mt-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: showIntro ? 0 : 1, scale: showIntro ? 0.8 : 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-cyan/30 mb-8"
          >
            <span className="neon-dot text-sm font-medium text-foreground">Now live at your campus</span>
            <Zap className="w-4 h-4 text-neon-cyan" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 40 : 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight"
          >
            Buy, Sell & Exchange
            <br />
            <span className="text-neon-aurora animate-aurora">within Campus</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 font-medium"
          >
            Notes, books, and essentials — delivered student to student.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
            transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 relative z-20 perspective-1000"
          >
            <Link to="/home">
              <motion.button
                whileHover={{ scale: 1.05, rotateX: 10, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-fire text-white font-black text-lg shadow-[0_15px_30px_rgba(255,100,0,0.4),inset_0_2px_0_rgba(255,255,255,0.4)] btn-ripple transition-all duration-300 transform-gpu"
              >
                <span className="drop-shadow-md">Explore Now</span>
                <ArrowRight className="w-6 h-6 drop-shadow-md transition-transform group-hover:translate-x-2" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: -20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto drop-shadow-2xl perspective-1000"
          >
            {floatingStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -10, scale: 1.05, rotateX: 10, rotateY: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="glass-heavy rounded-2xl p-6 text-center border-t border-l border-white/20 border-b border-r border-black/40 hover:border-white/40 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_30px_60px_rgba(0,180,255,0.3),inset_0_4px_15px_rgba(255,255,255,0.2)] transform-gpu cursor-pointer bg-gradient-to-b from-white/5 to-transparent"
              >
                <stat.icon className="w-8 h-8 text-neon-cyan mx-auto mb-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                <div className="font-black text-3xl text-white drop-shadow-md">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground mt-1 tracking-widest uppercase py-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-mono">scroll</span>
          <div className="w-0.5 h-8 bg-gradient-fire rounded-full animate-pulse" />
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Zero Commission",
                desc: "Keep 100% of what you earn. No hidden fees, ever.",
                gradient: "from-neon-orange to-neon-pink",
                glow: "shadow-neon-fire",
              },
              {
                title: "Instant Messaging",
                desc: "Chat directly with buyers and sellers in real-time.",
                gradient: "from-neon-cyan to-neon-blue",
                glow: "shadow-neon-ocean",
              },
              {
                title: "Live Tracking",
                desc: "Track your deliveries step-by-step within campus.",
                gradient: "from-neon-pink to-neon-blue",
                glow: "",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ y: -6 }}
                className={`glass rounded-2xl p-6 border border-white/5 ${f.glow} transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-4 flex items-center justify-center text-white font-bold text-xl`}>
                  {["₹", "💬", "🚀"][i]}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
