import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloatingMiniBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-24 right-4 z-40 sm:bottom-8 sm:right-6"
      >
        <motion.div
          animate={{ boxShadow: [
            "0 4px 20px rgba(255,69,0,0.3)",
            "0 4px 30px rgba(255,69,0,0.5)",
            "0 4px 20px rgba(255,69,0,0.3)",
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0a00, #2d1200)" }}
        >
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center z-10 transition-all"
          >
            <X className="w-2.5 h-2.5 text-white/70" />
          </button>

          <Link to="/pasta-offer" className="flex items-center gap-3 p-3 pr-4">
            {/* Mini pasta image */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-orange-400/20">
              <img src="/banners/red_sauce_pasta.png" alt="Pasta" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Limited Offer</span>
              <span className="text-sm font-black text-white leading-tight">Pasta @ {"\u20B9"}99</span>
              <span className="text-[10px] text-orange-200/60 font-medium flex items-center gap-1 mt-0.5">
                Order Now <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
