import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  Heart,
  TrendingUp,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";
import { comboItems, getPremiumImage } from "@/data/foodData";

const categories = [
  { id: "all", label: "All Drops" },
  { id: "pizza", label: "Artisan Pizza" },
  { id: "burgers", label: "Gourmet Burgers" },
  { id: "biryani", label: "Royal Biryani" },
  { id: "pasta", label: "Handcrafted Pasta" },
  { id: "combos", label: "Feasts" },
];

interface FoodSectionsProps {
  activeCat: string;
  onCatChange: (cat: string) => void;
}

export default function HomeSpecialSections({
  activeCat,
  onCatChange,
}: FoodSectionsProps) {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    if (activeCat === "combos") return comboItems;

    let items: any[] = [];

    if (activeCat === "all") {
      const favorites = ["Burger", "Pizza", "Biryani", "Paneer", "Noodles"];
      shops.forEach((shop) => {
        shop.categories.forEach((cat) => {
          cat.items.forEach((item) => {
            if (favorites.some((f) => item.name.includes(f))) {
              items.push({
                ...item,
                id: `all-${shop.id}-${item.name}`,
                shopName: shop.name,
                rating: (4.1 + Math.random() * 0.8).toFixed(1),
                image: getPremiumImage(item.name, "all"),
              });
            }
          });
        });
      });
      // Sort and slice for bento grid, ensure at least 7 items for grid completeness
      return items.sort(() => 0.5 - Math.random()).slice(0, 9);
    }

    shops.forEach((shop) => {
      shop.categories.forEach((cat) => {
        const isMatch =
          cat.category.toLowerCase().includes(activeCat.toLowerCase()) ||
          (activeCat === "burgers" &&
            cat.category.toLowerCase().includes("burger"));

        if (isMatch) {
          cat.items.forEach((item) => {
            items.push({
              ...item,
              id: `${activeCat}-${shop.id}-${item.name}`,
              shopName: shop.name,
              rating: (4.2 + Math.random() * 0.7).toFixed(1),
              image: getPremiumImage(item.name, activeCat),
            });
          });
        }
      });
    });

    return items;
  }, [activeCat]);

  const handleAdd = (item: any) => {
    addItem({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image,
      category: "shops",
    });
    setAddedIds((prev) => new Set(prev).add(String(item.id)));
    toast.success(`${item.name} added to cart!`);
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(String(item.id));
        return next;
      });
    }, 1500);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="mb-12 relative z-10">
      
      {/* ═══ 1. SLEEK CUISINE DOCK ═══ */}
      <div className="sticky top-20 z-40 flex justify-center mb-10 w-full pointer-events-none mt-4">
        <div className="pointer-events-auto max-w-[95%] overflow-hidden">
          <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
            <div className="flex items-center bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/5 rounded-[1.2rem] p-1.5 shadow-2xl mx-auto">
              {categories.map((cat, i) => {
                const isActive = activeCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCatChange(cat.id)}
                    className={`relative px-4 sm:px-5 py-2.5 rounded-[0.9rem] text-[12px] sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                      isActive ? "text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCuisine"
                        className="absolute inset-0 bg-white rounded-[0.9rem] shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeCat === "all" && (
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-1.5 h-6 rounded-full bg-orange-500" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
            Curated Editorial
          </h2>
        </div>
      )}

      {/* ═══ 2. ASYMMETRICAL BENTO GRID ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[160px] sm:auto-rows-[200px] gap-4 sm:gap-5 px-1">
        {filteredItems.map((item, i) => {
          const isAdded = addedIds.has(String(item.id));
          const isLiked = likedIds.has(String(item.id));
          
          // Bento logic: Make every 1st and 6th item large
          const isLarge = (i % 5 === 0);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-[2rem] bg-[#1c1c1e] border border-white/10 hover:border-white/20 transition-all duration-500 shadow-xl ${
                isLarge ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : "col-span-1 row-span-1"
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-transparent pointer-events-none" />

              {/* Top Icons */}
              <div className="absolute top-4 w-full px-4 flex justify-between items-start z-10">
                {Number(item.rating) >= 4.5 && isLarge ? (
                  <div className="px-3 py-1.5 rounded-full bg-orange-500 border border-orange-400/50 backdrop-blur-md">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                       <TrendingUp className="w-3 h-3" /> Editor's Pick
                     </span>
                  </div>
                ) : <div/>}

                <button 
                  onClick={(e) => toggleLike(String(item.id), e)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${
                    isLiked ? "bg-red-500/90 border-red-500" : "bg-black/40 hover:bg-black/60"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 w-full p-4 sm:p-5 flex flex-col justify-end z-10 h-1/2">
                
                <h4 className={`font-black text-white leading-tight ${isLarge ? 'text-2xl sm:text-4xl mb-2' : 'text-[15px] sm:text-lg mb-1'} drop-shadow-md`}>
                  {item.name}
                </h4>
                
                {isLarge && (
                  <p className="text-gray-300 text-[13px] font-medium mb-3 max-w-[80%] hidden sm:block">
                    A culinary masterpiece from {item.shop || item.shopName}. Hand-crafted to absolute perfection for your cravings.
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-bold tracking-wider uppercase">
                      {item.shop || item.shopName || "Hostel Cafe"}
                    </span>
                    <span className={`${isLarge ? 'text-2xl' : 'text-lg'} font-black text-white tracking-tight`}>
                      ₹{item.price}
                    </span>
                  </div>
                  
                  <motion.button
                     whileTap={{ scale: 0.9 }}
                     onClick={() => handleAdd(item)}
                     className={`rounded-2xl flex items-center justify-center font-bold text-[12px] tracking-wide transition-all shadow-xl backdrop-blur-lg ${
                       isLarge ? 'w-14 h-14 bg-white/20 hover:bg-white text-white hover:text-black border border-white/30' : 'w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-black border border-white/30'
                     }`}
                   >
                     {isAdded ? <CheckCircle2 className={isLarge ? "w-6 h-6" : "w-5 h-5"} /> : <Plus className={isLarge ? "w-6 h-6 stroke-[2.5]" : "w-5 h-5 stroke-[2.5]"} />}
                  </motion.button>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
