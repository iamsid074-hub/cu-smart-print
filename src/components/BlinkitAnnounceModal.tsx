import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap, X, ArrowRight } from "lucide-react";

interface BlinkitAnnounceModalProps {
  onCheck: () => void;
}

export default function BlinkitAnnounceModal({ onCheck }: BlinkitAnnounceModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Appear every time user enters the site
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAction = () => {
    setIsOpen(false);
    onCheck();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[10001] flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full bg-[#FFD210] pointer-events-auto overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            {/* Minimalist Top Accent */}
            <div className="h-1 bg-white/30 w-full" />

            <div className="max-w-[1400px] mx-auto px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Side: Brand & Text */}
              <div className="flex items-center gap-4 text-black">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Zap className="w-6 h-6 text-[#FFD210] fill-[#FFD210]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight leading-none mb-1">
                    Blinkit & Zwigato <span className="text-white bg-black px-2 py-0.5 rounded text-[10px] ml-2 align-middle">LIVE</span>
                  </h3>
                  <p className="text-black/80 text-xs sm:text-sm font-bold">
                    Superfast hostel delivery now active. Get your essentials in 15 mins.
                  </p>
                </div>
              </div>

              {/* Right Side: Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleAction}
                  className="flex-1 sm:flex-none px-8 py-3 bg-black text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl hover:bg-zinc-900"
                >
                  Go to Store <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-3 text-black/40 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
