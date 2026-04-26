import { motion } from "framer-motion";
import { Truck, MapPin, Navigation, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface HolographicMapProps {
  status: string;
  isQuick?: boolean;
}

export default function HolographicMap({ status, isQuick }: HolographicMapProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the drone/rider based on status
    if (status === 'pending' || status === 'confirmed') setProgress(10);
    else if (status === 'picked') setProgress(40);
    else if (status === 'delivering') setProgress(75);
    else if (status === 'completed') setProgress(100);
  }, [status]);

  return (
    <div className="relative w-full h-[450px] overflow-hidden bg-[#020202] rounded-[3.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] mb-10 group mt-4">
      {/* ── DIGITAL TEXTURE OVERLAY ── */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      {/* ── SCANNING BEAM ── */}
      <motion.div 
        animate={{ translateY: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-40 blur-xl w-full"
      />

      {/* ── BACKGROUND GRID ── */}
      <div className="absolute inset-0 opacity-[0.15]" 
           style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* ── COORDINATE LABELS ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-12 opacity-30">
        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.3em]">Lat: 30.7673° N</span>
        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.3em]">Long: 76.6074° E</span>
      </div>

      {/* ── ISOMETRIC STAGE ── */}
      <div className="absolute inset-0 flex items-center justify-center p-12" style={{ perspective: "2000px" }}>
        <motion.div 
          initial={{ rotateX: 55, rotateZ: -35 }}
          animate={{ rotateX: 55, rotateZ: [-35, -32, -35] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full max-w-[550px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Outer Base Glow */}
          <div className="absolute -inset-20 bg-emerald-500/5 blur-[100px] rounded-full" />

          {/* Base Plate */}
          <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] border-2 border-emerald-500/20 shadow-[0_0_80px_rgba(52,211,153,0.1)] " />

          {/* Road/Path with Glow */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ transform: "translateZ(2px)" }}>
             <defs>
                <filter id="glow">
                   <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                   <feMerge>
                      <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                   </feMerge>
                </filter>
             </defs>
             <motion.path 
               d="M 50,50 L 220,50 L 220,220 L 420,220" 
               stroke="rgba(52,211,153,0.15)" 
               strokeWidth="12" 
               fill="none" 
               strokeLinecap="round"
             />
             <motion.path 
               d="M 50,50 L 220,50 L 220,220 L 420,220" 
               stroke="rgba(52,211,153,0.8)" 
               strokeWidth="6" 
               fill="none" 
               strokeLinecap="round"
               strokeDasharray="500"
               initial={{ strokeDashoffset: 500 }}
               animate={{ strokeDashoffset: 500 - (progress * 5) }}
               transition={{ duration: 2.5, ease: "easeInOut" }}
               filter="url(#glow)"
             />
          </svg>

          {/* Campus Buildings */}
          <IsometricBuilding x={250} y={40} h={90} label="HUB" color="zinc" />
          <IsometricBuilding x={40} y={170} h={70} label="MESS" color="zinc" />
          <IsometricBuilding x={360} y={320} h={110} label="HOSTEL" color="emerald" isActive={progress === 100} />

          {/* DRONE / RIDER - PREMIUM DESIGN */}
          <motion.div
             animate={{ 
                x: progress < 40 ? 50 + (progress * 4.25) : 220, 
                y: progress < 40 ? 50 : (progress < 80 ? 50 + (progress - 40) * 4.25 : 220),
                translateZ: [30, 45, 30]
             }}
             transition={{ duration: 2.5, ease: "easeInOut" }}
             className="absolute z-50 w-16 h-16 flex items-center justify-center"
             style={{ transformStyle: "preserve-3d" }}
          >
             {/* Spinning Rotor Effect */}
             <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
             
             <div className="relative w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.6)] border-2 border-emerald-500 overflow-hidden">
                <Navigation className="w-7 h-7 text-emerald-600 transform rotate-45" />
                {/* Internal HUD like lines */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/20" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500/20" />
             </div>

             {/* Pulse Ring */}
             <motion.div 
               animate={{ scale: [1, 3], opacity: [0.6, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 border-4 border-emerald-500 rounded-full"
             />
          </motion.div>

          {/* Target Location Beam */}
          <div className="absolute top-[320px] left-[360px] flex flex-col items-center" style={{ transform: "translateZ(10px)" }}>
             <motion.div 
               animate={{ height: [0, 200], opacity: [0, 0.4, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute bottom-0 w-px bg-white"
             />
             <MapPin className="w-12 h-12 text-emerald-500 fill-emerald-500/20 animate-bounce relative z-10" />
             <div className="w-16 h-4 bg-emerald-400/30 blur-xl rounded-full mt-1" />
          </div>
        </motion.div>
      </div>

      {/* OVERLAY UI - REDESIGNED FOR LUXURY FEEL */}
      <div className="absolute top-10 left-10 right-10 flex justify-between items-start z-40 pointer-events-none">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400">Secure Live Uplink</p>
            </div>
            <h3 className="text-white font-black text-3xl tracking-tighter">HD TELEMETRY</h3>
         </div>
         
         <div className="flex flex-col items-end gap-3">
            <div className="px-6 py-2 bg-emerald-500/90 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_10px_30px_rgba(52,211,153,0.3)]">
               {isQuick ? "Priority Air" : "Ground Standard"}
            </div>
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-white/40" />
               SYS_LINK: ACTIVE
            </div>
         </div>
      </div>

      {/* BOTTOM TELEMETRY BAR */}
      <div className="absolute bottom-10 left-10 right-10 z-40 pointer-events-none">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               <div className="text-white/40 font-mono text-[10px] tracking-widest">SIGNAL: 98%</div>
               <div className="text-white/40 font-mono text-[10px] tracking-widest uppercase">Encryption: AES-256</div>
            </div>
            <span className="text-emerald-400 font-black tracking-tighter text-4xl">{progress}% <span className="text-xs text-white/40 tracking-widest align-middle">ON PATH</span></span>
         </div>
         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)]"
            />
         </div>
      </div>
    </div>
  );
}

function IsometricBuilding({ x, y, h, label, color, isActive = false }: { x: number, y: number, h: number, label: string, color: "zinc" | "emerald", isActive?: boolean }) {
  return (
    <div className="absolute" style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}>
       <div className={`relative w-20 h-20 transform-gpu group-hover:scale-110 transition-all duration-700`} style={{ transformStyle: "preserve-3d" }}>
          {/* Top Roof with details */}
          <div 
             className={`absolute inset-0 flex flex-col items-center justify-center border-2 overflow-hidden ${color === 'emerald' || isActive ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-800 border-zinc-700'}`}
             style={{ transform: `translateZ(${h}px)` }}
          >
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
             <span className="text-[11px] font-black text-black/60 rotate-0 tracking-widest">{label}</span>
             <div className="flex gap-1 mt-1 opacity-40">
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <div className="w-1 h-1 bg-black/40 rounded-full" />
             </div>
          </div>
          
          {/* Front Face with Windows */}
          <div 
             className={`absolute left-0 right-0 h-[${h}px] bg-gradient-to-b ${color === 'emerald' || isActive ? 'from-emerald-600 to-emerald-950 border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.2)]' : 'from-zinc-900 to-black border-zinc-700'} border-x-2 border-b-2 p-2`}
             style={{ height: `${h}px`, transform: `translateY(40px) rotateX(-90deg)`, transformOrigin: "top" }}
          >
             {/* Rows of windows */}
             <div className="grid grid-cols-4 gap-1 opacity-60">
                {[...Array(12)].map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-sm ${isActive ? 'bg-emerald-300 shadow-[0_0_5px_rgba(110,231,183,0.8)]' : 'bg-zinc-700'}`} />
                ))}
             </div>
          </div>
          
          {/* Side Face with Windows */}
          <div 
             className={`absolute top-0 bottom-0 w-[${h}px] bg-gradient-to-b ${color === 'emerald' || isActive ? 'from-emerald-700 to-emerald-950 border-emerald-400' : 'from-zinc-950 to-black border-zinc-700'} border-y-2 border-r-2 p-2`}
             style={{ width: `${h}px`, transform: `translateX(80px) rotateY(90deg)`, transformOrigin: "left" }}
          >
             <div className="grid grid-cols-6 gap-1 opacity-40">
                {[...Array(18)].map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-sm ${isActive ? 'bg-emerald-300' : 'bg-zinc-800'}`} />
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
