import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Heart,
  ChevronRight,
  Tag,
  Clock,
  Sparkles,
  Star,
  ShoppingCart,
  Zap,
  Gift,
  Coffee,
  Utensils,
  LayoutGrid,
  ArrowRight,
  Percent,
  Crown
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
    items: "Amool milk 500ml (2)",
    price: 49,
    originalPrice: 60,
    save: 11,
    image: "",
    images: ["/combo/amullmilk_hq.webp"],
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
    images: ["/combo/snacksimage.webp"],
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
    images: ["/combo/chocolates.webp"],
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
    images: ["/combo/dahiimage.webp"],
    fullCover: true,
    category: "new",
    badge: "NEW",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🥣",
    themeId: "purple"
  },
  {
    id: "combo-dairy-delight",
    name: "Dairy Delight",
    items: "Amul Milk 1L + Paneer 200g + Cheese Slices",
    price: 185,
    originalPrice: 210,
    save: 25,
    image: "/food_premium/dairy.jpg",
    category: "dairy",
    badge: "FRESH",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🧀",
    themeId: "blue"
  },
  {
    id: "combo-morning-fuel",
    name: "Morning Fuel",
    items: "Curd 400g + 2× Butter Milk + Brown Bread",
    price: 120,
    originalPrice: 145,
    save: 25,
    image: "/food_premium/morning.jpg",
    category: "dairy",
    badge: "HEALTHY",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🥣",
    themeId: "green"
  },
  {
    id: "combo-chill-vibes",
    name: "Chill Vibes",
    items: "Red Bull + 2× Coke 500ml + Ice Bag",
    price: 249,
    originalPrice: 285,
    save: 36,
    image: "/food_premium/beverage.jpg",
    category: "beverages",
    badge: "CHILLED",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "🧊",
    themeId: "blue"
  },
  {
    id: "combo-energy-pack",
    name: "Energy Pack",
    items: "Monster Energy + Sting + Dark Fantasy Biscuits",
    price: 165,
    originalPrice: 190,
    save: 25,
    image: "/food_premium/energy.jpg",
    category: "beverages",
    badge: "POWER",
    shop: "Bazzar Grocery",
    isVeg: true,
    emoji: "⚡",
    themeId: "orange"
  },
  {
    id: "combo-ultimate-party",
    name: "Ultimate Party Pack",
    items: "2× Smoked Chicken Burger + Peri Peri Fries + Coke 1L",
    price: 349,
    originalPrice: 400,
    save: 51,
    image: "/food_premium/party_pack.jpg",
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: false,
    emoji: "🎉",
    themeId: "pink"
  },
  {
    id: "combo-snack-attack",
    name: "Snack Attack",
    items: "Peri Peri Fries + Crispy Paneer Roll + Sprite",
    price: 149,
    originalPrice: 175,
    save: 26,
    image: "/food_premium/snack.jpg",
    category: "bestseller",
    badge: "BESTSELLER",
    shop: "Flavour Factory",
    isVeg: true,
    emoji: "🍟",
    themeId: "pink"
  },
];

const CATEGORIES = [
  { id: "all", label: "All Combos", count: ALL_COMBOS.length, icon: Sparkles },
  { id: "dairy", label: "Dairy", count: ALL_COMBOS.filter(c => c.category === "dairy").length, icon: Utensils },
  { id: "beverages", label: "Beverages", count: ALL_COMBOS.filter(c => c.category === "beverages").length, icon: Coffee },
  { id: "bestseller", label: "Snacks", count: ALL_COMBOS.filter(c => c.category === "bestseller").length, icon: Star },
  { id: "more", label: "More", count: 0, icon: LayoutGrid },
];

const BENEFITS = [
  { icon: Tag, title: "Best Prices", subtitle: "Guaranteed" },
  { icon: Gift, title: "Curated", subtitle: "With Care" },
  { icon: Percent, title: "Big Savings", subtitle: "Up to 40% Off" },
  { icon: Clock, title: "Time Saver", subtitle: "Everything together" },
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
      className="bg-white rounded-[24px] overflow-hidden flex-shrink-0 w-[220px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] pb-4"
    >
      <div 
        className="relative w-full h-[150px] flex flex-col justify-between p-3"
        style={{ background: theme.bg }}
      >
        <div className="flex items-start justify-between relative z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow-sm ${theme.badgeBg} ${theme.badgeText}`}>
            {combo.badge}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="w-7 h-7 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : "text-slate-500"}`} strokeWidth={2} />
          </button>
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

      <div className="px-4 pt-3 pb-1">
        <h3 className="text-[14px] font-black text-slate-900 leading-tight mb-0.5">{combo.name}</h3>
        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mb-2 leading-snug">{combo.items}</p>

        <div className="flex items-center justify-between mb-3">
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
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
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
                <Plus className="w-4 h-4" strokeWidth={3} />
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
      image: theme.bg,
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
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl pt-14 pb-4 px-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <h1 className="text-[28px] font-black text-slate-900 leading-tight tracking-tight">Smarter Combos,</h1>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[28px] font-black text-purple-600 leading-tight tracking-tight">Better Savings</h1>
              <Sparkles className="w-5 h-5 text-purple-400" fill="#c084fc" />
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Curated combos of your daily essentials</p>
          </div>
          <button onClick={() => navigate("/cart")} className="relative w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm active:scale-95 transition-transform">
            <ShoppingCart className="w-5 h-5 text-slate-700" strokeWidth={2} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide mt-6 pb-2 -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => cat.id !== "more" && setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 p-1.5 pr-4 rounded-[20px] transition-all active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-br from-[#7e22ce] to-[#6d28d9] text-white shadow-lg shadow-purple-600/30 border border-purple-500/50"
                    : "bg-white border border-slate-100 text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                }`}
              >
                <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center ${isActive ? "bg-white/20" : "bg-slate-50 border border-slate-100"}`}>
                  <cat.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className={`text-[12px] font-extrabold leading-tight ${isActive ? "text-white" : "text-slate-700"}`}>{cat.label}</span>
                  {cat.count > 0 ? (
                    <span className={`text-[10px] font-semibold leading-none mt-0.5 ${isActive ? "text-purple-200" : "text-slate-400"}`}>{cat.count}</span>
                  ) : null}
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
              className="relative rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(30,27,75,0.12)] cursor-pointer"
            >
              <img 
                src="/comboimage1.png" 
                alt="More Together, More Savings. Up to 40% OFF" 
                className="w-full h-auto object-cover block" 
              />
            </motion.div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" fill="#c084fc" />
                  <h2 className="text-[18px] font-black text-slate-900 tracking-tight">New Combos</h2>
                </div>
                <button onClick={() => setActiveCategory("new")} className="flex items-center gap-1 text-[13px] font-bold text-purple-600">
                  View all <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {ALL_COMBOS.filter(c => c.category === "new").map(combo => (
                  <ComboCard key={combo.id} combo={combo} onAdd={() => handleAdd(combo)} added={addedIds.has(combo.id)} liked={likedIds.has(combo.id)} onLike={() => toggleLike(combo.id)} />
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between py-4 px-1 my-4">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100/50 mb-1">
                    <b.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800">{b.title}</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-tight mt-0.5">{b.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" fill="#f59e0b" />
                  <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Best Selling Combos</h2>
                </div>
                <button onClick={() => setActiveCategory("bestseller")} className="flex items-center gap-1 text-[13px] font-bold text-purple-600">
                  View all <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-blue-500" />
                  <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Dairy Combos</h2>
                </div>
                <button onClick={() => setActiveCategory("dairy")} className="flex items-center gap-1 text-[13px] font-bold text-purple-600">
                  View all <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-orange-500" />
                  <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Beverages</h2>
                </div>
                <button onClick={() => setActiveCategory("beverages")} className="flex items-center gap-1 text-[13px] font-bold text-purple-600">
                  View all <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide shadow-sm ${theme.badgeBg} ${theme.badgeText}`}>{combo.badge}</span>
                    </div>
                    <button onClick={() => toggleLike(combo.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/60 backdrop-blur flex items-center justify-center">
                      <Heart className={`w-3 h-3 ${likedIds.has(combo.id) ? "fill-red-500 text-red-500" : "text-slate-500"}`} strokeWidth={2} />
                    </button>
                    <div className="text-6xl opacity-90">{combo.emoji}</div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[13px] font-black text-slate-900 mb-0.5 leading-tight">{combo.name}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-snug">{combo.items}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[16px] font-black text-slate-900">₹{combo.price}</span>
                        <span className="text-[10px] text-slate-400 line-through ml-1 font-semibold">₹{combo.originalPrice}</span>
                      </div>
                      <button onClick={() => handleAdd(combo)} className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${addedIds.has(combo.id) ? "bg-green-500" : theme.btnBg}`}>
                        {addedIds.has(combo.id) ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center pt-4 pb-6">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-purple-600 text-white text-[14px] font-black shadow-xl shadow-purple-600/30 active:scale-95 transition-transform">
            <ShoppingCart className="w-4 h-4" /> Go to Cart
            {totalItems > 0 && <span className="ml-1 bg-white text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-full">{totalItems}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
