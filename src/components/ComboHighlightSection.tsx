import { motion } from "framer-motion";
import { Plus, CheckCircle2, Crown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";

const comboItems = [
  {
    id: "combo-1",
    name: "Classic Student Combo",
    description: "Burger + Fries + Coke",
    price: 149,
    image: "/banners/white_sauce_pasta.png", // Demo image
    zIndex: 1,
  },
  {
    id: "combo-2",
    name: "The Bazzar Special",
    description: "Pizza + Garlic Bread + Shake",
    price: 299,
    image: "/banners/red_sauce_pasta.png", // Demo image
    zIndex: 3,
  },
  {
    id: "combo-3",
    name: "Midnight Cravings",
    description: "Noodles + Manchurian + Coke",
    price: 199,
    image: "/banners/mixed_sauce_pasta.png", // Demo image
    zIndex: 1,
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 rounded-3xl overflow-hidden relative border border-white/5"
      style={{
        background: "linear-gradient(135deg, #1D1D1F 0%, #2A2A2C 100%)",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)"
      }}
    >
      {/* Premium ambient glows */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/30 backdrop-blur-md">
              <Crown className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white/95 leading-tight">Featured Combos</h3>
              <p className="text-[11px] sm:text-xs text-[#D4AF37]/70 font-semibold tracking-wide uppercase mt-0.5">Premium Value Packs</p>
            </div>
          </div>
        </div>

        {/* Combo Cards (Horizontal scroll on mobile, flex on desktop) */}
        <div className="flex overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 sm:gap-5 min-w-full scrollbar-none snap-x snap-mandatory">
          {comboItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5 }}
              className="relative min-w-[200px] w-[200px] sm:w-auto h-full rounded-2xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl snap-center flex flex-col group transition-all duration-300 hover:border-[#D4AF37]/30 hover:shadow-[0_10px_30px_-5px_rgba(212,175,55,0.15)]"
            >
              {/* Image Container */}
              <div className="relative h-28 sm:h-36 overflow-hidden bg-[#2A2A2C]">
                {/* Fallback pattern if image is just demo */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#D4AF37 1px, transparent 1px)", backgroundSize: "10px 10px" }}></div>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D1D1F] via-[#1D1D1F]/50 to-transparent" />
                
                {/* Gold Price Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-bold text-[#1D1D1F] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow-[0_4px_15px_-3px_rgba(212,175,55,0.3)]">
                  {"\u20B9"}{item.price}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-[#1D1D1F]/80 to-[#1D1D1F] backdrop-blur-sm -mt-2 relative z-10">
                <p className="text-sm sm:text-base font-bold text-white/95 leading-tight">{item.name}</p>
                <p className="text-xs text-white/50 mt-1.5 flex-1 line-clamp-2">{item.description}</p>
                
                <button
                  onClick={(e) => { e.preventDefault(); handleAdd(item); }}
                  className="mt-4 w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 overflow-hidden relative group/btn"
                  style={{
                    background: addedIds.has(item.id) ? "rgba(34,197,94,0.15)" : "rgba(212,175,55,0.1)",
                    color: addedIds.has(item.id) ? "#4ADE80" : "#D4AF37",
                    border: `1px solid ${addedIds.has(item.id) ? "rgba(34,197,94,0.3)" : "rgba(212,175,55,0.3)"}`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite] group-hover/btn:translate-x-[150%] transition-all duration-700"></div>
                  {addedIds.has(item.id) ? (
                    <><CheckCircle2 className="w-4 h-4" /> Added</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Add Combo</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
