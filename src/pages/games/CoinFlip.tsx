import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Coins, RotateCcw } from "lucide-react";

export default function CoinFlip() {
  const navigate = useNavigate();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails" | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [demoBalance, setDemoBalance] = useState<number>(1000);
  const [message, setMessage] = useState<string>("");

  const handleFlip = () => {
    if (!selectedSide) {
      setMessage("Please select Heads or Tails first!");
      return;
    }
    if (betAmount > demoBalance) {
      setMessage("Not enough demo balance!");
      return;
    }

    setMessage("");
    setIsFlipping(true);
    setResult(null);
    setDemoBalance(prev => prev - betAmount);

    // Simulate flip time
    setTimeout(() => {
      const isHeads = Math.random() > 0.5;
      const flipResult = isHeads ? "heads" : "tails";
      setResult(flipResult);
      setIsFlipping(false);

      if (flipResult === selectedSide) {
        setDemoBalance(prev => prev + betAmount * 2);
        setMessage("You Won! 🎉");
      } else {
        setMessage("You Lost! 😢");
      }
    }, 2000);
  };

  const resetGame = () => {
    setResult(null);
    setSelectedSide(null);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-24 relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-amber-900/20 to-transparent pointer-events-none" />
      
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
            <Coins className="text-amber-400" size={24} />
            <h1 className="text-xl font-bold tracking-tight">Coin Flip</h1>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold border border-white/10">
          Demo: ₹{demoBalance}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto w-full">
        {/* Coin Animation Area */}
        <div className="h-64 flex flex-col items-center justify-center relative w-full mb-8">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-0 px-6 py-2 rounded-full font-bold text-lg shadow-lg ${
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
            animate={isFlipping ? {
              rotateY: [0, 360, 720, 1080, 1440],
              y: [0, -100, 0]
            } : {
              rotateY: result === "tails" ? 180 : 0
            }}
            transition={{
              duration: isFlipping ? 2 : 0.5,
              ease: "easeInOut"
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-32 h-32 relative mt-12"
          >
            {/* Heads Side */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center border-[4px] border-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.3)] backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-4xl font-black text-amber-900 drop-shadow-md">H</span>
            </div>
            {/* Tails Side */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-[4px] border-slate-200 shadow-[0_0_30px_rgba(148,163,184,0.3)] backface-hidden"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="text-4xl font-black text-slate-800 drop-shadow-md">T</span>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-6 bg-white/[0.03] p-6 rounded-3xl border border-white/[0.08]">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedSide("heads")}
              disabled={isFlipping}
              className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                selectedSide === "heads"
                  ? "bg-amber-500 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              HEADS
            </button>
            <button
              onClick={() => setSelectedSide("tails")}
              disabled={isFlipping}
              className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                selectedSide === "tails"
                  ? "bg-slate-400 text-slate-900 shadow-[0_0_20px_rgba(148,163,184,0.4)] scale-105"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              TAILS
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
                  disabled={isFlipping}
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
              onClick={handleFlip}
              disabled={isFlipping || !selectedSide}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg shadow-[0_4px_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {isFlipping ? "FLIPPING..." : "FLIP COIN"}
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
