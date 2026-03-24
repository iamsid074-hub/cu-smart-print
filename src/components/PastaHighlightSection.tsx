import { motion } from "framer-motion";
import { Plus, Flame, CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";

const pastaItems = [
  {
    id: "flavour-factory-Pasta-red",
    name: "Red Sauce Pasta",
    price: 99,
    image: "/banners/red_sauce_pasta.png",
    color: "#DC2626",
    gradientFrom: "from-red-500/20",
    rotate: "-rotate-3",
    zIndex: 1,
  },
  {
    id: "flavour-factory-Pasta-white",
    name: "White Sauce Pasta",
    price: 99,
    image: "/banners/white_sauce_pasta.png",
    color: "#F59E0B",
    gradientFrom: "from-amber-500/20",
    rotate: "rotate-0",
    zIndex: 3,
  },
  {
    id: "flavour-factory-Pasta-mixed",
    name: "Mixed Sauce Pasta",
    price: 99,
    image: "/banners/mixed_sauce_pasta.png",
    color: "#EA580C",
    gradientFrom: "from-orange-500/20",
    rotate: "rotate-3",
    zIndex: 1,
  },
];

export default function PastaHighlightSection() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (item: typeof pastaItems[0]) => {
    addItem({
      id: item.id,
      title: `${item.name} (Flavour Factory)`,
      price: item.price,
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
      transition={{ duration: 0.5 }}
      className="mb-8 rounded-[2rem] overflow-hidden relative"
      style={{ background: "linear-gradient(160deg, #1a0a00, #2d1200, #1a0800)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(255,120,30,0.5) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgba(255,60,30,0.4) 0%, transparent 70%)" }} />

      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-400/20">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">Pasta @ {"\u20B9"}99</h3>
              <p className="text-[10px] text-orange-300/60 font-bold uppercase tracking-wider">Flavour Factory Special</p>
            </div>
          </div>
          <Link
            to="/pasta-offer"
            className="text-[10px] sm:text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors px-3 py-1.5 rounded-full border border-orange-500/20 hover:border-orange-400/30 bg-orange-500/5"
          >
            View All {"\u2192"}
          </Link>
        </div>

        {/* Pasta Cards — creative staggered layout */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 -mx-1 sm:mx-0">
          {pastaItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.03, rotate: 0 }}
              className={`relative flex-1 max-w-[160px] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer group ${item.rotate}`}
              style={{ transformOrigin: "center bottom" }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Price badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black text-white"
                  style={{ background: `${item.color}cc` }}>
                  {"\u20B9"}99
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">{item.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAdd(item); }}
                  className="mt-2 w-full h-8 rounded-lg text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95"
                  style={{
                    background: addedIds.has(item.id)
                      ? "rgba(34,197,94,0.2)"
                      : `${item.color}20`,
                    color: addedIds.has(item.id) ? "#22C55E" : item.color,
                    border: `1px solid ${addedIds.has(item.id) ? "rgba(34,197,94,0.3)" : item.color + "30"}`,
                  }}
                >
                  {addedIds.has(item.id) ? (
                    <><CheckCircle2 className="w-3 h-3" /> Added</>
                  ) : (
                    <><Plus className="w-3 h-3" /> Add to Cart</>
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
