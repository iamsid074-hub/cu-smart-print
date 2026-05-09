/**
 * EOSBootAnimation — Eclipsed OS v3 Cinematic Boot Screen
 *
 * Shows once per session (stored in sessionStorage).
 * Timeline:
 *   0.0s  — Black screen, planet starts as dark sphere
 *   0.5s  — Corona / eclipse glow builds around planet
 *   1.8s  — "ECLIPSED OS" text fades + rises  
 *   2.8s  — "v3" sub-label + version tag appear
 *   3.8s  — Whole scene pulses, then slides upward and dissolves
 *   4.4s  — onComplete() fires → desktop UI animates in
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export default function EOSBootAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<"eclipse" | "text" | "exit" | "done">("eclipse");
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRef.current.push(t);
  };

  useEffect(() => {
    // Play startup sound
    if (audioRef.current) {
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(err => console.log("Audio autoplay blocked or failed:", err));
    }

    // Phase timeline
    addTimer(() => setPhase("text"),   1600);
    addTimer(() => setPhase("exit"),   4800);
    addTimer(() => {
      setPhase("done");
      onComplete();
    }, 5600);

    return () => timerRef.current.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="eos-boot"
        initial={{ opacity: 1 }}
        animate={phase === "exit" ? { opacity: 0, y: -40 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
        style={{ background: "#000000" }}
      >
        {/* Startup Sound Source */}
        <audio ref={audioRef} src="/sound.mp4.mp3" preload="auto" />

        {/* ── Subtle starfield ─────────────────────────────────────────── */}
        <StarField />

        {/* ── Eclipse Scene ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center select-none w-full">
          <RealPlanet />

          {/* ── Text Reveal ──────────────────────────────────────────── */}
          <AnimatePresence>
            {(phase === "text" || phase === "exit") && (
              <motion.div
                key="eos-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center -mt-8"
              >
                {/* Glowing top separator */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-48 h-px mb-6"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.8), rgba(216,180,254,1), rgba(168,85,247,0.8), transparent)",
                    boxShadow: "0 0 12px rgba(168,85,247,0.6), 0 0 24px rgba(168,85,247,0.3)",
                  }}
                />

                {/* THE REPUBLIC OF EOS — letter stagger */}
                <RepublicText />

                {/* Glowing bottom separator */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-32 h-px mt-6"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)",
                    boxShadow: "0 0 8px rgba(168,85,247,0.3)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Real Planet Image with Burning Effects ───────────────────────────────── */
function RealPlanet() {
  return (
    <motion.div 
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 4, ease: "easeOut" }}
      className="relative flex items-center justify-center w-full max-w-[800px] aspect-video"
    >
      {/* ── LIVE HEATING WAVES (Concentric ripples) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.8], 
              opacity: [0, 0.4, 0],
              borderWidth: ["2px", "8px"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 1,
              ease: "easeOut" 
            }}
            className="absolute rounded-full border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            style={{ width: 380, height: 380, filter: "blur(8px)" }}
          />
        ))}
      </div>

      {/* 1. Heat Distortion Layer */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
          filter: ["blur(20px)", "blur(40px)", "blur(20px)"]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/20 mix-blend-screen"
      />

      {/* 2. Burning Flame Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: Math.cos(i * 15 * (Math.PI / 180)) * (180 + Math.random() * 60),
              y: Math.sin(i * 15 * (Math.PI / 180)) * (180 + Math.random() * 60),
              rotate: 360
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
            style={{ 
              boxShadow: "0 0 15px #a855f7, 0 0 30px #d8b4fe",
              filter: "blur(1px)"
            }}
          />
        ))}
      </div>

      {/* 3. The Central realistic eclipse — Static and Solid */}
      <div className="relative z-10">
        <img 
          src="/eos-eclipse.png" 
          alt="EOS Eclipse" 
          className="w-[400px] h-auto object-contain"
          style={{
            filter: "drop-shadow(0 0 100px rgba(168,85,247,0.6))",
            maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 70%)"
          }}
        />
      </div>

      {/* 4. Swirling Corona Glow */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[500px] h-[500px] border-[20px] border-purple-500/10 rounded-full blur-[60px]"
      />
    </motion.div>
  );
}



/* ─── Star Field (pure CSS, zero JS loops) ──────────────────────────────────── */
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "rgba(216,180,254,0.7)",
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── "THE REPUBLIC OF EOS" — Letter Stagger ───────────────────────────────── */
function RepublicText() {
  const text = "THE REPUBLIC OF EOS";
  const letters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.1,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex items-center"
      style={{ gap: 0 }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={child}
          style={{
            display: "inline-block",
            fontSize: letter === " " ? "1rem" : "1.15rem",
            fontWeight: 800,
            letterSpacing: "0.3em",
            fontFamily: "'SF Pro Display', 'Inter', sans-serif",
            color: "transparent",
            background: "linear-gradient(180deg, #ffffff 0%, #d8b4fe 60%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            width: letter === " " ? "1.2em" : "auto",
            textShadow: "none",
            filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
