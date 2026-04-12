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

            <div className="max-w-[1400px] mx-auto px-5 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Content */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-2 shrink-0">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFD210] fill-[#FFD210]" />
                </div>
                <div className="flex flex-col text-black">
                  <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter leading-tight mb-0.5">
                    Blinkit & Zwigato Live
                  </h3>
                  <p className="text-black/80 text-[11px] sm:text-[15px] font-bold leading-tight max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                    Hostel snacks & essentials delivered in 15 mins.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleAction}
                  className="flex-1 sm:flex-none px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[13px] rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go to Store <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-black/30 hover:text-black transition-colors"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
