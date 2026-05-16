import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Flame, Clock, TrendingUp, Store, ChefHat } from "lucide-react";
import { getAllFoodItems } from "@/data/foodData";
import { SHOP_DIRECTORY } from "@/config/shopDirectory";
import { useCart } from "@/contexts/CartContext";
import { getPremiumImage } from "@/data/foodData";

const TRENDING_SEARCHES = ["Burger", "Pasta", "Biryani", "Pizza", "Maggi", "Momos", "Chai", "Roll"];
const FOOD_CATEGORIES = [
  { label: "Burgers", icon: "🍔", query: "burger" },
  { label: "Pizza", icon: "🍕", query: "pizza" },
  { label: "Biryani", icon: "🍛", query: "biryani" },
  { label: "Pasta", icon: "🍝", query: "pasta" },
  { label: "Momos", icon: "🥟", query: "momos" },
  { label: "Chai", icon: "☕", query: "chai" },
  { label: "Rolls", icon: "🌯", query: "roll" },
  { label: "Noodles", icon: "🍜", query: "noodles" },
];

const RECENT_KEY = "safy_recent_searches";
const getRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};
const saveRecent = (term: string) => {
  const prev = getRecent().filter(t => t.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, 6)));
};
const clearAllRecent = () => localStorage.removeItem(RECENT_KEY);

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedShopFilter, setSelectedShopFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const allFoods = useMemo(() => getAllFoodItems(), []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Pre-fill from SAFY voice query param and auto-run search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecent(term);
    setRecentSearches(getRecent());
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: `search-${item.id}`,
      title: item.name || item.title,
      price: item.price,
      image: item.image || getPremiumImage(item.name || item.title, item.category || ""),
      category: item.category,
    });
  };

  // ── Smart Autocomplete ─────────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    const dishSet = new Set<string>();
    const shopSet = new Set<string>();
    const dishes: any[] = [];

    allFoods.forEach(item => {
      if ((item.name || item.title)?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term)) {
        const n = item.name || item.title;
        if (!dishSet.has(n)) { dishSet.add(n); dishes.push(item); }
      }
      if (item.shopName?.toLowerCase().includes(term)) shopSet.add(item.shopName);
    });

    const out: any[] = [{ type: "query", title: query }];
    dishes.slice(0, 5).forEach(d => out.push({ type: "dish", title: d.name || d.title, price: d.price, image: d.image, raw: d }));
    Array.from(shopSet).slice(0, 3).forEach(sn => {
      const shop = SHOP_DIRECTORY.find(s => s.name === sn);
      if (shop) out.push({ type: "shop", title: sn, shopId: shop.id });
    });
    return out;
  }, [query, allFoods]);

  // ── Filtered results for inline display ───────────────────────────────────
  const results = useMemo(() => {
    if (!query.trim()) return { dishes: [], shops: [], availableShops: [] };
    const term = query.toLowerCase();
    const dishSet = new Set<string>();
    const allMatchingDishes: any[] = [];
    const availableShopNames = new Set<string>();

    allFoods.forEach(item => {
      const name = (item.name || item.title || "").toLowerCase();
      if (name.includes(term) || item.category?.toLowerCase().includes(term)) {
        if (!dishSet.has(name)) { 
          dishSet.add(name); 
          allMatchingDishes.push(item);
          if (item.shopName) availableShopNames.add(item.shopName);
        }
      }
    });

    const shops = SHOP_DIRECTORY.filter(s =>
      s.name.toLowerCase().includes(term) || s.aliases.some(a => a.includes(term))
    );

    const isFilterValid = selectedShopFilter && availableShopNames.has(selectedShopFilter);
    const filteredDishes = isFilterValid 
      ? allMatchingDishes.filter(d => d.shopName === selectedShopFilter)
      : allMatchingDishes;

    return { dishes: filteredDishes, shops, availableShops: Array.from(availableShopNames) };
  }, [query, allFoods, selectedShopFilter]);

  const isEmpty = !query.trim();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#FFFFFF] overflow-hidden">
      {/* ── BACKGROUND MESH ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[-1] opacity-70 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF4D94]/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FFB6C1]/20 blur-[100px]" />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-16 pb-4 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-pink-100/50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-pink-50 text-[#FF4D94] shrink-0 border border-pink-100 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex-1 flex items-center gap-3 bg-white border border-pink-100 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FF4D94]/20 transition-all duration-300">
          <Search className="w-5 h-5 text-[#FF4D94] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(query)}
            placeholder="Search for food or cravings..."
            className="flex-1 bg-transparent text-[15.5px] font-semibold text-[#1A1A1A] placeholder-pink-300/80 focus:outline-none min-w-0"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center shrink-0"
              >
                <X className="w-3.5 h-3.5 text-[#FF4D94]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
          {isEmpty ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-6 pb-10 space-y-8">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                      <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Recent</span>
                    </div>
                    <button onClick={() => { clearAllRecent(); setRecentSearches([]); }} className="text-[12px] font-bold text-pink-400/70">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {recentSearches.map(term => (
                      <motion.button
                        key={term}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-pink-100 shadow-[0_2px_10px_rgba(255,182,193,0.1)] active:bg-pink-50 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-pink-400" />
                        <span className="text-[14px] font-bold text-[#333333]">{term}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                  <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Trending Now</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-pink-50/50 to-white border border-pink-200/60 shadow-[4px_4px_15px_rgba(255,77,148,0.08)] active:shadow-none transition-all"
                    >
                      <span className="text-[14px] font-black text-[#FF4D94]">{term}</span>
                      <Flame className="w-3.5 h-3.5 text-[#FF4D94] fill-[#FF4D94]" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ── VISUAL FEAST (Large Images Section) ─────────────────── */}
              <div className="overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                    <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Most Loved Dishes</span>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-0.5">
                  {[
                    { name: "Pasta", img: "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png", price: "189" },
                    { name: "Burgers", img: "/food_premium/aloo_tikki_burger_premium_1775370523748_1775370605814.png", price: "99" },
                    { name: "Biryani", img: "/food_premium/veg_dum_biryani_premium_1775370523747_1775370582150.png", price: "249" },
                    { name: "Noodles", img: "/food_premium/veg_hakka_noodles_premium_1775370523750_1775370740442.png", price: "159" }
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setQuery(item.name)}
                      className="relative min-w-[240px] h-[340px] rounded-[32px] overflow-hidden group shadow-[0_15px_35px_rgba(255,77,148,0.15)] ring-1 ring-pink-100"
                    >
                      <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-[28px] font-black text-white leading-tight drop-shadow-lg">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-pink-300 font-bold tracking-wider uppercase text-[12px]">Starts @ ₹{item.price}</p>
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <Search className="w-4 h-4 text-[#FF4D94]" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Browse by Category */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                  <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Categories</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {FOOD_CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuery(cat.query)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-[22px] bg-white border border-pink-100 flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(255,182,193,0.15)] active:translate-y-1 transition-all">
                        {cat.icon}
                      </div>
                      <span className="text-[12px] font-bold text-[#444444]">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* All Restaurants */}
              <div className="pb-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                  <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Restaurants</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SHOP_DIRECTORY.map((shop, i) => (
                    <motion.button
                      key={shop.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/shop/${shop.id}`)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-pink-50 shadow-[0_10px_25px_rgba(0,0,0,0.03)] active:bg-pink-50/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
                        <span className="text-lg">🏪</span>
                      </div>
                      <span className="text-[13px] font-bold text-[#1A1A1A] leading-tight line-clamp-2">{shop.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── RESULTS STATE ─────────────────────────────────────────── */
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* Live Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div className="bg-white">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.title + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        if (s.type === "shop") navigate(`/shop/${s.shopId}`);
                        else { setQuery(s.title); handleSearch(s.title); }
                      }}
                      className="flex items-center gap-4 w-full px-5 py-4 active:bg-pink-50 transition-colors border-b border-pink-50 last:border-0"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-pink-50/50 flex items-center justify-center shrink-0 overflow-hidden border border-pink-100/50">
                        {s.type === "query" && <Search className="w-5 h-5 text-[#FF4D94]" />}
                        {s.type === "dish" && s.image && <img src={s.image} className="w-full h-full object-cover" />}
                        {s.type === "dish" && !s.image && <span className="text-lg">🍽️</span>}
                        {s.type === "shop" && <Store className="w-5 h-5 text-pink-500" />}
                      </div>
                      <div className="flex flex-col text-left flex-1 min-w-0">
                        <span className="text-[15.5px] font-bold text-[#1A1A1A] truncate">{s.title}</span>
                        <span className={`text-[12.5px] font-bold mt-0.5 ${s.type === "query" ? "text-pink-400" : s.type === "shop" ? "text-pink-500" : "text-black/40"}`}>
                          {s.type === "query" ? "Search for this craving" : s.type === "dish" ? `Dish • ₹${s.price}` : "Restaurant"}
                        </span>
                      </div>
                      {s.type === "dish" && s.raw && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); handleAddToCart(s.raw); }}
                          className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-[#FF4D94] font-black text-xl shrink-0"
                        >
                          +
                        </motion.button>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
              {/* Shop Filter UI */}
              {results.availableShops.length > 0 && (
                <div className="px-5 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                    <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Filter by Shop</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button
                      onClick={() => setSelectedShopFilter(null)}
                      className={`px-4 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap border transition-all ${!selectedShopFilter || !results.availableShops.includes(selectedShopFilter) ? "bg-[#FF4D94] text-white border-[#FF4D94] shadow-md shadow-pink-500/20" : "bg-white text-[#1A1A1A] border-pink-100"}`}
                    >
                      All Shops
                    </button>
                    {results.availableShops.map(shop => (
                      <button
                        key={shop}
                        onClick={() => setSelectedShopFilter(shop)}
                        className={`px-4 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap border transition-all ${selectedShopFilter === shop ? "bg-[#FF4D94] text-white border-[#FF4D94] shadow-md shadow-pink-500/20" : "bg-white text-[#1A1A1A] border-pink-100"}`}
                      >
                        {shop}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Full Results: Dishes */}
              {results.dishes.length > 0 && (
                <div className="px-5 pt-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                    <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">{results.dishes.length} Dishes</span>
                  </div>
                  <div className="space-y-4">
                    {results.dishes.map((item, i) => (
                      <motion.div
                        key={item.id || i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-pink-100 shadow-[0_8px_30px_rgba(255,77,148,0.06)]"
                      >
                        <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                          <img
                            src={item.image || getPremiumImage(item.name || item.title, item.category)}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[16px] font-black text-[#1A1A1A] truncate">{item.name || item.title}</p>
                          <p className="text-[12.5px] text-pink-400 font-black mt-0.5 tracking-tight uppercase">{item.shopName}</p>
                          <p className="text-[16px] font-black text-[#FF4D94] mt-1.5">₹{item.price}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddToCart(item)}
                          className="w-10 h-10 rounded-2xl bg-[#FF4D94] flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg shadow-pink-500/30"
                        >
                          +
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Results: Shops */}
              {results.shops.length > 0 && (
                <div className="px-5 pt-8 pb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 bg-[#FF4D94] rounded-full" />
                    <span className="text-[13px] font-black tracking-widest text-[#FF4D94] uppercase">Restaurants</span>
                  </div>
                  <div className="space-y-4">
                    {results.shops.map((shop, i) => (
                      <motion.button
                        key={shop.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/shop/${shop.id}`)}
                        className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white border border-pink-100 text-left shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                          <span className="text-2xl">🏪</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[16px] font-black text-[#1A1A1A]">{shop.name}</p>
                          <p className="text-[13px] text-pink-500 font-bold mt-0.5">Open Now • View Menu</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-pink-200 rotate-180" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.dishes.length === 0 && results.shops.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-24 px-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-8">
                    <Search className="w-10 h-10 text-pink-200" />
                  </div>
                  <p className="text-[20px] font-black text-[#1A1A1A]">No results for "{query}"</p>
                  <p className="text-[14px] text-black/40 font-bold mt-2">Try searching for something else or browse categories above!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
