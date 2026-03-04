import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════
   DYNAMIC ISLAND — React Component
   4 states: music · timer · notification · call
   ═══════════════════════════════════════════════ */

type IslandMode = "idle" | "music" | "timer" | "notification" | "call";

// Spring animation config
const spring = { type: "spring" as const, stiffness: 400, damping: 28 };

// ─── Size presets per mode ───
const sizes: Record<IslandMode, { w: number; h: number; r: number }> = {
    idle: { w: 126, h: 37, r: 50 },
    music: { w: 350, h: 140, r: 42 },
    timer: { w: 350, h: 210, r: 46 },
    notification: { w: 360, h: 200, r: 46 },
    call: { w: 350, h: 210, r: 46 },
};

export default function DynamicIsland() {
    const [mode, setMode] = useState<IslandMode>("idle");
    const [expanded, setExpanded] = useState(false);
    const [musicPlaying, setMusicPlaying] = useState(true);
    const [progress, setProgress] = useState(35);
    const [timerSec, setTimerSec] = useState(185);
    const [timerRunning, setTimerRunning] = useState(true);
    const [callSec, setCallSec] = useState(0);
    const islandRef = useRef<HTMLDivElement>(null);

    // ─── Timer tick ───
    useEffect(() => {
        if (mode !== "timer" || !timerRunning) return;
        const id = setInterval(() => setTimerSec((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [mode, timerRunning]);

    // ─── Call tick ───
    useEffect(() => {
        if (mode !== "call") return;
        const id = setInterval(() => setCallSec((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [mode]);

    // ─── Music progress ───
    useEffect(() => {
        if (mode !== "music" || !musicPlaying) return;
        const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.5)), 300);
        return () => clearInterval(id);
    }, [mode, musicPlaying]);

    // ─── Outside click ───
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (islandRef.current && !islandRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest(".di-btn")) {
                setExpanded(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ─── Keyboard shortcuts ───
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setExpanded(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

    const activate = useCallback((m: IslandMode) => {
        if (m === mode && expanded) { setExpanded(false); return; }
        setMode(m);
        setExpanded(true);
        if (m === "call") setCallSec(0);
        if (m === "timer") { setTimerSec(185); setTimerRunning(true); }
        if (m === "music") { setMusicPlaying(true); setProgress(35); }
        try { navigator.vibrate?.(12); } catch { }
    }, [mode, expanded]);

    const collapse = () => { setExpanded(false); try { navigator.vibrate?.(8); } catch { } };

    const reset = () => {
        setExpanded(false);
        setMode("idle");
        setTimerSec(185);
        setCallSec(0);
        setProgress(35);
        setMusicPlaying(true);
        setTimerRunning(true);
    };

    const sz = expanded ? sizes[mode] : sizes.idle;

    // ─── Compact content per mode ───
    const CompactContent = () => {
        if (expanded) return null;
        switch (mode) {
            case "music":
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 10px" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#FF6B6B,#FF3366)", flexShrink: 0 }} />
                        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                            {[6, 12, 8, 14, 6].map((h, i) => (
                                <div key={i} style={{
                                    width: 2.5, height: h, borderRadius: 2, background: "#1DB954",
                                    animation: musicPlaying ? `diWave 0.8s ease-in-out ${i * 0.12}s infinite alternate` : "none",
                                }} />
                            ))}
                        </div>
                    </div>
                );
            case "timer":
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 10px" }}>
                        <span style={{ fontSize: 16 }}>⏱️</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#FF9F0A", fontVariantNumeric: "tabular-nums" }}>{fmt(timerSec)}</span>
                    </div>
                );
            case "notification":
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 10px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#007AFF", animation: "diPulse 1.5s ease infinite" }} />
                        <span style={{ fontSize: 16 }}>💬</span>
                    </div>
                );
            case "call":
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 8px" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#30D158,#34C759)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>S</div>
                        <div style={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            {[4, 8, 5].map((h, i) => <div key={i} style={{ width: 2, height: h, borderRadius: 1, background: "#30D158", animation: `diWave 0.6s ease-in-out ${i * 0.1}s infinite alternate` }} />)}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#30D158", fontVariantNumeric: "tabular-nums" }}>{fmt(callSec)}</span>
                    </div>
                );
            default: return null;
        }
    };

    // ─── Expanded content per mode ───
    const ExpandedContent = () => {
        if (!expanded) return null;
        switch (mode) {
            case "music":
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: "100%", padding: "14px 18px" }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 14, flexShrink: 0,
                            background: "linear-gradient(135deg,#FF6B6B,#FF3366,#CC5599)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
                            boxShadow: "0 4px 15px rgba(255,107,107,0.3)",
                            animation: "diSpin 8s linear infinite",
                        }}>♫</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Blinding Lights</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>The Weeknd</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                                <BtnSmall onClick={() => { }}>⏮</BtnSmall>
                                <BtnSmall big onClick={() => setMusicPlaying(!musicPlaying)}>{musicPlaying ? "⏸" : "▶"}</BtnSmall>
                                <BtnSmall onClick={() => { }}>⏭</BtnSmall>
                            </div>
                            <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${progress}%`, background: "#1DB954", borderRadius: 2, transition: "width 0.3s" }} />
                            </div>
                        </div>
                    </motion.div>
                );

            case "timer":
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: 14 }}>
                        <div style={{ position: "relative", width: 80, height: 80 }}>
                            <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                                <circle cx="40" cy="40" r="36" fill="none" stroke="#FF9F0A" strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray="226" strokeDashoffset={226 - (timerSec / 300) * 226}
                                    style={{ transition: "stroke-dashoffset 1s linear" }} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#FF9F0A", fontVariantNumeric: "tabular-nums" }}>{fmt(timerSec)}</div>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>TIMER</div>
                        <div style={{ display: "flex", gap: 16 }}>
                            <BtnRound color="rgba(255,59,48,0.2)" textColor="#FF3B30" onClick={() => { setTimerSec(300); setTimerRunning(true); }}>■</BtnRound>
                            <BtnRound onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? "⏸" : "▶"}</BtnRound>
                        </div>
                    </motion.div>
                );

            case "notification":
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", padding: "14px 18px" }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                            background: "linear-gradient(135deg,#007AFF,#5856D6)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>💬</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>Messages</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 2 }}>Rahul Sharma</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                Hey! Are you coming to the campus event tonight? It starts at 7 PM 🎉
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                <button onClick={(e) => { e.stopPropagation(); collapse(); setTimeout(reset, 400); }}
                                    style={{ flex: 1, padding: "8px 12px", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                    Dismiss
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); collapse(); setTimeout(reset, 400); }}
                                    style={{ flex: 1, padding: "8px 12px", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#007AFF", color: "#fff" }}>
                                    Reply
                                </button>
                            </div>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0, marginTop: 2 }}>now</div>
                    </motion.div>
                );

            case "call":
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 16 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            background: "linear-gradient(135deg,#667eea,#764ba2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 600, boxShadow: "0 4px 15px rgba(102,126,234,0.3)",
                        }}>S</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>Sidharth</div>
                        <div style={{ fontSize: 12, color: "#30D158", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{fmt(callSec)}</div>
                        <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
                            <BtnRound onClick={(e) => e.stopPropagation()}>🔇</BtnRound>
                            <BtnRound color="#FF3B30" onClick={(e) => { e.stopPropagation(); collapse(); setTimeout(reset, 500); }}>📞</BtnRound>
                            <BtnRound onClick={(e) => e.stopPropagation()}>🔊</BtnRound>
                        </div>
                    </motion.div>
                );

            default: return null;
        }
    };

    return createPortal(
        <>
            {/* CSS keyframes injected once */}
            <style>{`
        @keyframes diWave { 0% { transform: scaleY(0.4); } 100% { transform: scaleY(1); } }
        @keyframes diPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } }
        @keyframes diSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes diBreathe {
          0%,100% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.08), 0 2px 12px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.12), 0 2px 16px rgba(0,0,0,0.4), 0 0 20px rgba(100,100,255,0.06); }
        }
      `}</style>

            {/* Island */}
            <motion.div
                ref={islandRef}
                animate={{ width: sz.w, height: sz.h, borderRadius: sz.r }}
                transition={spring}
                onClick={() => {
                    if (expanded) collapse();
                    else if (mode !== "idle") { setExpanded(true); try { navigator.vibrate?.(10); } catch { } }
                }}
                style={{
                    position: "fixed",
                    top: 12,
                    left: "50%",
                    x: "-50%",
                    zIndex: 99999,
                    cursor: "pointer",
                    background: "rgba(0,0,0,0.94)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08), 0 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    animation: mode === "idle" && !expanded ? "diBreathe 4s ease-in-out infinite" : "none",
                }}
            >
                <CompactContent />
                <AnimatePresence mode="wait">
                    {expanded && <ExpandedContent key={mode} />}
                </AnimatePresence>
            </motion.div>

            {/* Control buttons */}
            <div style={{
                position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 8, zIndex: 99998, flexWrap: "wrap", justifyContent: "center", maxWidth: 400, padding: "0 16px",
            }}>
                {([
                    { m: "music" as IslandMode, icon: "🎵", label: "Music" },
                    { m: "timer" as IslandMode, icon: "⏱️", label: "Timer" },
                    { m: "notification" as IslandMode, icon: "🔔", label: "Notif" },
                    { m: "call" as IslandMode, icon: "📞", label: "Call" },
                ]).map(({ m, icon, label }) => (
                    <button key={m} className="di-btn" onClick={() => activate(m)} style={{
                        padding: "10px 18px", borderRadius: 14,
                        border: mode === m ? "1px solid rgba(0,122,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        background: mode === m ? "rgba(0,122,255,0.15)" : "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)",
                        color: mode === m ? "#0A84FF" : "#fff",
                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        transition: "all 0.2s",
                    }}>
                        <span>{icon}</span> {label}
                    </button>
                ))}
                <button className="di-btn" onClick={reset} style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)", color: "#fff",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                }}>
                    🔄 Reset
                </button>
            </div>
        </>,
        document.body
    );
}

/* ─── Tiny helper buttons ─── */
function BtnSmall({ children, big, onClick }: { children: React.ReactNode; big?: boolean; onClick: (e: React.MouseEvent) => void }) {
    return (
        <button onClick={(e) => { e.stopPropagation(); onClick(e); }} style={{
            background: big ? "rgba(255,255,255,0.15)" : "none", border: "none", color: "#fff", cursor: "pointer",
            fontSize: big ? 18 : 16, borderRadius: "50%",
            width: big ? 36 : 32, height: big ? 36 : 32,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>{children}</button>
    );
}

function BtnRound({ children, color, textColor, onClick }: { children: React.ReactNode; color?: string; textColor?: string; onClick: (e: React.MouseEvent) => void }) {
    return (
        <button onClick={(e) => { e.stopPropagation(); onClick(e); }} style={{
            background: color || "rgba(255,255,255,0.1)", border: "none",
            color: textColor || "#fff", cursor: "pointer", borderRadius: "50%",
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "all 0.2s",
        }}>{children}</button>
    );
}
