import { Mic } from "lucide-react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useLocation } from "react-router-dom";

export default function VoiceAssistant() {
  const { state, isSupported, activate } = useVoiceAssistant();
  const location = useLocation();

  // Hide on pages that don't need it
  const hiddenPaths = ["/", "/login", "/reset-password", "/pasta-offer"];
  if (!isSupported || hiddenPaths.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/admin")) return null;

  // UI for the Dynamic Island is now handled natively inside TopDynamicIsland.tsx
  // We only render the floating activation button here.
  
  const isActive = state !== "idle";
  if (isActive) return null; // Hide the trigger button while the island is active

  return (
    <>
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
