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
            className="w-full h-[22vh] sm:h-[25vh] bg-[#FFD210] pointer-events-auto shadow-[0_-20px_80px_rgba(255,210,16,0.6)] border-none relative overflow-hidden"
          >
            {/* Background Accent / Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-white/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="h-full max-w-[1400px] mx-auto px-6 sm:px-12 flex items-center justify-between gap-6 sm:gap-12 relative z-10">
              
              {/* Content Group - Left */}
              <div className="flex items-center gap-5 sm:gap-10 flex-1 min-w-0">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [2, -2, 2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 sm:w-32 sm:h-32 bg-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl transform rotate-3 shrink-0"
                >
                  <Zap className="w-8 h-8 sm:w-16 sm:h-16 text-[#FFD210] fill-[#FFD210]" />
                </motion.div>
                
                <div className="flex flex-col min-w-0">
                  <motion.h3 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-6xl font-[1000] uppercase tracking-tighter leading-[0.9] mb-1 sm:mb-2 truncate"
                  >
                    Blinkit & Zwigato
                  </motion.h3>
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-black/80 text-sm sm:text-2xl font-black leading-none truncate opacity-80"
                  >
                    Delivered in 15 mins — CU Campus Special
                  </motion.p>
                </div>
              </div>

              {/* Action Group - Right */}
              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAction}
                  className="px-6 sm:px-16 py-3.5 sm:py-7 bg-black text-white font-black uppercase tracking-[0.15em] text-[11px] sm:text-[18px] rounded-2xl sm:rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center gap-2 sm:gap-4 group"
                >
                  <span>Go to Store</span>
                  <ArrowRight className="w-4 h-4 sm:w-7 sm:h-7 group-hover:translate-x-1.5 transition-transform" />
                </motion.button>
                
                <button
                  onClick={handleClose}
                  className="p-2 sm:p-4 text-black/20 hover:text-black transition-colors rounded-full hover:bg-black/5"
                >
                  <X className="w-6 h-6 sm:w-10 sm:h-10" />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
