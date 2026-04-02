import { motion } from "framer-motion";
import { Plus, CheckCircle2, Crown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";

const comboItems = [
  {
    id: "combo-1",
    name: "Pasta & Burger Feast",
    description: "White Sauce Pasta + Veg Burger + 2 Mountain Dew",
    price: 199,
    image: "/banners/combo_1.png",
    theme: "from-orange-500/20 to-red-500/10",
    accent: "#D4AF37"
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.png",
    theme: "from-amber-400/20 to-orange-600/10",
    accent: "#F59E0B"
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.png",
    theme: "from-emerald-400/20 to-teal-600/10",
    accent: "#10B981"
  },
];

export default function ComboHighlightSection() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (item: typeof comboItems[0]) => {
    addItem({
      id: item.id,
      title: `${item.name} Combo`,
      price: item.price,
      // @ts-ignore
      image: item.image,
      category: "shops",
    });
    toast.success(`${item.name} added to cart!`);
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-12 mt-12 relative"
    >
      {/* Background Decorative Text */}
      <div className="absolute -top-10 left-0 text-[80px] font-black text-white/[0.03] select-none pointer-events-none uppercase tracking-tighter">
        Exclusive
      </div>

      <div className="relative z-10 px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-16 px-2">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="h-[2px] w-8 bg-[#D4AF37]"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Special Curation</p>
             </div>
             <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none italic">
                C<span className="text-[#D4AF37]">O</span>MB<span className="text-[#D4AF37]">O</span>S
             </h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-md">
             <Crown className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          </div>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-24 sm:gap-x-8">
          {comboItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative"
            >
              {/* The "Outside" Image - Floating above card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 w-44 h-44 pointer-events-none"
              >
                <div className="relative w-full h-full p-2">
                   {/* Glow effect behind image */}
                   <div className={`absolute inset-4 rounded-full blur-2xl opacity-40 bg-gradient-to-br ${item.theme}`}></div>
                   
                   {/* Main Image in a premium circular/squircle frame */}
                   <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-[4px] border-[#1D1D1F] shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                   </div>

                   {/* Float Badge - Price */}
                   <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-black w-14 h-14 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-[#1D1D1F] -rotate-12 group-hover:rotate-0 transition-all duration-300">
                      <span className="text-[10px] leading-none mb-0.5">₹</span>
                      <p className="text-sm leading-none">{item.price}</p>
                   </div>
                </div>
              </motion.div>

              {/* The Main Card Body */}
              <div className="pt-24 h-full">
                <div className="h-full rounded-[2.5rem] bg-gradient-to-b from-[#2A2A2C]/60 to-[#1D1D1F]/90 backdrop-blur-xl border border-white/5 p-6 flex flex-col items-center text-center group-hover:border-[#D4AF37]/30 transition-all duration-500 shadow-xl self-end">
                   <div className="mb-4 pt-4">
                      <h4 className="text-lg font-black text-white group-hover:text-[#D4AF37] transition-colors duration-300">{item.name}</h4>
                      <div className="h-1 w-8 bg-[#D4AF37]/30 rounded-full mx-auto mt-2 group-hover:w-16 transition-all duration-300"></div>
                   </div>
                   
                   <p className="text-xs text-white/40 font-medium leading-relaxed max-w-[180px] mb-8 min-h-[3rem]">
                      {item.description}
                   </p>

                   {/* Premium Button */}
                   <button
                     onClick={() => handleAdd(item)}
                     className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                        addedIds.has(item.id) 
                        ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                        : "bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black hover:border-transparent active:scale-95"
                     }`}
                   >
                     {addedIds.has(item.id) ? (
                       <><CheckCircle2 className="w-4 h-4" /> Selected</>
                     ) : (
                       <><Plus className="w-4 h-4" /> Add to Order</>
                     )}
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
