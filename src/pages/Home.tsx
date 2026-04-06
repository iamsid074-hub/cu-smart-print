import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  X,
  MapPin,
  Phone,
  Home as HomeIcon,
  Zap,
  UtensilsCrossed,
  Package,
  Rocket,
  ShieldCheck,
  BadgePercent,
  Users,
  Plus,
  Shield,
  Ban,
  Headset,
  ExternalLink,
  ArrowLeft,
  Search,
  Download,
  ArrowRight,
  Store,
  Clock,
  Compass,
  Sparkles,
  ChevronDown,
  Leaf,
  History,
  TrendingUp,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import VendingMachine from "@/components/VendingMachine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { getAllFoodItems } from "@/data/foodData";
import { groceryItems } from "@/config/groceryItems";
import { ADMIN_SELLER_ID } from "@/config/campusEssentials";
import type { Database } from "@/types/supabase";
import MembershipBanner from "@/components/MembershipBanner";
import HomeSpecialSections from "@/components/HomeSpecialSections";

const categories = [
  { id: "All", label: "All" },
  { id: "Electronics", label: "Electronics" },
  { id: "Books", label: "Books" },
  { id: "Fashion", label: "Fashion" },
  { id: "Sports", label: "Sports" },
  { id: "Audio", label: "Audio" },
  { id: "Camera", label: "Camera" },
  { id: "Furniture", label: "Furniture" },
  { id: "Kitchen", label: "Kitchen" },
];

type Product = Database["public"]["Tables"]["products"]["Row"];

const fontH: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
};

// Removed LiquidGlassScreen for a cleaner food app aesthetic

// import FlavourFactoryBanner from "@/components/FlavourFactoryBanner";

const heroSlides = [
  { img: "/banners/delivery.webp", link: "/food", label: "Fast Delivery" },
  { img: "/banners/sell.webp", link: "/profile", label: "Sell Items" },
  { img: "/banners/community.webp", link: "/chat", label: "Community Chat" },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const count = heroSlides.length;
  const INTERVAL = 5000;

  useEffect(() => {
    if (count <= 1) return;
    const step = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += step;
      setProgress((elapsed / INTERVAL) * 100);
      if (elapsed >= INTERVAL) {
        setCurrent((p) => (p + 1) % count);
        elapsed = 0;
        setProgress(0);
      }
    }, step);
    return () => clearInterval(timer);
  }, [current, count]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
  };
  const prev = () => goTo((current - 1 + count) % count);
  const next = () => goTo((current + 1) % count);

  const touchRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (count <= 1) return;
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] group aspect-video max-h-[220px] sm:max-h-[380px] shadow-sm border border-black/[0.04]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {heroSlides.map((slide, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            opacity: i === current ? 1 : 0,
            scale: i === current ? 1 : 1.05,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ zIndex: i === current ? 1 : 0 }}
        >
          <Link to={slide.link} className="block w-full h-full">
            <img
              src={slide.img}
              alt={slide.label}
              className="w-full h-full object-cover"
            />
          </Link>
        </motion.div>
      ))}

      {count > 1 && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 pointer-events-none" />

          <button
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                style={{
                  width: i === current ? 20 : 6,
                  backgroundColor:
                    i === current
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                }}
              >
                {i === current && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

}

export default function Home() {
  const navigate = useNavigate();
  const isNativeApp = Capacitor.isNativePlatform();
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodCat, setActiveFoodCat] = useState("all");
  const [homeMode, setHomeMode] = useState<"meal" | "vending">("meal");

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      let query = supabase
        .from("products")
        .select(`*, profiles(full_name)`)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      setProducts(data || []);
      setProductsLoading(false);
    }
    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-[4rem] sm:pt-[5rem] pb-32 relative bg-[#F8F9FA] text-[#1D1D1F]">
      {/* ─── Modern Food App Top Header ─── */}
      <div className="px-4 pt-4 sm:pt-6 mb-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Location & Profile Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-start gap-2">
              <div className="mt-1 flex text-orange-500">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="font-extrabold text-[#1c1c1c] text-[17px] tracking-tight">CU Campus Delivery</span>
                  <ChevronDown className="w-4 h-4 text-[#1c1c1c]" />
                </div>
                <span className="text-[13px] text-gray-500 font-medium truncate max-w-[200px]">Hostel Blocks, Academic Area</span>
              </div>
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center -mt-1 active:scale-95 transition-transform">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative group cursor-text">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              readOnly
              onClick={() => setIsFoodSearchOpen(true)}
              className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-100 rounded-2xl text-base placeholder-gray-400 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
              placeholder="Search 'Pizza' or 'Burger'..."
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100">
                <Leaf className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <div className="px-4 mb-6">
        <div className="max-w-[1600px] mx-auto">
          <HeroCarousel />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 mt-[-1rem]">
        <MembershipBanner />

        {/* ═══ MODE SWITCHER: Meal vs Vending ═══ */}
        <div className="flex items-center justify-center mb-6 mt-2">
          <div className="relative flex items-center p-1.5 rounded-[1.2rem] bg-[#F2F2F7] border border-black/[0.06] shadow-inner">
            {/* Sliding pill indicator */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className="absolute top-1.5 bottom-1.5 rounded-[0.9rem] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] border border-black/[0.04]"
              style={{
                left: homeMode === "meal" ? "6px" : "calc(50% + 3px)",
                width: "calc(50% - 9px)",
              }}
            />
            <button
              id="home-mode-meal"
              onClick={() => setHomeMode("meal")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-[0.9rem] text-[13px] font-bold transition-colors duration-300 min-w-[130px] justify-center ${
                homeMode === "meal" ? "text-[#1D1D1F]" : "text-[#8E8E93]"
              }`}
            >
              Meal
            </button>
            <button
              id="home-mode-vending"
              onClick={() => setHomeMode("vending")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-[0.9rem] text-[13px] font-bold transition-colors duration-300 min-w-[130px] justify-center ${
                homeMode === "vending" ? "text-[#1D1D1F]" : "text-[#8E8E93]"
              }`}
            >
              Vending
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ MEAL MODE ═══ */}
          {homeMode === "meal" && (
            <motion.div
              key="meal"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Food Category Sections */}
              <HomeSpecialSections
                activeCat={activeFoodCat}
                onCatChange={setActiveFoodCat}
              />

              {/* Explore Products — only when no food category filter active */}
              {activeFoodCat === "all" && (
                <section className="mb-10 sm:mb-16 mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#007AFF]" />
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
                        Explore Products
                      </h2>
                    </div>
                    <Link
                      to="/browse"
                      className="flex items-center gap-1 text-[13px] sm:text-[15px] text-[#007AFF] font-semibold hover:underline mr-auto sm:mr-0 sm:ml-auto pr-4"
                    >
                      See all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all duration-200 flex-shrink-0 text-[13px] sm:text-[15px] whitespace-nowrap shadow-sm ${
                            isActive
                              ? "bg-[#1D1D1F] text-white ios-shadow scale-105"
                              : "ios-glass text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-white/80"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                  {productsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
                      <p className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-widest">
                        Finding Items...
                      </p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 ios-glass rounded-[2rem]">
                      <Package className="w-12 h-12 text-[#8E8E93] mx-auto mb-4" />
                      <p className="text-lg font-semibold text-[#1D1D1F]">
                        No products found
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategory("All");
                        }}
                        className="mt-4 text-[13px] font-bold uppercase tracking-widest text-[#007AFF]"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                      {filteredProducts.slice(0, 3).map((p, i) => (
                        <ProductCard
                          key={p.id}
                          id={p.id}
                          image={p.image_url || ""}
                          title={p.title}
                          price={p.price}
                          originalPrice={p.original_price || undefined}
                          condition={p.condition as any}
                          category={p.category}
                          rating={4.5}
                          seller={p.profiles?.full_name || "Student"}
                          delay={i * 0.05}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          )}

          {/* ═══ VENDING MODE ═══ */}
          {homeMode === "vending" && (
            <motion.div
              key="vending"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <VendingMachine />

              {/* Help / Safety section */}
              <section className="mb-6 mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl sm:rounded-[2.5rem] overflow-hidden ios-glass shadow-sm"
                >
                  <div className="px-5 pt-8 pb-3 sm:px-8 sm:pt-10 sm:pb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-[#34C759]/10 border border-[#34C759]/20">
                      <Shield className="w-4 h-4 text-[#34C759]" />
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#34C759]">
                        Safe & Trusted
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#1D1D1F] tracking-tight">
                      Your Safety is Our Priority
                    </h2>
                    <p className="text-[15px] max-w-lg mx-auto text-[#8E8E93] font-medium leading-relaxed">
                      CU Bazzar is run with full transparency. Every delivery is
                      handled personally with zero tolerance for prohibited
                      items.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 pb-8 sm:px-8">
                    {[
                      {
                        icon: Package,
                        title: "Personal Delivery",
                        desc: "Platform owner personally handles every single delivery. No third parties.",
                        color: "#34C759",
                      },
                      {
                        icon: Ban,
                        title: "No Illegal Items",
                        desc: "Strict zero-tolerance policy. No drugs, alcohol, weapons, or prohibited goods.",
                        color: "#FF3B30",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Direct Accountability",
                        desc: "Real person, real responsibility. We stand behind every order and transaction.",
                        color: "#007AFF",
                      },
                      {
                        icon: Headset,
                        title: "24/7 Help Center",
                        desc: "Need help? Our support is available round the clock. Instant response guaranteed.",
                        color: "#FF9500",
                      },
                    ].map((item, i) => (
                      <Link to="/help" key={item.title} className="block group">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col transition-all duration-300 bg-white/50 border border-white/60 shadow-sm hover:shadow-md hover:bg-white h-full"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-300">
                              <item.icon
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                style={{ color: item.color }}
                              />
                            </div>
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-black/10 group-hover:text-[#007AFF] transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                          <h3 className="text-[15px] sm:text-base font-bold mb-1.5 text-[#1D1D1F] tracking-tight group-hover:text-[#007AFF] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[13px] leading-relaxed text-[#8E8E93] font-medium">
                            {item.desc}
                          </p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Search Overlay */}
      <FoodSearchOverlay isOpen={isFoodSearchOpen} onClose={() => setIsFoodSearchOpen(false)} />
    </div>
  );
}
// ─── ZOMATO-STYLE GLOBAL FOOD SEARCH OVERLAY ───
const suggestedCuisines = [
  { name: "Biryani", image: "/banners/cat_biryani.webp" },
  { name: "Pizza", image: "/banners/cat_pizza.webp" },
  { name: "Burger", image: "/banners/cat_burger.webp" },
  { name: "Noodles", image: "/food_premium/veg_hakka_noodles_premium_1775370523750_1775370740442.png" },
  { name: "Pasta", image: "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png" },
  { name: "Combos", image: "/banners/combo_feast.webp" },
];

function FoodSearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const allFoods = useMemo(() => getAllFoodItems(), []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => { if (inputRef.current) inputRef.current.blur(); }, 0);
      setQuery("");
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return allFoods.filter(
      item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.shopName?.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 15);
  }, [query, allFoods]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col"
        >
          {/* Header & Search Input */}
          <div className="pt-12 px-4 pb-3 border-b border-gray-100 shadow-sm flex items-center gap-3 bg-white">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-700 active:scale-95 transition-transform" aria-label="Close search">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for dishes, restaurants..."
                className="w-full bg-gray-100 rounded-xl py-3 pl-4 pr-10 text-[15px] font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all border border-gray-200"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto w-full bg-gray-50/50">
            {!query.trim() ? (
              <div className="p-5">
                <h3 className="font-extrabold text-[16px] text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" /> Popular Cuisines
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {suggestedCuisines.map((cat, i) => (
                    <motion.button 
                      key={i}
                      whileTap={{ scale: 0.92 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setQuery(cat.name)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-200 shadow-sm bg-white p-1">
                        <img src={cat.image} className="w-full h-full rounded-full object-cover" alt={cat.name} />
                      </div>
                      <span className="text-[12px] font-bold text-gray-700">{cat.name}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="font-extrabold text-[16px] text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" /> Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Paneer Butter Masala", "Oreo Shake", "Farmhouse Pizza"].map((term) => (
                      <button 
                         key={term} 
                         onClick={() => setQuery(term)}
                         className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-[13px] font-medium hover:border-orange-500 transition-colors"
                      >
                         {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white min-h-full">
                {searchResults.length === 0 ? (
                  <div className="text-center py-20">
                     <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 font-medium">No dishes found for "{query}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <h3 className="font-extrabold text-gray-900 text-[15px] pb-2 border-b border-gray-100">
                       Searching dishes... 
                    </h3>
                    {searchResults.map((item) => (
                      <div key={`search-${item.id}`} className="flex gap-4 items-center bg-white">
                        <div className="w-[84px] h-[84px] sm:w-[100px] sm:h-[100px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5 shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                             <div className="w-2.5 h-2.5 rounded-sm border border-emerald-500 flex items-center justify-center bg-white"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/></div>
                             <h4 className="font-bold text-[15px] sm:text-[16px] text-gray-900 tracking-tight leading-none">{item.name}</h4>
                          </div>
                          <span className="text-[12px] text-gray-500 font-medium">{item.shopName || "Hostel CAFE"}</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-[15px] text-gray-900">₹{item.price}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(item);
                                toast.success(`${item.name} added!`);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-black text-[11px] uppercase tracking-wide border border-emerald-200 active:scale-95 transition-all"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
