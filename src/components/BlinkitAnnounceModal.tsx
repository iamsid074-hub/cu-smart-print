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
        <div className="fixed bottom-0 sm:bottom-8 left-0 right-0 z-[10001] pointer-events-none px-0 sm:px-6">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full sm:max-w-[700px] sm:mx-auto h-[50vh] sm:h-auto bg-[#FFD210] pointer-events-auto border-none relative overflow-hidden rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.3)]"
          >
            {/* Top Close Button - Absolute Positioned */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-3 text-black/30 hover:text-black transition-colors rounded-full hover:bg-black/10 shrink-0"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <div className="h-full flex flex-col justify-center gap-6 sm:gap-8 relative z-10 p-8 sm:p-12">
              
              {/* Header Group */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <motion.div 
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                >
                  <Zap className="w-6 h-6 sm:w-9 sm:h-9 text-[#FFD210] fill-[#FFD210]" />
                </motion.div>
                
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[1.6rem] sm:text-[2.5rem] font-black tracking-tight leading-none mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    Blinkit & Zwigato
                  </h3>
                  <p className="text-black/60 text-[11px] sm:text-[14px] font-bold uppercase tracking-wider">
                    CU Special — 15 Min Delivery
                  </p>
                </div>
              </div>

              {/* Feature Points Group */}
              <div className="space-y-3 sm:space-y-4 bg-black/[0.04] p-6 sm:p-8 rounded-[2rem] border border-black/5">
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
                    className="flex items-center gap-4"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3.5 h-3.5 text-[#FFD210] fill-[#FFD210]" />
                    </div>
                    <span className="text-[13.5px] sm:text-[16px] font-bold text-black tracking-tight">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Action Group */}
              <div className="flex items-center justify-center w-full mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAction}
                  className="w-full h-[60px] sm:h-[64px] bg-black text-white font-bold text-[17px] rounded-[22px] shadow-2xl flex items-center justify-center gap-3 transition-all active:opacity-90"
                >
                  Go to Store <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
