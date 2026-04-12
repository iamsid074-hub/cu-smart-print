import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap, X, ArrowRight } from "lucide-react";

interface BlinkitAnnounceModalProps {
  onCheck: () => void;
}

export default function BlinkitAnnounceModal({ onCheck }: BlinkitAnnounceModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenAnnounced = localStorage.getItem("blinkit_announced_v1");
    if (!hasBeenAnnounced) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Slight delay for better UX
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("blinkit_announced_v1", "true");
    setIsOpen(false);
  };

  const handleAction = () => {
    localStorage.setItem("blinkit_announced_v1", "true");
    setIsOpen(false);
    onCheck();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[400px] bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Branded Header */}
            <div className="relative h-48 bg-[#FFD210] flex items-center justify-center overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -right-10 -top-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" 
                />
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                        <Zap className="w-8 h-8 text-[#FFD210] fill-[#FFD210]" />
                    </div>
                    <div className="text-black font-black text-2xl uppercase tracking-tighter italic">
                        Quick Delivery
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                    Blinkit & Zwigato <br /> Now Live!
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Need snacks or essentials? Get them delivered to your hostel room in under 15 minutes. High speed, low cost.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleAction}
                        className="w-full h-14 bg-[#FFD210] hover:bg-[#ffe04d] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
                    >
                        Try Quick Store 
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors text-sm"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>

            {/* Close Icon */}
            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-black transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
