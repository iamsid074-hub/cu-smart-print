import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Gamepad2, Coins, Dices, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GAMES = [
  {
    id: "coin-flip",
    title: "Coin Flip",
    description: "Heads or Tails? Test your luck and double your bet.",
    icon: Coins,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/30",
    link: "/games/coin-flip"
  },
  {
    id: "dice-roll",
    title: "Dice Roll",
    description: "Roll the dice! Guess high or low to win big.",
    icon: Dices,
    color: "from-indigo-400 to-purple-600",
    shadow: "shadow-indigo-500/30",
    link: "/games/dice-roll"
  }
];

export default function Games() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-24 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none" />
      <motion.div
        animate={{ x: [-20, 20, -20], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"
      />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-indigo-400" size={24} />
          <h1 className="text-xl font-bold tracking-tight">Mini Games</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Play & Win
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Try our new mini-games! Play for fun in Demo mode, or use your wallet balance to play for real rewards.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] overflow-hidden group"
            >
              {/* Card Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-bl-full blur-2xl pointer-events-none`} />
              
              <div className="relative z-10 flex gap-4 mb-5">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} p-[1px] ${game.shadow} shadow-lg shrink-0`}>
                  <div className="w-full h-full bg-[#121214] rounded-[15px] flex items-center justify-center">
                    <game.icon className="text-white drop-shadow-md" size={26} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{game.title}</h3>
                  <p className="text-white/50 text-xs leading-snug">{game.description}</p>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                <Link
                  to={game.link}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center transition-colors active:scale-95"
                >
                  Play Demo
                </Link>
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-indigo-600/40 text-white/50 font-semibold text-sm flex items-center justify-center gap-1.5 cursor-not-allowed border border-indigo-500/20"
                >
                  <Lock size={14} />
                  Play Real
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Lock size={14} className="text-indigo-400" />
          </div>
          <p className="text-xs text-indigo-200/70 leading-relaxed pt-1">
            Real money betting is currently disabled in this version. Enjoy the free demo modes!
          </p>
        </div>
      </div>
    </div>
  );
}
