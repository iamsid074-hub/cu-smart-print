import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BlinkitZomatoTransitionProps {
  onComplete: () => void;
}

export default function BlinkitZomatoTransition({ onComplete }: BlinkitZomatoTransitionProps) {
  const [phase, setPhase] = useState<"entering" | "holding" | "leaving">("entering");

  useEffect(() => {
    // Timing sequence for a professional transition
    const holdTimer = setTimeout(() => setPhase("holding"), 800);
    const leaveTimer = setTimeout(() => setPhase("leaving"), 1400);
    const completeTimer = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(leaveTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {phase !== "leaving" && (
          <>
            {/* Blinkit Yellow Panel (Top Left) */}
            <motion.div
              initial={{ x: "-100%", y: "-100%", skewX: -20 }}
              animate={{ x: "-10%", y: "-10%", skewX: -20 }}
              exit={{ x: "-120%", y: "-120%", skewX: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-[150%] h-[150%] bg-[#FFD210] origin-center z-10"
              style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
            />

            {/* Zomato Red Panel (Bottom Right) */}
            <motion.div
              initial={{ x: "100%", y: "100%", skewX: -20 }}
              animate={{ x: "10%", y: "10%", skewX: -20 }}
              exit={{ x: "120%", y: "120%", skewX: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-[150%] h-[150%] bg-[#E23744] origin-center z-10"
              style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
            />

            {/* Center Content */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="relative z-20 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-6xl font-black text-black tracking-tighter uppercase italic select-none">
                  Blinkit
                </div>
                <div className="text-4xl sm:text-6xl font-black text-white px-2 py-1 rotate-12 select-none border-4 border-white">
                  &
                </div>
                <div className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic select-none">
                  Zomato
                </div>
              </div>
              <div className="h-1 w-48 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "linear" }}
                  className="h-full bg-white transition-all duration-300"
                />
              </div>
              <p className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-2 drop-shadow-md">
                Fast Delivery Squad Arriving
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
