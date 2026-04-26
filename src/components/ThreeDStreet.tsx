import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  heroImage: string;
  rating: string;
  deliveryTime: string;
  isOpen: boolean;
}

interface ThreeDStreetProps {
  shops: Shop[];
}

export default function ThreeDStreet({ shops }: ThreeDStreetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { scrollXProgress } = useScroll({
    container: containerRef,
  });

  const smoothProgress = useSpring(scrollXProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* ── STREET SURFACE ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent opacity-50 skew-y-2 transform origin-bottom-left" />
      
      <div 
        ref={containerRef}
        className="flex gap-12 overflow-x-auto px-[10vw] pb-24 scrollbar-hide snap-x snap-mandatory"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        {shops.map((shop, i) => (
          <StorefrontItem 
            key={shop.id} 
            shop={shop} 
            index={i} 
            onClick={() => navigate(`/shop/${shop.id}`)}
          />
        ))}
        
        {/* Spacer at the end for better centering */}
        <div className="min-w-[20vw]" />
      </div>

      {/* ── AMBIENT OVERLAYS ─────────────────────────────────────────────── */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
    </div>
  );
}

function StorefrontItem({ shop, index, onClick }: { shop: Shop; index: number; onClick: () => void }) {
  const itemRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, x: 100, rotateY: 35 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ scale: 1.02, translateZ: "40px" }}
      onClick={onClick}
      className={`relative min-w-[320px] sm:min-w-[440px] h-[550px] rounded-[3rem] bg-[#0A0A0B] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] snap-center cursor-pointer group overflow-hidden`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* ── BACKGROUND DEPTH ── */}
      <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-[2s] ease-out">
        <img 
          src={shop.heroImage} 
          className={`w-full h-full object-cover ${!shop.isOpen ? 'grayscale contrast-125 opacity-20' : 'opacity-60 contrast-110'}`} 
          alt={shop.name}
        />
        {/* Multi-layered Gradients for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-transparent to-[#0A0A0B]/80" />
      </div>

      {/* ── NEON SIGNBOARD (Top) ── */}
      <div className="absolute top-10 left-10 right-10 flex justify-between items-start z-20">
         <motion.div 
           whileHover={{ y: -5 }}
           className="relative"
         >
           <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className={`px-5 py-2.5 rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 ${shop.isOpen ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-orange-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${shop.isOpen ? 'text-orange-400' : 'text-zinc-500'}`}>
                  {shop.isOpen ? 'Open Now' : 'Closed'}
                </span>
             </div>
           </div>
         </motion.div>

         <div className="flex flex-col items-end gap-2">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-400 transition-all duration-500 shadow-xl">
               <Star className="w-6 h-6 text-white group-hover:fill-white transition-all" />
            </div>
         </div>
      </div>

      {/* ── CENTRAL FLOATING CONTENT ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="relative">
            <div className="absolute -inset-20 bg-orange-500/5 blur-[100px] rounded-full group-hover:opacity-100 opacity-0 transition-opacity duration-1000" />
            <motion.div 
              style={{ translateZ: "60px" }}
              className="text-center"
            >
              <h3 className="text-5xl sm:text-6xl font-black text-white leading-[0.85] tracking-tight uppercase transition-all duration-700">
                {shop.name.split(' ').map((word, i) => (
                  <span key={i} className="block last:text-orange-500">
                    {word}
                  </span>
                ))}
              </h3>
            </motion.div>
         </div>
      </div>

      {/* ── BOTTOM INFO PANEL (Glass) ── */}
      <div className="absolute bottom-0 left-0 right-0 p-10 z-30">
        <div className="bg-white/5 border-t border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl overflow-hidden">
          {/* Faux Light Glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full" />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.3em] mb-1">Location</span>
               <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <p className="text-white font-bold text-sm">North Campus Wing</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Arrival</span>
               <div className="flex items-center gap-2 justify-end">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <p className="text-white font-black text-sm">{shop.deliveryTime}</p>
               </div>
            </div>
          </div>

          <button className="w-full py-4 rounded-2xl bg-orange-500 text-black font-black text-[13px] uppercase tracking-[0.2em] transform transition-all active:scale-95 hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]">
             Enter Boutique
          </button>
        </div>
      </div>

      {/* ── DECORATIVE ELEMENTS ── */}
      <div className="absolute top-1/2 -left-4 w-1 h-32 bg-gradient-to-b from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute top-1/2 -right-4 w-1 h-32 bg-gradient-to-b from-transparent via-orange-500/40 to-transparent" />
      
      {!shop.isOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-xl">
           <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-1 bg-white/20 rounded-full" />
              <p className="text-3xl font-black uppercase tracking-[0.4em] text-white/40 italic">Resting</p>
              <div className="w-20 h-1 bg-white/20 rounded-full" />
           </div>
        </div>
      )}
    </motion.div>
  );
}
