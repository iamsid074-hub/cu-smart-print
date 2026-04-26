import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { VirtualCard } from './VirtualCard';

interface VirtualCardSwipePaymentProps {
  amount: number;
  balance: number;
  onSuccess: () => void;
  onCancel: () => void;
  userName: string;
}

export const VirtualCardSwipePayment: React.FC<VirtualCardSwipePaymentProps> = ({
  amount,
  balance,
  onSuccess,
  onCancel,
  userName
}) => {
  const [stage, setStage] = useState<'idle' | 'machine_appears' | 'swiping' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isInsufficient = balance < amount;

  // Smooth dragging with framer-motion values (avoids React state lag)
  const x = useMotionValue(0);
  
  // Transform opacities based on drag position
  const swipeToPayOpacity = useTransform(x, [0, 80], [1, 0]);
  const payingOpacity = useTransform(x, [80, 160], [0, 1]);

  // Drag max is 256 (320 - 64).

  const handleDragEnd = (event: any, info: any) => {
    if (isInsufficient) return;
    
    // Check current x position (use offset.x or x.get())
    if (x.get() > 150) {
      setStage('machine_appears');
      
      // Force handle to end
      animate(x, 256, { type: "spring", stiffness: 400, damping: 30 });
      
      // Sequence
      setTimeout(() => setStage('swiping'), 500);
      setTimeout(() => setStage('processing'), 2000);
      
      setTimeout(() => {
        if (balance >= amount) {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setStage('success');
          setTimeout(() => onSuccess(), 1500);
        } else {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          setStage('error');
          setErrorMessage('Insufficient balance');
          setTimeout(() => {
            setStage('idle');
            animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
          }, 2000);
        }
      }, 3000);
    } else {
      // Snap back if didn't swipe far enough
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  };

  return (
    <div className="w-full">
      {/* ── Checkout Page UI (Mini preview & Swipe Button) ── */}
      <div className="bg-[#1a1a1a] rounded-[1.5rem] p-4 border border-[#d4af37]/30 shadow-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded border border-[#d4af37]/50 relative overflow-hidden flex items-center justify-center">
             <div className="absolute top-1 left-0 w-full h-[2px] bg-[#d4af37]/80" />
             <div className="w-2 h-1.5 bg-[#d4af37] rounded-sm relative top-1 left-[-4px]" />
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Wallet Balance</p>
            <p className="text-white font-bold text-sm">₹{balance.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">To Pay</p>
          <p className={`font-black text-lg ${isInsufficient ? 'text-red-500' : 'text-[#d4af37]'}`}>
            ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {isInsufficient && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold text-center mb-4">
          Insufficient balance. Please add money to your wallet.
        </div>
      )}

      {/* Swipe to Pay Button */}
      <div className={`w-full max-w-[320px] mx-auto bg-[#1a1a1a] border border-white/10 rounded-full h-16 relative overflow-hidden flex items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ${isInsufficient ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* PAYING... Text (Fades in) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: payingOpacity }}
        >
          <span className="font-bold tracking-widest text-[13px] uppercase text-[#d4af37]">
            Paying...
          </span>
        </motion.div>

        {/* SWIPE TO PAY Text (Fades out) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: swipeToPayOpacity }}
        >
          <span className="font-bold tracking-widest text-[13px] uppercase flex items-center gap-2 ml-4 text-white/60">
            <ArrowRight className="w-4 h-4 text-white/50" />
            Swipe to Pay
            <ArrowLeft className="w-4 h-4 opacity-0" />
          </span>
        </motion.div>
        
        <motion.div
          style={{ x }}
          drag={isInsufficient ? false : "x"}
          dragConstraints={{ left: 0, right: 256 }} // 320 - 64
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 relative left-0 border border-gray-300 touch-none will-change-transform"
        >
          <CreditCard className="w-6 h-6 text-[#1a1a1a]" />
        </motion.div>
      </div>

      {/* ── Fullscreen POS Machine Animation (Stages 2-6) ── */}
      <AnimatePresence>
        {stage !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            {/* POS Machine */}
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative w-[300px] h-[400px] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-[2rem] border-2 border-[#333] shadow-2xl flex flex-col items-center p-6 overflow-hidden"
            >
              {/* POS Screen */}
              <div className="w-full h-32 bg-[#a3b899] rounded-xl border-4 border-[#111] shadow-inner p-4 flex flex-col justify-center items-center font-mono">
                {stage === 'machine_appears' && <span className="text-[#1a3b11] font-bold text-lg animate-pulse">INSERT/SWIPE CARD</span>}
                {stage === 'swiping' && <span className="text-[#1a3b11] font-bold text-lg">READING...</span>}
                {stage === 'processing' && <span className="text-[#1a3b11] font-bold text-lg animate-pulse">PROCESSING...</span>}
                {stage === 'success' && (
                  <div className="flex flex-col items-center text-[#1a3b11]">
                    <CheckCircle className="w-8 h-8 mb-1" />
                    <span className="font-bold">APPROVED</span>
                  </div>
                )}
                {stage === 'error' && (
                  <div className="flex flex-col items-center text-red-800">
                    <XCircle className="w-8 h-8 mb-1" />
                    <span className="font-bold">DECLINED</span>
                  </div>
                )}
              </div>

              {/* POS Keypad (Decor) */}
              <div className="w-full flex-1 mt-6 grid grid-cols-3 gap-2 opacity-50">
                {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((k) => (
                  <div key={k} className="bg-[#111] rounded-lg flex items-center justify-center text-white/30 text-sm font-bold border-b-2 border-black">
                    {k}
                  </div>
                ))}
              </div>

              {/* Card Slot */}
              <div className="absolute -top-4 w-full h-8 bg-black border-b border-[#333] z-20 flex justify-center">
                 <div className={`w-3/4 h-2 bg-[#050505] rounded-full mt-5 border border-[#111] transition-all duration-300 ${stage === 'swiping' ? 'shadow-[0_0_10px_#d4af37]' : ''}`} />
              </div>
            </motion.div>

            {/* The Virtual Card that swipes */}
            <AnimatePresence>
              {stage === 'swiping' && (
                <motion.div
                  initial={{ x: 300, y: -220, rotateZ: 90, scale: 0.6 }}
                  animate={{ x: -300, y: -220, rotateZ: 90, scale: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute z-10 pointer-events-none"
                >
                  <VirtualCard name={userName} balance={balance} />
                </motion.div>
              )}
            </AnimatePresence>

            {stage === 'machine_appears' && (
              <button 
                onClick={() => setStage('idle')}
                className="absolute top-10 right-10 text-white/50 hover:text-white"
              >
                Cancel
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
