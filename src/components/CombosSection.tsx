import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag } from "lucide-react";

const combos = [
  {
    id: 4,
    title: "Smoky Delight",
    items: "Smoked Chicken Burger + Peri Peri Fries + Mountain Dew",
    price: 210,
    shop: "Flavour Factory",
    badge: "Popular",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    id: 5,
    title: "Ultimate Feast",
    items: "Baked Pizza Sandwich + White Sauce Pasta + 2 Smoked Chicken Burger + Coke",
    price: 465,
    shop: "Flavour Factory",
    badge: "Premium",
    gradient: "from-fuchsia-500 to-purple-600",
  },
];

export default function CombosSection() {
  return (
    <div className="w-full px-2 pb-12 relative">
      {/* Parallelogram Background Shape */}
      <div className="absolute top-12 bottom-6 left-[-2%] right-[-2%] md:left-[0%] md:right-[0%] pointer-events-none z-0">
        <div className="w-full h-full border-[1.5px] border-purple-500/40 bg-[#220B4E] transform -skew-x-[12deg] rounded-[2.5rem] shadow-[0_0_40px_rgba(147,51,234,0.15)]" />
      </div>

      <div className="relative z-10 flex items-center gap-2 mb-6 ml-2">
        <Sparkles className="text-purple-400 w-5 h-5" />
        <h2 className="text-xl font-black text-white tracking-tight uppercase">
          Curated Combos
        </h2>
      </div>
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {combos.map((combo, idx) => (
          <motion.div
            key={combo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative p-6 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group cursor-pointer border border-purple-100"
          >
            {/* Advanced Purple/White UI Elements */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${combo.gradient} opacity-15 blur-2xl rounded-full transform group-hover:scale-150 transition-transform duration-700`}
            />
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-purple-100/80 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm border border-purple-200/50 shadow-sm">
                {combo.badge}
              </span>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div>
                <h3 className="text-[18px] font-black mb-1 text-purple-950 tracking-tight leading-tight pr-20">
                  {combo.title}
                </h3>
                <p className="text-[12px] font-bold text-purple-500/80 mb-4 uppercase tracking-wider">
                  {combo.shop}
                </p>

                <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100/60 mb-5">
                  <p className="text-[13px] font-semibold text-purple-900/80 leading-relaxed">
                    {combo.items}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                    Price
                  </span>
                  <span className="text-2xl font-black text-purple-950">
                    ₹{combo.price}
                  </span>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] active:scale-95">
                  <ShoppingBag className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
