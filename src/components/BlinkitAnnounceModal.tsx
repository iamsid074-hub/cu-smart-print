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
    const timer = setTimeout(() => setIsOpen(true), 1000);
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
        <div className="fixed bottom-0 left-0 right-0 z-[10001] flex justify-center pointer-events-none p-0 sm:p-6">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[600px] bg-[#FFD210] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(255,210,16,0.3)] pointer-events-auto overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center p-6 sm:p-8 gap-6">
                {/* Visual Icon */}
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg rotate-12 shrink-0">
                    <Zap className="w-8 h-8 text-[#FFD210] fill-[#FFD210]" />
                </div>

                {/* Text Content */}
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none mb-1">
                        Blinkit & Zwigato Live
                    </h3>
                    <p className="text-black/70 text-sm font-bold">
                        Essentials delivered in 15 mins to your hostel.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleAction}
                        className="flex-1 sm:flex-none px-8 h-12 bg-white text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                        Try Now <ArrowRight className="w-4 h-4" />
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
