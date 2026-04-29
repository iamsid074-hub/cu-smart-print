import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Eye, ArrowUpRight, Trophy } from "lucide-react";

const GAMES = [
  {
    index: "01",
    id: "number-blitz",
    title: "Number Blitz",
    tag: "SPEED",
    description: "Tap 1 through 9 in sequence before the clock runs out. 30 seconds, pure reflex.",
    stat1: { label: "Duration", value: "30s" },
    stat2: { label: "Target", value: "1→9" },
    icon: Zap,
    link: "/games/number-blitz",
    accentColor: "#a78bfa",
    accentDim: "rgba(167,139,250,0.08)",
    accentBorder: "rgba(167,139,250,0.15)",
  },
  {
    index: "02",
    id: "color-rush",
    title: "Color Rush",
    tag: "MIND",
    description: "Ignore what you read. Trust only the ink. 10 rounds of cognitive precision.",
    stat1: { label: "Rounds", value: "10" },
    stat2: { label: "Type", value: "Stroop" },
    icon: Eye,
    link: "/games/color-rush",
    accentColor: "#c4b5fd",
    accentDim: "rgba(196,181,253,0.07)",
    accentBorder: "rgba(196,181,253,0.13)",
  },
];

export default function Games() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#08080b" }}
    >
      {/* ── Fixed top bar — clears Dynamic Island ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 50px) + 16px)",
          paddingBottom: "14px",
          background: "rgba(8,8,11,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors active:scale-95"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>

        <span
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20"
        >
          CU Bazzar
        </span>
      </div>

      {/* ── Page content — padded below fixed header ── */}
      <div
        className="px-5 pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 50px) + 70px)" }}
      >

        {/* ── Hero title block ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: "linear-gradient(180deg, #a78bfa, #7c3aed)" }}
            />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-purple-400">
              Mini Games
            </span>
          </div>
          <h1
            className="font-black leading-none tracking-tighter text-white"
            style={{ fontSize: "clamp(2.8rem, 10vw, 4.5rem)" }}
          >
            Play.<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" }}
            >
              Win.
            </span>
          </h1>
          <p className="text-white/30 text-sm mt-3 max-w-[280px] leading-relaxed font-medium">
            Two skill-based games. Your scores, your record.
          </p>
        </motion.div>

        {/* ── Game Cards ── */}
        <div className="flex flex-col gap-5">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
              >
                {/* Index label */}
                <div className="flex items-center gap-3 mb-3 px-1">
                  <span
                    className="text-[11px] font-black tracking-widest uppercase"
                    style={{ color: game.accentColor, opacity: 0.6 }}
                  >
                    {game.index}
                  </span>
                  <div className="flex-1 h-px" style={{ background: game.accentBorder }} />
                  <span
                    className="text-[9px] font-black tracking-[0.2em] uppercase"
                    style={{ color: game.accentColor, opacity: 0.5 }}
                  >
                    {game.tag}
                  </span>
                </div>

                {/* Card */}
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  onClick={() => navigate(game.link)}
                  className="w-full text-left rounded-[2rem] overflow-hidden relative"
                  style={{
                    background: game.accentDim,
                    border: `1px solid ${game.accentBorder}`,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {/* Faded index watermark */}
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-black leading-none pointer-events-none select-none"
                    style={{
                      fontSize: "clamp(5rem, 20vw, 9rem)",
                      color: game.accentColor,
                      opacity: 0.04,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {game.index}
                  </div>

                  <div className="relative z-10 p-6">
                    {/* Icon + Title row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: `rgba(${game.accentColor === "#a78bfa" ? "167,139,250" : "196,181,253"},0.12)`,
                          border: `1px solid ${game.accentBorder}`,
                        }}
                      >
                        <Icon size={20} style={{ color: game.accentColor }} strokeWidth={2.2} />
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: game.accentBorder }}
                      >
                        <ArrowUpRight size={15} style={{ color: game.accentColor }} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <h2
                      className="font-black tracking-tight text-white mb-2"
                      style={{ fontSize: "1.45rem", lineHeight: 1.1 }}
                    >
                      {game.title}
                    </h2>

                    {/* Description */}
                    <p className="text-white/40 text-xs leading-relaxed mb-5 max-w-[260px]">
                      {game.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{game.stat1.label}</span>
                        <span className="text-xs font-black text-white/70">{game.stat1.value}</span>
                      </div>
                      <div
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{game.stat2.label}</span>
                        <span className="text-xs font-black text-white/70">{game.stat2.value}</span>
                      </div>

                      {/* Spacer + local high score */}
                      <div className="ml-auto flex items-center gap-1.5">
                        <Trophy size={11} style={{ color: game.accentColor, opacity: 0.5 }} />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-wider">
                          {Number(localStorage.getItem(
                            game.id === "number-blitz" ? "nb_hs" : "cr_hs"
                          ) || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div
                    className="px-6 py-3.5 flex items-center justify-between"
                    style={{
                      background: `rgba(${game.accentColor === "#a78bfa" ? "167,139,250" : "196,181,253"},0.07)`,
                      borderTop: `1px solid ${game.accentBorder}`,
                    }}
                  >
                    <span
                      className="text-[11px] font-black uppercase tracking-[0.15em]"
                      style={{ color: game.accentColor }}
                    >
                      Play Now
                    </span>
                    <div
                      className="h-px flex-1 mx-4"
                      style={{ background: `linear-gradient(90deg, ${game.accentColor}40, transparent)` }}
                    />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Free</span>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-white/15 uppercase tracking-widest font-bold">
            High scores saved locally
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </motion.div>

      </div>
    </div>
  );
}
