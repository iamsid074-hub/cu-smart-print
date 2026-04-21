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
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="pointer-events-none fixed inset-0 z-[8000] overflow-hidden"
          style={{ mixBlendMode: "screen" }}
        >
          {/* 
            To get the exact soft iOS 18 "wavy edge bleed", we use massive blurred blobs 
            drifting along the very perimeter of the screen. 
            Because they are pushed slightly off-screen, only their blurred edges bleed inwards.
          */}

          {/* Top Edge Blob - Orange/Pink */}
          <motion.div
            animate={{
              x: isProcessing ? ["-10%", "10%", "-10%"] : ["0%", "5%", "0%"],
              scaleY: isProcessing ? [1, 1.3, 1] : [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-40px] left-[-20%] right-[-20%] h-[120px]"
            style={{
              background: "linear-gradient(90deg, #ff0f7b, #f89b29, #ff0f7b)",
              filter: "blur(50px)",
              opacity: isProcessing ? 0.95 : 0.75,
            }}
          />

          {/* Bottom Edge Blob - Blue/Purple */}
          <motion.div
            animate={{
              x: isProcessing ? ["10%", "-10%", "10%"] : ["0%", "-5%", "0%"],
              scaleY: isProcessing ? [1, 1.4, 1] : [1, 1.1, 1],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-50px] left-[-20%] right-[-20%] h-[140px]"
            style={{
              background: "linear-gradient(90deg, #00eeff, #8a2be2, #00eeff)",
              filter: "blur(55px)",
              opacity: isProcessing ? 0.9 : 0.7,
            }}
          />

          {/* Left Edge Blob - Pink/Purple */}
          <motion.div
            animate={{
              y: isProcessing ? ["-10%", "10%", "-10%"] : ["0%", "5%", "0%"],
              scaleX: isProcessing ? [1, 1.5, 1] : [1, 1.1, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-40px] top-[-20%] bottom-[-20%] w-[120px]"
            style={{
              background: "linear-gradient(180deg, #ff0f7b, #8a2be2, #ff0f7b)",
              filter: "blur(50px)",
              opacity: isProcessing ? 0.85 : 0.65,
            }}
          />

          {/* Right Edge Blob - Teal/Orange */}
          <motion.div
            animate={{
              y: isProcessing ? ["10%", "-10%", "10%"] : ["0%", "-5%", "0%"],
              scaleX: isProcessing ? [1, 1.6, 1] : [1, 1.1, 1],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-40px] top-[-20%] bottom-[-20%] w-[120px]"
            style={{
              background: "linear-gradient(180deg, #00eeff, #f89b29, #00eeff)",
              filter: "blur(50px)",
              opacity: isProcessing ? 0.85 : 0.65,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
