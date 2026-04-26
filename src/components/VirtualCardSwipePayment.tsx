import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, ArrowRight, ArrowLeft, Lock, Delete } from 'lucide-react';
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
  const [stage, setStage] = useState<'idle' | 'passcode_required' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isWrongPasscode, setIsWrongPasscode] = useState(false);

  const isInsufficient = balance < amount;

  // Smooth dragging with framer-motion values (avoids React state lag)
  const x = useMotionValue(0);
  
  // Transform opacities based on drag position
  const swipeToPayOpacity = useTransform(x, [0, 80], [1, 0]);
  const payingOpacity = useTransform(x, [80, 160], [0, 1]);

  // Drag max is 256 (320 - 64).

  const handleDragEnd = (event: any, info: any) => {
    if (isInsufficient) return;
    
    if (x.get() > 150) {
      animate(x, 256, { type: "spring", stiffness: 400, damping: 30 });
      
      const storedPasscode = localStorage.getItem("wallet_passcode");
      if (storedPasscode) {
        setStage('passcode_required');
      } else {
        processPayment();
      }
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  };

  const processPayment = () => {
    setStage('processing');
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
    }, 2000);
  };

  const handleNumpadPress = (num: string) => {
    if (isWrongPasscode) setIsWrongPasscode(false);
    if (passcodeInput.length < 4) {
      const newVal = passcodeInput + num;
      setPasscodeInput(newVal);
      if (newVal.length === 4) {
        // Validate
        const storedPasscode = localStorage.getItem("wallet_passcode");
        if (newVal === storedPasscode) {
          processPayment();
        } else {
          setIsWrongPasscode(true);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setTimeout(() => {
            setPasscodeInput("");
            setIsWrongPasscode(false);
          }, 600);
        }
      }
    }
  };

  const handleNumpadDelete = () => {
    if (isWrongPasscode) {
      setIsWrongPasscode(false);
      setPasscodeInput("");
      return;
    }
    setPasscodeInput(prev => prev.slice(0, -1));
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

      {/* ── Fullscreen Payment Flow ── */}
      <AnimatePresence>
        {stage !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#000000] backdrop-blur-3xl flex flex-col items-center pt-24"
          >
            {/* Render the Virtual Card at the top */}
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[450px] px-4 pointer-events-none mb-10"
            >
              <VirtualCard name={userName} balance={balance} balanceHidden={true} />
            </motion.div>

            {/* Passcode UI */}
            {stage === 'passcode_required' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-sm flex flex-col items-center"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Enter Wallet PIN</h2>
                  <p className="text-sm text-gray-400">Confirm payment of ₹{amount.toLocaleString('en-IN')}</p>
                </div>

                {/* PIN Dots */}
                <motion.div 
                  className="flex gap-4 mb-12"
                  animate={isWrongPasscode ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isWrongPasscode
                          ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          : i < passcodeInput.length
                          ? "bg-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </motion.div>

                {/* iOS Style Numpad */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-6 px-8 w-full max-w-[320px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumpadPress(num.toString())}
                      className="w-[72px] h-[72px] rounded-full bg-white/5 border border-white/5 text-2xl font-semibold text-white hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all flex items-center justify-center mx-auto"
                    >
                      {num}
                    </button>
                  ))}
                  <div />
                  <button
                    onClick={() => handleNumpadPress("0")}
                    className="w-[72px] h-[72px] rounded-full bg-white/5 border border-white/5 text-2xl font-semibold text-white hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all flex items-center justify-center mx-auto"
                  >
                    0
                  </button>
                  <button
                    onClick={handleNumpadDelete}
                    className="w-[72px] h-[72px] rounded-full text-white/50 hover:text-white active:scale-95 transition-all flex items-center justify-center mx-auto"
                  >
                    <Delete className="w-8 h-8" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Processing / Success UI */}
            {stage === 'processing' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center mt-20"
              >
                <div className="w-16 h-16 border-4 border-white/10 border-t-[#d4af37] rounded-full animate-spin mb-6" />
                <p className="text-white font-bold tracking-widest uppercase animate-pulse">Processing Payment</p>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center mt-20"
              >
                <div className="w-20 h-20 bg-[#34C759]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,199,89,0.3)]">
                  <CheckCircle className="w-10 h-10 text-[#34C759]" />
                </div>
                <p className="text-2xl font-black text-white mb-2">Payment Successful</p>
                <p className="text-gray-400">₹{amount.toLocaleString('en-IN')} paid via CU Card</p>
              </motion.div>
            )}

            {stage === 'error' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center mt-20"
              >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-2xl font-black text-white mb-2">Payment Failed</p>
                <p className="text-gray-400">{errorMessage}</p>
              </motion.div>
            )}

            {stage === 'passcode_required' && (
              <button 
                onClick={() => {
                  setStage('idle');
                  animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
                  setPasscodeInput('');
                }}
                className="absolute top-10 right-6 text-white/50 hover:text-white font-bold text-sm"
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
