import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { GroceryItem } from "@/config/groceryItems";

interface Props {
  item: GroceryItem;
  idx: number;
  bgFrom: string; // e.g. '#EFF6FF'
  bgTo: string; // e.g. '#DBEAFE'
  btnColor: string; // e.g. '#3B82F6'
  onAdd: (item: GroceryItem) => void;
}

export default function GroceryProductCard({
  item,
  idx,
  bgFrom,
  bgTo,
  btnColor,
  onAdd,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, type: "spring", stiffness: 130 }}
      className="flex-shrink-0 w-[150px] sm:w-[172px] group cursor-pointer"
    >
      <div 
        className="rounded-[2.5rem] overflow-hidden bg-white border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1"
      >
        {/* Blurred background image area */}
        <div
          className="relative h-[130px] flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
        >
          {/* Subtle light streak */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <motion.img
            whileHover={{ scale: 1.12, rotate: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-[105px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] z-10"
            style={{ mixBlendMode: "multiply" }}
          />
          
          {/* Item Category Badge on image */}
          {item.isFresh && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-[#1D1D1F] uppercase tracking-wider shadow-sm border border-white/50">
                Fresh
              </span>
            </div>
          )}
        </div>

        {/* Details Section - Premium Glass Look */}
        <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/60">
          <p className="text-[12px] font-black text-[#1D1D1F] leading-tight line-clamp-2 min-h-[32px] mb-1">
            {item.name}
          </p>
          <p className="text-[10px] text-[#8E8E93] font-bold mb-3 uppercase tracking-tight">
            {item.quantity}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[16px] font-black text-[#1D1D1F] tracking-tight">
              ₹{item.price}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item);
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold transition-all"
              style={{
                backgroundColor: btnColor,
                boxShadow: `0 8px 20px ${btnColor}44`,
              }}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
