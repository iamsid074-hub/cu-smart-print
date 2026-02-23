import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, BookOpen, Grid3X3, Laptop, ShieldCheck, Heart } from "lucide-react";

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const containerRef = useRef(null);

  // Native scroll listeners for 3D parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scroll animations for hero elements fading out / moving down on scroll
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Parallax for floating background items (different speeds)
  const parallax1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const parallax2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const parallax3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    // Hold intro for 1.8 seconds, then trigger exit
    const timer = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="relative bg-background overflow-x-hidden">

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

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 perspective-1000">
        {/* Simplified Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop" alt="hero" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/90 to-background" />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-orange/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-cyan/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

        {/* 3D Scroll Parallax Cards */}
        {!showIntro && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block" style={{ perspective: '1200px' }}>
            <motion.div
              style={{ y: parallax1 }}
              initial={{ opacity: 0, rotateX: 45, rotateY: -30 }}
              animate={{ opacity: 1, rotateX: [15, 25, 15], rotateY: [-20, -10, -20] }}
              transition={{ opacity: { delay: 0.8, duration: 1 }, rotateX: { repeat: Infinity, duration: 8, ease: "easeInOut" }, rotateY: { repeat: Infinity, duration: 9, ease: "easeInOut" } }}
              className="absolute top-[20%] left-[12%] glass-heavy p-5 rounded-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform-gpu"
            >
              <div className="w-14 h-14 rounded-xl bg-neon-orange/20 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,100,0,0.3)]"><BookOpen className="w-7 h-7 text-neon-orange" /></div>
              <div className="w-24 h-2 bg-white/20 rounded-full shadow-inner shadow-black/50"></div>
            </motion.div>

            <motion.div
              style={{ y: parallax2 }}
              initial={{ opacity: 0, rotateX: -45, rotateY: 30 }}
              animate={{ opacity: 1, rotateX: [-15, -25, -15], rotateY: [20, 10, 20] }}
              transition={{ opacity: { delay: 1, duration: 1 }, rotateX: { repeat: Infinity, duration: 9, ease: "easeInOut" }, rotateY: { repeat: Infinity, duration: 7, ease: "easeInOut" } }}
              className="absolute top-[35%] right-[10%] glass border border-white/20 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] backdrop-blur-md bg-black/60 transform-gpu"
            >
              <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,200,255,0.3)]"><Laptop className="w-8 h-8 text-neon-cyan" /></div>
              <div className="w-28 h-2.5 bg-white/20 rounded-full mb-3 shadow-inner shadow-black/50"></div>
              <div className="w-20 h-2 bg-white/10 rounded-full shadow-inner shadow-black/50"></div>
            </motion.div>

            <motion.div
              style={{ y: parallax3 }}
              initial={{ opacity: 0, scale: 0.5, rotateZ: -45 }}
              animate={{ opacity: 1, scale: [1, 1.1, 1], rotateZ: [-10, 10, -10], rotateX: [10, -10, 10] }}
              transition={{ opacity: { delay: 1.2, duration: 1 }, scale: { repeat: Infinity, duration: 5, ease: "easeInOut" }, rotateZ: { repeat: Infinity, duration: 15, ease: "linear" } }}
              className="absolute bottom-[20%] left-[20%] w-28 h-28 rounded-[2rem] border-4 border-neon-pink/30 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_20px_50px_rgba(255,0,150,0.15)] transform-gpu"
            >
              <Grid3X3 className="w-10 h-10 text-neon-pink/70 drop-shadow-[0_0_10px_rgba(255,0,150,0.5)]" />
            </motion.div>
          </div>
        )}

        {/* Hero Content tied to Scroll parallax */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4 perspective-1000"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-neon-cyan/20 mb-8 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_#00ffff]"></span>
            <span className="text-sm font-medium text-white tracking-wide">Live at Chandigarh University</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 40 : 0 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 80 }}
            className="text-5xl md:text-6xl lg:text-7xl font-sans font-black leading-tight mb-6 tracking-tight drop-shadow-2xl"
          >
            Buy, Sell & Exchange
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-orange via-neon-pink to-neon-blue animate-aurora drop-shadow-sm">within Campus</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-12 font-medium"
          >
            Notes, books, and essentials — delivered student to student.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
            transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/home">
              <motion.button
                whileHover={{ scale: 1.05, rotateX: 10, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black text-lg shadow-[0_10px_30px_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.2)] transition-all duration-300 transform-gpu hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] hover:bg-gray-100"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent overflow-hidden">
            <div className="w-full h-1/2 bg-white animate-scan-line" />
          </div>
        </motion.div>
      </section>

      {/* 3. CORE FEATURES SECTION (Clean Layout, 3D Scroll In) */}
      <section className="relative py-32 px-4 z-10 perspective-1000 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg text-white">Why CU Bazaar?</h2>
            <p className="text-muted-foreground text-lg md:text-xl">Built exclusively to empower students.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Zero Fees",
                desc: "Keep 100% of what you earn. We don't take a single cut from your sales.",
                icon: ShieldCheck,
                color: "text-neon-cyan",
                bg: "bg-neon-cyan/10",
              },
              {
                title: "Instant Chat",
                desc: "Negotiate securely using our lightning-fast direct messaging system.",
                icon: Zap,
                color: "text-neon-orange",
                bg: "bg-neon-orange/10",
              },
              {
                title: "Local Handset",
                desc: "Meet on campus or at hostels. No shipping wait times or hidden fees.",
                icon: Heart,
                color: "text-neon-pink",
                bg: "bg-neon-pink/10",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 80, rotateY: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                whileHover={{ y: -15, rotateX: 5, rotateY: -5, scale: 1.03 }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring" }}
                className="glass-heavy rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transform-gpu relative overflow-hidden group"
              >
                <div className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-white drop-shadow-sm">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{f.desc}</p>

                {/* Subtle hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLEAN FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 pt-20 pb-10 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-fire flex items-center justify-center shadow-neon-fire mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h4 className="text-3xl font-black mb-3 tracking-widest text-white drop-shadow-md">CU BAZZAR</h4>
          <p className="text-muted-foreground mb-10 text-lg">The official campus marketplace.</p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/home" className="inline-block px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10 hover:border-white/30 backdrop-blur-sm shadow-xl">
              Enter Marketplace
            </Link>
          </motion.div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-sm font-medium text-muted-foreground flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto">
          <p className="mb-4 sm:mb-0 text-white/50">© 2026 CU Bazaar. Crafted for students.</p>
          <div className="flex gap-6 justify-center">
            <Link to="/" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
