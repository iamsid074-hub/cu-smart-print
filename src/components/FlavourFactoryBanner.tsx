import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

const pastaItems = [
  { name: "Red Sauce", img: "/banners/red_sauce_pasta.png", rotate: -6 },
  { name: "White Sauce", img: "/banners/white_sauce_pasta.png", rotate: 0 },
  { name: "Mixed Sauce", img: "/banners/mixed_sauce_pasta.png", rotate: 6 },
];

export default function FlavourFactoryBanner() {
  return (
    <div className="w-full h-full relative flex flex-col items-center justify-end overflow-hidden border-2 border-black rounded-[1.6rem] sm:rounded-[2.6rem] box-border"
      style={{ background: "linear-gradient(160deg, #1a0a00 0%, #2d1200 30%, #3d1a00 60%, #1a0800 100%)" }}
    >
      {/* Warm ambient glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(255,120,30,0.5) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(255,60,30,0.4) 0%, transparent 70%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] pointer-events-none opacity-15"
        style={{ background: "radial-gradient(ellipse, rgba(255,180,50,0.6) 0%, transparent 70%)" }} />

      {/* Subtle grain texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-between py-4 sm:py-8 px-4">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-400/30 bg-orange-500/10 backdrop-blur-sm"
        >
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-[9px] sm:text-[11px] font-black text-orange-300 uppercase tracking-[0.2em]">Limited Time Offer</span>
        </motion.div>

        {/* Center â€” pasta images stacked */}
        <div className="flex items-center justify-center gap-[-1rem] my-2 sm:my-4 relative">
          {pastaItems.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: p.rotate }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-orange-400/20 shadow-xl shadow-black/40 -mx-2 sm:-mx-3"
              style={{ zIndex: i === 1 ? 3 : 1 }}
            >
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Bottom text & CTA */}
        <div className="text-center flex flex-col items-center gap-2 sm:gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text tracking-tight"
            style={{ backgroundImage: "linear-gradient(135deg, #FFD700, #FF8C00, #FFB347)" }}
          >
            Pasta @ {"₹"}99 Only
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] sm:text-sm text-orange-200/80 font-semibold tracking-wide"
          >
            Flavour Factory {"•"} Your Daily Dose of Flavours
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              to="/pasta-offer"
              className="inline-flex items-center gap-2 px-5 py-2 sm:px-7 sm:py-2.5 rounded-full text-xs sm:text-sm font-black text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF4500)",
                boxShadow: "0 4px 20px rgba(255,69,0,0.4)"
              }}
            >
              Order Now <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
