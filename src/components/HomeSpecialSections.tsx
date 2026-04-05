import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Star, ListFilter, ChevronDown, Clock, Leaf } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";

type CategoryType = "all" | "combos" | "burgers" | "pizza" | "biryani" | "pasta" | "specials";

interface FoodSectionsProps {
  activeCat: string;
  onCatChange: (cat: string) => void;
}

interface FilterOption {
  id: string;
  label: string;
  icon?: any;
  hasDropdown?: boolean;
}

const categories = [
  { id: "all", label: "All", img: "/banners/cat_all.webp" },
  { id: "pizza", label: "Pizza", img: "/banners/cat_pizza.webp" },
  { id: "burgers", label: "Burger", img: "/banners/cat_burger.webp" },
  { id: "biryani", label: "Biryani", img: "/banners/cat_biryani.webp" },
  { id: "pasta", label: "Pasta", img: "/banners/mixed_sauce_pasta.webp" },
  { id: "combos", label: "Combos", img: "/banners/combo_feast.webp" },
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
    image: "/banners/combo_1.webp",
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    shop: "Bombay Bites Special",
    rating: 4.7,
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.webp",
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    shop: "Chatori Chaat Special",
    rating: 4.9,
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.webp",
  },
];

const PREMIUM_ASSETS: Record<string, string> = {
  "margherita": "/food_premium/margherita_pizza_premium_1775370523745.png",
  "farmhouse": "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  "peppy paneer": "/food_premium/peppy_paneer_pizza_premium_1775370523749_1775370716628.png",
  "pizza": "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  "burger": "/food_premium/aloo_tikki_burger_premium_1775370523748_1775370605814.png",
  "noodles": "/food_premium/veg_hakka_noodles_premium_1775370523750_1775370740442.png",
  "pasta": "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
  "vada pav": "/food_premium/mumbai_vada_pav_premium_1775370523753_1775370832865.png",
  "chole bhature": "/food_premium/chole_bhature_premium_1775370523754_1775370853979.png",
  "paneer butter": "/food_premium/paneer_butter_masala_premium_1775370523755_1775370876646.png",
  "dal makhani": "/food_premium/dal_makhani_premium_1775370523756_1775370900599.png",
  "pav bhaji": "/food_premium/pav_bhaji_premium_1775370523759_1775370968391.png",
  "shake": "/food_premium/oreo_shake_premium_1775370523760_1775370986248.png",
  "brownie": "/food_premium/chocolate_brownie_premium_1775370523761_1775371010375.png",
  "biryani": "/food_premium/veg_dum_biryani_premium_1775370523747_1775370582150.png",
  "chilli paneer": "/food_premium/chilli_paneer_dry_premium_1775370523751_1775370790498.png",
  "red sauce pasta": "/banners/red_sauce_pasta.webp",
  "white sauce pasta": "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
  "mixed sauce pasta": "/banners/mixed_sauce_pasta.webp",
};

const getPremiumImage = (name: string, category: string) => {
  const lowercaseName = name.toLowerCase();
  for (const [key, value] of Object.entries(PREMIUM_ASSETS)) {
    if (lowercaseName.includes(key)) return value;
  }
  
  if (category === "pizza") return PREMIUM_ASSETS["pizza"];
  if (category === "burgers") return PREMIUM_ASSETS["burger"];
  if (category === "biryani") return PREMIUM_ASSETS["biryani"];
  if (category === "pasta") return PREMIUM_ASSETS["pasta"];
  
  return PREMIUM_ASSETS["chole bhature"]; // Default premium placeholder
};

export default function HomeSpecialSections({ activeCat, onCatChange }: FoodSectionsProps) {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // 1. Dynamic Extraction Logic
  const filteredItems = useMemo(() => {
    if (activeCat === "combos") return comboItems;

    let items: any[] = [];
    
    if (activeCat === "all") {
       const favorites = ["Burger", "Pizza", "Biryani", "Paneer", "Noodles"];
       shops.forEach(shop => {
         shop.categories.forEach(cat => {
           cat.items.forEach(item => {
             if (favorites.some(f => item.name.includes(f))) {
               items.push({ 
                 ...item, 
                 id: `all-${shop.id}-${item.name}`, 
                 shopName: shop.name, 
                 rating: (4.1 + Math.random() * 0.8).toFixed(1), 
                 image: getPremiumImage(item.name, "all") 
               });
             }
           });
         });
       });
       return items.sort(() => 0.5 - Math.random()).slice(0, 8);
    }

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
                image: getPremiumImage(item.name, activeCat)
              });
            });
        }
      });
    });

    if (activeFilters.has("under-250")) {
      items = items.filter(i => i.price <= 250);
    }
    
    if (activeFilters.has("pure-veg")) {
      items = items.filter(i => i.shop === "Punjabi Rasoi" || i.shopName === "Punjabi Rasoi");
    }

    return items;
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
      {/* 1. Premium Food Categories Shelf */}
      <div className="relative mb-8 mt-2 px-1">
        {/* Luxury Background Shelf */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2F2F7]/80 to-white/40 rounded-[2.5rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl -z-10" />
        
        <div className="flex items-start gap-6 overflow-x-auto py-5 px-5 scrollbar-hide">
          {/* Promo Item */}
          <div className="flex-shrink-0 flex flex-col items-center group">
             <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] border-2 border-white active:scale-95 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <img src="/banners/promo_meals_under_250.webp" alt="Promo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
             </div>
             <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mt-2 bg-white/80 px-2 py-0.5 rounded-full border border-black/5">HOT</span>
          </div>

          {categories.map((cat) => {
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCatChange(cat.id)}
                className="flex-shrink-0 flex flex-col items-center gap-3 group relative"
              >
                <div className={`w-[72px] h-[72px] rounded-full transition-all duration-500 relative ${
                   isActive ? "scale-105" : "scale-100"
                }`}>
                   {/* Active Glow */}
                   <AnimatePresence>
                     {isActive && (
                       <motion.div 
                          layoutId="activeGlow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-[-4px] rounded-full bg-[#34C759]/20 blur-md" 
                       />
                     )}
                   </AnimatePresence>
                   
                   <div className={`w-full h-full rounded-full bg-white overflow-hidden border-2 transition-all duration-500 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] group-hover:shadow-2xl group-hover:-translate-y-1 ${
                      isActive ? "border-[#34C759]" : "border-white/80"
                   }`}>
                      <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>

                   {/* Active Indicator Dot */}
                   {isActive && (
                     <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" 
                     />
                   )}
                </div>
                <span className={`text-[12px] font-black tracking-tight transition-colors duration-300 ${
                   isActive ? "text-[#1D1D1F]" : "text-[#8E8E93] group-hover:text-[#1D1D1F]"
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
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

      {activeCat === 'all' && (
        <h3 className="text-sm font-black text-[#1D1D1F]/40 uppercase tracking-[0.15em] mb-6 px-1">
          Handpicked For You
        </h3>
      )}

      {/* 3. Luxury Showroom Discovery Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16 px-1 mt-12">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="group rounded-[2.5rem] bg-white border border-[#E5E5E7] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full pt-20 pb-6 px-6">
                 
                 {/* Floating Plate Image - The LUXURY HERO */}
                 <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-48 z-20 pointer-events-none">
                    <div className="relative w-full h-full">
                       {/* Layered Shadows for Depth */}
                       <div className="absolute inset-4 rounded-full bg-black/30 blur-2xl translate-y-8" />
                       <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3" 
                       />
                       
                       {item.rating && (
                         <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg border border-black/5 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[11px] font-black">{item.rating}</span>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Premium Card Content */}
                 <div className="flex flex-col flex-grow text-center mt-4">
                    {/* Brand/Shop Name */}
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] truncate">{item.shop || item.shopName}</p>
                    </div>

                    {/* Dish Name */}
                    <h4 className="text-[19px] font-black text-[#1D1D1F] leading-[1.2] mb-3 group-hover:text-[#007AFF] transition-colors line-clamp-2 min-h-[46px] flex items-center justify-center">
                       {item.name}
                    </h4>

                    {/* Meta Info Row */}
                    <div className="flex items-center justify-center gap-4 text-[12px] font-bold text-[#8E8E93] mb-4 pb-4 border-b border-[#F2F2F7]">
                       <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{15 + Math.floor(Math.random() * 5)}-{25 + Math.floor(Math.random() * 5)}m</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <span className="opacity-40">•</span>
                          <span>{(0.2 + Math.random() * 0.6).toFixed(1)} km</span>
                       </div>
                    </div>

                    {/* Special Offer Badge */}
                    <div className="flex items-center justify-center gap-1.5 mb-6 px-3 py-1.5 bg-[#007AFF]/5 rounded-full w-fit mx-auto border border-[#007AFF]/10">
                       <CheckCircle2 className="w-3.5 h-3.5 text-[#007AFF]" />
                       <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-wider">Flat ₹50 OFF</span>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                       <div className="flex flex-col items-start leading-none">
                          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Price</span>
                          <span className="text-[20px] font-black text-[#1D1D1F]">₹{item.price}</span>
                       </div>
                       <button
                         onClick={() => handleAdd(item)}
                         className={`h-11 px-8 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] transition-all duration-500 overflow-hidden relative ${
                            addedIds.has(String(item.id)) 
                            ? "bg-[#34C759] text-white shadow-lg scale-95" 
                            : "bg-[#1D1D1F] text-white hover:bg-black ios-shadow active:scale-95 group-hover:translate-x-1"
                         }`}
                       >
                         {addedIds.has(String(item.id)) ? "Added" : "Add +"}
                       </button>
                    </div>
                 </div>

                 {/* Premium Glass Shine Effect */}
                 <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
