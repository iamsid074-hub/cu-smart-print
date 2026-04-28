import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, ShieldCheck, Eye, EyeOff, Diamond } from 'lucide-react';

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
        <div className="absolute inset-0 backface-hidden bg-[#0a0a0a] rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/5 overflow-hidden flex flex-col justify-between p-5 sm:p-7">
          
          {/* High-End Metallic Texture Background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d3d3d,transparent)]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          </div>

          {/* Premium Vertical Golden Strip (Left) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-[#d4af37] via-[#f9e29c] to-[#b3932b] shadow-[2px_0_15px_rgba(212,175,55,0.3)]" />



          {/* Diagonal Glass Highlight */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent rotate-45 pointer-events-none transition-transform duration-1000 group-hover:translate-x-full" />

          {/* Shimmer Sweep Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

          {/* Top Section */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2.5">

              <div>
                <span className="text-white font-black tracking-[0.2em] uppercase text-sm sm:text-base block leading-none">CU CARD</span>
                <span className="text-[#d4af37] font-bold text-[8px] sm:text-[9px] uppercase tracking-widest mt-1 opacity-80">Elite Rewards</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 rounded-lg shadow-inner">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            </div>
          </div>

          {/* Middle Section (Chip + Number) */}
          <div className="relative z-10 space-y-3 sm:space-y-5">
            <div className="flex items-center gap-4">
              {/* EMV Chip - Highly detailed */}
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-[#f0df9e] via-[#d4af37] to-[#b3932b] relative overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.4)] border border-black/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-black/10" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-black/10" />
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-black/10" />
                <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-black/10" />
                <div className="absolute inset-1.5 border border-black/5 rounded-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
              </div>
              {/* Contactless Icon */}
              <svg className="w-6 h-6 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 8c2.5 2.5 2.5 5.5 0 8M8 6c4 4 4 8 0 12M11 4c5.5 5.5 5.5 10.5 0 16" />
              </svg>
            </div>

            <div className="flex justify-between items-center w-full">
              <div className="text-white font-mono text-[13px] xs:text-[16px] sm:text-[22px] md:text-2xl tracking-widest sm:tracking-[0.18em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate mr-2">
                •••• •••• •••• 8834
              </div>
              <div className="text-right flex flex-col items-end flex-shrink-0">
                <p className="text-[7px] text-[#d4af37] uppercase font-black tracking-tighter leading-none mb-0.5">Valid Thru</p>
                <p className="text-white font-mono text-[10px] sm:text-xs font-bold tracking-wider">12/30</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="relative z-10 pt-3 border-t border-white/5 flex justify-between items-end">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[9px] sm:text-[10px] text-[#d4af37] uppercase tracking-widest font-black mb-0.5 sm:mb-1">Cardholder</p>
              <p className="text-white font-bold tracking-widest uppercase text-xs sm:text-sm truncate drop-shadow-md">{name || 'ADMIN'}</p>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-0.5 sm:mb-1">Balance</p>
              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                {balanceHidden ? (
                  <p className="text-white font-black text-base sm:text-lg tracking-[0.1em] mt-0.5">••••</p>
                ) : (
                  <p className="text-white font-black text-base sm:text-xl md:text-2xl drop-shadow-lg">₹{balance.toLocaleString('en-IN')}</p>
                )}
                {onEyeClick && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEyeClick(e);
                    }}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {balanceHidden ? <EyeOff className="w-3.5 h-3.5 text-[#d4af37]" /> : <Eye className="w-3.5 h-3.5 text-[#d4af37]" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Premium Glow Elements */}
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-[80px]" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-[60px]" />
        </div>

        {/* BACK OF CARD */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] rounded-[1.5rem] shadow-2xl border border-white/5 overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
          {/* Magnetic Stripe */}
          <div className="w-full h-11 sm:h-14 bg-black mt-6 shadow-inner relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          </div>
          
          <div className="p-5 sm:p-7">
            {/* Signature Panel */}
            <div className="w-full h-9 sm:h-11 bg-[#f0f0f0] rounded flex items-center justify-end px-4 mt-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <span className="font-mono text-[#333] font-black italic tracking-[0.3em] text-sm">834</span>
            </div>
            
            {/* Security Label */}
            <div className="mt-3 flex justify-end px-1">
              <span className="text-[7px] text-[#d4af37] font-black uppercase tracking-widest">Security Code (CVV)</span>
            </div>

            {/* Terms */}
            <div className="mt-8 text-[7px] sm:text-[8px] text-white/30 leading-relaxed text-center px-4 font-medium italic">
              This elite virtual card is exclusively for BAZZAR members. Details are encrypted and stored securely.
              <br/>
              <span className="text-[#d4af37]/40">© 2026 BAZZAR FINANCIAL SYSTEMS</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
