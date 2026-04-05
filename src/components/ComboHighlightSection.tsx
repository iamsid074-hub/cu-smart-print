import { motion } from "framer-motion";
import { Plus, CheckCircle2, Trophy } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";

const comboItems = [
  {
    id: "combo-1",
    name: "Pasta & Burger Feast",
    description: "White Sauce Pasta + Veg Burger + 2 Mountain Dew",
    price: 199,
    image: "/banners/combo_1.webp",
    theme: "from-orange-500/20 to-red-500/10",
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.webp",
    theme: "from-amber-400/20 to-orange-600/10",
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.webp",
    theme: "from-emerald-400/20 to-teal-600/10",
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
      className="mb-8 mt-2 relative overflow-hidden"
    >
      <div className="relative z-10">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 px-5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/40">
                <Trophy className="w-4 h-4 text-[#D4AF37]" />
             </div>
             <div>
                <h3 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wider">Top Combos</h3>
                <div className="h-[2px] w-full bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full opacity-60 mt-0.5"></div>
             </div>
          </div>
        </div>

        {/* COMPACT Horizontal Carousel */}
        <div 
          className="flex overflow-x-auto pb-4 gap-4 px-5 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Add a CSS in JS style to hide webkit scrollbars */}
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {comboItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative min-w-[280px] w-[280px] snap-center pt-8"
            >
              {/* Floating Image - Half Outside vertically but horizontally aligned */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                className="absolute top-0 right-4 z-20 w-24 h-24 pointer-events-none"
              >
                <div className="relative w-full h-full">
                   <div className={`absolute inset-2 rounded-2xl blur-xl opacity-40 bg-gradient-to-br ${item.theme}`}></div>
                   <div className="w-full h-full rounded-2xl overflow-hidden border-[3px] border-[#1D1D1F] shadow-xl rotate-6 group-hover:rotate-0 transition-all duration-300">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                </div>
              </motion.div>

              {/* Compact Card with Left Info Layout */}
              <div className="h-32 rounded-3xl bg-gradient-to-br from-[#2A2A2C]/80 to-[#1D1D1F] backdrop-blur-xl border border-white/5 p-4 flex flex-col justify-between shadow-xl">
                 <div className="max-w-[160px]">
                    <h4 className="text-sm font-black text-white/95 leading-tight truncate">{item.name}</h4>
                    <p className="text-[10px] text-white/40 mt-1 line-clamp-2 leading-tight">
                       {item.description}
                    </p>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black font-black text-xs">
                       â‚¹{item.price}
                    </div>
                    
                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 ${
                         addedIds.has(item.id) 
                         ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                         : "bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-white/10 active:scale-95"
                      }`}
                    >
                      {addedIds.has(item.id) ? (
                        <><CheckCircle2 className="w-3 h-3" /> Added</>
                      ) : (
                        <><Plus className="w-3 h-3" /> Add Item</>
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
