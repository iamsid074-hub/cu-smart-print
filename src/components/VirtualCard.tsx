import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface VirtualCardProps {
  name: string;
  balance: number;
  balanceHidden?: boolean;
  className?: string;
  onFlip?: () => void;
  onEyeClick?: (e: React.MouseEvent) => void;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({
  name,
  balance,
  balanceHidden = false,
  className = '',
  onFlip,
  onEyeClick
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleTap = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  return (
    <div 
      className={`perspective-1000 w-full max-w-[450px] mx-auto cursor-pointer group px-1 sm:px-0 ${className}`}
      onClick={handleTap}
    >
      <motion.div
        className="relative w-full aspect-[1.586/1] preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.02, translateY: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* FRONT OF CARD */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#121212] rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col justify-between p-6">
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />

          {/* Top Section */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c9a961] flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-black" fill="currentColor" />
              </div>
              <span className="text-white font-black tracking-widest uppercase text-base sm:text-lg">CU CARD</span>
            </div>
            <div className="flex gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]/80" />
            </div>
          </div>

          {/* Middle Section (Chip + Number) */}
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-[#e6c15c] via-[#d4af37] to-[#b3932b] border border-[#f0df9e] flex flex-col justify-between py-1 px-1.5 opacity-90 shadow-inner">
              <div className="w-full h-[1px] bg-black/20" />
              <div className="w-full h-[1px] bg-black/20" />
              <div className="w-full h-[1px] bg-black/20" />
            </div>
            <div className="text-white/90 font-mono text-base sm:text-2xl tracking-[0.1em] sm:tracking-[0.15em] drop-shadow-md">
              •••• •••• •••• 8834
            </div>
          </div>

          {/* Bottom Section */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold mb-1">Cardholder</p>
              <p className="text-white font-medium tracking-widest uppercase text-sm">{name || 'USER'}</p>
            </div>
            
            <div className="text-right">
              <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Balance</p>
              <div className="flex items-center justify-end gap-2">
                {balanceHidden ? (
                  <p className="text-white font-black text-lg tracking-[0.1em] mt-1">••••</p>
                ) : (
                  <p className="text-white font-black text-lg">₹{balance.toLocaleString('en-IN')}</p>
                )}
                {onEyeClick && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEyeClick(e);
                    }}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-1"
                  >
                    {balanceHidden ? <EyeOff className="w-3.5 h-3.5 text-white/70" /> : <Eye className="w-3.5 h-3.5 text-white/70" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* BACK OF CARD */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[1.25rem] shadow-2xl border border-white/10 overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-black mt-6 shadow-inner" />
          
          <div className="p-6">
            {/* Signature Panel */}
            <div className="w-full h-10 bg-[#e5e5e5] rounded flex items-center justify-end px-4 mt-2">
              <span className="font-mono text-black font-bold italic tracking-widest">•••</span>
            </div>
            
            {/* Terms */}
            <div className="mt-6 text-[8px] text-white/40 leading-relaxed text-center px-4">
              This card is virtual and intended for use within the BAZZAR ecosystem. Keep your account details secure. Not a real credit card.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
