import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Star, ListFilter, ChevronDown, Clock, Leaf } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";

type CategoryType = "all" | "combos" | "burgers" | "pizza" | "biryani" | "pasta" | "specials";

interface FilterOption {
  id: string;
  label: string;
  icon?: any;
  hasDropdown?: boolean;
}

const categories = [
  { id: "all", label: "All", img: "/banners/cat_all.png" },
  { id: "pizza", label: "Pizza", img: "/banners/cat_pizza.png" },
  { id: "burgers", label: "Burger", img: "/banners/cat_burger.png" },
  { id: "biryani", label: "Biryani", img: "/banners/cat_biryani.png" },
  { id: "pasta", label: "Pasta", img: "/banners/mixed_sauce_pasta.png" },
  { id: "combos", label: "Combos", img: "/banners/combo_feast.png" },
];

const filters: FilterOption[] = [
  { id: "filter", label: "Filters", icon: ListFilter },
  { id: "under-250", label: "Under ₹250" },
  { id: "schedule", label: "Schedule", icon: ChevronDown, hasDropdown: true },
  { id: "pure-veg", label: "Pure Veg", icon: Leaf },
];

const comboItems = [
  {
    id: "combo-1",
    name: "Pasta & Burger Feast",
    shop: "Multi-Shop Special",
    rating: 4.8,
    description: "White Sauce Pasta + Veg Burger + 2 Mountain Dew",
    price: 199,
    image: "/banners/combo_1.png",
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    shop: "Bombay Bites Special",
    rating: 4.7,
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.png",
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    shop: "Chatori Chaat Special",
    rating: 4.9,
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.png",
  },
];

export default function HomeSpecialSections() {
  const { addItem } = useCart();
  const [activeCat, setActiveCat] = useState<CategoryType>("all");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // 1. Dynamic Extraction Logic
  const filteredItems = useMemo(() => {
    if (activeCat === "combos") return comboItems;

    let items: any[] = [];
    
    if (activeCat === "all") {
       // Just grab popular things or recommended ones
       const favorites = ["Burger", "Pizza", "Biryani", "Paneer", "Noodles"];
       shops.forEach(shop => {
         shop.categories.forEach(cat => {
           cat.items.forEach(item => {
             if (favorites.some(f => item.name.includes(f))) {
               items.push({ ...item, id: `all-${shop.id}-${item.name}`, shopName: shop.name, rating: (4.1 + Math.random() * 0.8).toFixed(1), image: item.name.includes("Burger") ? "/banners/burger_special.png" : item.name.includes("Pizza") ? "/banners/today_special.png" : "/banners/combo_feast.png" });
             }
           });
         });
       });
       return items.sort(() => 0.5 - Math.random()).slice(0, 8);
    }

    // specific categories
    shops.forEach(shop => {
      shop.categories.forEach(cat => {
        const isMatch = 
          cat.category.toLowerCase().includes(activeCat.toLowerCase()) || 
          (activeCat === "burgers" && cat.category.toLowerCase().includes("burger"));

        if (isMatch) {
          cat.items.forEach(item => {
            items.push({
              ...item,
              id: `${activeCat}-${shop.id}-${item.name}`,
              shopName: shop.name,
              rating: (4.2 + Math.random() * 0.7).toFixed(1),
              image: activeCat === "burgers" ? "/banners/burger_special.png" : "/banners/today_special.png"
            });
          });
        }
      });
    });

    // Handle secondary filters
    if (activeFilters.has("under-250")) {
      items = items.filter(i => i.price <= 250);
    }
    if (activeFilters.has("pure-veg")) {
      // In a real app we'd check item.isVeg, here we'll simulate or skip for simplicity if not in data
    }

    return items.slice(0, 10);
  }, [activeCat, activeFilters]);

  const handleAdd = (item: any) => {
    addItem({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image,
      category: "shops",
    });
    setAddedIds(prev => new Set(prev).add(String(item.id)));
    toast.success(`${item.name} added to cart!`);
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(String(item.id));
        return next;
      });
    }, 1500);
  };

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="mt-6 mb-12">
      {/* 1. Food Bubbles Row */}
      <div className="flex items-start gap-5 overflow-x-auto pb-4 scrollbar-hide px-1">
        {/* Promo Tile */}
        <div className="flex-shrink-0 flex flex-col items-center">
           <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-black/5 active:scale-95 transition-transform hover:shadow-xl">
              <img src="/banners/promo_meals_under_250.png" alt="Promo" className="w-full h-full object-cover" />
           </div>
        </div>

        {categories.map((cat) => {
          const isActive = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id as CategoryType)}
              className="flex-shrink-0 flex flex-col items-center gap-2.5 group"
            >
              <div className={`w-[72px] h-[72px] rounded-full overflow-hidden transition-all duration-300 relative ${
                isActive ? "p-[2px] bg-[#34C759]" : "p-0"
              }`}>
                 <div className="w-full h-full rounded-full bg-[#F5F5F7] overflow-hidden border border-black/5 shadow-sm active:scale-95 transition-transform">
                    <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 </div>
              </div>
              <span className={`text-[12px] font-bold tracking-tight ${
                 isActive ? "text-[#1D1D1F]" : "text-[#48484A]"
              }`}>
                {cat.label}
              </span>
              {isActive && (
                <motion.div layoutId="active-indicator" className="h-1 w-8 bg-[#34C759] rounded-full mt-[-4px]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="h-[1px] w-full bg-[#E5E5E7] mt-2 mb-6" />

      {/* 2. Filter Pills Row */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide px-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilters.has(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                isActive 
                ? "bg-[#1D1D1F] text-white border-[#1D1D1F]" 
                : "bg-white text-[#1D1D1F] border-[#E5E5E7] hover:bg-[#F5F5F7]"
              }`}
            >
              {f.id === 'filter' && <Icon className="w-4 h-4" />}
              {f.label}
              {(f.hasDropdown || f.id === 'schedule') && <ChevronDown className="w-3 h-3 opacity-60" />}
            </button>
          );
        })}
      </div>

      <h3 className="text-sm font-black text-[#1D1D1F]/40 uppercase tracking-[0.15em] mb-6 px-1">
        Recommended For You
      </h3>

      {/* 3. Items Carousel (matching current theme) */}
      <div 
        className="flex overflow-x-auto pb-8 gap-5 px-1 snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <AnimatePresence mode="wait">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.04 }}
              className="relative min-w-[280px] w-[280px] snap-center pt-8"
            >
              {/* Asset Header Circle */}
              <div className="absolute top-0 right-4 z-20 w-24 h-24 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-[3px] border-white shadow-xl bg-white">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   {item.rating && (
                     <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5 border border-black/5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[9px] font-black">{item.rating}</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Card Body (Swiggy/Zomato style) */}
              <div className="rounded-[2.2rem] bg-white border border-[#E5E5E7] p-5 pt-6 flex flex-col justify-between shadow-sm min-h-[150px] relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-[#34C759]/20" />
                 
                 <div className="max-w-[170px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] truncate">
                          {item.shop || item.shopName}
                       </p>
                    </div>
                    <h4 className="text-[15px] font-black text-[#1D1D1F] leading-tight line-clamp-2 mb-2">{item.name}</h4>
                 </div>

                 <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                       <span className="text-[16px] font-black text-[#1D1D1F]">₹{item.price}</span>
                    </div>
                    
                    <button
                      onClick={() => handleAdd(item)}
                      className={`h-9 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                         addedIds.has(String(item.id)) 
                         ? "bg-green-500 text-white shadow-lg" 
                         : "bg-[#1D1D1F] text-white hover:bg-black active:scale-95"
                      }`}
                    >
                      {addedIds.has(String(item.id)) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        "Add"
                      )}
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
