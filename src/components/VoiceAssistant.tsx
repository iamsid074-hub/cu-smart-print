import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

// ─── Gradient per state ──────────────────────────────────────────────────────
const STATE_BG: Record<string, string> = {
  waking:     "rgba(99,102,241,0.95)",
  listening:  "rgba(239,68,68,0.95)",
  processing: "rgba(245,158,11,0.95)",
  speaking:   "rgba(16,185,129,0.95)",
  error:      "rgba(239,68,68,0.9)",
};

const STATE_LABEL: Record<string, string> = {
  waking:     "Hey! What can I do for you?",
  listening:  "Listening…",
  processing: "Thinking…",
  speaking:   "",
  error:      "Try again",
};

// ─── Waveform bars that animate while speaking/listening ─────────────────────
function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[0.4, 0.7, 1, 0.7, 0.5, 0.8, 0.6].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white"
          animate={active ? { scaleY: [h, 1, h * 0.5, 1, h] } : { scaleY: 0.3 }}
          transition={{
            repeat: Infinity,
            duration: 0.7 + i * 0.08,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center", height: "100%" }}
        />
      ))}
    </div>
  );
}

export default function VoiceAssistant() {
  const { state, transcript, response, isSupported, dismiss } = useVoiceAssistant();

  if (!isSupported) return null;

  const isActive = state !== "idle";
  const bg = STATE_BG[state] ?? STATE_BG.listening;

  // ─── Compact Dynamic Island pill (visible only when SAFY is active) ────────
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="safy-island"
          // Position: directly inside / below the top Dynamic Island notch
          initial={{ opacity: 0, scaleX: 0.3, scaleY: 0.3, y: -12 }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1, y: 0 }}
          exit={{ opacity: 0, scaleX: 0.3, scaleY: 0.3, y: -12 }}
          transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.9 }}
          className="fixed top-3 left-1/2 z-[400]"
          style={{
            transform: "translateX(-50%)",
            transformOrigin: "top center",
          }}
        >
          <motion.div
            animate={{ backgroundColor: bg }}
            transition={{ duration: 0.3 }}
            className="relative flex items-center gap-3 px-4 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            style={{ minWidth: 180, maxWidth: "90vw" }}
          >
            {/* SAFY mic icon */}
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Mic className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>

            {/* Content area */}
            <div className="flex flex-col min-w-0 flex-1">
              {/* Name row */}
              <div className="flex items-center gap-2">
                <span className="text-white text-[11px] font-black tracking-widest uppercase">
                  SAFY
                </span>
                {(state === "listening" || state === "speaking" || state === "waking") && (
                  <WaveBars active={state === "listening" || state === "speaking"} />
                )}
              </div>

              {/* Dynamic status / transcript / response */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={response || transcript || state}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-white/80 text-[11px] font-medium leading-tight mt-0.5 truncate max-w-[200px]"
                >
                  {response
                    ? response
                    : transcript
                    ? transcript
                    : STATE_LABEL[state] ?? ""}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Dismiss X */}
            <button
              onClick={dismiss}
              className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/35 transition-colors"
              aria-label="Dismiss SAFY"
            >
              <X className="w-3 h-3 text-white" strokeWidth={3} />
            </button>
          </motion.div>

          {/* Full command overlay — slides down from island when speaking long responses */}
          <AnimatePresence>
            {state === "speaking" && response.length > 40 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.85 }}
                animate={{ opacity: 1, y: 8, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.85 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="absolute top-full left-1/2 mt-2 w-72"
                style={{ transform: "translateX(-50%)", transformOrigin: "top center" }}
              >
                <div
                  className="rounded-2xl px-5 py-4 text-white/90 text-sm font-medium leading-relaxed shadow-2xl"
                  style={{ background: "rgba(20,20,25,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {response}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
