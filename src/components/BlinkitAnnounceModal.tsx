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
            className="w-full bg-[#FFD210] pointer-events-auto shadow-[0_-15px_60px_rgba(255,210,16,0.5)] border-none"
          >
            {/* Top Shine/Accent */}
            <div className="h-[2px] bg-white/50 w-full" />

            <div className="max-w-[1400px] mx-auto px-4 py-3 sm:py-6 flex items-center justify-between gap-3 sm:gap-6">
              
              {/* Content Group */}
              <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg transform rotate-2 shrink-0">
                  <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-[#FFD210] fill-[#FFD210]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm sm:text-2xl font-black uppercase tracking-tighter leading-none mb-0.5 truncate">
                    Blinkit & Zwigato
                  </h3>
                  <p className="text-black/70 text-[10px] sm:text-[15px] font-bold leading-none truncate">
                    Delivered in 15 mins.
                  </p>
                </div>
              </div>

              {/* Action Group */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAction}
                  className="px-4 sm:px-10 py-2.5 sm:py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] sm:text-[13px] rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="hidden sm:inline">Go to Store</span>
                  <span className="sm:hidden">Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 sm:p-2 text-black/30 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
