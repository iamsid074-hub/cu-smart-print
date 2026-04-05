import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Star,
  ListFilter,
  ChevronDown,
  Clock,
  Leaf,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Heart,
  Zap,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";

type CategoryType =
  | "all"
  | "combos"
  | "burgers"
  | "pizza"
  | "biryani"
  | "pasta"
  | "specials";

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
  {
    id: "all",
    label: "All",
    img: "/banners/cat_all.webp",
    emoji: "\u2728",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    id: "pizza",
    label: "Pizza",
    img: "/banners/cat_pizza.webp",
    emoji: "\uD83C\uDF55",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "burgers",
    label: "Burger",
    img: "/banners/cat_burger.webp",
    emoji: "\uD83C\uDF54",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "biryani",
    label: "Biryani",
    img: "/banners/cat_biryani.webp",
    emoji: "\uD83C\uDF5A",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    id: "pasta",
    label: "Pasta",
    img: "/banners/mixed_sauce_pasta.webp",
    emoji: "\uD83C\uDF5D",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "combos",
    label: "Combos",
    img: "/banners/combo_feast.webp",
    emoji: "\uD83C\uDF7D\uFE0F",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const filters: FilterOption[] = [
  { id: "filter", label: "Filters", icon: ListFilter },
  { id: "under-250", label: "Under \u20B9250" },
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
  margherita: "/food_premium/margherita_pizza_premium_1775370523745.png",
  farmhouse:
    "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  "peppy paneer":
    "/food_premium/peppy_paneer_pizza_premium_1775370523749_1775370716628.png",
  pizza:
    "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  burger:
    "/food_premium/aloo_tikki_burger_premium_1775370523748_1775370605814.png",
  noodles:
    "/food_premium/veg_hakka_noodles_premium_1775370523750_1775370740442.png",
  pasta:
    "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
  "vada pav":
    "/food_premium/mumbai_vada_pav_premium_1775370523753_1775370832865.png",
  "chole bhature":
    "/food_premium/chole_bhature_premium_1775370523754_1775370853979.png",
  "paneer butter":
    "/food_premium/paneer_butter_masala_premium_1775370523755_1775370876646.png",
  "dal makhani":
    "/food_premium/dal_makhani_premium_1775370523756_1775370900599.png",
  "pav bhaji":
    "/food_premium/pav_bhaji_premium_1775370523759_1775370968391.png",
  shake: "/food_premium/oreo_shake_premium_1775370523760_1775370986248.png",
  brownie:
    "/food_premium/chocolate_brownie_premium_1775370523761_1775371010375.png",
  biryani:
    "/food_premium/veg_dum_biryani_premium_1775370523747_1775370582150.png",
  "chilli paneer":
    "/food_premium/chilli_paneer_dry_premium_1775370523751_1775370790498.png",
  "red sauce pasta": "/banners/red_sauce_pasta.webp",
  "white sauce pasta":
    "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
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

  return PREMIUM_ASSETS["chole bhature"];
};

// Card accent colors for visual variety
const CARD_ACCENTS = [
  {
    bg: "from-orange-500/90 via-red-500/80 to-rose-600/90",
    pill: "bg-orange-500",
    glow: "shadow-orange-500/20",
  },
  {
    bg: "from-violet-500/90 via-purple-500/80 to-fuchsia-600/90",
    pill: "bg-violet-500",
    glow: "shadow-violet-500/20",
  },
  {
    bg: "from-emerald-500/90 via-teal-500/80 to-cyan-600/90",
    pill: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  {
    bg: "from-amber-500/90 via-orange-500/80 to-red-500/90",
    pill: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  {
    bg: "from-pink-500/90 via-rose-500/80 to-red-600/90",
    pill: "bg-pink-500",
    glow: "shadow-pink-500/20",
  },
  {
    bg: "from-sky-500/90 via-blue-500/80 to-indigo-600/90",
    pill: "bg-sky-500",
    glow: "shadow-sky-500/20",
  },
  {
    bg: "from-lime-500/90 via-green-500/80 to-emerald-600/90",
    pill: "bg-lime-500",
    glow: "shadow-lime-500/20",
  },
  {
    bg: "from-fuchsia-500/90 via-pink-500/80 to-rose-600/90",
    pill: "bg-fuchsia-500",
    glow: "shadow-fuchsia-500/20",
  },
];

export default function HomeSpecialSections({
  activeCat,
  onCatChange,
}: FoodSectionsProps) {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Dynamic Extraction Logic
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
      return items.sort(() => 0.5 - Math.random()).slice(0, 8);
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

    if (activeFilters.has("under-250")) {
      items = items.filter((i) => i.price <= 250);
    }

    if (activeFilters.has("pure-veg")) {
      items = items.filter(
        (i) => i.shop === "Punjabi Rasoi" || i.shopName === "Punjabi Rasoi"
      );
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

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="mt-6 mb-12">
      {/* ═══ 1. CIRCULAR CATEGORY SELECTOR ═══ */}
      <div className="relative mb-8 mt-2">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-[18px] sm:text-[22px] font-black text-[#1D1D1F] tracking-tight leading-none">
                What's Cooking
              </h2>
              <p className="text-[11px] font-bold text-[#8E8E93] mt-0.5 tracking-wide">
                EXPLORE BY CATEGORY
              </p>
            </div>
          </div>
          <Link to="/browse" className="text-[12px] font-bold text-[#007AFF] flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Circles - Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide px-1"
        >
          {categories.map((cat, i) => {
            const isActive = activeCat === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => onCatChange(cat.id)}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div
                  className={`relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-full p-[2.5px] transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-tr from-[#34C759] to-[#30B04F] shadow-lg shadow-[#34C759]/20 scale-105"
                      : "bg-[#E5E5E7] hover:bg-[#D1D1D6] hover:scale-105"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white overflow-hidden border-2 border-white">
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Status dot for active */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#34C759] border-[1.5px] border-white rounded-full shadow-sm" />
                  )}
                </div>
                <span
                  className={`text-[12px] sm:text-[13px] font-bold tracking-tight transition-colors ${
                    isActive ? "text-[#1D1D1F]" : "text-[#8E8E93]"
                  }`}
                >
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ 2. FLOATING FILTER BAR ═══ */}
      <div className="relative mb-8 px-1">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f, i) => {
            const Icon = f.icon;
            const isActive = activeFilters.has(f.id);
            return (
              <motion.button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[12px] font-bold whitespace-nowrap transition-all duration-300 border ${
                  isActive
                    ? "bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-lg shadow-black/10 scale-[1.02]"
                    : "bg-white/80 backdrop-blur-xl text-[#3A3A3C] border-[#E5E5E7]/80 hover:bg-white hover:border-[#D1D1D6] hover:shadow-md"
                }`}
              >
                {f.id === "filter" && <Icon className="w-3.5 h-3.5" />}
                {f.id === "pure-veg" && (
                  <div className="w-3 h-3 rounded-sm border-2 border-[#34C759] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  </div>
                )}
                {f.label}
                {(f.hasDropdown || f.id === "schedule") && (
                  <ChevronDown className="w-3 h-3 opacity-50" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ Handpicked Header ═══ */}
      {activeCat === "all" && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-8 px-1"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-[15px] font-black text-[#1D1D1F] tracking-tight">
              Handpicked For You
            </h3>
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#E5E5E7] to-transparent" />
        </motion.div>
      )}

      {/* ═══ 3. EDITORIAL FOOD CARDS GRID ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 px-1">
        {filteredItems.map((item, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
          const isAdded = addedIds.has(String(item.id));
          const isLiked = likedIds.has(String(item.id));
          const deliveryTime = `${15 + Math.floor(Math.random() * 5)}-${
            25 + Math.floor(Math.random() * 5)
          }`;
          const distance = (0.2 + Math.random() * 0.6).toFixed(1);
          const accentColors = [
            {
              strip: "bg-gradient-to-b from-orange-400 to-red-500",
              badge: "bg-orange-500",
              text: "text-orange-600",
              light: "bg-orange-50",
              border: "border-orange-200",
            },
            {
              strip: "bg-gradient-to-b from-violet-400 to-purple-600",
              badge: "bg-violet-500",
              text: "text-violet-600",
              light: "bg-violet-50",
              border: "border-violet-200",
            },
            {
              strip: "bg-gradient-to-b from-emerald-400 to-teal-600",
              badge: "bg-emerald-500",
              text: "text-emerald-600",
              light: "bg-emerald-50",
              border: "border-emerald-200",
            },
            {
              strip: "bg-gradient-to-b from-sky-400 to-blue-600",
              badge: "bg-sky-500",
              text: "text-sky-600",
              light: "bg-sky-50",
              border: "border-sky-200",
            },
            {
              strip: "bg-gradient-to-b from-pink-400 to-rose-600",
              badge: "bg-pink-500",
              text: "text-pink-600",
              light: "bg-pink-50",
              border: "border-pink-200",
            },
            {
              strip: "bg-gradient-to-b from-amber-400 to-orange-600",
              badge: "bg-amber-500",
              text: "text-amber-600",
              light: "bg-amber-50",
              border: "border-amber-200",
            },
            {
              strip: "bg-gradient-to-b from-cyan-400 to-teal-600",
              badge: "bg-cyan-500",
              text: "text-cyan-600",
              light: "bg-cyan-50",
              border: "border-cyan-200",
            },
            {
              strip: "bg-gradient-to-b from-fuchsia-400 to-pink-600",
              badge: "bg-fuchsia-500",
              text: "text-fuchsia-600",
              light: "bg-fuchsia-50",
              border: "border-fuchsia-200",
            },
          ];
          const ac = accentColors[i % accentColors.length];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.3 }}
              className="group relative"
            >
              {/* ════ UNIQUE "GOURMET PASS" CARD ════ */}
              <div className="relative rounded-[1.4rem] sm:rounded-[1.6rem] overflow-hidden bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] transition-all duration-600 hover:-translate-y-1.5 border border-black/[0.04]">
                {/* Left Accent Color Strip */}
                <div
                  className={`absolute top-0 left-0 w-[4px] h-full ${ac.strip} z-20 rounded-l-[1.4rem]`}
                />

                {/* ── IMAGE HERO ── */}
                <div className="relative overflow-hidden">
                  {/* Food Image with clip-path diagonal cut */}
                  <div
                    className="relative h-[140px] sm:h-[160px] overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                    />
                    {/* Dark vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                  </div>

                  {/* Shop Name Banner - Prominently on Image */}
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

                  {/* Rating Notch Badge - sits at the diagonal cut edge */}
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

                {/* ── CONTENT SECTION ── */}
                <div className="px-4 pt-4 pb-3.5 sm:px-5 sm:pt-5 sm:pb-4">
                  {/* Dish Name - LARGE & PROMINENT */}
                  <h4
                    className="text-[15px] sm:text-[17px] font-black text-[#1D1D1F] leading-tight mb-2 line-clamp-2 group-hover:text-[#007AFF] transition-colors duration-300 tracking-[-0.01em]"
                    style={{ minHeight: "38px" }}
                  >
                    {item.name}
                  </h4>

                  {/* Info Pills Row */}
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

                  {/* ── PRICE ── */}
                  <div className="mb-3.5">
                    <span className="text-[22px] sm:text-[24px] font-black text-[#1D1D1F] tracking-tight">
                      {"\u20B9"} {item.price}
                    </span>
                  </div>

                  {/* ── ACTION ROW ── */}
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

                {/* Hover Glow Border */}
                <div className="absolute inset-0 rounded-[1.4rem] sm:rounded-[1.6rem] ring-1 ring-inset ring-black/[0.03] group-hover:ring-[#007AFF]/20 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ "See More" CTA ═══ */}
      {filteredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-10"
        >
          <button className="group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[13px] font-bold text-[#3A3A3C] transition-all duration-300 hover:shadow-md border border-[#E5E5E7]/60">
            <TrendingUp className="w-4 h-4 text-[#007AFF]" />
            Explore More Dishes
            <ArrowRight className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-[#007AFF] group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>
      )}
    </section>
  );
}
