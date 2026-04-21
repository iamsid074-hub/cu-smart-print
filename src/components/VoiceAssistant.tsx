import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useVoiceAssistant, type SafyState } from "@/hooks/useVoiceAssistant";
import { useLocation } from "react-router-dom";

// ─── Pill colour per state ────────────────────────────────────────────────────
const PILL_COLOR: Record<SafyState, string> = {
  idle:       "transparent",
  listening:  "#ef4444",
  processing: "#f59e0b",
  speaking:   "#10b981",
  error:      "#dc2626",
};

const PILL_LABEL: Record<SafyState, string> = {
  idle:       "",
  listening:  "Listening…",
  processing: "Thinking…",
  speaking:   "Speaking…",
  error:      "Mic error — try again",
};

// ─── Small waveform ───────────────────────────────────────────────────────────
function Wave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2.5px] h-4">
      {[0.5, 0.9, 1, 0.7, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white"
          animate={active ? { scaleY: [h, 1, h * 0.4, 1, h] } : { scaleY: 0.25 }}
          transition={{
            repeat: Infinity,
            duration: 0.65 + i * 0.07,
            delay: i * 0.06,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center", height: "100%" }}
        />
      ))}
    </div>
  );
}

export default function VoiceAssistant() {
  const { state, transcript, response, errorMsg, isSupported, activate, dismiss } =
    useVoiceAssistant();
  const location = useLocation();

  // Hide on pages that don't need it
  const hiddenPaths = ["/", "/login", "/reset-password", "/pasta-offer"];
  if (!isSupported || hiddenPaths.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/admin")) return null;

  const isActive = state !== "idle";
  const pillColor = PILL_COLOR[state];

  return (
    <>
      {/* ── Dynamic Island SAFY pill (slides down from top when active) ─────── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="safy-pill"
            initial={{ opacity: 0, y: -60, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            className="fixed top-4 left-1/2 z-[500] flex flex-col items-center"
            style={{ transform: "translateX(-50%)" }}
          >
            {/* Pill */}
            <motion.div
              animate={{ backgroundColor: pillColor }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
              style={{ minWidth: 160 }}
            >
              {/* Mic dot */}
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Mic className="w-3 h-3 text-white" strokeWidth={3} />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[10px] font-black tracking-[0.15em] uppercase">
                    SAFY
                  </span>
                  {(state === "listening" || state === "speaking") && (
                    <Wave active />
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={state + transcript + response + errorMsg}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="text-white/75 text-[10px] font-medium leading-tight mt-0.5 truncate"
                    style={{ maxWidth: 170 }}
                  >
                    {errorMsg
                      ? errorMsg
                      : state === "speaking" && response
                      ? response
                      : state === "processing" && transcript
                      ? `"${transcript}"`
                      : PILL_LABEL[state]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/35 transition-colors"
                aria-label="Dismiss SAFY"
              >
                <X className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
              </button>
            </motion.div>

            {/* Long response card drops below pill */}
            <AnimatePresence>
              {state === "speaking" && response.length > 50 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 6, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="mt-2 rounded-2xl px-5 py-3.5 text-white/90 text-sm font-medium leading-relaxed shadow-2xl max-w-[300px] text-center"
                  style={{
                    background: "rgba(15,15,20,0.97)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {response}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Static SAFY button (no layout animation = no glitch) ─────────────── */}
      {!isActive && (
        <button
          id="safy-voice-btn"
          onClick={activate}
          aria-label="Talk to SAFY"
          className="fixed right-5 z-[300] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-[0_6px_28px_rgba(99,102,241,0.5)] active:scale-95 transition-transform select-none"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 104px)",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Gentle idle pulse ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(99,102,241,0.35)",
              animation: "safy-pulse 2.2s ease-in-out infinite",
            }}
          />
          <Mic className="w-4 h-4 text-white relative z-10" strokeWidth={2.5} />
          <span className="text-white text-[11px] font-black tracking-widest uppercase relative z-10">
            SAFY
          </span>
        </button>
      )}

      {/* Keyframe for idle pulse — injected once */}
      <style>{`
        @keyframes safy-pulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50%       { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
