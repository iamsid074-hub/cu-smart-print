import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronUp } from "lucide-react";

interface MobileLockScreenProps {
  onUnlock: () => void;
}

export default function MobileLockScreen({ onUnlock }: MobileLockScreenProps) {
  const { user } = useAuth();
  const [time, setTime]       = useState(new Date());
  const [isDismissing, setIsDismissing] = useState(false);

  const touchStartY  = useRef(0);
  const touchStartT  = useRef(0);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ||
                    user?.user_metadata?.name?.split(" ")[0] || "";

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const dismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(onUnlock, 520);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartT.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStartT.current;
    const velocity = dy / dt;
    // Swipe up: either fast flick or >100px drag upward
    if (dy > 100 || velocity > 0.5) dismiss();
  };

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="lockscreen"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[50000] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={dismiss}
        >
          {/* Wallpaper */}
          <img
            src="/eos-v3-wallpaper-mobile.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          {/* Dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

          {/* Content */}
          <div
            className="relative flex flex-col items-center justify-between h-full"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 48px)", paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 32px)" }}
          >
            {/* ── Top: Time ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <p className="text-white/60 text-sm font-medium tracking-wide mb-2">{dateStr}</p>
              <p
                className="text-white font-extralight tracking-tight"
                style={{ fontSize: "clamp(88px, 22vw, 120px)", lineHeight: 1 }}
              >
                {timeStr}
              </p>
              {firstName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/50 text-lg font-light mt-4 tracking-wide"
                >
                  {firstName}'s iPhone
                </motion.p>
              )}
            </motion.div>

            {/* ── Notification area (empty, extends the lock screen feel) ── */}
            <div className="flex-1" />

            {/* ── Bottom: Swipe to unlock ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Animated chevrons */}
              <div className="flex flex-col items-center gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 0.9, 0.2], y: [4, 0, 4] }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18, ease: "easeInOut" }}
                  >
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  </motion.div>
                ))}
              </div>
              <p className="text-white/50 text-sm font-medium tracking-widest uppercase" style={{ letterSpacing: "0.15em" }}>
                Swipe up to unlock
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
