import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Heart, MessageCircle, Star, Zap, Package } from "lucide-react";

// ─── 3D / Gamified Palette ────────────────────────────────────────────────────
const C = {
  bg: "#F8FAFC", // Match Slate-50 used in main UI
  surface: "#FFFFFF",
  accent: "#FF4D4D", // Vibrant Red/Orange
  accentGlow: "rgba(255,77,77,0.4)",
  brand: "#231942", // Extremely dark purple/black for outlines and depth
  yellow: "#FFD166",
  cyan: "#06D6A0",
  purple: "#8338EC",
  text: "#231942",
};

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const fontB: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

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
      if (start >= target) { setCount(target); clearInterval(timer); } else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Quick intro fade
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 2800);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { value: 500, suffix: "+", label: "Students Joined", color: C.yellow },
    { value: 200, suffix: "+", label: "Items Listed", color: C.cyan },
    { value: 100, suffix: "%", label: "Campus Only", color: C.purple },
  ];

  return (
    <div ref={containerRef} className="relative overflow-x-hidden min-h-screen" style={{ ...fontB, backgroundColor: C.bg }}>
      
      {/* ─── Gamified Splash Screen ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: C.brand }}
          >
            {/* Intro Content */}
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.6, duration: 0.8, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-28 h-28 bg-white rounded-3xl p-2 mb-6 shadow-[0_15px_0_#000] border-4 border-black rotate-[-3deg]">
                <img src="/logo.png" alt="Logo" className="w-full h-full rounded-2xl object-cover" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_8px_0_#FF4D4D]" style={fontH}>
                CU BAZZAR
              </h1>
              <div className="mt-8 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-4 h-4 rounded-full bg-white shadow-[0_4px_0_#000]"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Abstract Background Shapes ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         {/* Massive gradient blobs */}
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-20 blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-300 to-blue-400 opacity-20 blur-[100px]" />
      </div>

      {/* ─── 1. 3D HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 pt-20 pb-12 z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: showIntro ? 0 : 1, x: showIntro ? -50 : 0 }} 
            transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1 relative z-20"
          >
            {/* Floating Tag */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] mb-8 rotate-[-2deg]"
            >
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm uppercase tracking-wider" style={fontH}>The Campus Super-Store</span>
            </motion.div>

            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter mb-6 text-[#231942]" style={fontH}>
              Trade <span className="text-white drop-shadow-[0_6px_0_#8338EC] [-webkit-text-stroke:2px_#231942]">Epic</span> Gear.
              <br />
              <span className="relative inline-block mt-2">
                On Campus.
                {/* 3D Underline */}
                <svg className="absolute -bottom-4 left-0 w-full h-6" viewBox="0 0 300 24" preserveAspectRatio="none">
                  <motion.path d="M5 15Q150 -5 295 15" fill="none" stroke="#FF4D4D" strokeWidth="8" strokeLinecap="round" 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.8 }} />
                  <motion.path d="M5 15Q150 -5 295 15" fill="none" stroke="#231942" strokeWidth="12" strokeLinecap="round" className="-z-10 absolute translate-y-2 opacity-50 blur-[2px]" />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl font-medium text-slate-700 mb-10 max-w-lg leading-relaxed">
              Buy, sell, and discover amazing items from your classmates. Built with thick 3D vibes, zero platform fees, and 100% campus trust.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/login">
                {/* Super 3D Button */}
                <motion.button 
                  whileHover={{ scale: 1.05, rotate: -2 }} 
                  whileTap={{ scale: 0.95, y: 8, boxShadow: "0px 0px 0px #231942" }}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-[#FFD166] text-[#231942] font-black text-lg rounded-2xl border-4 border-[#231942] shadow-[0_8px_0_#231942] transition-all"
                  style={fontH}
                >
                  Enter Marketplace
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform stroke-[3]" />
                </motion.button>
              </Link>
              
              <Link to="/login" className="font-bold text-lg text-slate-600 hover:text-[#FF4D4D] transition-colors" style={fontH}>
                I already have an account
              </Link>
            </div>
          </motion.div>

          {/* Right 3D Visual Composition */}
          <motion.div 
            style={{ y: parallaxY }} 
            className="order-1 lg:order-2 relative h-[400px] lg:h-[600px] flex items-center justify-center w-full z-10"
          >
            {/* Refined v2 Backpack - Premium Tech Look */}
            <motion.img 
              src="/3d_backpack_v2.png" 
              alt="Premium 3D Backpack"
              className="absolute w-[80%] max-w-[450px] z-20 drop-shadow-2xl"
              style={{ 
                mixBlendMode: 'multiply',
                WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                maskImage: 'radial-gradient(circle, black 70%, transparent 100%)'
              }}
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1, delay: 0.4 }}
            />
            
            {/* Glowing Backdrop Plate */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
              className="absolute w-[70%] h-[70%] bg-white rounded-full border-8 border-dashed border-[#8338EC] opacity-20 animate-spin-slow pointer-events-none -z-10"
              style={{ animationDuration: '20s' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ─── 2. EXTREME 3D STATS ─── */}
      <section className="relative py-20 px-5 sm:px-8 z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.4, delay: i * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white p-8 rounded-[2rem] border-4 border-[#231942] relative group"
              style={{ boxShadow: `8px 12px 0 ${s.color}, 8px 12px 0 4px #231942` }} // double shadow effect
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-4 border-[#231942] flex items-center justify-center bg-white shadow-[0_4px_0_#231942]">
                 <Star className="w-6 h-6 fill-current" style={{ color: s.color }} />
              </div>
              <p className="text-5xl lg:text-7xl font-black tracking-tighter text-[#231942] mb-2" style={fontH}>
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 3. WHY CU BAZZAR (Gamified Cards) ─── */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 z-10 overflow-hidden">
        {/* Slanted background stripe */}
        <div className="absolute inset-0 bg-[#231942] -skew-y-3 transform origin-top-left -z-10 shadow-[0_20px_0_#8338EC]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 text-white">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 drop-shadow-[0_4px_0_#000]" style={fontH}>Superpowers Included</h2>
            <p className="text-xl font-medium text-purple-200">Everything you need to trade like a pro.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Zero Fees", desc: "Keep 100% of your money. We do not take a cut.", icon: ShieldCheck, color: C.yellow },
              { title: "Direct Chat", desc: "Haggle, discuss, and meet up using the built-in chat.", icon: MessageCircle, color: C.cyan },
              { title: "Local Handoff", desc: "No shipping. Meet at the library or hostel lobby.", icon: Heart, color: C.accent },
            ].map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
                whileInView={{ opacity: 1, scale: 1, rotate: (i % 2 === 0 ? 2 : -2) }} 
                viewport={{ once: true }} 
                whileHover={{ scale: 1.05, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: i * 0.1 }} 
                className="bg-white p-8 rounded-3xl border-4 border-[#231942] shadow-[8px_12px_0_#000]"
              >
                <div className="w-16 h-16 rounded-2xl border-4 border-[#231942] flex items-center justify-center mb-6 shadow-[0_6px_0_#000] rotate-[-5deg]"
                  style={{ backgroundColor: f.color }}>
                  <f.icon className="w-8 h-8 text-[#231942] stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-[#231942]" style={fontH}>{f.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. CTA SECTION WITH 3D ROCKET ─── */}
      <section className="relative py-32 px-5 sm:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#FFD166] to-[#FF4D4D] p-10 sm:p-16 rounded-[3rem] border-8 border-[#231942] shadow-[12px_16px_0_#231942] text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-[#231942] drop-shadow-[0_4px_0_rgba(255,255,255,0.5)]" style={fontH}>
                Blast off into the <br/> Campus Market!
              </h2>
              
              <Link to="/login" className="inline-block mt-8">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 2 }} 
                  whileTap={{ scale: 0.9, y: 8, boxShadow: "0px 0px 0px #231942" }}
                  className="flex items-center gap-3 px-10 py-5 bg-white text-[#231942] font-black text-xl rounded-2xl border-4 border-[#231942] shadow-[0_8px_0_#231942] transition-all"
                  style={fontH}
                >
                  <Package className="w-7 h-7 stroke-[3]" />
                  Start Trading
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 px-5 bg-white border-t-4 border-[#231942] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-bold text-slate-500">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#231942] border-2 border-slate-300 p-1">
                <img src="/logo.png" className="w-full h-full object-cover rounded" />
             </div>
             <span>© 2026 CU BAZZAR. All rigths reserved.</span>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-[#FF4D4D] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#FF4D4D] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
