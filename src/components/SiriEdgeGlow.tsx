import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

export default function SiriEdgeGlow() {
  const { state } = useVoiceAssistant();

  // Directly map to state — AnimatePresence handles the exit delay natively
  const isActive = state !== "idle" && state !== "error";
  const isProcessing = state === "processing";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} // Premium cubic-bezier
          className="pointer-events-none fixed inset-0 z-[8000] overflow-hidden"
          style={{ 
            willChange: "opacity",
            transform: "translate3d(0,0,0)", // Force GPU layer
            background: "transparent"
          }}
        >
          {/* 
            ULTRA-OPTIMIZED BLOBS: 
            Reducing to Top and Bottom only significantly cuts down on mobile GPU workload.
            Removed mix-blend-mode: screen as it is the #1 cause of refresh-rate lag.
          */}

          {/* Top Edge Glow */}
          <motion.div
            animate={{
              x: isProcessing ? ["-2%", "2%", "-2%"] : ["0%", "1%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-110px] left-[-20%] right-[-20%] h-[130px]"
            style={{
              background: "linear-gradient(90deg, rgba(255,15,123,0.4), rgba(248,155,41,0.4), rgba(255,15,123,0.4))",
              filter: "blur(30px)",
              opacity: isProcessing ? 0.8 : 0.6,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />

          {/* Bottom Edge Glow */}
          <motion.div
            animate={{
              x: isProcessing ? ["2%", "-2%", "2%"] : ["0%", "-1%", "0%"],
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-120px] left-[-20%] right-[-20%] h-[140px]"
            style={{
              background: "linear-gradient(90deg, rgba(0,238,255,0.35), rgba(138,43,226,0.35), rgba(0,238,255,0.35))",
              filter: "blur(35px)",
              opacity: isProcessing ? 0.7 : 0.5,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
