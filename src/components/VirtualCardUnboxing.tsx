import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
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
  const [step, setStep] = useState<'initial' | 'opening' | 'revealed'>('initial');
  const x = useMotionValue(0);
  const swipeTextOpacity = useTransform(x, [0, 80], [1, 0]);
  const openingOpacity = useTransform(x, [80, 160], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (x.get() > 150) {
      setStep('opening');
      
      // Force handle to end
      animate(x, 256, { type: "spring", stiffness: 400, damping: 30 });
      
      // Box opening animation (1.5s) -> Card reveal (2s)
      setTimeout(() => {
        setStep('revealed');
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Let them see it, then complete
        setTimeout(() => {
          onComplete();
        }, 3000);
      }, 1500);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
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
              <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full" />
              <Package className="w-24 h-24 text-[#d4af37] relative z-10" />
            </motion.div>
            
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">
              Your Premium Card<br/>is ready!
            </h2>
            
            {/* Swipe Button Container */}
            <div className="w-full max-w-[320px] mt-12 bg-[#1a1a1a] border border-white/10 rounded-full h-16 relative overflow-hidden flex items-center">
              
              {/* OPENING... Text (Fades in) */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: openingOpacity }}
              >
                <span className="font-bold tracking-widest text-[13px] uppercase text-[#d4af37]">
                  Opening...
                </span>
              </motion.div>

              {/* SWIPE TO UNBOX Text (Fades out) */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: swipeTextOpacity }}
              >
                <span className="font-bold tracking-widest text-[13px] uppercase flex items-center gap-2 ml-4 text-white/60">
                  <ArrowRight className="w-4 h-4 text-white/50" />
                  Swipe to Unbox
                  <ArrowLeft className="w-4 h-4 opacity-0" />
                </span>
              </motion.div>
              
              <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: 0, right: 256 }} // 320 - 64
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 relative left-0 border border-gray-300 touch-none will-change-transform"
                style={{ x, zIndex: 10 }}
              >
                <Package className="w-6 h-6 text-[#1a1a1a]" />
              </motion.div>
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
            <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full opacity-50" />
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
