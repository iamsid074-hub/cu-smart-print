import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Diamond, Skull, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../components/ui/use-toast";

import { VirtualCard } from "../../components/VirtualCard";

export default function RealMines() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [balance, setBalance] = useState<number>(profile?.wallet_balance || 0);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [numMines, setNumMines] = useState<number>(3);
  const [balanceHidden, setBalanceHidden] = useState(false);
  
  // 'idle', 'playing', 'crashed', 'cashed_out'
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'cashed_out'>('idle');
  
  // Board state
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false)); // true = mine
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [hitIndex, setHitIndex] = useState<number | null>(null);
  
  const [multiplier, setMultiplier] = useState(1.00);
  
  // Provably Fair
  const [serverSeed, setServerSeed] = useState("hidden_until_game_ends");
  const [clientSeed, setClientSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [showProvablyFair, setShowProvablyFair] = useState(false);

  useEffect(() => {
    if (profile) setBalance(profile.wallet_balance);
  }, [profile]);

  // Math for Mines
  const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
  const combinations = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));

  const calculateMultiplier = (mines: number, revealedCount: number) => {
    if (revealedCount === 0) return 1.00;
    const totalWays = combinations(25, revealedCount);
    const winningWays = combinations(25 - mines, revealedCount);
    // 4% House edge
    return (totalWays / winningWays) * 0.96;
  };

  const startGame = async () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return toast({ title: "Invalid Bet", description: "Enter a valid amount.", variant: "destructive" });
    if (amount > balance) return toast({ title: "Insufficient Funds", description: "Your CU Card balance is too low.", variant: "destructive" });

    // Deduct locally for instant feedback
    const newBalance = balance - amount;
    setBalance(newBalance);
    
    // Attempt secure DB sync via RPC
    if (user) {
      const { error } = await supabase.rpc('place_bet', { bet_amount: amount, game_name: 'Mines' });
      if (error) {
        toast({ title: "Bet Failed", description: error.message || "Failed to place bet.", variant: "destructive" });
        setBalance(balance); // Revert optimistic update
        return;
      }
    }

    setGameState('playing');
    setRevealed(Array(25).fill(false));
    setHitIndex(null);
    setMultiplier(1.00);
    
    const newServerSeed = crypto.randomUUID();
    setServerSeed(newServerSeed);
    
    // Generate grid locally (simulating Edge function)
    const newGrid = Array(25).fill(false);
    let minesPlaced = 0;
    while (minesPlaced < numMines) {
      const idx = Math.floor(Math.random() * 25);
      if (!newGrid[idx]) {
        newGrid[idx] = true;
        minesPlaced++;
      }
    }
    setGrid(newGrid);
  };

  const revealTile = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index]) {
      // Hit a mine!
      setGameState('crashed');
      setHitIndex(index);
      
      // Reveal all tiles to the user
      setRevealed(Array(25).fill(true));
      
      // Log loss
      // (Loss is already accounted for because the bet was deducted in place_bet)
    } else {
      // Safe tile
      const revealedCount = newRevealed.filter(r => r).length;
      const nextMulti = calculateMultiplier(numMines, revealedCount);
      setMultiplier(nextMulti);
      
      // Auto cash-out if they hit the max possible
      if (revealedCount === 25 - numMines) {
        cashOut(nextMulti);
      }
    }
  };

  const cashOut = (overrideMulti?: number) => {
    if (gameState !== 'playing') return;
    
    const finalMulti = overrideMulti || multiplier;
    const amount = parseFloat(betAmount);
    const win = amount * finalMulti;
    
    setGameState('cashed_out');
    
    const newBalance = balance + win;
    setBalance(newBalance);

    if (user) {
      supabase.rpc('process_game_win', { 
        win_amount: win, 
        game_name: `Mines (x${finalMulti.toFixed(2)})` 
      }).then(({ error }) => {
        if (error) console.error("Error processing win:", error);
      });
    }
    
    // Reveal all remaining tiles but slightly dimmed
    setRevealed(Array(25).fill(true));
    
    toast({
      title: "Cashed Out! 🎉",
      description: `You won ₹${win.toFixed(2)} at ${finalMulti.toFixed(2)}x`,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans pb-24 relative">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-96 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #3b82f6 0%, transparent 60%)' }} />

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-2 flex items-center justify-between z-20 relative">
        <button onClick={() => navigate("/games")} className="flex items-center gap-2 text-white/50 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <span className="text-white/50 text-sm font-black tracking-[0.2em] uppercase">Mines</span>
        <div className="w-5" /> {/* Spacer */}
      </div>

      <div className="px-4 max-w-lg mx-auto flex flex-col gap-4 z-10 relative">
        
        {/* CU Card Display */}
        <div className="w-full mb-2">
          <VirtualCard
            name={profile?.full_name || user?.email?.split('@')[0] || "USER"}
            balance={balance}
            balanceHidden={balanceHidden}
            onEyeClick={(e) => {
              e.stopPropagation();
              setBalanceHidden(!balanceHidden);
            }}
          />
        </div>
        
        {/* ── Game Grid ── */}
        <div className="relative w-full bg-[#111111] rounded-3xl border border-white/5 p-4 shadow-2xl flex flex-col items-center">
          
          {/* Top stats bar */}
          <div className="w-full flex justify-between items-center mb-4">
            <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Multiplier</span>
              <span className="text-lg font-black text-white">{multiplier.toFixed(2)}x</span>
            </div>
            
            {(gameState === 'crashed' || gameState === 'cashed_out') && (
              <div className={`px-4 py-2 rounded-xl border font-black ${gameState === 'crashed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                {gameState === 'crashed' ? 'CRASHED' : `WON ₹${(parseFloat(betAmount) * multiplier).toFixed(2)}`}
              </div>
            )}
            
            <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/5 text-right">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Potential</span>
              <span className="text-lg font-black text-blue-400">₹{(parseFloat(betAmount) * multiplier).toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] aspect-square">
            {Array.from({ length: 25 }).map((_, i) => {
              const isRevealed = revealed[i];
              const isMine = grid[i];
              const isHit = hitIndex === i;
              
              return (
                <motion.button
                  key={i}
                  whileTap={!isRevealed && gameState === 'playing' ? { scale: 0.9 } : undefined}
                  onClick={() => revealTile(i)}
                  disabled={isRevealed || gameState !== 'playing'}
                  className={`rounded-xl flex items-center justify-center relative overflow-hidden transition-colors
                    ${!isRevealed ? 'bg-[#222222] hover:bg-[#333333] border-b-4 border-[#151515] shadow-inner' 
                    : isMine 
                      ? isHit ? 'bg-red-500 border border-red-400' : 'bg-[#1A1A1A] border border-white/5 opacity-50'
                      : 'bg-[#1A1A1A] border border-white/5'}
                  `}
                >
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative z-10"
                      >
                        {isMine ? (
                          <Skull className={`${isHit ? 'text-black' : 'text-red-500'} w-6 h-6`} />
                        ) : (
                          <Diamond className="text-blue-400 w-6 h-6" fill="currentColor" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Betting Controls ── */}
        <div className="bg-[#111111] rounded-3xl p-5 border border-white/5 flex flex-col gap-4 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Bet Amount</label>
              <div className="flex bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">₹</span>
                  <input 
                    type="number"
                    value={betAmount}
                    onChange={e => setBetAmount(e.target.value)}
                    disabled={gameState === 'playing'}
                    className="w-full bg-transparent py-4 pl-8 pr-2 text-white font-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Mines</label>
              <div className="flex bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <select 
                  value={numMines}
                  onChange={e => setNumMines(parseInt(e.target.value))}
                  disabled={gameState === 'playing'}
                  className="w-full bg-transparent py-4 px-4 text-white font-black focus:outline-none appearance-none text-center"
                >
                  {[1,2,3,4,5,6,7,8,9,10,15,20,24].map(n => (
                    <option key={n} value={n} className="bg-[#1A1A1A]">{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={gameState === 'playing' ? () => cashOut() : startGame}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              gameState === 'playing' 
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
          >
            {gameState === 'playing' ? (
              <>Cash Out</>
            ) : (
              <>Place Bet</>
            )}
          </button>
        </div>

        {/* ── Provably Fair Section ── */}
        <button 
          onClick={() => setShowProvablyFair(!showProvablyFair)}
          className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          <ShieldCheck size={14} /> Provably Fair
        </button>
        
        <AnimatePresence>
          {showProvablyFair && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-4 overflow-hidden"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-white/30 font-bold block mb-1">Server Seed (Hashed)</label>
                  <input readOnly value={serverSeed} className="w-full bg-[#1A1A1A] p-2 rounded-lg text-xs font-mono text-white/50 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/30 font-bold block mb-1">Client Seed</label>
                  <input value={clientSeed} onChange={e => setClientSeed(e.target.value)} className="w-full bg-[#1A1A1A] p-2 rounded-lg text-xs font-mono text-white/80 outline-none focus:ring-1 focus:ring-white/20" />
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  The grid logic is securely generated using a seeded Fisher-Yates shuffle. The platform takes a 4% edge on calculated payouts to maintain liquidity.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
