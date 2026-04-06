import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Search,
  Star,
  Clock,
  Zap,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { getAllFoodItems } from "@/data/foodData";

function getLevenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

const CARD_ACCENTS = [
  {
    strip: "from-orange-500/90 via-red-500/80 to-rose-600/90",
    badge: "bg-orange-500",
    text: "text-orange-600",
    light: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    strip: "from-violet-500/90 via-purple-500/80 to-fuchsia-600/90",
    badge: "bg-violet-500",
    text: "text-violet-600",
    light: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    strip: "from-emerald-500/90 via-teal-500/80 to-cyan-600/90",
    badge: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    strip: "from-sky-500/90 via-blue-500/80 to-indigo-600/90",
    badge: "bg-sky-500",
    text: "text-sky-600",
    light: "bg-sky-50",
    border: "border-sky-200",
  },
];

export default function FoodSearch() {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Create added items Set
  const addedIds = useMemo(
    () => new Set(items.map((i) => String(i.id))),
    [items]
  );

  const allItems = useMemo(() => getAllFoodItems(), []);

  // Debounce search query to prevent lag while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return allItems;

    return allItems.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const shop = (item.shopName || item.shop || "").toLowerCase();

      // 1. Exact or partial substring match (very fast)
      if (name.includes(q) || cat.includes(q) || shop.includes(q)) return true;

      // 2. Fuzzy match (Typo tolerance)
      const words = name.split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && q.length > 2) {
          const distance = getLevenshteinDistance(word, q);
          if (distance <= 2) return true; // Allows 2 spelling mistakes
        }
      }
      return false;
    });
  }, [debouncedQuery, allItems]);

  const handleAdd = (item: any) => {
    if (!addedIds.has(String(item.id))) {
      addItem({
        id: String(item.id),
        title: item.name,
        price: item.price,
        image: item.image,
        category: "food",
      });
      toast.success(`${item.name} added to cart!`);
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 pb-4 pt-12 sm:pt-16 px-4">
        <div className="max-w-[1200px] mx-auto flex gap-3 items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 shadow-sm shrink-0 rounded-full bg-[#F2F2F7] flex items-center justify-center hover:bg-[#E5E5E7] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" />
          </button>

          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for pizza, burger, biryani..."
              className="w-full pl-9 pr-10 py-3 rounded-2xl bg-[#F2F2F7] border border-black/5 text-[15px] font-semibold text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 w-5 h-5 rounded-full bg-[#8E8E93] flex items-center justify-center text-white hover:bg-[#1D1D1F] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#1D1D1F] tracking-tight">
            {debouncedQuery
              ? `Results for "${debouncedQuery}"`
              : "All Delicious Food"}
          </h2>
          <span className="text-[13px] font-bold text-[#8E8E93]">
            {filteredItems.length} items
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#8E8E93]" />
            </div>
            <h3 className="text-[18px] font-black text-[#1D1D1F]">
              Hmm, we couldn't find anything
            </h3>
            <p className="text-[13px] font-medium text-[#8E8E93] mt-2 max-w-[250px]">
              We autocorrect spelling mistakes ideally, but maybe what you are
              craving isn't on campus right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item, i) => {
              const ac = CARD_ACCENTS[i % CARD_ACCENTS.length];
              const isAdded = addedIds.has(String(item.id));
              const deliveryTime = `${15 + Math.floor(Math.random() * 5)}-${
                25 + Math.floor(Math.random() * 5)
              }`;
              const distance = (0.2 + Math.random() * 0.6).toFixed(1);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 8) * 0.05, duration: 0.3 }}
                  className="group relative"
                >
                  <div className="relative rounded-[1.4rem] sm:rounded-[1.6rem] overflow-hidden bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] transition-all duration-600 hover:-translate-y-1.5 border border-black/[0.04] flex flex-col h-full">
                    {/* Left Accent Strip */}
                    <div
                      className={`absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b ${ac.strip} z-20 rounded-l-[1.4rem]`}
                    />

                    {/* Image Hero */}
                    <div className="relative shrink-0">
                      <div
                        className="relative h-[130px] sm:h-[150px] overflow-hidden"
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                      </div>

                      {/* Shop Name */}
                      <div className="absolute top-3 left-4 z-20">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${ac.badge} shadow-lg`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-white uppercase tracking-[0.12em] truncate max-w-[100px] sm:max-w-[120px]">
                            {item.shop || item.shopName}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      {item.rating && (
                        <div className="absolute -bottom-0 right-4 z-20 translate-y-1/2">
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white shadow-lg border border-black/5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[12px] font-black text-[#1D1D1F]">
                              {item.rating}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="px-4 pt-4 pb-3.5 sm:px-5 sm:pt-5 sm:pb-4 flex flex-col flex-1">
                      <h4
                        className="text-[15px] sm:text-[17px] font-black text-[#1D1D1F] leading-tight mb-2 line-clamp-2 group-hover:text-[#007AFF] transition-colors duration-300 tracking-[-0.01em]"
                        style={{ minHeight: "38px" }}
                      >
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F2F2F7]">
                          <Clock className="w-3 h-3 text-[#8E8E93]" />
                          <span className="text-[10px] font-bold text-[#6E6E73]">
                            {deliveryTime}m
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F2F2F7]">
                          <span className="text-[10px] font-bold text-[#6E6E73]">
                            {distance} km
                          </span>
                        </div>
                      </div>

                      <div className="mb-3.5 mt-auto">
                        <span className="text-[22px] sm:text-[24px] font-black text-[#1D1D1F] tracking-tight">
                          {"\u20B9"} {item.price}
                        </span>
                      </div>

                      <div className="w-full">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleAdd(item)}
                          className={`relative w-full h-10 sm:h-11 rounded-[0.9rem] text-[12px] font-black uppercase tracking-[0.06em] transition-all duration-500 overflow-hidden flex items-center justify-center gap-1.5 ${
                            isAdded
                              ? "bg-[#34C759] text-white shadow-lg shadow-[#34C759]/25"
                              : "bg-[#1D1D1F] text-white hover:bg-[#007AFF] shadow-md hover:shadow-lg active:scale-95"
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {isAdded ? (
                              <motion.div
                                key="added"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Done</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="add"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>ADD</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
