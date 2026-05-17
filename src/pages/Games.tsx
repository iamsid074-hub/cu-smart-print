import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Eye, ArrowUpRight, Trophy, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GAMES = [
  {
    index: "01",
    id: "crash",
    title: "Crash",
    tag: "MULTIPLIER",
    description: "Watch the multiplier climb. Cash out before it crashes to secure your win. High risk, high reward.",
    stat1: { label: "Max Win", value: "x100.0" },
    stat2: { label: "Edge", value: "4.0%" },
    icon: Zap,
    image: "/crash_banner.png",
    link: "/games/crash",
    accentColor: "#ef4444", // red-500
    accentDim: "rgba(239,68,68,0.08)",
    accentBorder: "rgba(239,68,68,0.15)",
  },
  {
    index: "02",
    id: "mines",
    title: "Mines",
    tag: "STRATEGY",
    description: "Clear the grid without hitting a mine. The more mines you add, the higher the payout.",
    stat1: { label: "Grid", value: "5x5" },
    stat2: { label: "Edge", value: "4.0%" },
    icon: Eye,
    image: "/mines_banner.png",
    link: "/games/mines",
    accentColor: "#3b82f6", // blue-500
    accentDim: "rgba(59,130,246,0.07)",
    accentBorder: "rgba(59,130,246,0.13)",
  },
];

export default function Games() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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
          background: "rgba(8,8,11,0.95)",
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
          STARTING ON 1 MAY
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
            Two provably fair betting games. Bet real money, win real money.
          </p>
        </motion.div>

        {/* ── Game Cards / Lock Banner ── */}
        {!isAdmin ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(167, 139, 250, 0.12)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.4)"
            }}
          >
            {/* Glowing background aura */}
            <div 
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] pointer-events-none"
              style={{ background: "rgba(167, 139, 250, 0.12)" }}
            />
            <div 
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[100px] pointer-events-none"
              style={{ background: "rgba(239, 68, 68, 0.08)" }}
            />

            {/* Glowing Lock Icon */}
            <div className="relative mb-6">
              <div 
                className="absolute inset-0 rounded-full blur-xl scale-125"
                style={{ background: "rgba(167, 139, 250, 0.25)" }}
              />
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 border border-purple-500/20"
                style={{
                  background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(124,58,237,0.15) 100%)",
                }}
              >
                <Lock size={30} className="text-purple-300 drop-shadow-[0_2px_8px_rgba(167,139,250,0.4)]" strokeWidth={1.8} />
              </div>
            </div>

            {/* Restricted Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 mb-5 shadow-[0_2px_12px_rgba(251,191,36,0.05)]">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-amber-400/90">
                🔒 ADMIN ONLY ACCESS
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight drop-shadow-md">
              Mini Games Locked
            </h2>

            {/* Description */}
            <p className="text-white/40 text-xs leading-relaxed max-w-[280px] mb-8 font-medium">
              Betting games are currently locked under scheduled maintenance. Only authorized Chandigarh University Bazzar administrators can access the live wagering system.
            </p>

            {/* Subtle Divider */}
            <div className="w-full h-px bg-white/5 mb-6" />

            {/* Info label */}
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-black leading-normal px-4">
              Provably Fair betting is restricted in your region/profile.
            </p>
          </motion.div>
        ) : (
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

                    <div className="relative z-10 p-0">
                      {/* Real Image Banner */}
                      <div className="w-full h-40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
                        <img src={game.image} alt={game.title} className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105" />
                        
                        <div className="absolute top-4 left-4 z-20 flex items-center justify-between w-[calc(100%-2rem)]">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-md"
                            style={{
                              background: `rgba(0,0,0,0.5)`,
                              border: `1px solid ${game.accentBorder}`,
                            }}
                          >
                            <Icon size={18} style={{ color: game.accentColor }} strokeWidth={2.2} />
                          </div>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"
                            style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${game.accentBorder}` }}
                          >
                            <ArrowUpRight size={15} style={{ color: game.accentColor }} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-5">

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
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-white/15 uppercase tracking-widest font-bold">
            Provably Fair • 100% Transparent
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </motion.div>

      </div>
    </div>
  );
}
