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
      initial={{ opacity: 0, x: 100, rotateY: 45 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ scale: 1.05, translateZ: "50px" }}
      onClick={onClick}
      className={`relative min-w-[280px] sm:min-w-[400px] h-[450px] rounded-[2.5rem] bg-[#1A1A1C] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] snap-center cursor-pointer group overflow-hidden`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Building Structure: Front Face */}
      <div className="absolute inset-0 z-0">
        <img 
          src={shop.heroImage} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!shop.isOpen ? 'grayscale opacity-30' : ''}`} 
          alt={shop.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Window effect */}
      <div className="absolute inset-0 border-[12px] border-black/20 pointer-events-none" />
      
      {/* Hover content (Inside the "Shop") */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
         <motion.div 
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20"
         >
           <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">Express</span>
           <p className="text-white font-black text-lg">OPEN</p>
         </motion.div>

         <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
               <Star className="w-5 h-5 text-white fill-white" />
            </div>
         </div>
      </div>

      {/* Info Panel: "Storefront Sign" */}
      <div className="absolute bottom-8 left-8 right-8 z-20">
        <motion.div
           layoutId={`title-${shop.id}`}
           className="flex flex-col gap-1"
        >
          <span className="flex items-center gap-2 text-orange-500 text-[11px] font-black uppercase tracking-[0.2em] mb-1">
             <MapPin className="w-3 h-3" />
             Campus Hub
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tighter group-hover:text-orange-400 transition-colors">
            {shop.name}
          </h3>
        </motion.div>

        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-[12px] font-black">
            {shop.rating} <Star className="w-3 h-3 fill-black text-black" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[12px] font-bold">
            <Clock className="w-4 h-4" />
            {shop.deliveryTime}
          </div>
        </div>
      </div>

      {/* 3D Awning/Roof Detail (Faux 3D) */}
      <div className="absolute -top-4 left-10 right-10 h-8 bg-[#2A2A2C] rounded-xl transform -rotate-x-45 border-b border-black shadow-lg z-30" />
      
      {!shop.isOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-sm">
           <p className="text-2xl font-black uppercase tracking-[0.2em] text-white/50 border-2 border-white/20 px-8 py-3 rounded-full">Closed</p>
        </div>
      )}
    </motion.div>
  );
}
