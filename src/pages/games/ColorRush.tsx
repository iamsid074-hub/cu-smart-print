import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

const COLORS = [
  { name: "RED",    bg: "#ef4444", shadow: "rgba(239,68,68,0.35)" },
  { name: "BLUE",   bg: "#3b82f6", shadow: "rgba(59,130,246,0.35)" },
  { name: "GREEN",  bg: "#10b981", shadow: "rgba(16,185,129,0.35)" },
  { name: "PURPLE", bg: "#8b5cf6", shadow: "rgba(139,92,246,0.35)" },
];

const TOTAL_ROUNDS = 10;
const BASE_SHOW_MS = 900;
const BASE_CHOICE_MS = 3000;

type Phase = "idle" | "show" | "choose" | "feedback" | "result";
interface Round {
  textColor: typeof COLORS[number];
  wordColor: typeof COLORS[number];
}

function getRound(hard: boolean): Round {
  const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  let wordColor: typeof COLORS[number];
  if (hard && Math.random() < 0.7) {
    const others = COLORS.filter(c => c.name !== textColor.name);
    wordColor = others[Math.floor(Math.random() * others.length)];
  } else {
    wordColor = textColor;
  }
  return { textColor, wordColor };
}

export default function ColorRush() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("cr_hs") || 0));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "timeout" | null>(null);
  const [choiceProgress, setChoiceProgress] = useState(100);
  const [results, setResults] = useState<Array<"correct" | "wrong" | "timeout">>([]);
  const [isNewHS, setIsNewHS] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const showMs = Math.max(400, BASE_SHOW_MS - roundNum * 30);
  const choiceMs = Math.max(1200, BASE_CHOICE_MS - roundNum * 80);

  const nextRound = useCallback((rNum: number, sc: number, st: number) => {
    if (rNum >= TOTAL_ROUNDS) {
      setPhase("result");
      if (sc > Number(localStorage.getItem("cr_hs") || 0)) {
        localStorage.setItem("cr_hs", String(sc));
        setHighScore(sc);
        setIsNewHS(true);
      }
      return;
    }
    const r = getRound(rNum > 4);
    setRound(r);
    setPhase("show");
    timerRef.current = setTimeout(() => {
      setPhase("choose");
      startTimeRef.current = Date.now();
      setChoiceProgress(100);
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.max(0, 100 - (elapsed / choiceMs) * 100);
        setChoiceProgress(pct);
        if (pct > 0) animRef.current = requestAnimationFrame(animate);
        else handleAnswer(null, rNum, sc, st);
      };
      animRef.current = requestAnimationFrame(animate);
    }, showMs);
  }, [showMs, choiceMs]);

  const handleAnswer = useCallback((picked: typeof COLORS[number] | null, rNum: number, sc: number, st: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setRound(prev => {
      if (!prev) return prev;
      let fb: "correct" | "wrong" | "timeout";
      let newScore = sc;
      let newStreak = st;

      if (!picked) { fb = "timeout"; newStreak = 0; }
      else if (picked.name === prev.textColor.name) {
        fb = "correct";
        const elapsed = Date.now() - startTimeRef.current;
        newScore = sc + 10 + Math.floor((1 - elapsed / choiceMs) * 5) + Math.min(st, 4);
        newStreak = st + 1;
      } else { fb = "wrong"; newStreak = 0; }

      setFeedback(fb);
      setScore(newScore);
      setStreak(newStreak);
      setResults(r => [...r, fb]);
      setPhase("feedback");

      setTimeout(() => {
        setFeedback(null);
        nextRound(rNum + 1, newScore, newStreak);
        setRoundNum(rNum + 1);
      }, 550);
      return prev;
    });
  }, [choiceMs, nextRound]);

  const startGame = () => {
    setScore(0); setStreak(0); setRoundNum(0);
    setResults([]); setFeedback(null); setIsNewHS(false);
    nextRound(0, 0, 0);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ minHeight: "100svh", background: "#08080b" }} className="text-white flex flex-col">

      {/* ── Top bar ── */}
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-px h-5" style={{ background: "linear-gradient(180deg, #a78bfa, transparent)" }} />
                <span className="text-[9px] font-black tracking-[0.25em] uppercase text-purple-400">02 · Mind</span>
              </div>

              {/* Hero */}
              <div className="mb-8 relative">
                <div
                  className="font-black leading-none select-none pointer-events-none absolute -top-2 -left-2"
                  style={{ fontSize: "clamp(5rem, 28vw, 10rem)", opacity: 0.03, color: "white", letterSpacing: "-0.05em" }}
                >
                  INK
                </div>
                <h1
                  className="font-black leading-none tracking-tighter relative z-10"
                  style={{ fontSize: "clamp(2.8rem, 10vw, 4.2rem)" }}
                >
                  Color<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
                    Rush
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-white/35 text-sm leading-relaxed mb-8 max-w-[280px]">
                Read the ink, not the word. Trust your eyes. 10 rounds — speed and accuracy both count.
              </p>

              {/* Live example */}
              <div
                className="mb-10 px-5 py-5 rounded-2xl"
                style={{
                  background: "rgba(167,139,250,0.05)",
                  border: "1px solid rgba(167,139,250,0.12)",
                }}
              >
                <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-3 font-black">How it works</div>
                <div className="flex items-center gap-4">
                  <div
                    className="text-3xl font-black leading-none"
                    style={{ color: "#3b82f6" }}
                  >
                    RED
                  </div>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="text-right">
                    <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Tap</div>
                    <div className="text-sm font-black" style={{ color: "#3b82f6" }}>BLUE</div>
                    <div className="text-[9px] text-white/20">the ink color</div>
                  </div>
                </div>
              </div>

              {/* 4 color pills preview */}
              <div className="grid grid-cols-4 gap-2 mb-10">
                {COLORS.map(c => (
                  <div key={c.name}
                    className="rounded-xl py-2.5 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-wider"
                    style={{ background: c.bg, opacity: 0.7 }}>
                    {c.name}
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
                className="w-full rounded-2xl font-black text-[15px] text-white flex items-center justify-between px-7"
                style={{
                  height: "58px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span>Begin</span>
                <span className="text-purple-200/60 font-black tracking-widest text-xs">10 rounds →</span>
              </motion.button>
            </motion.div>
          )}

          {/* ─── GAME ─── */}
          {(phase === "show" || phase === "choose" || phase === "feedback") && round && (
            <motion.div key="game"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col px-5 pt-4 pb-8 gap-5"
            >
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                  <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-300" style={{
                    background: i < results.length
                      ? results[i] === "correct" ? "#a78bfa" : "#ef4444"
                      : i === roundNum ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)"
                  }} />
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-4xl font-black">{score}</div>
                </div>
                {streak > 1 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}
                  >
                    <span className="text-[11px] font-black text-purple-300">{streak}x streak</span>
                  </motion.div>
                )}
                <div className="text-right">
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Round</div>
                  <div className="text-4xl font-black">{roundNum + 1}<span className="text-white/20 text-2xl">/{TOTAL_ROUNDS}</span></div>
                </div>
              </div>

              {/* Timer bar */}
              {phase === "choose" && (
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-none"
                    style={{
                      width: `${choiceProgress}%`,
                      background: choiceProgress > 50
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                        : choiceProgress > 25 ? "#f59e0b" : "#ef4444"
                    }} />
                </div>
              )}

              {/* Word display */}
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  key={roundNum}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.span
                    className="font-black select-none leading-none"
                    style={{
                      fontSize: "clamp(4rem, 18vw, 7rem)",
                      letterSpacing: "-0.02em",
                      color: feedback === "correct"
                        ? "#a78bfa"
                        : feedback === "wrong"
                        ? "#ef4444"
                        : round.textColor.bg,
                      textShadow: feedback === "correct"
                        ? "0 0 40px rgba(167,139,250,0.4)"
                        : feedback === "wrong"
                        ? "0 0 40px rgba(239,68,68,0.4)"
                        : `0 0 30px ${round.textColor.shadow}`,
                    }}
                    animate={
                      feedback === "correct" ? { scale: [1, 1.1, 1] }
                      : feedback === "wrong" ? { x: [-7, 7, -5, 5, 0] }
                      : {}
                    }
                    transition={{ duration: 0.28 }}
                  >
                    {round.wordColor.name}
                  </motion.span>
                  {phase === "show" && (
                    <p className="text-center text-[9px] text-white/20 uppercase tracking-widest mt-3 font-black">
                      Get ready
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Color buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {COLORS.map(color => (
                  <motion.button
                    key={color.name}
                    whileTap={{ scale: 0.93 }}
                    disabled={phase !== "choose"}
                    onClick={() => phase === "choose" && handleAnswer(color, roundNum, score, streak)}
                    className="rounded-2xl font-black text-white text-sm select-none"
                    style={{
                      height: "52px",
                      background: color.bg,
                      opacity: phase === "show" ? 0.3 : phase === "feedback" ? 0.25 : 1,
                      boxShadow: phase === "choose" ? `0 4px 20px ${color.shadow}` : "none",
                      letterSpacing: "0.05em",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {color.name}
                  </motion.button>
                ))}
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
                className="font-black leading-none tracking-tighter mb-3"
                style={{ fontSize: "clamp(5rem, 22vw, 8rem)", color: "#a78bfa" }}
              >
                {score}
              </div>

              {/* Accuracy bar */}
              <div className="flex gap-1 mb-4">
                {results.map((r, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full"
                    style={{ background: r === "correct" ? "#a78bfa" : "#ef4444" }} />
                ))}
              </div>

              <div className="flex gap-5 text-sm mb-8">
                <div>
                  <span className="font-black text-white">{results.filter(r => r === "correct").length}</span>
                  <span className="text-white/25 ml-1.5 text-xs uppercase tracking-wider">correct</span>
                </div>
                <div>
                  <span className="font-black text-red-400">{results.filter(r => r !== "correct").length}</span>
                  <span className="text-white/25 ml-1.5 text-xs uppercase tracking-wider">missed</span>
                </div>
              </div>

              {isNewHS && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[11px] font-black text-purple-300 uppercase tracking-widest">New Record</span>
                </motion.div>
              )}

              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => setPhase("idle")}
                  className="flex-[0.4] rounded-2xl font-black text-sm flex items-center justify-center active:scale-95 transition-transform"
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
                  onClick={startGame}
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
