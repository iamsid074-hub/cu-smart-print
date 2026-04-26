import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { VirtualCard } from './VirtualCard';

interface VirtualCardUnboxingProps {
  name: string;
  balance: number;
  onComplete: () => void;
}

export const VirtualCardUnboxing: React.FC<VirtualCardUnboxingProps> = ({
  name,
  balance,
  onComplete
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [step, setStep] = useState<'initial' | 'opening' | 'revealed'>('initial');

  const handleDrag = (event: any, info: any) => {
    // Assuming a total swipe distance of about 200px
    const progress = Math.max(0, Math.min(100, (info.offset.x / 200) * 100));
    setSwipeProgress(progress);
  };

  const handleDragEnd = (event: any, info: any) => {
    if (swipeProgress > 80 || info.offset.x > 150) {
      setStep('opening');
      
      // Box opening animation (1.5s) -> Card reveal (2s)
      setTimeout(() => {
        setStep('revealed');
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate(200);
        
        // Let them see it, then complete
        setTimeout(() => {
          onComplete();
        }, 3000);
      }, 1500);
    } else {
      setSwipeProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[450px] mx-auto min-h-[400px]">
      <AnimatePresence mode="wait">
        
        {step === 'initial' && (
          <motion.div 
            key="package"
            className="flex flex-col items-center w-full"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="relative w-40 h-40 mb-8 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-[#d4af37]/20 blur-3xl rounded-full" />
              <Package className="w-24 h-24 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] relative z-10" />
            </motion.div>
            
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">
              Your Premium Card<br/>is ready!
            </h2>
            
            {/* Swipe Button Container */}
            <div className="w-full max-w-[300px] mt-12 bg-white/5 border border-white/10 rounded-full h-16 relative overflow-hidden flex items-center shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/50 font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Swipe to Unbox
                  <ArrowLeft className="w-4 h-4 opacity-0" /> {/* Balance for centering */}
                </span>
              </div>
              
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 236 }} // 300 - 64 (button width)
                dragElastic={0.1}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ x: swipeProgress === 0 ? 0 : undefined }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 relative left-0"
              >
                <ArrowRight className="w-6 h-6 text-black" />
              </motion.div>
              
              {/* Highlight fill behind button */}
              <div 
                className="absolute top-0 left-0 h-full bg-[#d4af37]/20 pointer-events-none"
                style={{ width: `calc(${swipeProgress}% + 32px)` }}
              />
            </div>
          </motion.div>
        )}

        {step === 'opening' && (
          <motion.div 
            key="opening"
            className="flex items-center justify-center relative w-full h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute"
              animate={{ y: -50, opacity: 0, rotateX: 45 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <Package className="w-24 h-24 text-[#d4af37]" />
            </motion.div>
            <div className="absolute inset-0 bg-[#d4af37]/30 blur-[100px] animate-pulse" />
          </motion.div>
        )}

        {step === 'revealed' && (
          <motion.div 
            key="revealed"
            className="w-full flex flex-col items-center"
            initial={{ y: 100, scale: 0.8, opacity: 0, rotateX: -15 }}
            animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            <VirtualCard name={name} balance={balance} />
            <motion.p 
              className="mt-8 text-[#d4af37] font-bold tracking-widest uppercase text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Your Premium Card is Ready!
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
