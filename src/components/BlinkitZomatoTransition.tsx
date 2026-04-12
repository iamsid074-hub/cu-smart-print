import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BlinkitZomatoTransitionProps {
  onComplete: () => void;
}

export default function BlinkitZomatoTransition({ onComplete }: BlinkitZomatoTransitionProps) {
  const [phase, setPhase] = useState<"masking" | "entering" | "holding" | "finishing">("masking");

  useEffect(() => {
    // Stage 1: Absolute Masking (Black fade in)
    const enterTimer = setTimeout(() => setPhase("entering"), 200);
    // Stage 2: Panels Hold
    const holdTimer = setTimeout(() => setPhase("holding"), 1200);
    // Stage 3: Finish (unified exit)
    const finishTimer = setTimeout(() => setPhase("finishing"), 1800);
    // Final: Navigation
    const completeTimer = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden pointer-events-auto">
      {/* Dynamic Background Mask - Totally hides previous screen */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black z-0"
      />

      <AnimatePresence mode="wait">
        {phase !== "finishing" && (
          <motion.div 
            key="transition-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.2,
              filter: "blur(20px)",
              transition: { duration: 0.6, ease: "easeIn" } 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Blinkit Yellow Panel */}
            <motion.div
              initial={{ x: "-120%", y: "-120%", skewX: -20 }}
              animate={phase !== "masking" ? { x: "-5%", y: "-5%", skewX: -20 } : {}}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute inset-0 w-[150%] h-[150%] bg-[#FFD210] origin-center z-10 shadow-[20px_0_100px_rgba(0,0,0,0.5)]"
            />

            {/* Zomato Red Panel */}
            <motion.div
              initial={{ x: "120%", y: "120%", skewX: -20 }}
              animate={phase !== "masking" ? { x: "5%", y: "5%", skewX: -20 } : {}}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute inset-0 w-[150%] h-[150%] bg-[#E23744] origin-center z-10 shadow-[-20px_0_100px_rgba(0,0,0,0.5)]"
            />

            {/* Impact Flash (meeting point) */}
            {phase === "entering" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute inset-0 z-15 bg-white mix-blend-overlay pointer-events-none"
                />
            )}

            {/* Center Branded Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={phase !== "masking" ? { scale: 1, opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 25 }}
              className="relative z-20 flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="text-5xl sm:text-7xl font-black text-black tracking-tighter uppercase italic drop-shadow-sm">
                  Blinkit
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-xl rotate-12 border-4 border-black/5">
                  <span className="text-3xl sm:text-4xl font-black text-red-600">&</span>
                </div>
                <div className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl">
                  Zomato
                </div>
              </div>

              <div className="relative w-64 h-2 bg-black/10 rounded-full overflow-hidden backdrop-blur-md">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={phase !== "masking" ? { width: "100%" } : {}}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 background-size-200 animate-aurora shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>

              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex flex-col items-center gap-1"
              >
                <p className="text-white text-[12px] sm:text-sm font-black uppercase tracking-[0.3em] drop-shadow-lg">
                  Fast Delivery Squad
                </p>
                <p className="text-black/60 text-[9px] font-bold uppercase tracking-widest">
                  Arriving In Style
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
