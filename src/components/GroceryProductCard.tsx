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
      className="flex-shrink-0 w-[150px] sm:w-[164px] group cursor-pointer"
    >
      <div className="rounded-[22px] overflow-hidden shadow-sm border border-white/80 hover:shadow-md transition-shadow duration-300 bg-white">
        {/* Colored image area */}
        <div
          className="relative h-[120px] flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
        >
          <motion.img
            whileHover={{ scale: 1.08, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-[96px] w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
            style={{ mixBlendMode: "multiply" }}
          />
          {/* subtle inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] to-white/30 pointer-events-none" />
        </div>

        {/* Details */}
        <div className="p-3 bg-white">
          <p className="text-[11px] font-black text-slate-800 leading-snug line-clamp-2 mb-0.5">
            {item.name}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mb-3">
            {item.quantity}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-black text-slate-900">
              â‚¹{item.price}
            </span>
            <button
              onClick={() => onAdd(item)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black active:scale-90 transition-transform shadow-md"
              style={{
                backgroundColor: btnColor,
                boxShadow: `0 4px 12px ${btnColor}55`,
              }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
