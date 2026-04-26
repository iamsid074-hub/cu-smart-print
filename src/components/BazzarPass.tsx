import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield, Target, Cpu, Wifi, Globe } from "lucide-react";
import React, { useMemo, useRef } from "react";

interface BazzarPassProps {
  userName: string;
  userId: string;
  tier: string;
  points: number;
}

export default function BazzarPass({ userName, userId, tier, points }: BazzarPassProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["-100%", "200%"]);

  const cardNumber = useMemo(() => {
    const s = userId.replace(/[^0-9]/g, '');
    const base = (s + "9827364510").slice(0, 12);
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString().slice(-4);
    return `${base.slice(0,4)}  ${base.slice(4,8)}  ${base.slice(8,12)}  ${hash}`;
  }, [userId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div className="relative py-24 flex flex-col items-center justify-center perspective-[2000px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-[340px] h-[215px] sm:w-[460px] sm:h-[290px] rounded-[1.2rem] cursor-pointer group"
      >
        {/* ── CARD BODY (Matte Obsidian) ── */}
        <div className="absolute inset-0 bg-[#0F0F10] rounded-[1.2rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]">
           
           {/* Clean Minimal Background */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" />

           {/* ── GOLD VERTICAL STRIPE (Premium Detail) ── */}
           <div className="absolute right-0 top-0 w-8 sm:w-12 h-full bg-gradient-to-b from-[#D4AF37] via-[#FFD700] to-[#B8860B] shadow-[inset_1px_0_10px_rgba(0,0,0,0.3)]">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:100%_4px]" />
           </div>

           {/* ── FRONT CONTENT ── */}
           <div className="relative h-full p-8 sm:p-10 flex flex-col justify-between z-10" style={{ transform: "translateZ(50px)" }}>
              {/* TOP: Identity & contactless */}
              <div className="flex justify-between items-start pr-12">
                 <div className="flex flex-col gap-0.5">
                    <h2 className="text-white font-bold text-xl tracking-tight uppercase">Bazzar <span className="text-[#D4AF37]">Pass</span></h2>
                    <p className="text-[9px] font-medium tracking-[0.2em] text-white/40 uppercase">Premium Member Card</p>
                 </div>
                 <Wifi className="w-6 h-6 text-white/20 rotate-90" />
              </div>

              {/* CENTER: Clean EMV Chip & Number */}
              <div className="space-y-4">
                 <div className="flex items-center gap-8">
                    {/* ── RECTANGULAR EMV CHIP (Improved Realism) ── */}
                    <div className="w-16 h-11 sm:w-18 sm:h-13 bg-gradient-to-br from-[#E3C572] via-[#C5A350] to-[#917430] rounded-lg shadow-lg border border-black/20 overflow-hidden relative">
                       {/* Circuit paths */}
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[length:6px_6px]" />
                       <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-black/20" />
                       <div className="absolute left-[33%] top-0 w-[0.5px] h-full bg-black/20" />
                       <div className="absolute left-[66%] top-0 w-[0.5px] h-full bg-black/20" />
                       <div className="absolute inset-1.5 border border-black/10 rounded-[2px]" />
                    </div>

                    {/* ── 3D HOLOGRAPHIC LOGO (Bazzar Globe) ── */}
                    <motion.div 
                       className="relative w-11 h-11 rounded-full border border-white/10 bg-[#1A1A1B] flex items-center justify-center overflow-hidden shadow-inner"
                    >
                       {/* Rainbow Foil Effect */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-blue-500/30 via-green-500/30 to-red-500/30 animate-[spin_5s_linear_infinite] opacity-50" />
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_80%)]" />
                       
                       <Globe className="w-6 h-6 text-white/40 z-10" strokeWidth={1} />
                       
                       {/* Light Refraction on Logo */}
                       <div className="absolute -inset-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.6)_50%,transparent_55%)] opacity-20" />
                    </motion.div>
                 </div>
                 
                 <p className="text-white font-mono text-xl sm:text-2xl tracking-[0.16em] tabular-nums">
                    {cardNumber}
                 </p>
              </div>

              {/* BOTTOM: Holder & Eco Balance */}
              <div className="flex justify-between items-end pr-12">
                 <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37]/60">Card Holder</p>
                    <h3 className="text-white font-semibold text-lg sm:text-xl tracking-tight uppercase">{userName}</h3>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/20 mb-1">Eco Reward Balance</p>
                    <div className="flex items-center gap-2 justify-end">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                       <span className="text-2xl font-bold text-white tracking-tighter">{points}<span className="text-[10px] text-white/30 ml-1 font-black">BP</span></span>
                    </div>
                 </div>
              </div>
           </div>

           {/* ── REALISTIC REFRACTION ── */}
           <motion.div 
              style={{ left: shineX }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-20 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" 
           />
        </div>

        {/* Outer Bevel Shadow */}
        <div className="absolute inset-0 rounded-[1.2rem] shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />
      </motion.div>

      {/* FOOTER: SECURITY INFO */}
      <div className="mt-12 flex gap-12 px-6">
         <SecurityFeature title="EMERALD" detail="Biometric Active" />
         <SecurityFeature title="ISSUED" detail="2026 SERIES" />
         <SecurityFeature title="NETWORK" detail="ATM SECURE" />
      </div>
    </div>
  );
}

function SecurityFeature({ title, detail }: any) {
  return (
    <div className="text-center">
       <p className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] uppercase mb-0.5">{title}</p>
       <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">{detail}</p>
    </div>
  );
}
