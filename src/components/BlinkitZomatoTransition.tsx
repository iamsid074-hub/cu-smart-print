import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BlinkitZomatoTransitionProps {
  onComplete: () => void;
}

export default function BlinkitZomatoTransition({ onComplete }: BlinkitZomatoTransitionProps) {
  const [phase, setPhase] = useState<"masking" | "active" | "exit">("masking");

  useEffect(() => {
    // Stage 1: Ultra Fast Entrance
    const activeTimer = setTimeout(() => setPhase("active"), 40);
    // Stage 2: Sharp Swish (Very brief hold)
    const exitTimer = setTimeout(() => setPhase("exit"), 500); 
    // Final: Navigation (Total 800ms for that "Swish" feel)
    const completeTimer = setTimeout(() => onComplete(), 800);

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black pointer-events-auto">
      {/* 100% Solid Mask - Zero Gradient */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black z-0"
      />

      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div 
            key="swish-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              transition: { duration: 0.2, ease: "easeIn" } 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Blinkit Yellow - SOLID */}
            <motion.div
              initial={{ x: "-100%", skewX: -15 }}
              animate={phase === "active" ? { x: "-5%", skewX: -15 } : {}}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-0 w-[110%] h-full bg-[#FFD210] origin-left z-10"
            />

            {/* Zomato Red - SOLID */}
            <motion.div
              initial={{ x: "100%", skewX: -15 }}
              animate={phase === "active" ? { x: "5%", skewX: -15 } : {}}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-0 w-[110%] h-full bg-[#E23744] origin-right z-10"
            />

            {/* Typography Overlay */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={phase === "active" ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.25, duration: 0.15 }}
              className="relative z-20 flex flex-col items-center gap-2 sm:gap-6 px-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-8">
                <span className="text-xl sm:text-2xl font-bold text-black tracking-[0.2em] uppercase leading-none select-none">
                  BLINKIT
                </span>
                
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-black shadow-lg skew-x-[-15deg]">
                    <span className="text-sm sm:text-lg font-black text-red-600">&</span>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-white tracking-[0.2em] uppercase leading-none select-none">
                  ZOMATO
                </span>
              </div>

              {/* Minimal "Line of Speed" - Desktop Only */}
              <div className="hidden sm:block w-96 h-1 bg-black/20 rounded-full overflow-hidden mt-8">
                <motion.div 
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={phase === "active" ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, ease: "linear" }}
                  className="h-full bg-white"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
