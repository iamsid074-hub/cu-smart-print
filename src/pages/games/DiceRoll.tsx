import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Dices, RotateCcw } from "lucide-react";

export default function DiceRoll() {
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<"low" | "high" | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [demoBalance, setDemoBalance] = useState<number>(1000);
  const [message, setMessage] = useState<string>("");

  // low = 1, 2, 3 | high = 4, 5, 6
  const handleRoll = () => {
    if (!selectedGuess) {
      setMessage("Please select High or Low!");
      return;
    }
    if (betAmount > demoBalance) {
      setMessage("Not enough demo balance!");
      return;
    }

    setMessage("");
    setIsRolling(true);
    setResult(null);
    setDemoBalance(prev => prev - betAmount);

    // Simulate roll time
    setTimeout(() => {
      const rolledNumber = Math.floor(Math.random() * 6) + 1;
      setResult(rolledNumber);
      setIsRolling(false);

      const isLow = rolledNumber <= 3;
      const won = (selectedGuess === "low" && isLow) || (selectedGuess === "high" && !isLow);

      if (won) {
        setDemoBalance(prev => prev + betAmount * 2);
        setMessage(`Rolled ${rolledNumber}. You Won! 🎉`);
      } else {
        setMessage(`Rolled ${rolledNumber}. You Lost! 😢`);
      }
    }, 1500);
  };

  const resetGame = () => {
    setResult(null);
    setSelectedGuess(null);
    setMessage("");
  };

  // Helper to render dice dots based on number
  const renderDiceDots = (num: number) => {
    const dotClasses = "w-3 h-3 bg-indigo-900 rounded-full shadow-inner";
    switch(num) {
      case 1: return <div className={dotClasses} />;
      case 2: return <><div className={`${dotClasses} self-start`} /><div className={`${dotClasses} self-end`} /></>;
      case 3: return <><div className={`${dotClasses} self-start`} /><div className={dotClasses} /><div className={`${dotClasses} self-end`} /></>;
      case 4: return <><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/></>;
      case 5: return <><div className={dotClasses}/><div className={dotClasses}/><div className={`${dotClasses} col-span-2 place-self-center`}/><div className={dotClasses}/><div className={dotClasses}/></>;
      case 6: return <><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/><div className={dotClasses}/></>;
      default: return <span className="text-4xl font-black text-indigo-900">?</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-24 relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Dices className="text-indigo-400" size={24} />
            <h1 className="text-xl font-bold tracking-tight">Dice Roll</h1>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold border border-white/10">
          Demo: ₹{demoBalance}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto w-full">
        {/* Dice Animation Area */}
        <div className="h-64 flex flex-col items-center justify-center relative w-full mb-8">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-0 px-6 py-2 rounded-full font-bold text-lg shadow-lg z-10 ${
                  message.includes("Won") ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                  message.includes("Lost") ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                  "bg-white/10 text-white"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={isRolling ? {
              rotate: [0, 90, 180, 270, 360, 450, 540, 720],
              y: [0, -60, 20, -30, 0],
              scale: [1, 1.2, 0.9, 1.1, 1]
            } : {
              rotate: result ? 0 : -10,
              y: 0,
              scale: 1
            }}
            transition={{
              duration: isRolling ? 1.5 : 0.3,
              ease: "easeInOut"
            }}
            className="w-32 h-32 mt-12 bg-gradient-to-br from-indigo-100 to-indigo-300 rounded-3xl border-[6px] border-indigo-50 shadow-[0_10px_40px_rgba(99,102,241,0.4)] flex items-center justify-center relative overflow-hidden"
          >
            <div className={`w-full h-full p-6 grid place-items-center gap-2 ${result === 4 || result === 6 ? 'grid-cols-2 grid-rows-2' : result === 5 ? 'grid-cols-2 grid-rows-3' : result === 2 || result === 3 ? 'grid-cols-1 grid-rows-1 justify-between' : 'grid-cols-1 grid-rows-1'}`}>
              {!isRolling && result ? renderDiceDots(result) : (
                <span className="text-6xl font-black text-indigo-900 opacity-20">?</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-6 bg-white/[0.03] p-6 rounded-3xl border border-white/[0.08]">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedGuess("low")}
              disabled={isRolling}
              className={`py-3 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedGuess === "low"
                  ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">LOW</span>
              <span className="text-[10px] opacity-80 font-medium tracking-widest">(1, 2, 3)</span>
            </button>
            <button
              onClick={() => setSelectedGuess("high")}
              disabled={isRolling}
              className={`py-3 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedGuess === "high"
                  ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">HIGH</span>
              <span className="text-[10px] opacity-80 font-medium tracking-widest">(4, 5, 6)</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60 font-medium px-1">
              <span>Bet Amount</span>
              <span>₹{betAmount}</span>
            </div>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isRolling}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    betAmount === amount
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleRoll}
              disabled={isRolling || !selectedGuess}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg shadow-[0_4px_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {isRolling ? "ROLLING..." : "ROLL DICE"}
            </button>
            {result && (
              <button
                onClick={resetGame}
                className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10 shrink-0"
              >
                <RotateCcw size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
