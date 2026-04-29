import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Gamepad2, Zap, TrendingUp, Coins, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BlinkitAnnounceModalProps {
  onCheck?: () => void;
}

// Module-level variable: survives SPA navigation but resets on full page reload (login → fresh session)
let dismissedThisSession = false;

const features = [
  { icon: TrendingUp,  text: "Earn upto ₹5,000 / day",        color: "#4ade80" },
  { icon: Coins,       text: "Start with just ₹10",            color: "#facc15" },
  { icon: Gamepad2,    text: "Play your favourite game",       color: "#a78bfa" },
  { icon: Zap,         text: "Instant money in your card",     color: "#38bdf8" },
];

export default function BlinkitAnnounceModal({ onCheck }: BlinkitAnnounceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dismissedThisSession) return;
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    dismissedThisSession = true;
    setIsOpen(false);
  };

  const handleEnter = () => {
    dismissedThisSession = true;
    setIsOpen(false);
    onCheck?.();
    navigate("/games");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center px-0 sm:px-6 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 pointer-events-auto"
          />

          {/* Card */}
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 200 }}
            className="relative pointer-events-auto w-full sm:max-w-[480px] overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.5)]"
            style={{
              background: "linear-gradient(145deg, #0f0f1a 0%, #1a0f2e 50%, #0d1a2e 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Animated glow orbs */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 p-7 sm:p-9 flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    boxShadow: "0 0 24px rgba(124,58,237,0.5)",
                  }}
                >
                  <Gamepad2 className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "#fff" }}
                    >
                      🎮 New
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Earn Money<br />
                    <span style={{ background: "linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      By Playing Games
                    </span>
                  </h3>
                </div>
              </div>

              {/* Feature list */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {features.map(({ icon: Icon, text, color }, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-sm sm:text-[15px] font-semibold text-white/85">{text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEnter}
                className="relative w-full h-[58px] rounded-2xl font-black text-white text-base sm:text-[17px] overflow-hidden flex items-center justify-center gap-2 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
                }}
              >
                {/* Shimmer */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)", width: "60%" }}
                />
                <Trophy className="w-5 h-5" />
                Enter Game Section
              </motion.button>

              <p className="text-center text-[11px] text-white/30">
                Tap outside to dismiss · Won't show again this session
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
