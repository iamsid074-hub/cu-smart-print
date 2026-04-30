import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Gamepad2, Zap, CreditCard, IndianRupee } from "lucide-react";

let dismissedThisSession = false;

const PERKS = [
  {
    icon: IndianRupee,
    text: "Earn up to Rs 5,000/day by playing games",
  },
  {
    icon: CreditCard,
    text: "Instant money transfer to your CU Card",
  },
  {
    icon: Zap,
    text: "Start playing from just Rs 10",
  },
];

export default function BlinkitAnnounceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dismissedThisSession) return;
    const timer = setTimeout(() => setIsOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    dismissedThisSession = true;
    setIsOpen(false);
  };

  const handlePlay = () => {
    dismissedThisSession = true;
    setIsOpen(false);
    navigate("/games");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center pointer-events-none px-0 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/85 pointer-events-auto"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full sm:max-w-[480px] pointer-events-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden will-change-transform"
            style={{
              background: "linear-gradient(160deg, #0f0f14 0%, #13101f 100%)",
              borderTop: "1px solid rgba(139,92,246,0.3)",
              borderLeft: "1px solid rgba(139,92,246,0.1)",
              borderRight: "1px solid rgba(139,92,246,0.1)",
              willChange: "transform",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #8b5cf6 40%, #ec4899 60%, transparent)",
              }}
            />

            <div
              className="absolute top-[-60px] right-[-40px] w-52 h-52 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-[-40px] left-[-40px] w-44 h-44 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)",
              }}
            />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-all"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 p-7 sm:p-10 flex flex-col gap-6">
              <div className="flex items-center gap-2 w-fit">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-purple-300">
                    New Feature
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  }}
                >
                  <Gamepad2 size={28} className="text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1">
                    Games Section
                  </h2>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
                    Play | Earn | Win Real Cash
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {PERKS.map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.12 }}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))",
                          border: "1px solid rgba(139,92,246,0.2)",
                        }}
                      >
                        <Icon size={17} className="text-purple-300" />
                      </div>
                      <span className="text-[13.5px] font-semibold text-white/80 leading-snug">
                        {perk.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleClose}
                  className="flex-[0.4] py-3.5 rounded-2xl text-sm font-bold text-white/40 bg-white/5 border border-white/8 active:scale-95 transition-transform"
                >
                  Later
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlay}
                  className="flex-[0.6] py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #ec4899 100%)",
                  }}
                >
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    className="absolute inset-0 pointer-events-none will-change-transform"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                      width: "60%",
                    }}
                  />
                  <Gamepad2 size={16} />
                  Play Now ›
                </motion.button>
              </div>

              <p className="text-center text-[10px] text-white/20">
                Tap outside to dismiss | Won't show again this session
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
