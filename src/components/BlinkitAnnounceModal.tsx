import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap, X, ArrowRight } from "lucide-react";

interface BlinkitAnnounceModalProps {
  onCheck: () => void;
}

// Module-level variable survives navigation in an SPA but resets on page reload
let dismissedThisSession = false;

export default function BlinkitAnnounceModal({ onCheck }: BlinkitAnnounceModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If already dismissed in this session, don't show
    if (dismissedThisSession) return;

    const timer = setTimeout(() => setIsOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    dismissedThisSession = true;
    setIsOpen(false);
  };

  const handleAction = () => {
    dismissedThisSession = true;
    setIsOpen(false);
    onCheck();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[10001] pointer-events-none">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full h-[50vh] bg-[#FFD210] pointer-events-auto border-none relative overflow-hidden rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)]"
          >
            {/* Top Close Button - Absolute Positioned */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 p-3 sm:p-5 text-black/30 hover:text-black transition-colors rounded-full hover:bg-black/10 shrink-0"
            >
              <X className="w-7 h-7 sm:w-10 sm:h-10" />
            </button>

            <div className="h-full max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col justify-center gap-6 sm:gap-10 relative z-10 py-8">
              
              {/* Header Group */}
              <div className="flex items-center gap-5 sm:gap-8 shrink-0">
                <motion.div 
                   animate={{ scale: [1, 1.1, 1], rotate: [2, -2, 2] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="w-14 h-14 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 shrink-0"
                >
                  <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-[#FFD210] fill-[#FFD210]" />
                </motion.div>
                
                <div className="flex flex-col min-w-0">
                  <h3 className="text-3xl sm:text-7xl font-[1000] uppercase tracking-tighter leading-none mb-1">
                    Blinkit & Zwigato
                  </h3>
                  <p className="text-black/80 text-sm sm:text-2xl font-black uppercase opacity-60">
                    CU Campus Special — 15 Min Delivery
                  </p>
                </div>
              </div>

              {/* Feature Points Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 bg-black/5 p-5 sm:p-8 rounded-[2rem] border border-black/5">
                {[
                  "Anything you order will come at your room",
                  "Fastest delivery on campus",
                  "Minimal service charges ever",
                  "3 delivery partners (No Delay)"
                ].map((point, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    key={idx} 
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-black flex items-center justify-center shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3.5 h-3.5 text-[#FFD210] fill-[#FFD210]" />
                    </div>
                    <span className="text-[14px] sm:text-[22px] font-black leading-tight text-black">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Action Group */}
              <div className="flex items-center gap-4 sm:gap-8 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAction}
                  className="w-full sm:w-auto px-8 sm:px-20 py-4.5 sm:py-8 bg-black text-white font-[1000] uppercase tracking-wider text-[14px] sm:text-[22px] rounded-2xl sm:rounded-[2.5rem] shadow-xl flex items-center justify-center gap-3 sm:gap-4 transition-all"
                >
                  <span>Go to Store</span>
                  <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" />
                </motion.button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
