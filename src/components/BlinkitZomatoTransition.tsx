import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BlinkitZomatoTransitionProps {
  onComplete: () => void;
}

export default function BlinkitZomatoTransition({ onComplete }: BlinkitZomatoTransitionProps) {
  const [phase, setPhase] = useState<"ready" | "warp" | "exit">("ready");

  useEffect(() => {
    const warpTimer = setTimeout(() => setPhase("warp"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 1800);
    const completeTimer = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(warpTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black font-sans">
      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div 
            key="warp-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "brightness(2)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Speed Line Particles (Performance Optimized) */}
            <div className="absolute inset-0 z-0 opacity-40">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scaleY: [0, 4, 0],
                    y: ["-50%", "150%"]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.05,
                    ease: "linear"
                  }}
                  className="absolute top-0 w-[1px] h-32 bg-white/30"
                  style={{ left: `${(i / 24) * 100}%` }}
                />
              ))}
            </div>

            {/* Radial Velocity Rings */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-[80vw] h-[80vw] rounded-full border border-yellow-400/20"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
              className="absolute w-[80vw] h-[80vw] rounded-full border border-red-500/20"
            />

            {/* Branded "Velocity" Panels */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={phase === "warp" ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ type: "spring", stiffness: 40, damping: 15 }}
              className="absolute inset-0 bg-gradient-to-r from-[#FFD210] to-[#E23744] z-10"
            />

            {/* Center Content - Redesigned for Mobile (Vertical Stack) */}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className="relative z-20 flex flex-col items-center justify-center gap-4 sm:gap-8 px-6 text-center"
            >
              {/* Luxury Typography Stack */}
              <div className="flex flex-col sm:flex-row items-center gap-0 sm:gap-6">
                <motion.span 
                  className="text-6xl sm:text-9xl font-black text-black tracking-tighter uppercase italic drop-shadow-sm leading-none"
                >
                  BLINKIT
                </motion.span>
                
                <div className="relative h-12 w-12 sm:h-20 sm:w-20 my-2 sm:my-0">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-black rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-serif italic text-3xl sm:text-5xl font-black text-white">
                    &
                  </div>
                </div>

                <motion.span 
                  className="text-6xl sm:text-9xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl leading-none"
                >
                  ZOMATO
                </motion.span>
              </div>

              {/* Unique Status Indicator */}
              <div className="flex flex-col items-center gap-3 mt-4 sm:mt-10">
                <div className="h-0.5 w-48 sm:w-96 bg-black/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-white shadow-[0_0_20px_white]"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <p className="font-serif italic text-lg sm:text-2xl text-black/90 tracking-wide">
                        Warping to Quick Store
                    </p>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/60 mt-2">
                  Extreme Velocity Delivery Mode
                </p>
              </div>
            </motion.div>

            {/* Vignette for Depth */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none z-30" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
