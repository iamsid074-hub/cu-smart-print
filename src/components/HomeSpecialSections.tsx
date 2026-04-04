import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Star, Flame, Trophy, Utensils } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";

type TabType = "combos" | "burgers" | "specials";

const comboItems = [
  {
    id: "combo-1",
    name: "Pasta & Burger Feast",
    shop: "Multi-Shop Special",
    rating: 4.8,
    description: "White Sauce Pasta + Veg Burger + 2 Mountain Dew",
    price: 199,
    image: "/banners/combo_1.png",
    theme: "from-orange-500/20 to-red-500/10",
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    shop: "Bombay Bites Special",
    rating: 4.7,
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.png",
    theme: "from-amber-400/20 to-orange-600/10",
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    shop: "Chatori Chaat Special",
    rating: 4.9,
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.png",
    theme: "from-emerald-400/20 to-teal-600/10",
  },
];

export default function HomeSpecialSections() {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<TabType>("combos");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // 1. Dynamic Burger Filtering
  const burgerItems = useMemo(() => {
    const allBurgers: any[] = [];
    shops.forEach(shop => {
      shop.categories.forEach(cat => {
        if (cat.category.toLowerCase().includes("burger")) {
          cat.items.forEach(item => {
            allBurgers.push({
              ...item,
              id: `burger-${shop.id}-${item.name}`,
              shopName: shop.name,
              rating: (4.2 + Math.random() * 0.7).toFixed(1),
              image: "/banners/burger_special.png"
            });
          });
        }
      });
    });
    return allBurgers.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []);

  // 2. Curated Today's Specials
  const specialItems = useMemo(() => {
    const specials = [
      { id: "sp-1", name: "Paneer Tikka Platter", shop: "Punjabi Rasoi", rating: 4.9, price: 180, image: "/banners/today_special.png", tag: "Chef's Choice" },
      { id: "sp-2", name: "Mix Sauce Pasta", shop: "Chatori Chaat", rating: 4.7, price: 110, image: "/banners/mixed_sauce_pasta.png", tag: "Best Seller" },
      { id: "sp-3", name: "Special Makni Burger", shop: "Insta Food", rating: 4.8, price: 100, image: "/banners/burger_special.png", tag: "Must Try" },
    ];
    return specials;
  }, []);

  const handleAdd = (item: any) => {
    addItem({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image,
      category: "shops",
    });
    const idStr = String(item.id);
    setAddedIds(prev => new Set(prev).add(idStr));
    toast.success(`${item.name} added to cart!`);
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
    }, 1500);
  };

  const tabs = [
    { id: "combos", label: "Combos", icon: Trophy, color: "text-amber-500" },
    { id: "burgers", label: "Burgers", icon: Flame, color: "text-orange-500" },
    { id: "specials", label: "Today's Special", icon: Utensils, color: "text-rose-500" },
  ];

  const currentData = activeTab === "combos" ? comboItems : activeTab === "burgers" ? burgerItems : specialItems;

  return (
    <section className="mt-8 mb-12">
      {/* Premium Tab Bar */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all duration-300 text-[13px] whitespace-nowrap ${
                isActive 
                ? "bg-[#1D1D1F] text-white shadow-lg scale-[1.05]" 
                : "bg-white/60 text-[#8E8E93] hover:bg-white border border-white/20"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Horizontal Carousel */}
      <div 
        className="flex overflow-x-auto pb-8 gap-5 px-1 snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <AnimatePresence mode="wait">
          {currentData.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="relative min-w-[280px] w-[280px] snap-center pt-10"
            >
              {/* Floating Asset */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                className="absolute top-0 right-4 z-20 w-28 h-28 pointer-events-none"
              >
                <div className="relative w-full h-full">
                   <div className="absolute inset-4 rounded-3xl blur-2xl opacity-30 bg-[#007AFF]"></div>
                   <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-[4px] border-[#1D1D1F] shadow-2xl rotate-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                   {item.rating && (
                     <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-md border border-black/5 px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black text-[#1D1D1F]">{item.rating}</span>
                     </div>
                   )}
                </div>
              </motion.div>

              {/* High-End Card */}
              <div className="rounded-[2.5rem] bg-gradient-to-br from-white to-[#F5F5F7] border border-white p-5 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.06)] min-h-[160px]">
                 <div className="max-w-[160px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] mb-1 truncate">
                       {item.shop || item.shopName}
                    </p>
                    <h4 className="text-[15px] font-black text-[#1D1D1F] leading-tight line-clamp-2">{item.name}</h4>
                    {activeTab === 'combos' && (
                      <p className="text-[10px] text-[#8E8E93] mt-1.5 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.tag && (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                         <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">{item.tag}</span>
                      </div>
                    )}
                 </div>

                 <div className="flex items-center gap-3 mt-4">
                    <div className="text-[15px] font-black text-[#1D1D1F]">
                       ₹{item.price}
                    </div>
                    
                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex-1 h-10 rounded-2xl text-[11px] font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                         addedIds.has(String(item.id)) 
                         ? "bg-green-500 text-white shadow-lg ios-shadow" 
                         : "bg-[#1D1D1F] text-white hover:bg-black ios-shadow active:scale-95"
                      }`}
                    >
                      {addedIds.has(String(item.id)) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <><Plus className="w-4 h-4" /> Add</>
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
