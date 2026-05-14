import { useState, useEffect } from "react";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { Zap } from "lucide-react";


export default function MobileStatusBar() {
  const [time, setTime] = useState(new Date());
  const { batteryLevel, isCharging, isOnline, isBatteryAvailable } = useSystemStatus();
  const [isChargingAlert, setIsChargingAlert] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const handleStart = () => setIsChargingAlert(true);
    const handleEnd   = () => setIsChargingAlert(false);
    window.addEventListener("di_charging_start", handleStart);
    window.addEventListener("di_charging_end",   handleEnd);
    return () => {
      clearInterval(t);
      window.removeEventListener("di_charging_start", handleStart);
      window.removeEventListener("di_charging_end",   handleEnd);
    };
  }, []);

  const timeStr = time
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/ am| pm| AM| PM/gi, "");

  return (
    // pointer-events-none so the island below can receive touches
    // z-index matches island wrapper so neither overlaps the other
    <div
      className="fixed top-0 left-0 right-0 z-[89999] pointer-events-none flex justify-between items-center text-black font-semibold text-[15px] px-6 h-[40px]"
      style={{ marginTop: "calc(var(--sat, env(safe-area-inset-top, 20px)) + 12px)" }}
    >
      {/* ── Time (left) ── */}
      <span
        className="tracking-wide transition-all duration-500"
        style={{
          transform: isChargingAlert ? "scale(0.75)" : "scale(1)",
          transformOrigin: "left center",
          display: "inline-block",
        }}
      >
        {timeStr}
      </span>

      {/* ── Right icons ── */}
      <div className="flex items-center gap-[6px]">

        {/* Cellular bars — hidden during charging alert, dims when offline */}
        {!isChargingAlert && (
          <svg
            width="17" height="12" viewBox="0 0 18 12"
            fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-500"
          >
            <rect x="0"  y="8" width="3" height="4"  rx="1" opacity={isOnline ? 1 : 0.35} />
            <rect x="5"  y="5" width="3" height="7"  rx="1" opacity={isOnline ? 1 : 0.35} />
            <rect x="10" y="2" width="3" height="10" rx="1" opacity={isOnline ? 1 : 0.35} />
            <rect x="15" y="0" width="3" height="12" rx="1" opacity={isOnline ? 1 : 0.35} />
          </svg>
        )}

        {/* Wi-Fi — hidden during charging alert OR when offline */}
        {isOnline && !isChargingAlert && (
          <svg
            width="16" height="12" viewBox="0 0 17 12"
            fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.5 11.5C9.32843 11.5 10 10.8284 10 10C10 9.17157 9.32843 8.5 8.5 8.5C7.67157 8.5 7 9.17157 7 10C7 10.8284 7.67157 11.5 8.5 11.5Z" fill="currentColor"/>
            <path d="M4 6.5C6.48528 4.5 10.5147 4.5 13 6.5"          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M1.5 2.5C5.36574 -0.166667 11.6343 -0.166667 15.5 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        )}

        {/* Battery — ALWAYS visible; scales up prominently during charging alert */}
        <div
          className="relative flex items-center transition-all duration-500"
          style={{
            transform: isChargingAlert ? "scale(0.75)" : "scale(1)",
            transformOrigin: "right center",
          }}
        >
          {isBatteryAvailable ? (
            <>
              {/* Shell */}
              <div className="w-[24px] h-[11px] border border-black/35 rounded-[3.5px] relative overflow-hidden">
                {/* Fill — anchored left/top/bottom, reduces from right */}
                <div
                  className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                  style={{
                    width: `${Math.max(4, batteryLevel * 100)}%`,
                    background: isCharging
                      ? "#34C759"
                      : batteryLevel <= 0.2
                        ? "#FF453A"
                        : "black",
                  }}
                />
                {/* Lightning bolt overlay when charging */}
                {isCharging && (
                  <Zap
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-current text-white"
                    style={{ width: 9, height: 9 }}
                  />
                )}
              </div>
              {/* Nub */}
              <div className="w-[1.5px] h-[4px] bg-black/35 rounded-r-[1px] ml-[1px]" />
            </>
          ) : (
            // Neutral Safari Fallback
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-[24px] h-[11px] border border-black/30 rounded-[3.5px] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[50%] bg-black/40" />
              </div>
              <div className="w-[1.5px] h-[4px] bg-black/30 rounded-r-[1px] -ml-[5.5px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
