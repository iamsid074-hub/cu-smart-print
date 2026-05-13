import { useState, useEffect } from "react";
import { Wifi, BatteryFull } from "lucide-react";

export default function MobileStatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).replace(/ am| pm| AM| PM/gi, "");

  return (
    <div className="fixed top-0 left-0 right-0 z-[100000] pointer-events-none px-7 pt-[calc(env(safe-area-inset-top,12px)+16px)] flex justify-between items-center text-white font-semibold text-[15px]">
      {/* Time */}
      <div className="w-[90px] flex justify-start tracking-wide" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
        {timeStr}
      </div>

      {/* Spacer for Dynamic Island */}
      <div className="flex-1" />

      {/* Status Icons */}
      <div className="w-[90px] flex justify-end items-center gap-[5px]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)", dropShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
        {/* Cellular Bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* iOS Wi-Fi Icon */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
          <path d="M8.5 11.5C9.32843 11.5 10 10.8284 10 10C10 9.17157 9.32843 8.5 8.5 8.5C7.67157 8.5 7 9.17157 7 10C7 10.8284 7.67157 11.5 8.5 11.5Z" fill="currentColor"/>
          <path d="M4 6.5C6.48528 4.5 10.5147 4.5 13 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M1.5 2.5C5.36574 -0.166667 11.6343 -0.166667 15.5 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        {/* iOS Battery Icon */}
        <div className="relative ml-1 flex items-center" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))", width: "24px", height: "12px" }}>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            {/* Outline */}
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
            {/* Tip */}
            <path d="M23 4C23.5523 4 24 4.44772 24 5V7C24 7.55228 23.5523 8 23 8V4Z" fill="currentColor" fillOpacity="0.4" />
            {/* Fill */}
            <rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
