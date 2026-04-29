import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

const GAME_DURATION = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "idle" | "countdown" | "playing" | "result";

export default function NumberBlitz() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [grid, setGrid] = useState<number[]>(shuffle([1,2,3,4,5,6,7,8,9]));
  const [next, setNext] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("nb_hs") || 0));
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [correctFlash, setCorrectFlash] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [isNewHS, setIsNewHS] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cdRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    cdRef.current = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(cdRef.current!); beginGame(); }
      else setCountdown(c);
    }, 1000);
  };

  const beginGame = useCallback(() => {
    setScore(0); setRound(1); setNext(1);
    setGrid(shuffle([1,2,3,4,5,6,7,8,9]));
    setTimeLeft(GAME_DURATION); setIsNewHS(false);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const endGame = useCallback(() => {
    setPhase("result");
    setScore(prev => {
      if (prev > Number(localStorage.getItem("nb_hs") || 0)) {
        localStorage.setItem("nb_hs", String(prev));
        setHighScore(prev);
        setIsNewHS(true);
      }
      return prev;
    });
  }, []);

  const handleTap = (num: number) => {
    if (phase !== "playing") return;
    if (num === next) {
      setCorrectFlash(num);
      setTimeout(() => setCorrectFlash(null), 280);
      if (next === 9) {
        setScore(s => s + 10 + Math.ceil(timeLeft / 3));
        setRound(r => r + 1);
        setNext(1);
        setGrid(shuffle([1,2,3,4,5,6,7,8,9]));
      } else {
        setScore(s => s + 1);
        setNext(n => n + 1);
      }
    } else {
      setWrongFlash(num);
      setScore(s => Math.max(0, s - 2));
      setTimeout(() => setWrongFlash(null), 350);
    }
  };

  const timerPct = (timeLeft / GAME_DURATION) * 100;

  return (
    <div style={{ minHeight: "100svh", background: "#08080b" }} className="text-white flex flex-col">

      {/* ── Minimal top bar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 12px)",
          paddingBottom: "12px",
          background: "rgba(8,8,11,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button onClick={() => navigate("/games")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          style={{ WebkitTapHighlightColor: "transparent" }}>
          <ArrowLeft size={16} strokeWidth={2} />
          <span className="text-[10px] font-black uppercase tracking-widest">Games</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Best</span>
          <span className="text-sm font-black text-purple-400">{highScore}</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div
        className="flex-1 flex flex-col"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 64px)" }}
      >
        <AnimatePresence mode="wait">

          {/* ─── IDLE ─── */}
          {phase === "idle" && (
            <motion.div key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 pt-8 pb-10"
            >
              {/* Label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-px h-5" style={{ background: "linear-gradient(180deg, #a78bfa, transparent)" }} />
                <span className="text-[9px] font-black tracking-[0.25em] uppercase text-purple-400">01 · Speed</span>
              </div>

              {/* Giant typographic hero */}
              <div className="mb-8 relative">
                <div
                  className="font-black leading-none select-none pointer-events-none absolute -top-3 -left-2 text-white"
                  style={{ fontSize: "clamp(6rem, 30vw, 11rem)", opacity: 0.03, letterSpacing: "-0.05em" }}
                >
                  1→9
                </div>
                <h1
                  className="font-black leading-none tracking-tighter relative z-10"
                  style={{ fontSize: "clamp(2.8rem, 10vw, 4.2rem)" }}
                >
                  Number<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
                    Blitz
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-white/35 text-sm leading-relaxed mb-10 max-w-[280px]">
                Tap <span className="text-white/70 font-bold">1 through 9</span> in order, as fast as possible. Complete a full cycle to earn bonus points. 30 seconds on the clock.
              </p>

              {/* Preview grid — small */}
              <div className="grid grid-cols-9 gap-1.5 mb-10 max-w-[260px]">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <div key={n}
                    className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: "rgba(167,139,250,0.07)",
                      border: "1px solid rgba(167,139,250,0.12)",
                      color: "rgba(167,139,250,0.5)",
                    }}>
                    {n}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={startCountdown}
                className="w-full rounded-2xl font-black text-[15px] text-white flex items-center justify-between px-7"
                style={{
                  height: "58px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span>Begin</span>
                <span className="text-purple-200/60 font-black tracking-widest text-xs">30s →</span>
              </motion.button>
            </motion.div>
          )}

          {/* ─── COUNTDOWN ─── */}
          {phase === "countdown" && (
            <motion.div key="cd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Ready</span>
              <motion.div
                key={countdown}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="font-black leading-none"
                style={{
                  fontSize: "clamp(8rem, 35vw, 14rem)",
                  color: "#a78bfa",
                  textShadow: "0 0 80px rgba(167,139,250,0.4)",
                  letterSpacing: "-0.05em",
                }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}

          {/* ─── PLAYING ─── */}
          {phase === "playing" && (
            <motion.div key="playing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col px-5 pt-4 pb-8 gap-5"
            >
              {/* Stats row */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-4xl font-black tracking-tight" style={{ color: "white" }}>{score}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Tap Next</div>
                  <div className="text-4xl font-black tracking-tight" style={{ color: "#a78bfa" }}>{next}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Round</div>
                  <div className="text-4xl font-black tracking-tight">{round}</div>
                </div>
              </div>

              {/* Timer */}
              <div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: timerPct > 50
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                        : timerPct > 25
                        ? "#f59e0b"
                        : "#ef4444",
                      width: `${timerPct}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <span className="text-[10px] font-black text-white/20">{timeLeft}s</span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-3 flex-1">
                {grid.map((num) => {
                  const isCorrect = correctFlash === num;
                  const isWrong = wrongFlash === num;
                  const isDone = num < next;
                  const isNext = num === next;
                  return (
                    <motion.button
                      key={`${round}-${num}`}
                      onPointerDown={() => handleTap(num)}
                      animate={isWrong ? { x: [-5, 5, -4, 4, 0] } : {}}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl flex items-center justify-center font-black select-none"
                      style={{
                        fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
                        aspectRatio: "1",
                        background: isDone
                          ? "rgba(167,139,250,0.06)"
                          : isCorrect
                          ? "rgba(167,139,250,0.25)"
                          : isWrong
                          ? "rgba(239,68,68,0.18)"
                          : isNext
                          ? "rgba(167,139,250,0.1)"
                          : "rgba(255,255,255,0.04)",
                        border: isDone
                          ? "1px solid rgba(167,139,250,0.1)"
                          : isCorrect
                          ? "1px solid rgba(167,139,250,0.5)"
                          : isWrong
                          ? "1px solid rgba(239,68,68,0.35)"
                          : isNext
                          ? "1px solid rgba(167,139,250,0.3)"
                          : "1px solid rgba(255,255,255,0.05)",
                        color: isDone
                          ? "rgba(167,139,250,0.25)"
                          : isWrong
                          ? "#ef4444"
                          : isNext
                          ? "#a78bfa"
                          : "rgba(255,255,255,0.8)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {num}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── RESULT ─── */}
          {phase === "result" && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col px-6 pt-8 pb-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-px h-5" style={{ background: "linear-gradient(180deg, #a78bfa, transparent)" }} />
                <span className="text-[9px] font-black tracking-[0.25em] uppercase text-purple-400">Result</span>
              </div>

              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Final Score</div>
              <div
                className="font-black leading-none tracking-tighter mb-2"
                style={{ fontSize: "clamp(5rem, 22vw, 8rem)", color: "#a78bfa" }}
              >
                {score}
              </div>
              <div className="text-white/30 text-sm mb-2">{round - 1} round{round - 1 !== 1 ? "s" : ""} completed</div>

              {isNewHS && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[11px] font-black text-purple-300 uppercase tracking-widest">New Record</span>
                </motion.div>
              )}

              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => setPhase("idle")}
                  className="flex-[0.4] rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{
                    height: "52px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RotateCcw size={13} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={startCountdown}
                  className="flex-[0.6] rounded-2xl font-black text-[15px] text-white"
                  style={{
                    height: "52px",
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    boxShadow: "0 6px 24px rgba(124,58,237,0.3)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Again
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
