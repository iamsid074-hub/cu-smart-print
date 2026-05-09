import { useState, useEffect, useRef } from "react";
import { Wifi, BatteryMedium } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface DesktopMenuBarProps {
  notification?: string | null;
}

// Status type for the Face ID suffix
type FaceStatus = "detecting" | "detected" | "not_detected" | "success";

const STATUS_CONFIG: Record<FaceStatus, { text: string; color: string; glow?: string }> = {
  detecting:    { text: "is detecting...",   color: "text-white/50" },
  detected:     { text: "is detected",       color: "text-blue-400",  glow: "0 0 20px rgba(96,165,250,0.5)" },
  not_detected: { text: "is not detected",   color: "text-red-400",   glow: "0 0 20px rgba(239,68,68,0.5)" },
  success:      { text: "Welcome back",      color: "text-white" },
};

export default function DesktopMenuBar({ notification }: DesktopMenuBarProps) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState("");
  const [isFaceIdActive, setIsFaceIdActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("detecting");

  const successLock = useRef(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || "Daniela";

  useEffect(() => {
    const onScanStart = () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      successLock.current = false;
      setIsFaceIdActive(true);
      setFaceStatus("detecting");
    };

    const onScanEnd = () => {
      if (successLock.current) return;
      collapseTimer.current = setTimeout(() => {
        if (successLock.current) return;
        setIsFaceIdActive(false);
        setFaceStatus("detecting");
      }, 800);
    };

    const onUnlockSuccess = () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      successLock.current = true;

      // Transition to Success message
      setIsFaceIdActive(true);
      setFaceStatus("success");

      // Auto-collapse after 2.5s
      collapseTimer.current = setTimeout(() => {
        successLock.current = false;
        setIsFaceIdActive(false);
        setFaceStatus("detecting");
      }, 2500);
    };

    const onNoFace = () => setFaceStatus("not_detected");
    const onFaceFound = () => setFaceStatus("detecting");

    window.addEventListener("face_id_scan_start", onScanStart);
    window.addEventListener("face_id_scan_end", onScanEnd);
    window.addEventListener("wallet_unlock_success", onUnlockSuccess);
    window.addEventListener("face_id_no_face", onNoFace);
    window.addEventListener("face_id_face_found", onFaceFound);

    return () => {
      window.removeEventListener("face_id_scan_start", onScanStart);
      window.removeEventListener("face_id_scan_end", onScanEnd);
      window.removeEventListener("wallet_unlock_success", onUnlockSuccess);
      window.removeEventListener("face_id_no_face", onNoFace);
      window.removeEventListener("face_id_face_found", onFaceFound);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
      };
      setTimeStr(now.toLocaleDateString('en-US', options).replace(/,/g, ''));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const showOverlay = isFaceIdActive;

  return (
    <>
      {/* Primary menu bar */}
      <div
        id="desktop-menu-bar"
        className="fixed top-0 left-0 right-0 h-[40px] bg-[#535353]/40 backdrop-blur-[50px] flex items-center justify-between px-5 text-[14px] text-white/95 z-[10000] select-none cursor-default"
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 font-bold text-[15px] cursor-default select-none">
            <span className="tracking-tighter text-white">CU</span>
            <span className="text-white">Bazzar</span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          <Wifi className="w-[16px] h-[16px]" />
          <BatteryMedium className="w-[18px] h-[18px]" />
          <div className="font-medium select-none cursor-default">{timeStr}</div>

          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute top-[20px] right-0 bg-[#ff3b30]/10 backdrop-blur-2xl border border-[#ff3b30]/30 px-4 py-2 rounded-2xl shadow-2xl z-[100] min-w-[280px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse shadow-[0_0_8px_#ff3b30]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-white leading-tight">
                    {notification}
                  </span>
                </div>
                <div className="absolute -top-[5px] right-[40px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#ff3b30]/30" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2nd stripe — Liquid Background Morph */}
      <AnimatePresence>
        {isFaceIdActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[40px] left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center justify-center w-[420px] h-[40px]"
          >
            <svg viewBox="0 0 420 40" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path
                initial={{ d: "M0,0 C40,0 50,0 80,0 L340,0 C370,0 380,0 420,0 Z" }}
                animate={{ d: "M0,0 C40,0 50,40 80,40 L340,40 C370,40 380,0 420,0 Z" }}
                exit={{ d: "M0,0 C40,0 50,0 80,0 L340,0 C370,0 380,0 420,0 Z" }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30, 
                  mass: 0.8 
                }}
                fill="rgba(83,83,83,0.4)"
                style={{ backdropFilter: 'blur(50px)' }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Face ID overlay — centred across BOTH bars (top:0, h:80px) */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-[10001] pointer-events-none flex items-center justify-center"
            style={{ height: 80 }}
          >
            {faceStatus === "success" ? (
              <motion.div 
                initial={{ scale: 0.9, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center gap-[8px] relative"
              >
                {/* Decorative Sparkles — Spread on both sides */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, 1.2, 0.6],
                        x: i < 8 ? -(60 + Math.random() * 80) : (60 + Math.random() * 80),
                        y: (Math.random() - 0.5) * 50
                      }}
                      transition={{ 
                        duration: 2 + Math.random(), 
                        repeat: Infinity,
                        delay: i * 0.08
                      }}
                      className="absolute w-1 h-1 rounded-full"
                      style={{ 
                        background: i % 2 === 0 ? '#ff9e7a' : '#ff6b6b',
                        boxShadow: `0 0 12px ${i % 2 === 0 ? '#ff9e7a' : '#ff6b6b'}`
                      }}
                    />
                  ))}
                </div>

                <span className="text-[19px] font-semibold text-[#e0e0ff] tracking-tight">
                  Welcome back,
                </span>
                <span className="text-[19px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9e7a] to-[#ff6b6b] tracking-tight">
                  {userName}
                </span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-[6px]">
                {/* "Face ID" — Bright white for emphasis */}
                <span className="text-[17px] font-extrabold text-white tracking-tight">Face ID</span>

                {/* Animated suffix — slides vertically inside clipped container */}
                <div className="overflow-hidden flex items-center" style={{ height: 26 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={faceStatus}
                      initial={{ y: 26, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -26, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.5 }}
                      className="flex items-center gap-[4px]"
                    >
                      <span className="text-[17px] font-semibold text-white/50">is</span>
                      {faceStatus === "not_detected" && (
                        <span className="text-[17px] font-semibold text-white/50">not</span>
                      )}
                      <motion.span
                        animate={faceStatus === "detecting" ? { opacity: [0.6, 1, 0.6] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`text-[17px] font-bold ${
                          faceStatus === "detected"     ? "text-blue-400" :
                          faceStatus === "not_detected" ? "text-red-400"  :
                          "text-white/50"
                        }`}
                        style={{
                          textShadow: faceStatus === "detected" ? '0 0 15px rgba(96,165,250,0.5)' : 
                                      faceStatus === "not_detected" ? '0 0 15px rgba(239,68,68,0.5)' : 'none'
                        }}
                      >
                        {faceStatus === "detecting" ? "detecting..." : "detected"}
                      </motion.span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
