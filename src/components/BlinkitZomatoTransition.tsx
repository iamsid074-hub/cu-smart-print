import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BlinkitZomatoTransitionProps {
  onComplete: () => void;
}

const BlinkitLogo = () => (
  <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120px] sm:w-[200px] h-auto">
    <text x="0" y="32" fill="#FFD210" style={{ font: "italic 900 32px sans-serif", letterSpacing: "-1px" }}>BLINKI</text>
    {/* Bolt integrated 'L' */}
    <path d="M110 5L102 20H112L104 35" stroke="#FFD210" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="120" y="32" fill="#FFD210" style={{ font: "italic 900 32px sans-serif", letterSpacing: "-1px" }}>T</text>
  </svg>
);

const ZwigatoLogo = () => (
  <svg width="240" height="50" viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[160px] sm:w-[260px] h-auto">
    {/* Heart-Z Path */}
    <path 
      d="M10 15C10 10 15 10 15 15M15 15C15 10 20 10 20 15M10 15L35 15L10 40L40 40" 
      stroke="#A01519" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <text x="45" y="40" fill="#A01519" style={{ font: "bold 36px serif", italic: "true" }}>WIGATO</text>
  </svg>
);

export default function BlinkitZomatoTransition({ onComplete }: BlinkitZomatoTransitionProps) {
  const [phase, setPhase] = useState<"masking" | "active" | "exit">("masking");

  useEffect(() => {
    const activeTimer = setTimeout(() => setPhase("active"), 50);
    const exitTimer = setTimeout(() => setPhase("exit"), 1200);
    const completeTimer = setTimeout(() => onComplete(), 1500);

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#faf9f6] pointer-events-auto">
      {/* 100% Solid Mask - Creamy luxury background like the image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-[#faf9f6] z-0"
      />

      <AnimatePresence mode="wait">
        {phase !== "exit" && (
          <motion.div 
            key="branded-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.1,
              transition: { duration: 0.3 } 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Split Screen Colors */}
            <motion.div
              initial={{ x: "-100%", skewX: -10 }}
              animate={phase === "active" ? { x: "-50%", skewX: -10 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 w-full bg-[#FFD210]/10 z-1"
            />
            <motion.div
              initial={{ x: "100%", skewX: -10 }}
              animate={phase === "active" ? { x: "50%", skewX: -10 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-y-0 right-0 w-full bg-[#A01519]/5 z-1"
            />

            {/* Branded Center Stack */}
            <div className="relative z-10 flex flex-col items-center gap-6 p-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <BlinkitLogo />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-2xl font-black text-gray-400 italic"
              >
                &
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ZwigatoLogo />
              </motion.div>

              {/* Unique Delivery Status */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col items-center gap-2 mt-4"
              >
                 <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#FFD210] to-[#A01519]"
                    />
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-500">
                    Hostel Priority Mode
                 </p>
              </motion.div>
            </div>

            {/* Swish Panels (keeping the high-speed impact) */}
            <motion.div
              initial={{ x: "-100%", skewX: -20 }}
              animate={phase === "active" ? { x: "-20%", skewX: -20 } : {}}
              className="absolute inset-0 w-full h-full bg-[#FFD210] opacity-5 z-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
