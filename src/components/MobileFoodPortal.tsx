import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, ArrowLeft, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const FOOD_ITEMS = [
  { id: 1, name: "Kurkure Momos Veg", price: 120, originalPrice: 150, image: "/kurkure_opt.webp", time: "15 mins" },
  { id: 2, name: "Vada Pav", price: 40, originalPrice: 50, image: "/vadapav_opt.webp", time: "10 mins" },
  { id: 3, name: "Chole Bhature", price: 110, originalPrice: 130, image: "/cholebature_opt.webp", time: "20 mins" },
  { id: 4, name: "Baked Pizza Sandwich", price: 149, originalPrice: 180, image: "/sandwitchbaked_opt.webp", time: "20 mins" },
  { id: 5, name: "Veg Crispy Burger", price: 89, originalPrice: 110, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=400&auto=format&fit=crop", time: "10 mins" },
  { id: 6, name: "Single Egg Roll", price: 50, originalPrice: 65, image: "/singleegg_opt.webp", time: "12 mins" },
  { id: 7, name: "Double Egg Roll", price: 70, originalPrice: 85, image: "/doubleegg_opt.webp", time: "15 mins" },
  { id: 8, name: "Afgani Momos", price: 140, originalPrice: 160, image: "/afganimomos_opt.webp", time: "20 mins" },
  { id: 9, name: "Paneer Tikka Roll", price: 130, originalPrice: 150, image: "/paneertikka_opt.webp", time: "18 mins" },
  { id: 10, name: "Cold Coffee Shake", price: 90, originalPrice: 120, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop", time: "5 mins" },
];

export default function MobileFoodPortal() {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const headlines = [
    { top: "CELEBRATE", bottom: "new session" },
    { top: "POWERED BY", bottom: "flavour factory" }
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIdx(prev => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#fef3ec] text-[#5e1e2d] flex flex-col font-sans">
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-[#fef3ec]/90 backdrop-blur-xl border-b border-black/5 px-6 pt-16 pb-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#5e1e2d]" />
        </button>
        <div className="flex-1 px-4">
           <div onClick={() => navigate('/search')} className="bg-white rounded-xl h-10 flex items-center px-4 gap-2 border border-black/10 shadow-sm cursor-pointer">
             <Search className="w-4 h-4 text-[#5e1e2d]/40" />
             <span className="text-sm text-[#5e1e2d]/40">Search food...</span>
           </div>
        </div>
        <button onClick={() => navigate('/cart')} className="p-2 -mr-2 relative active:scale-95 transition-transform">
          <ShoppingCart className="w-6 h-6 text-[#5e1e2d]" />
          {items.length > 0 && (
            <span className="absolute top-1 right-0 w-4 h-4 bg-[#ff6b6b] rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
        {/* ── Animated Hero Section ── */}
        <div className="px-6 mt-6 mb-4">
           <div className="relative h-28 rounded-3xl overflow-hidden flex items-center justify-center text-center">
              {/* Left Flower */}
              <motion.img 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src="/flower-watercolor.png"
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-28 h-28 object-contain opacity-90 -scale-x-100 mix-blend-multiply drop-shadow-sm"
                alt="flower"
              />

              {/* Right Flower */}
              <motion.img 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src="/flower-watercolor.png"
                className="absolute -right-6 top-1/2 -translate-y-1/2 w-28 h-28 object-contain opacity-90 mix-blend-multiply drop-shadow-sm"
                alt="flower"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={headlineIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span className="text-[#5e1e2d]/60 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">{headlines[headlineIdx].top}</span>
                  <h1 className="text-4xl font-serif font-bold text-[#5e1e2d] tracking-tight leading-none italic">
                    {headlines[headlineIdx].bottom}
                  </h1>
                </motion.div>
              </AnimatePresence>
           </div>
        </div>

        {/* ── Famous Items Horizontal Carousel ── */}
        <div className="pt-2 pb-4 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide snap-x pb-4">
            {FOOD_ITEMS.map((product) => (
              <motion.div 
                key={product.id}
                className="flex-shrink-0 w-[180px] bg-[#ffeae6] border border-white/60 rounded-[2rem] p-4 snap-start relative shadow-sm"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#ffdde1]/50 mb-4 group">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                  <button className="absolute top-3 right-3 p-1.5 bg-white/40 backdrop-blur-sm rounded-full border border-white/50">
                    <Heart className="w-4 h-4 text-[#5e1e2d]/60" />
                  </button>
                </div>

                <div className="relative px-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-semibold text-[#5e1e2d]/60">1 pc</span>
                    <button 
                      onClick={() => addItem({
                        id: `shop-${product.id}`,
                        title: product.name,
                        price: product.price,
                        image: product.image,
                        category: "Food"
                      })}
                      className="px-4 py-2 bg-transparent text-black font-bold text-[10px] tracking-wider rounded-xl active:scale-95 transition-all border border-black/80"
                    >
                      ADD
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-xl font-black text-[#5e1e2d]">₹{product.price}</span>
                    <span className="text-[11px] text-[#5e1e2d]/40 line-through font-semibold">₹{product.originalPrice}</span>
                  </div>

                  <h3 className="text-[12px] font-bold text-[#5e1e2d] leading-tight mb-3 line-clamp-3 h-12">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#5e1e2d]/50 pt-2 border-t border-black/5">
                    <Clock className="w-3 h-3 text-[#5e1e2d]/50" />
                    <span>{product.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── The Ultimate Gift Guide ── */}
        <div className="mt-2 pb-20">
           {/* Edge-to-Edge Curved String + Golden Ribbon */}
           <div className="relative w-full overflow-visible" style={{height: '70px'}}>
              <svg
                width="100%"
                height="70"
                viewBox="0 0 400 70"
                preserveAspectRatio="none"
                className="absolute top-0 left-0 w-full h-full"
              >
                <defs>
                  <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c59d5f" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#dfb77d" stopOpacity="1" />
                    <stop offset="100%" stopColor="#c59d5f" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dfb77d" />
                    <stop offset="100%" stopColor="#b68944" />
                  </linearGradient>
                </defs>
                <path d="M 0 5 Q 200 65 400 5" stroke="rgba(223, 183, 125, 0.2)" strokeWidth="4" fill="none" />
                <path d="M 0 5 Q 200 65 400 5" stroke="url(#goldLine)" strokeWidth="1.5" fill="none" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl leading-none select-none">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="url(#goldRibbon)" className="drop-shadow-md">
                   <path d="M12.5,13C14.16,13 15.5,11.66 15.5,10C15.5,8.34 14.16,7 12.5,7C12.04,7 11.6,7.11 11.21,7.3C10.61,4.76 8.35,3 5.5,3C2.46,3 0,5.46 0,8.5C0,11.54 2.46,14 5.5,14C6.34,14 7.13,13.8 7.82,13.46L11,18.5V21H14V18.5L17.18,13.46C17.87,13.8 18.66,14 19.5,14C22.54,14 25,11.54 25,8.5C25,5.46 22.54,3 19.5,3C16.65,3 14.39,4.76 13.79,7.3C13.4,7.11 12.96,7 12.5,7M5.5,11.5C3.84,11.5 2.5,10.16 2.5,8.5C2.5,6.84 3.84,5.5 5.5,5.5C7.16,5.5 8.5,6.84 8.5,8.5C8.5,10.16 7.16,11.5 5.5,11.5M19.5,11.5C17.84,11.5 16.5,10.16 16.5,8.5C16.5,6.84 17.84,5.5 19.5,5.5C21.16,5.5 22.5,6.84 22.5,8.5C22.5,10.16 21.16,11.5 19.5,11.5Z" />
                </svg>
              </div>
           </div>

           <div className="px-6 text-center mt-6 mb-10">
              <h2 className="text-3xl font-serif italic font-bold text-[#5e1e2d] tracking-tight">
                The Ultimate Food Guide
              </h2>
           </div>

           <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-6 snap-x">
             {/* Card 1 */}
             <motion.div 
               whileHover={{ y: -5 }}
               onClick={() => navigate('/search?q=Shake')}
               className="flex-shrink-0 w-[220px] aspect-[4/5] bg-[#ffaab5] rounded-[2.5rem] p-6 flex flex-col items-center text-center snap-center relative overflow-hidden group shadow-md cursor-pointer"
             >
                <h3 className="text-[16px] font-bold text-[#5e1e2d] mb-4 leading-tight">Juices<br/>& Shakes</h3>
                <div className="bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                   <span className="text-[#5e1e2d] font-bold text-[12px]">Starting from ₹60</span>
                </div>
                <div className="relative z-10 w-32 h-32 transform group-hover:scale-105 transition-transform duration-500 mt-auto">
                  <img src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white/20" alt="shakes" />
                </div>
             </motion.div>

             {/* Card 2 */}
             <motion.div 
               whileHover={{ y: -5 }}
               onClick={() => navigate('/search?q=Roll')}
               className="flex-shrink-0 w-[220px] aspect-[4/5] bg-[#ffb5aa] rounded-[2.5rem] p-6 flex flex-col items-center text-center snap-center relative overflow-hidden group shadow-md cursor-pointer"
             >
                <h3 className="text-[16px] font-bold text-[#5e1e2d] mb-4 leading-tight">Quick Snacks<br/>& Rolls</h3>
                <div className="bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                   <span className="text-[#5e1e2d] font-bold text-[12px]">Starting from ₹60</span>
                </div>
                <div className="relative z-10 w-32 h-32 transform group-hover:scale-105 transition-transform duration-500 mt-auto">
                  <img src="/readd_opt.webp" className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white/20" alt="snacks" />
                </div>
             </motion.div>

             {/* Card 3 */}
             <motion.div 
               whileHover={{ y: -5 }}
               onClick={() => navigate('/search?q=Meal')}
               className="flex-shrink-0 w-[220px] aspect-[4/5] bg-[#ff9f9f] rounded-[2.5rem] p-6 flex flex-col items-center text-center snap-center relative overflow-hidden group shadow-md cursor-pointer"
             >
                <h3 className="text-[16px] font-bold text-[#5e1e2d] mb-4 leading-tight">Main Meals<br/>& Combos</h3>
                <div className="bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                   <span className="text-[#5e1e2d] font-bold text-[12px]">Starting from ₹49</span>
                </div>
                <div className="relative z-10 w-32 h-32 transform group-hover:scale-105 transition-transform duration-500 mt-auto">
                  <img src="/3combo_opt.webp" className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white/20" alt="meals" />
                </div>
             </motion.div>
           </div>
        </div>
      </div>
    </div>
  );
}
