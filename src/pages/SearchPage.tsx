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
    if (!query.trim()) return { dishes: [], shops: [] };
    const term = query.toLowerCase();
    const dishSet = new Set<string>();
    const dishes: any[] = [];

    allFoods.forEach(item => {
      const name = (item.name || item.title || "").toLowerCase();
      if (name.includes(term) || item.category?.toLowerCase().includes(term)) {
        if (!dishSet.has(name)) { dishSet.add(name); dishes.push(item); }
      }
    });

    const shops = SHOP_DIRECTORY.filter(s =>
      s.name.toLowerCase().includes(term) || s.aliases.some(a => a.includes(term))
    );
    return { dishes, shops };
  }, [query, allFoods]);

  const isEmpty = !query.trim();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 bg-[#0a0a0a] border-b border-white/5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex-1 flex items-center gap-2.5 bg-white/8 border border-white/10 rounded-2xl px-3.5 py-2.5">
          <Search className="w-4.5 h-4.5 text-white/40 shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(query)}
            placeholder="Search food, restaurants..."
            className="flex-1 bg-transparent text-[15px] font-medium text-white placeholder-white/30 focus:outline-none min-w-0"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"
              >
                <X className="w-3 h-3 text-white" />
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
                      <Clock className="w-4 h-4 text-white/40" />
                      <span className="text-[12px] font-black tracking-widest text-white/40 uppercase">Recent</span>
                    </div>
                    <button onClick={() => { clearAllRecent(); setRecentSearches([]); }} className="text-[12px] font-bold text-orange-400">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {recentSearches.map(term => (
                      <motion.button
                        key={term}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/8 border border-white/10"
                      >
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-[13px] font-semibold text-white/80">{term}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-[12px] font-black tracking-widest text-white/40 uppercase">Trending Now</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/20"
                    >
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-[13px] font-semibold text-orange-300">{term}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Browse by Category */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="w-4 h-4 text-purple-400" />
                  <span className="text-[12px] font-black tracking-widest text-white/40 uppercase">Categories</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {FOOD_CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.label}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setQuery(cat.query)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/8 active:bg-white/10 transition-colors"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-[11px] font-bold text-white/60">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* All Restaurants */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span className="text-[12px] font-black tracking-widest text-white/40 uppercase">All Restaurants</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_DIRECTORY.map((shop, i) => (
                    <motion.button
                      key={shop.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/shop/${shop.id}`)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8 text-left active:bg-white/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center shrink-0">
                        <span className="text-base">🍽️</span>
                      </div>
                      <span className="text-[12px] font-bold text-white/80 leading-tight line-clamp-2">{shop.name}</span>
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
                <div className="border-b border-white/5">
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
                      className="flex items-center gap-4 w-full px-4 py-3.5 active:bg-white/5 transition-colors border-b border-white/4 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0 overflow-hidden">
                        {s.type === "query" && <Search className="w-4.5 h-4.5 text-white/50" size={18} />}
                        {s.type === "dish" && s.image && <img src={s.image} className="w-full h-full object-cover" />}
                        {s.type === "dish" && !s.image && <span className="text-lg">🍽️</span>}
                        {s.type === "shop" && <Store className="w-4.5 h-4.5 text-emerald-400" size={18} />}
                      </div>
                      <div className="flex flex-col text-left flex-1 min-w-0">
                        <span className="text-[14.5px] font-bold text-white truncate">{s.title}</span>
                        <span className={`text-[12px] font-semibold mt-0.5 ${s.type === "query" ? "text-orange-400" : s.type === "shop" ? "text-emerald-400" : "text-white/40"}`}>
                          {s.type === "query" ? "Search all results" : s.type === "dish" ? `Dish • ₹${s.price}` : "Restaurant"}
                        </span>
                      </div>
                      {s.type === "dish" && s.raw && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); handleAddToCart(s.raw); }}
                          className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0"
                        >
                          +
                        </motion.button>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
              
              {/* Full Results: Dishes */}
              {results.dishes.length > 0 && (
                <div className="px-4 pt-6">
                  <p className="text-[12px] font-black tracking-widest text-white/30 uppercase mb-4">
                    {results.dishes.length} Dishes Found
                  </p>
                  <div className="space-y-3">
                    {results.dishes.map((item, i) => (
                      <motion.div
                        key={item.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/8"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                          <img
                            src={item.image || getPremiumImage(item.name || item.title, item.category)}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-white truncate">{item.name || item.title}</p>
                          <p className="text-[12px] text-white/40 font-medium mt-0.5">{item.shopName}</p>
                          <p className="text-[13px] font-black text-orange-400 mt-1">₹{item.price}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddToCart(item)}
                          className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
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
                <div className="px-4 pt-6 pb-4">
                  <p className="text-[12px] font-black tracking-widest text-white/30 uppercase mb-4">Restaurants</p>
                  <div className="space-y-3">
                    {results.shops.map((shop, i) => (
                      <motion.button
                        key={shop.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/shop/${shop.id}`)}
                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/8 text-left active:bg-white/8"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <span className="text-xl">🏪</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-white">{shop.name}</p>
                          <p className="text-[12px] text-emerald-400 font-medium mt-0.5">Open Now • Tap to view menu</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-white/30 rotate-180" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.dishes.length === 0 && results.shops.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-20 px-8 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-[17px] font-bold text-white/60">No results for"{query}"</p>
                  <p className="text-[13px] text-white/30 font-medium mt-2">Try a different search or browse categories above</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
