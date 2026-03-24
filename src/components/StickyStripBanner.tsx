import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function StickyStripBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-[3.5rem] left-0 right-0 z-40 overflow-hidden"
        style={{ background: "linear-gradient(90deg, #FF6B00, #FF4500, #FF6B00)" }}
      >
        <Link to="/pasta-offer" className="block relative">
          {/* Marquee animation */}
          <div className="flex items-center h-8 sm:h-9 overflow-hidden">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 18 }}
              className="flex items-center gap-8 sm:gap-12 whitespace-nowrap w-max"
            >
              {[...Array(6)].map((_, i) => (
                <span key={i} className="text-[11px] sm:text-xs font-black text-white tracking-wider flex items-center gap-2">
                  <span className="text-sm">{"\uD83D\uDD25"}</span>
                  Pasta @ {"\u20B9"}99 {"\u2013"} Limited Time Offer!
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  Flavour Factory Special
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  Red {"\u2022"} White {"\u2022"} Mixed Sauce
                </span>
              ))}
            </motion.div>
          </div>
        </Link>

        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all z-10"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
