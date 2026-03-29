import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function FloatingMiniBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  if (dismissed || pathname === "/pasta-offer") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-24 right-4 z-40 sm:bottom-8 sm:right-6 pointer-events-auto"
      >
        <motion.div
           animate={{
            y: [0, -4, 0],
            boxShadow: [
              "0 10px 30px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
              "0 15px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
              "0 10px 30px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-[20px] overflow-hidden ios-glass border border-white/60 p-0.5"
        >
          {/* Subtle colored glow inside */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/10 rounded-full blur-[30px] pointer-events-none" />
          
          <div className="relative bg-white/30 rounded-[18px]">
            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center z-10 transition-all backdrop-blur-md"
            >
              <X className="w-3 h-3 text-[#1D1D1F]/70" />
            </button>

            <Link to="/pasta-offer" className="flex items-center gap-3 p-3 pr-5">
              {/* Mini pasta image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm border border-black/5">
                <img src="/banners/red_sauce_pasta.png" alt="Pasta" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-wider mb-0.5">Limited Offer</span>
                <span className="text-[15px] font-bold text-[#1D1D1F] leading-tight tracking-tight">Pasta @ {"\u20B9"}99</span>
                <span className="text-[11px] font-semibold text-[#007AFF] flex items-center gap-1 mt-0.5">
                  Order Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
