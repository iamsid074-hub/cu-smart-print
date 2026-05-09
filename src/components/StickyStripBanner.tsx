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
        style={{
          background: "linear-gradient(90deg, #1A1A1A, #2D2D2D, #1A1A1A)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
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
                <span
                  key={i}
                  className="text-[11px] sm:text-xs font-bold text-white tracking-wider flex items-center gap-3"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    WORK IN PROGRESS
                  </span>
                  <span className="opacity-60">•</span>
                  MOBILE EXPERIENCE UNDER DEVELOPMENT
                  <span className="opacity-60">•</span>
                  STAY TUNED FOR EOS v3 MOBILE
                </span>
              ))}
            </motion.div>
          </div>
        </Link>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all z-10"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
