import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { GroceryItem } from "@/config/groceryItems";

interface Props {
    item: GroceryItem;
    idx: number;
    accentColor: string; // tailwind bg class like 'bg-blue-500'
    glowColor: string;   // css rgba string for shadow
    onAdd: (item: GroceryItem) => void;
}

export default function GroceryProductCard({ item, idx, accentColor, glowColor, onAdd }: Props) {
    // Alternate even/odd cards to create staggered vertical offset
    const isOdd = idx % 2 !== 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 120 }}
            className={`relative flex-shrink-0 w-[148px] sm:w-[160px] ${isOdd ? 'mt-8' : 'mb-8'}`}
        >
            {/* Card */}
            <div className="relative bg-white rounded-[1.6rem] shadow-[0_6px_24px_rgba(0,0,0,0.07)] border border-slate-100 pt-14 pb-4 px-3 flex flex-col group hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-shadow duration-300 overflow-visible">

                {/* Product image – overflows above card */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[80px] h-[96px] drop-shadow-2xl transition-transform duration-300 group-hover:-translate-y-2 pointer-events-none">
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Subtle color splash behind image inside card */}
                <div className={`absolute top-0 left-0 right-0 h-16 rounded-t-[1.6rem] ${accentColor} opacity-[0.06]`} />

                {/* Category badge */}
                <span className={`self-start text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${accentColor} text-white mb-1.5`}>
                    {item.category === 'Cold Drinks' ? '🧊 Cold' : item.category === 'Milk' ? '🥛 Milk' : '🍿 Snack'}
                </span>

                <h3 className="text-[12px] font-black text-slate-800 leading-snug line-clamp-2">{item.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">{item.quantity}</p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-[17px] font-black text-slate-900 leading-none">₹{item.price}</span>
                    <button
                        onClick={() => onAdd(item)}
                        className={`w-9 h-9 rounded-xl ${accentColor} text-white flex items-center justify-center active:scale-90 transition-transform`}
                        style={{ boxShadow: `0 4px 14px ${glowColor}` }}
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
