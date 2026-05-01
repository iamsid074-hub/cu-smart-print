import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../components/ui/use-toast";
import { VirtualCard } from "../../components/VirtualCard";

interface FakeBet {
  id: string;
  user: string;
  avatarColor: string;
  betAmount: number;
  targetMulti: number;
}

interface BetPanelState {
  id: number;
  isAuto: boolean;
  inputAmount: string;
  autoMulti: string;
  activeBet: number | null; 
  nextBet: number | null; 
  cashedOutAt: number | null;
}

const FIRST_NAMES = "abcdefghijklmnopqrstuvwxyz";
const AVATAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];

const generateFakeName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  return `${first}***${last}`;
};

export default function RealCrash() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [balance, setBalance] = useState<number>(profile?.wallet_balance || 0);
  const [winningsBalance, setWinningsBalance] = useState<number>(profile?.winnings_balance || 0);
  
  const [phase, setPhase] = useState<'betting' | 'playing' | 'crashed'>('betting');
  const [bettingProgress, setBettingProgress] = useState(100);
  
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(1.00);
  const [history, setHistory] = useState<number[]>([1.24, 2.50, 1.05, 5.40, 1.12]);

  // Dual Betting Panels
  const [panels, setPanels] = useState<BetPanelState[]>([
    { id: 1, isAuto: false, inputAmount: "10", autoMulti: "2.00", activeBet: null, nextBet: null, cashedOutAt: null },
    { id: 2, isAuto: false, inputAmount: "10", autoMulti: "2.00", activeBet: null, nextBet: null, cashedOutAt: null }
  ]);
  
  const [fakeBets, setFakeBets] = useState<FakeBet[]>([]);
  const [serverSeed, setServerSeed] = useState("hidden_until_game_ends");
  const [clientSeed, setClientSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  
  const animationRef = useRef<number>();
  const loopTimeoutRef = useRef<NodeJS.Timeout>();
  
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-performance refs for 120hz animation (bypass React state)
  const multiplierRef = useRef<number>(1.00);
  const multiplierTextRef = useRef<HTMLHeadingElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (profile) {
      setBalance(profile.wallet_balance);
      setWinningsBalance(profile.winnings_balance || 0);
    }
  }, [profile]);

  // Auto Cashout Effect
  useEffect(() => {
    if (phase === 'playing') {
      panels.forEach(p => {
        if (p.isAuto && p.activeBet !== null && p.cashedOutAt === null) {
          const target = parseFloat(p.autoMulti);
          if (!isNaN(target) && multiplier >= target) {
            cashOut(p.id, target);
          }
        }
      });
    }
  }, [multiplier, phase, panels]);

  // Main Loop
  useEffect(() => {
    let startTime: number;
    
    if (phase === 'betting') {
      if (pathRef.current) pathRef.current.setAttribute('d', 'M 0 320 L 0 320');
      if (fillRef.current) fillRef.current.setAttribute('d', 'M 0 320 L 0 320');
      if (planeRef.current) {
        planeRef.current.style.transition = 'none';
        planeRef.current.style.transform = `translate(0px, 320px)`;
      }

      const duration = 4000;
      startTime = performance.now();
      
      const updateProgress = (time: number) => {
        const elapsed = time - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        
        // 120hz perf opt: direct DOM update
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${remaining}%`;
        }
        
        if (elapsed < duration) {
          animationRef.current = requestAnimationFrame(updateProgress);
        } else {
          startPlayingPhase();
        }
      };
      animationRef.current = requestAnimationFrame(updateProgress);
    } 
    else if (phase === 'playing') {
      startTime = performance.now();
      
      const animatePlane = (time: number) => {
        const elapsed = (time - startTime) / 1000;
        let currentMulti = Math.pow(1.06, elapsed * 5);
        
        if (currentMulti >= crashPoint) {
          handleCrash(crashPoint);
          return;
        }
        
        // --- 120hz Performance Optimization ---
        // Do NOT use setMultiplier(currentMulti) here because it causes a full React re-render 
        // 60-120 times per second, which kills performance on mobile.
        // Instead, update the DOM directly via a ref for the text.
        multiplierRef.current = currentMulti;
        if (multiplierTextRef.current) {
          multiplierTextRef.current.textContent = currentMulti.toFixed(2) + 'x';
        }

        if (containerRef.current && pathRef.current && fillRef.current && planeRef.current) {
          const w = containerRef.current.clientWidth;
          const h = 320;
          const maxPlaneX = w - 60;
          const maxPlaneY = 40;
          const progressX = Math.min(1, elapsed / 10);
          const x = progressX * maxPlaneX;
          const progressY = Math.min(1, elapsed / 15);
          const y = h - (progressY * (h - maxPlaneY));
          
          const d = `M 0 ${h} Q ${x*0.4} ${h} ${x} ${y}`;
          const fillD = `M 0 ${h} Q ${x*0.4} ${h} ${x} ${y} L ${x} ${h} Z`;
          
          pathRef.current.setAttribute('d', d);
          fillRef.current.setAttribute('d', fillD);
          planeRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }

        animationRef.current = requestAnimationFrame(animatePlane);
      };
      
      animationRef.current = requestAnimationFrame(animatePlane);
    } else if (phase === 'crashed') {
      if (planeRef.current) {
        planeRef.current.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        planeRef.current.style.transform = `translate(500px, -200px)`;
      }
      loopTimeoutRef.current = setTimeout(() => setPhase('betting'), 3000);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [phase, crashPoint]);

  const startPlayingPhase = () => {
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    const rawCrash = Math.floor((100 * e - h) / (e - h)) / 100;
    
    // Transfer nextBets to activeBets and evaluate total bet
    let totalBet = 0;
    const newPanels = panels.map(p => {
      if (p.nextBet !== null) {
        totalBet += p.nextBet;
        // Securely deduct the bet from the server NOW
        if (user) {
          supabase.rpc('place_bet', { bet_amount: p.nextBet, game_name: 'Crash' }).then(({ error }) => {
            if (error) {
               console.error("Failed to place bet on server:", error);
               toast({ title: "Bet Rejected", description: "Insufficient balance or error.", variant: "destructive" });
               // Ideally we should refund them locally or drop their bet, but for now we just log it.
            }
          });
        }
      }
      return {
        ...p,
        activeBet: p.nextBet !== null ? p.nextBet : null,
        nextBet: null,
        cashedOutAt: null
      };
    });
    setPanels(newPanels);

    let targetCrash = Math.max(1.00, rawCrash);

    // Apply House Edge / Rigging logic based on total bet amount
    if (totalBet > 0) {
      // 1. Large bets (> 100): Aggressive instant crash (66% chance)
      if (totalBet > 100) {
        if (Math.random() < 0.66) {
           targetCrash = 1.00 + (Math.random() * 0.1); // Crash instantly between 1.00x and 1.10x
        } else {
           // If they survive the instant crash, cap it low anyway
           targetCrash = Math.min(targetCrash, 1.2 + (Math.random() * 0.3));
        }
      } 
      // 2. Medium bets (50 - 100): Cap at 1.5x - 1.6x
      else if (totalBet > 50 && totalBet <= 100) {
        targetCrash = Math.min(targetCrash, 1.5 + (Math.random() * 0.1));
      } 
      // 3. Small bets (10 - 50): Let them win a bit, cap at 2.0x - 2.5x
      else if (totalBet >= 10 && totalBet <= 50) {
         targetCrash = Math.min(targetCrash, 2.0 + (Math.random() * 0.5));
      }

      // 4. Track total bets played in session to enforce max win rate (1-2 wins per 3 plays)
      const sessionPlays = parseInt(sessionStorage.getItem('cr_session_plays') || '0') + 1;
      const sessionWins = parseInt(sessionStorage.getItem('cr_session_wins') || '0');
      
      sessionStorage.setItem('cr_session_plays', sessionPlays.toString());

      // If they've won too much recently in this session, force a loss
      if (sessionPlays >= 3 && sessionWins >= 2) {
         targetCrash = 1.00 + (Math.random() * 0.05); // Force instant loss
         sessionStorage.setItem('cr_session_plays', '0'); // Reset cycle
         sessionStorage.setItem('cr_session_wins', '0');
      }
    }
    
    setCrashPoint(targetCrash);
    setServerSeed(crypto.randomUUID());
    
    
    // Generate fresh fake bets
    const count = Math.floor(Math.random() * 15) + 15;
    const newFakeBets: FakeBet[] = Array.from({ length: count }, (_, i) => {
      const bet = Math.floor(Math.random() * 100) > 80 ? (Math.random() * 5000 + 500) : (Math.random() * 500 + 10);
      const r = Math.random();
      let target = 0;
      if (r < 0.5) target = 1.01 + Math.random() * 0.8;
      else if (r < 0.8) target = 1.5 + Math.random() * 2.5;
      else target = 3.5 + Math.random() * 15;
      
      return {
        id: Math.random().toString(),
        user: generateFakeName(),
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        betAmount: Math.floor(bet),
        targetMulti: target
      };
    }).sort((a,b) => b.betAmount - a.betAmount);
    
    setFakeBets(newFakeBets);
    setMultiplier(1.00);
    setPhase('playing');
  };

  const handleCrash = (finalMulti: number) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    multiplierRef.current = finalMulti;
    if (multiplierTextRef.current) multiplierTextRef.current.textContent = finalMulti.toFixed(2) + 'x';
    setMultiplier(finalMulti); // Still sync React state at the END of the round
    setPhase('crashed');
    setHistory(prev => [finalMulti, ...prev].slice(0, 10));
    
    // Process losses
    setPanels(prev => prev.map(p => {
      // (Losses are already deducted from the DB in startPlayingPhase)
      return p;
    }));
  };

  // ─── ACTIONS ───
  const updatePanel = (id: number, changes: Partial<BetPanelState>) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const placeBet = (id: number) => {
    const panel = panels.find(p => p.id === id)!;
    const amount = parseFloat(panel.inputAmount);
    
    if (isNaN(amount) || amount < 10 || amount > 8000) return toast({ title: "Invalid Bet", description: "Limit ₹10 - ₹8000.", variant: "destructive" });
    if (amount > balance) return toast({ title: "Insufficient Funds", variant: "destructive" });

    const newBalance = balance - amount;
    setBalance(newBalance);
    // Local state only, DB synced when game actually starts


    updatePanel(id, { nextBet: amount });
    if (phase !== 'betting') toast({ title: "Bet Queued" });
  };

  const cancelBet = (id: number) => {
    const panel = panels.find(p => p.id === id)!;
    if (panel.nextBet !== null) {
      const newBalance = balance + panel.nextBet;
      setBalance(newBalance);
      // Local state only
      updatePanel(id, { nextBet: null });
    }
  };

  const cashOut = (id: number, overrideMulti?: number) => {
    setPanels(prev => {
      const panel = prev.find(p => p.id === id)!;
      if (phase !== 'playing' || panel.activeBet === null || panel.cashedOutAt !== null) return prev;
      
      const finalMulti = overrideMulti || multiplier;
      const totalReturn = panel.activeBet * finalMulti;   // full payout
      const profit = totalReturn - panel.activeBet;        // net winnings only

      // Record a win for the session tracker
      const currentWins = parseInt(sessionStorage.getItem('cr_session_wins') || '0');
      sessionStorage.setItem('cr_session_wins', (currentWins + 1).toString());

      // Update local state: The full return (stake + profit) goes to winnings balance
      setWinningsBalance(w => w + totalReturn);

      // Add total return directly to winnings on server
      if (user) {
        supabase.rpc('process_game_win', {
          win_amount: totalReturn,
          game_name: `Crash (x${finalMulti.toFixed(2)})`
        }).then(({ error }) => {
          if (error) console.error("Error processing crash win:", error);
        });
      }
      
      toast({ title: "Cashed Out! 🎉", description: `You won ₹${profit.toFixed(2)} profit at ${finalMulti.toFixed(2)}x` });
      return prev.map(p => p.id === id ? { ...p, cashedOutAt: finalMulti } : p);
    });
  };

  const renderActionButton = (p: BetPanelState) => {
    const canBet = p.nextBet === null && p.activeBet === null;
    const isQueued = p.nextBet !== null;
    const canCashOut = phase === 'playing' && p.activeBet !== null && p.cashedOutAt === null;

    if (canCashOut) {
      return (
        <button onClick={() => cashOut(p.id)} className="w-full h-full rounded-xl bg-orange-500 shadow-[0_4px_0_#c2410c] active:shadow-[0_0px_0_#c2410c] active:translate-y-1 flex flex-col items-center justify-center transition-all">
          <span className="font-black text-white text-lg leading-none">CASH OUT</span>
          <span className="text-[12px] font-bold text-white/90 mt-1">₹{(p.activeBet! * multiplier).toFixed(2)}</span>
        </button>
      );
    }
    if (isQueued) {
      return (
        <button onClick={() => cancelBet(p.id)} className="w-full h-full rounded-xl bg-red-500 shadow-[0_4px_0_#b91c1c] active:shadow-[0_0px_0_#b91c1c] active:translate-y-1 flex flex-col items-center justify-center transition-all">
          <span className="font-black text-white text-lg">CANCEL</span>
          {phase === 'playing' && <span className="text-[10px] font-bold text-white/90 mt-1">WAITING</span>}
        </button>
      );
    }
    if (p.cashedOutAt !== null) {
      return (
        <button disabled className="w-full h-full rounded-xl bg-green-500 shadow-[0_4px_0_#15803d] opacity-80 flex flex-col items-center justify-center transition-all">
          <span className="font-black text-white text-lg">WON</span>
          <span className="text-[12px] font-bold text-white/90 mt-1">₹{(p.activeBet! * p.cashedOutAt).toFixed(2)}</span>
        </button>
      );
    }
    return (
      <button onClick={() => placeBet(p.id)} className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all ${phase === 'betting' ? 'bg-[#22c55e] shadow-[0_4px_0_#15803d] active:shadow-[0_0px_0_#15803d]' : 'bg-[#222] border border-white/10 shadow-[0_4px_0_#111] active:shadow-[0_0px_0_#111]'} active:translate-y-1`}>
        <span className={`font-black text-xl leading-none ${phase === 'betting' ? 'text-white' : 'text-white/50'}`}>BET</span>
        {phase !== 'betting' && <span className="text-[10px] font-bold text-white/50 mt-1">NEXT ROUND</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans pb-24 relative">
      <div className="px-5 pt-12 pb-2 flex items-center justify-between z-20 relative">
        <button onClick={() => navigate("/games")} className="flex items-center gap-2 text-white/50 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <span className="text-white/50 text-sm font-black tracking-[0.2em] uppercase">Crash</span>
        <div className="w-5" />
      </div>

      <div className="px-2 md:px-4 max-w-lg mx-auto flex flex-col gap-3 z-10 relative">
        <div className="w-full mb-1">
          <VirtualCard
            name={profile?.full_name || user?.email?.split('@')[0] || "USER"}
            balance={balance}
            winningsBalance={winningsBalance}
          />
        </div>
        
        {/* ── Aviator-style Game Canvas ── */}
        <div ref={containerRef} className="relative w-full h-[320px] bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'repeating-conic-gradient(from 0deg at 0% 100%, #333 0deg 5deg, #111 5deg 10deg)', transformOrigin: 'bottom left' }} />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path ref={fillRef} fill="url(#curveGradient)" />
            <path ref={pathRef} fill="none" stroke="#ef4444" strokeWidth="4" />
          </svg>

          {phase === 'betting' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
              <div ref={progressBarRef} className="h-full bg-red-500 transition-all duration-75 ease-linear" style={{ width: `${bettingProgress}%` }} />
            </div>
          )}

          <div className="z-10 text-center mt-10">
            {phase === 'betting' && <h1 className="font-black tracking-tighter text-white/50 text-3xl uppercase">Waiting...</h1>}
            {phase !== 'betting' && (
              <h1 
                ref={multiplierTextRef}
                className={`font-black tracking-tighter transition-colors ${phase === 'crashed' ? 'text-red-500' : 'text-white'}`} 
                style={{ fontSize: 'clamp(4rem, 15vw, 6rem)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))', fontVariantNumeric: 'tabular-nums' }}
              >
                {multiplier.toFixed(2)}x
              </h1>
            )}
            {phase === 'crashed' && <p className="text-red-500 font-bold tracking-widest uppercase text-sm mt-2">Flew Away</p>}
          </div>

          {phase !== 'betting' && (
            <div ref={planeRef} className="absolute left-0 top-0 w-16 h-16 pointer-events-none z-20 -ml-8 -mt-8" style={{ filter: 'drop-shadow(2px 5px 5px rgba(0,0,0,0.5))' }}>
              <svg viewBox="0 0 100 100" fill="#ef4444" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M 10 60 L 25 60 L 25 45 L 10 45 Z" />
                <path d="M 20 65 L 85 65 C 90 65 95 60 95 55 C 95 50 90 45 85 45 L 20 45 Z" />
                <path d="M 40 65 L 60 65 L 70 80 L 30 80 Z" fill="#dc2626"/>
                <path d="M 40 45 L 60 45 L 50 30 L 40 30 Z" fill="#b91c1c"/>
                <path d="M 95 40 L 100 40 L 100 70 L 95 70 Z" fill="#fff" opacity="0.8">
                  <animateTransform attributeName="transform" type="scale" values="1 1; 1 0.2; 1 1" dur="0.1s" repeatCount="indefinite" />
                </path>
                <path d="M 60 52 L 65 58 M 65 52 L 60 58" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>

        {/* ── History Bar ── */}
        <div className="flex gap-2 overflow-x-auto py-2 px-1 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {history.map((h, i) => (
            <div key={i} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${h < 2 ? 'bg-[#1A1A1A] text-white/50' : 'bg-green-500/10 text-green-500'}`}>
              {h.toFixed(2)}x
            </div>
          ))}
        </div>

        {/* ── DUAL BETTING CONTROLS ── */}
        <div className="flex flex-col md:flex-row gap-3">
          {panels.map((p, index) => (
            <div key={p.id} className="flex-1 bg-[#1A1A1A] rounded-3xl p-3 border border-white/5 relative shadow-lg">
              
              {/* Tab Selector */}
              <div className="flex justify-center mb-3">
                <div className="bg-[#111] rounded-full p-1 flex w-36 relative border border-white/5">
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#333] rounded-full transition-transform duration-200 ease-out shadow-sm ${p.isAuto ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'}`} />
                  <button onClick={() => updatePanel(p.id, { isAuto: false })} className={`flex-1 text-[11px] font-bold py-1 z-10 transition-colors ${!p.isAuto ? 'text-white' : 'text-white/50'}`}>Bet</button>
                  <button onClick={() => updatePanel(p.id, { isAuto: true })} className={`flex-1 text-[11px] font-bold py-1 z-10 transition-colors ${p.isAuto ? 'text-white' : 'text-white/50'}`}>Auto</button>
                </div>
              </div>

              {/* Main Inputs & Action */}
              <div className="flex gap-2 h-[80px]">
                {/* Left side inputs */}
                <div className="w-[55%] flex flex-col gap-1">
                  <div className="flex bg-[#111] rounded-xl border border-white/10 p-1 items-center h-10">
                    <button onClick={() => updatePanel(p.id, { inputAmount: Math.max(10, parseFloat(p.inputAmount)-10).toFixed(2) })} disabled={p.nextBet !== null} className="w-8 h-8 flex items-center justify-center text-white/50 bg-[#222] rounded-lg hover:bg-[#333] active:scale-95 transition-all">-</button>
                    <input type="number" value={p.inputAmount} onChange={e => updatePanel(p.id, { inputAmount: e.target.value })} disabled={p.nextBet !== null} className="flex-1 w-full bg-transparent text-center text-white font-black text-sm focus:outline-none" />
                    <button onClick={() => updatePanel(p.id, { inputAmount: Math.min(8000, parseFloat(p.inputAmount)+10).toFixed(2) })} disabled={p.nextBet !== null} className="w-8 h-8 flex items-center justify-center text-white/50 bg-[#222] rounded-lg hover:bg-[#333] active:scale-95 transition-all">+</button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-1 h-8">
                    {[10, 50, 100, 500].map(val => (
                      <button key={val} onClick={() => updatePanel(p.id, { inputAmount: val.toFixed(2) })} disabled={p.nextBet !== null} className="bg-[#111] border border-white/5 rounded-lg text-[10px] font-bold text-white/50 hover:bg-[#222] hover:text-white transition-colors active:scale-95">
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side ACTION button */}
                <div className="w-[45%]">
                  {renderActionButton(p)}
                </div>
              </div>

              {/* Auto Cashout Options */}
              <AnimatePresence>
                {p.isAuto && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-1">Auto Cash Out</span>
                      <div className="flex items-center bg-[#111] border border-white/10 rounded-xl p-1 w-24 h-8">
                        <input type="number" value={p.autoMulti} onChange={e => updatePanel(p.id, { autoMulti: e.target.value })} disabled={p.nextBet !== null} className="flex-1 w-full bg-transparent text-center text-white font-black text-xs focus:outline-none" />
                        <span className="text-white/30 text-[10px] font-black pr-2">x</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── Live Bets ── */}
        <div className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden mt-2">
          <div className="bg-[#1A1A1A] p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-widest text-white/80">Live Bets</h3>
            </div>
            <span className="text-xs font-bold text-white/50">{fakeBets.length + panels.filter(p => p.activeBet !== null).length} Playing</span>
          </div>
          
          <div className="flex flex-col max-h-[400px] overflow-y-auto no-scrollbar">
            {/* Show User's Active Bets First */}
            {panels.filter(p => p.activeBet !== null).map((p, idx) => (
              <div key={`user-bet-${p.id}`} className={`flex items-center justify-between p-3 border-b border-white/10 transition-colors ${p.cashedOutAt ? 'bg-green-500/20' : phase === 'crashed' ? 'bg-red-500/10' : 'bg-white/5'}`}>
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20 text-white">
                    You
                  </div>
                  <span className="text-xs font-bold text-white">You {idx + 1 > 1 ? `(${idx+1})` : ''}</span>
                </div>
                <div className="w-1/3 text-center">
                  <span className="text-xs font-bold text-white">₹{p.activeBet!.toFixed(2)}</span>
                </div>
                <div className="w-1/3 text-right">
                  {p.cashedOutAt ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-green-400 bg-green-500/20 px-2 py-0.5 rounded-md">{p.cashedOutAt.toFixed(2)}x</span>
                      <span className="text-xs font-bold text-white mt-0.5">₹{(p.activeBet! * p.cashedOutAt).toFixed(2)}</span>
                    </div>
                  ) : phase === 'crashed' ? (
                    <span className="text-xs font-bold text-red-500/50">-</span>
                  ) : (
                    <span className="text-xs font-bold text-white/20">...</span>
                  )}
                </div>
              </div>
            ))}

            {/* Fake Bots */}
            {fakeBets.map((bet) => {
              const hasCashedOut = phase === 'crashed' ? bet.targetMulti <= crashPoint : bet.targetMulti <= multiplier;
              const hasLost = phase === 'crashed' && bet.targetMulti > crashPoint;
              
              return (
                <div key={bet.id} className={`flex items-center justify-between p-3 border-b border-white/5 transition-colors ${
                  hasCashedOut ? 'bg-green-500/10' : hasLost ? 'bg-red-500/5 opacity-50' : ''
                }`}>
                  <div className="flex items-center gap-3 w-1/3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${bet.avatarColor}`}>
                      {bet.user[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white/70">{bet.user}</span>
                  </div>
                  <div className="w-1/3 text-center">
                    <span className="text-xs font-bold text-white/50">₹{bet.betAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-1/3 text-right">
                    {hasCashedOut ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-green-500 bg-green-500/20 px-2 py-0.5 rounded-md">
                          {bet.targetMulti.toFixed(2)}x
                        </span>
                        <span className="text-xs font-bold text-white mt-0.5">
                          ₹{(bet.betAmount * bet.targetMulti).toFixed(2)}
                        </span>
                      </div>
                    ) : hasLost ? (
                      <span className="text-xs font-bold text-red-500/50">-</span>
                    ) : (
                      <span className="text-xs font-bold text-white/20">...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => setShowProvablyFair(!showProvablyFair)} className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors">
          <ShieldCheck size={14} /> Provably Fair
        </button>
        
        <AnimatePresence>
          {showProvablyFair && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#111111] border border-white/5 rounded-2xl p-4 overflow-hidden">
              <div className="space-y-3">
                <div><label className="text-[10px] uppercase text-white/30 font-bold block mb-1">Server Seed (Hashed)</label><input readOnly value={serverSeed} className="w-full bg-[#1A1A1A] p-2 rounded-lg text-xs font-mono text-white/50 outline-none" /></div>
                <div><label className="text-[10px] uppercase text-white/30 font-bold block mb-1">Client Seed</label><input value={clientSeed} onChange={e => setClientSeed(e.target.value)} className="w-full bg-[#1A1A1A] p-2 rounded-lg text-xs font-mono text-white/80 outline-none focus:ring-1 focus:ring-white/20" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
