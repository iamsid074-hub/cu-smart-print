import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  Heart,
  TrendingUp,
  Search,
  Store,
  Truck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

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
      // Stable slice for performance rather than random sort
      return items.slice(0, 8);
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
            <div className="flex items-center bg-[#1c1c1e] border border-white/10 rounded-[1.2rem] p-1.5 shadow-2xl mx-auto">
              {categories.map((cat, i) => {
                const isActive = activeCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCatChange(cat.id);
                      setShowAll(false);
                    }}
                    className={`relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-[0.9rem] text-[11px] sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
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
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 rounded-full bg-orange-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
              Curated Editorial
            </h2>
          </div>
          <Link 
            to="/search"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5 shrink-0"
          >
            <Search className="w-4 h-4 text-white" />
          </Link>
        </div>
      )}

      {/* ═══ 2. UNIFORM CARD GRID ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 px-1">
        {(showAll ? filteredItems : filteredItems.slice(0, 4)).map((item, i) => {
          const isAdded = addedIds.has(String(item.id));
          const isLiked = likedIds.has(String(item.id));
          
          return (
            <motion.div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-[1.5rem] bg-[#1c1c1e] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col shadow-lg"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Top Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button 
                    onClick={(e) => toggleLike(String(item.id), e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-all ${
                      isLiked ? "bg-red-500 border-red-500" : "bg-black/60 hover:bg-black/80"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                </div>

                {Number(item.rating) >= 4.5 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-500/90 backdrop-blur-md border border-orange-400/50 z-10">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" /> Pick
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h4 className="font-bold text-[14px] sm:text-[15px] text-white leading-tight mb-0.5 sm:mb-1 truncate">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-[11px] sm:text-[12px] mb-3 truncate">
                  {item.shop || item.shopName}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[15px] sm:text-[17px] font-black text-white tracking-tight">
                    ₹{item.price}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {item.rating}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!showAll && filteredItems.length > 4 && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => setShowAll(true)}
            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[13px] uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-colors shadow-sm"
          >
            Show More
          </button>
        </div>
      )}
      
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[90%] w-full sm:max-w-md bg-[#1c1c1e] text-white border-white/10 p-0 rounded-3xl overflow-hidden shadow-2xl">
          {selectedItem && (
            <div className="flex flex-col relative">
              <div className="w-full h-48 sm:h-56 relative bg-black">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] to-transparent pointer-events-none" />
              </div>
              <div className="px-6 pb-6 -mt-8 relative z-10 flex flex-col">
                <h3 className="text-3xl font-black text-white leading-tight mb-2">{selectedItem.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> Outlet</span>
                    <span className="font-bold text-sm text-white truncate">{selectedItem.shop || selectedItem.shopName || "Hostel Cafe"}</span>
                  </div>
                  <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                    <span className="font-bold text-sm text-white truncate">15-20 Mins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 mb-4">
                   <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Price</span>
                      <span className="text-3xl font-black text-white tracking-tight">₹{selectedItem.price}</span>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    handleAdd(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="w-full mt-2 bg-white text-[#1c1c1e] font-black text-[15px] py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
