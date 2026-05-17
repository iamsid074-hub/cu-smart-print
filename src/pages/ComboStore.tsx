import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Theme Data ───────────────────────────────────────────────────
const THEMES: Record<string, { bg: string, badgeBg: string, badgeText: string, btnBg: string, btnText: string }> = {
  green: { bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", badgeBg: "bg-green-100", badgeText: "text-green-700", btnBg: "bg-green-600", btnText: "text-white" },
  orange: { bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", badgeBg: "bg-orange-100", badgeText: "text-orange-700", btnBg: "bg-orange-500", btnText: "text-white" },
  blue: { bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", badgeBg: "bg-blue-100", badgeText: "text-blue-700", btnBg: "bg-blue-600", btnText: "text-white" },
  pink: { bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", badgeBg: "bg-pink-100", badgeText: "text-pink-600", btnBg: "bg-pink-500", btnText: "text-white" },
  purple: { bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", badgeBg: "bg-purple-100", badgeText: "text-purple-700", btnBg: "bg-purple-600", btnText: "text-white" },
};

// ─── Combo Data ───────────────────────────────────────────────────
const ALL_COMBOS = [
  {
    id: "combo-amul-milk",
    name: "Amul Milk Special",
    items: "Get 2 packets of Amul Milk 500ml",
    price: 49,
    originalPrice: 60,
    save: 11,
    image: "",
    images: ["/combo/amullmilk_opt.webp"],
    fullCover: true,
    category: "new",
    badge: "NEW",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🥛",
    themeId: "green"
  },
  {
    id: "combo-snack-time",
    name: "Snack Time",
    items: "Lays green + pepsi 400ml + kurkure",
    price: 66,
    originalPrice: 80,
    save: 14,
    image: "",
    images: ["/combo/snacksimage_opt.webp"],
    fullCover: true,
    category: "new",
    badge: "NEW",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍟",
    themeId: "orange"
  },
  {
    id: "combo-choco-paradise",
    name: "Chocolate Paradise",
    items: "Nestle fruit 'N' nuts + dairy milk + 5 milkibars + 2 waffers",
    price: 95,
    originalPrice: 120,
    save: 25,
    image: "",
    images: ["/combo/chocolates_opt.webp"],
    fullCover: true,
    category: "new",
    badge: "NEW",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍫",
    themeId: "blue"
  },
  {
    id: "combo-curd-pack",
    name: "Fresh Curd Pack",
    items: "3 box curd 150gram",
    price: 56,
    originalPrice: 70,
    save: 14,
    image: "",
    images: ["/combo/dahiimage_opt.webp"],
    fullCover: true,
    category: "new",
    badge: "NEW",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🥣",
    themeId: "purple"
  },
  {
    id: "combo-aloo-bhujia",
    name: "Aloo Bhujia Snacks Combo",
    items: "Aloo Bhujia (80g) + Lays Green + Mad Angles + Cold Drink (400ml)",
    price: 80,
    originalPrice: 100,
    save: 20,
    image: "",
    images: ["/combo/3rs1_opt.webp"],
    fullCover: true,
    category: "dairy",
    badge: "CRISPY",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍟",
    themeId: "orange"
  },
  {
    id: "combo-kurkure-chips",
    name: "Kurkure Chips Combo",
    items: "Kurkure + Haldiram's Blue Chips (2) + Coke (750ml)",
    price: 110,
    originalPrice: 140,
    save: 30,
    image: "",
    images: ["/combo/3rs2_opt.webp"],
    fullCover: true,
    category: "dairy",
    badge: "PARTY",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🥤",
    themeId: "blue"
  },
  {
    id: "combo-lime-juice",
    name: "Lime (Mosambi) Juice Large Combo",
    items: "Get 2 Lime (Mosambi) Juice (Large)",
    price: 150,
    originalPrice: 180,
    save: 30,
    image: "",
    images: ["/combo/4th1_opt.webp"],
    fullCover: true,
    category: "beverages",
    badge: "FRESH",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍋",
    themeId: "green"
  },
  {
    id: "combo-pineapple-juice",
    name: "Pineapple Juice Large Combo",
    items: "Get 2 Pineapple Juice (Large)",
    price: 155,
    originalPrice: 190,
    save: 35,
    image: "",
    images: ["/combo/4th2_opt.webp"],
    fullCover: true,
    category: "beverages",
    badge: "SWEET",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍍",
    themeId: "orange"
  },
  {
    id: "combo-watermelon-juice",
    name: "Watermelon Juice Large Combo",
    items: "Get 2 Watermelon Juice (Large)",
    price: 115,
    originalPrice: 140,
    save: 25,
    image: "",
    images: ["/combo/4th3_opt.webp"],
    fullCover: true,
    category: "beverages",
    badge: "CHILLED",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🍉",
    themeId: "pink"
  },
  {
    id: "combo-party-chicken",
    name: "Chicken Party Pack",
    items: "2 smoked chicken burgers + peri peri fries + coke 750 ml",
    price: 341,
    originalPrice: 390,
    save: 49,
    image: "",
    images: ["/combo/best1_opt.webp"],
    fullCover: true,
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: false,
    emoji: "🍔",
    themeId: "pink"
  },
  {
    id: "combo-crispy-veg",
    name: "Crispy Veg Deal",
    items: "crispy veg burger + pepsi 400 ml",
    price: 82,
    originalPrice: 100,
    save: 18,
    image: "",
    images: ["/combo/best2_opt.webp"],
    fullCover: true,
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: true,
    emoji: "🥤",
    themeId: "orange"
  },

  {
    id: "combo-pizza-sandwich",
    name: "Pizza Burger Combo",
    items: "baked pizza sandwitch + crispy veg burger + mountain dew / pepsi (400ml)",
    price: 234,
    originalPrice: 270,
    save: 36,
    image: "",
    images: ["/combo/best3_opt.webp"],
    fullCover: true,
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: true,
    emoji: "🍕",
    themeId: "purple"
  },
  {
    id: "combo-mumbai-vada",
    name: "Mumbai Vada Pav Meal",
    items: "mumbai aloo vada pav (2) + pepsi 400ml",
    price: 91,
    originalPrice: 110,
    save: 19,
    image: "",
    images: ["/combo/best4_opt.webp"],
    fullCover: true,
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: true,
    emoji: "🌶️",
    themeId: "green"
  },
];

const CATEGORIES = [
  { id: "all", label: "All Combos", count: ALL_COMBOS.length },
  { id: "dairy", label: "Snacks combo", count: ALL_COMBOS.filter(c => c.category === "dairy").length },
  { id: "beverages", label: "Juices combo", count: ALL_COMBOS.filter(c => c.category === "beverages").length },
  { id: "bestseller", label: "Best Seller", count: ALL_COMBOS.filter(c => c.category === "bestseller").length },
  { id: "more", label: "More", count: 0 },
];

const BENEFITS = [
  { title: "Best Prices", subtitle: "Guaranteed" },
  { title: "Curated", subtitle: "With Care" },
  { title: "Big Savings", subtitle: "Up to 40% Off" },
  { title: "Time Saver", subtitle: "Everything together" },
];

function ComboCard({
  combo,
  onAdd,
  added,
  liked,
  onLike,
}: {
  combo: (typeof ALL_COMBOS)[0];
  onAdd: () => void;
  added: boolean;
  liked: boolean;
  onLike: () => void;
}) {
  const theme = THEMES[combo.themeId] || THEMES.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[24px] overflow-hidden flex-shrink-0 w-[220px] h-[340px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] pb-4 flex flex-col"
    >
      <div 
        className="relative w-full h-[150px] flex flex-col justify-between p-3"
        style={{ background: theme.bg }}
      >
        <div className="flex items-start justify-between relative z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow-sm ${theme.badgeBg} ${theme.badgeText}`}>
            {combo.badge}
          </span>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center ${combo.fullCover ? '' : 'pt-5'}`}>
          {combo.images && combo.images.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {combo.images.length === 1 && (
                <img 
                  src={combo.images[0]} 
                  alt="Combo item"
                  className={combo.fullCover ? "object-cover w-full h-full" : "object-contain h-[100px] drop-shadow-2xl transition-transform duration-300 hover:scale-110"} 
                  style={combo.fullCover ? { imageRendering: 'high-quality', transform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' } : {}}
                />
              )}
              {combo.images.length === 2 && (
                <>
                  <img src={combo.images[0]} className="absolute h-[90px] object-contain drop-shadow-xl -translate-x-6 -rotate-6 z-10 transition-transform duration-300 hover:scale-110 hover:z-30 origin-bottom" />
                  <img src={combo.images[1]} className="absolute h-[100px] object-contain drop-shadow-2xl translate-x-5 translate-y-1 rotate-6 z-20 transition-transform duration-300 hover:scale-110 hover:z-30 origin-bottom" />
                </>
              )}
              {combo.images.length === 3 && (
                <>
                  <img src={combo.images[0]} className="absolute h-[90px] object-contain drop-shadow-xl -translate-x-10 -translate-y-1 -rotate-12 z-10 transition-transform duration-300 hover:scale-110 hover:z-40 origin-bottom" />
                  <img src={combo.images[2]} className="absolute h-[85px] object-contain drop-shadow-xl translate-x-10 translate-y-2 rotate-12 z-20 transition-transform duration-300 hover:scale-110 hover:z-40 origin-bottom" />
                  <img src={combo.images[1]} className="absolute h-[105px] object-contain drop-shadow-2xl z-30 translate-y-2 transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:z-40 origin-bottom" />
                </>
              )}
              {combo.images.length > 3 && (
                <div className="flex items-center justify-center -space-x-5">
                  {combo.images.map((img, i) => (
                    <img key={i} src={img} className="h-[75px] object-contain drop-shadow-xl transition-transform duration-300 hover:scale-110 hover:z-40" style={{ zIndex: i }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-7xl opacity-90">{combo.emoji}</div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1 flex-1 flex flex-col">
        <h3 className="text-[14px] font-black text-slate-900 leading-tight mb-0.5">{combo.name}</h3>
        <p className="text-[11px] text-slate-500 font-medium mb-2 leading-snug">{combo.items}</p>

        <div className="flex items-center justify-between mb-3 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-black text-slate-900 tracking-tight">₹{combo.price}</span>
            <span className="text-[12px] text-slate-400 line-through font-semibold">₹{combo.originalPrice}</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-[6px]">
            <span className="text-[10px] font-bold text-green-700">Save ₹{combo.save}</span>
          </div>
        </div>

        {/* Full-width animated add button */}
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.97 }}
          className="relative w-full h-11 rounded-2xl overflow-hidden flex items-center justify-center font-black text-[13px] tracking-wide"
          style={{
            background: "linear-gradient(90deg, #16a34a, #22c55e)"
          }}
        >
          {/* Ripple sweep animation on add */}
          <AnimatePresence>
            {added && (
              <motion.div
                key="sweep"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 bg-white/20 rounded-2xl"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {added ? (
              <motion.div
                key="added"
                initial={{ opacity: 0, scale: 0.7, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-white relative z-10"
              >
                Added to Cart!
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, scale: 0.7, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-white relative z-10"
              >
                Add to Cart
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ComboStore() {
  const { addItem, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filteredCombos = useMemo(() => {
    return activeCategory === "all" ? ALL_COMBOS : ALL_COMBOS.filter(c => c.category === activeCategory);
  }, [activeCategory]);

  const handleAdd = (combo: (typeof ALL_COMBOS)[0]) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    const theme = THEMES[combo.themeId] || THEMES.blue;
    addItem({
      id: combo.id,
      title: `${combo.name} (${combo.shop})`,
      price: combo.price,
      image: combo.images?.[0] || "",
      category: "shops",
    });
    toast.success(`${combo.name} added!`);
    setAddedIds(prev => new Set(prev).add(combo.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(combo.id);
        return next;
      });
    }, 2500);
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white pb-28 md:hidden">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl pt-14 pb-4 px-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-2 mt-2">
          <div className="flex flex-col">
            <h1 className="text-[32px] font-black text-slate-900 leading-[1.1] tracking-tight">
              Smarter Combos<br />
              <span className="text-purple-600">Better Savings</span>
            </h1>
          </div>
          <button onClick={() => navigate("/home")} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm active:scale-95 transition-transform text-slate-700">
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide mt-6 pb-2 -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => cat.id !== "more" && setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center justify-center px-5 py-2.5 rounded-full transition-all active:scale-95 ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "bg-slate-50 text-slate-500 border border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black">{cat.label}</span>
                  {cat.count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {cat.count}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 space-y-8 mt-2">
        {activeCategory === "all" ? (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory("all")}
              className="relative rounded-[24px] overflow-hidden cursor-pointer"
            >
              <img 
                src="/comboimage1.webp" 
                alt="More Together, More Savings. Up to 40% OFF" 
                className="w-full h-auto object-cover block" 
                loading="eager"
                decoding="async"
              />
            </motion.div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-6 bg-purple-600 rounded-full" />
                  <h2 className="text-[20px] font-black text-slate-900 tracking-tight">New Combos</h2>
                </div>
                <button onClick={() => setActiveCategory("new")} className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[11px] font-black text-purple-600 active:scale-95 transition-transform">
                  VIEW ALL
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {ALL_COMBOS.filter(c => c.category === "new").map(combo => (
                  <ComboCard key={combo.id} combo={combo} onAdd={() => handleAdd(combo)} added={addedIds.has(combo.id)} liked={likedIds.has(combo.id)} onLike={() => toggleLike(combo.id)} />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 my-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[18px] bg-slate-50 border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <div>
                    <p className="text-[11px] font-black text-slate-800 leading-none">{b.title}</p>
                    <p className="text-[9px] font-semibold text-slate-400 leading-none mt-1.5">{b.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-6 bg-amber-500 rounded-full" />
                  <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Best Selling Combos</h2>
                </div>
                <button onClick={() => setActiveCategory("bestseller")} className="px-3.5 py-1.5 rounded-full bg-amber-50 text-[11px] font-black text-amber-600 active:scale-95 transition-transform">
                  VIEW ALL
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {ALL_COMBOS.filter(c => c.category === "bestseller").map(combo => (
                  <ComboCard key={combo.id} combo={combo} onAdd={() => handleAdd(combo)} added={addedIds.has(combo.id)} liked={likedIds.has(combo.id)} onLike={() => toggleLike(combo.id)} />
                ))}
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Snacks combo</h2>
                </div>
                <button onClick={() => setActiveCategory("dairy")} className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[11px] font-black text-blue-600 active:scale-95 transition-transform">
                  VIEW ALL
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {ALL_COMBOS.filter(c => c.category === "dairy").map(combo => (
                  <ComboCard key={combo.id} combo={combo} onAdd={() => handleAdd(combo)} added={addedIds.has(combo.id)} liked={likedIds.has(combo.id)} onLike={() => toggleLike(combo.id)} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-6 bg-orange-500 rounded-full" />
                  <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Juices combo</h2>
                </div>
                <button onClick={() => setActiveCategory("beverages")} className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[11px] font-black text-orange-600 active:scale-95 transition-transform">
                  VIEW ALL
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {ALL_COMBOS.filter(c => c.category === "beverages").map(combo => (
                  <ComboCard key={combo.id} combo={combo} onAdd={() => handleAdd(combo)} added={addedIds.has(combo.id)} liked={likedIds.has(combo.id)} onLike={() => toggleLike(combo.id)} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-8">
            {filteredCombos.map(combo => {
              const theme = THEMES[combo.themeId] || THEMES.blue;
              return (
                <motion.div key={combo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col">
                  <div className="relative w-full h-[120px] flex items-center justify-center p-3" style={{ background: theme.bg }}>
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide shadow-sm ${theme.badgeBg} ${theme.badgeText}`}>{combo.badge}</span>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center ${combo.fullCover ? '' : 'pt-5'}`}>
                      {combo.images && combo.images.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {combo.images.length === 1 && (
                            <img 
                              src={combo.images[0]} 
                              alt="Combo item"
                              className={combo.fullCover ? "object-cover w-full h-full" : "object-contain h-[80px] drop-shadow-2xl transition-transform duration-300 hover:scale-110"} 
                              style={combo.fullCover ? { imageRendering: 'high-quality', transform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' } : {}}
                            />
                          )}
                          {combo.images.length === 2 && (
                            <>
                              <img src={combo.images[0]} className="absolute h-[70px] object-contain drop-shadow-xl -translate-x-4 -rotate-6 z-10" />
                              <img src={combo.images[1]} className="absolute h-[80px] object-contain drop-shadow-2xl translate-x-3 translate-y-1 rotate-6 z-20" />
                            </>
                          )}
                          {combo.images.length === 3 && (
                            <>
                              <img src={combo.images[0]} className="absolute h-[70px] object-contain drop-shadow-xl -translate-x-8 -translate-y-1 -rotate-12 z-10" />
                              <img src={combo.images[2]} className="absolute h-[65px] object-contain drop-shadow-xl translate-x-8 translate-y-2 rotate-12 z-20" />
                              <img src={combo.images[1]} className="absolute h-[85px] object-contain drop-shadow-2xl z-30 translate-y-2" />
                            </>
                          )}
                          {combo.images.length > 3 && (
                            <div className="flex items-center justify-center -space-x-4">
                              {combo.images.map((img, i) => (
                                <img key={i} src={img} className="h-[60px] object-contain drop-shadow-xl" style={{ zIndex: i }} />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : combo.image ? (
                        <img 
                          src={combo.image} 
                          alt="Combo item"
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <div className="text-6xl opacity-90">{combo.emoji}</div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[13px] font-black text-slate-900 mb-0.5 leading-tight">{combo.name}</h3>
                      <p className="text-[10px] text-slate-400 mb-2 leading-snug">{combo.items}</p>
                    </div>
                    <div className="flex items-center justify-between mb-2.5 mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[16px] font-black text-slate-900">₹{combo.price}</span>
                        <span className="text-[10px] text-slate-400 line-through font-semibold">₹{combo.originalPrice}</span>
                      </div>
                      <div className="inline-flex items-center bg-green-50 px-1.5 py-0.5 rounded-[4px]">
                        <span className="text-[9px] font-bold text-green-700">Save ₹{combo.save}</span>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => handleAdd(combo)}
                      whileTap={{ scale: 0.97 }}
                      className="relative w-full h-9 rounded-xl overflow-hidden flex items-center justify-center font-black text-[11px] tracking-wide text-white"
                      style={{
                        background: "linear-gradient(90deg, #16a34a, #22c55e)"
                      }}
                    >
                      {addedIds.has(combo.id) ? "Added!" : "Add to Cart"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center pt-4 pb-6">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-purple-600 text-white text-[14px] font-black shadow-xl shadow-purple-600/30 active:scale-95 transition-transform">
            GO TO CART
            {totalItems > 0 && <span className="ml-1 bg-white text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-full">{totalItems}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
