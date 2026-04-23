import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { memo } from "react";

const SiriEdgeGlow = memo(function SiriEdgeGlow() {
  const { state } = useVoiceAssistant();

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
          className="pointer-events-none fixed inset-0 z-[8000]"
          style={{ 
            mixBlendMode: "screen",
            contain: "strict",
            maskImage: "radial-gradient(circle at 50% 50%, transparent 85%, black 100%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 85%, black 100%)",
          }}
        >
          {/* Top Edge */}
          <motion.div
            animate={{ opacity: isProcessing ? [0.7, 0.95, 0.7] : [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-40px] left-[-10%] right-[-10%] h-[80px]"
            style={{
              background: "linear-gradient(90deg, #ff0f7b, #f89b29, #ff0f7b)",
              filter: "blur(20px)",
              willChange: "opacity",
              transform: "translateZ(0)",
            }}
          />

          {/* Bottom Edge */}
          <motion.div
            animate={{ opacity: isProcessing ? [0.65, 0.9, 0.65] : [0.45, 0.75, 0.45] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-50px] left-[-10%] right-[-10%] h-[100px]"
            style={{
              background: "linear-gradient(90deg, #00eeff, #8a2be2, #00eeff)",
              filter: "blur(25px)",
              willChange: "opacity",
              transform: "translateZ(0)",
            }}
          />

          {/* Left Edge */}
          <motion.div
            animate={{ opacity: isProcessing ? [0.6, 0.85, 0.6] : [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-40px] top-[-10%] bottom-[-10%] w-[80px]"
            style={{
              background: "linear-gradient(180deg, #ff0f7b, #8a2be2, #ff0f7b)",
              filter: "blur(30px)",
              willChange: "opacity",
              transform: "translateZ(0)",
            }}
          />

          {/* Right Edge */}
          <motion.div
            animate={{ opacity: isProcessing ? [0.6, 0.85, 0.6] : [0.4, 0.7, 0.4] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-40px] top-[-10%] bottom-[-10%] w-[80px]"
            style={{
              background: "linear-gradient(180deg, #00eeff, #f89b29, #00eeff)",
              filter: "blur(30px)",
              willChange: "opacity",
              transform: "translateZ(0)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SiriEdgeGlow;
