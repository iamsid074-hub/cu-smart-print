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
            mixBlendMode: "screen", 
            willChange: "opacity",
            transform: "translate3d(0,0,0)" // Force GPU layer
          }}
        >
          {/* 
            OPTIMIZED BLOBS: Lower blur handles better on mobile.
            Using larger sizes but tighter transforms to keep it strictly on edges.
          */}

          {/* Top Edge Blob */}
          <motion.div
            animate={{
              x: isProcessing ? ["-5%", "5%", "-5%"] : ["0%", "2%", "0%"],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-100px] left-[-20%] right-[-20%] h-[120px]"
            style={{
              background: "linear-gradient(90deg, #ff0f7b, #f89b29, #ff0f7b)",
              filter: "blur(30px)",
              opacity: isProcessing ? 0.7 : 0.5,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />

          {/* Bottom Edge Blob */}
          <motion.div
            animate={{
              x: isProcessing ? ["5%", "-5%", "5%"] : ["0%", "-2%", "0%"],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-110px] left-[-20%] right-[-20%] h-[130px]"
            style={{
              background: "linear-gradient(90deg, #00eeff, #8a2be2, #00eeff)",
              filter: "blur(35px)",
              opacity: isProcessing ? 0.6 : 0.4,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />

          {/* Left Edge Blob */}
          <motion.div
            animate={{
              y: isProcessing ? ["-5%", "5%", "-5%"] : ["0%", "2%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute left-[-100px] top-[-20%] bottom-[-20%] w-[110px]"
            style={{
              background: "linear-gradient(180deg, #ff0f7b, #8a2be2, #ff0f7b)",
              filter: "blur(30px)",
              opacity: isProcessing ? 0.6 : 0.4,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />

          {/* Right Edge Blob */}
          <motion.div
            animate={{
              y: isProcessing ? ["5%", "-5%", "10%"] : ["0%", "-2%", "0%"],
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
            className="absolute right-[-100px] top-[-20%] bottom-[-20%] w-[110px]"
            style={{
              background: "linear-gradient(180deg, #00eeff, #f89b29, #00eeff)",
              filter: "blur(30px)",
              opacity: isProcessing ? 0.6 : 0.4,
              willChange: "transform",
              transform: "translate3d(0,0,0)"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
