import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ChevronDown,
  Package,
  Shield,
  Ban,
  ShieldCheck,
  Headset,
  ExternalLink,
  Loader2,
  Compass,
  ChevronRight,
  TrendingUp,
  Store,
  ArrowUpRight,
  Utensils,
  Clock,
  Flame,
  BadgeCheck,
  Star,
  Heart
} from "lucide-react";
import { shops } from "@/config/shopMenus";
import ProductCard from "@/components/ProductCard";
import VendingMachine from "@/components/VendingMachine";
import { supabase } from "@/lib/supabase";
import MembershipBanner from "@/components/MembershipBanner";
import HomeSpecialSections from "@/components/HomeSpecialSections";
import { useAuth } from "@/contexts/AuthContext";
import BlinkitZomatoTransition from "@/components/BlinkitZomatoTransition";
import BlinkitAnnounceModal from "@/components/BlinkitAnnounceModal";
import type { Database } from "@/types/supabase";

const categories = [
  { id: "All", label: "All" },
  { id: "Electronics", label: "Electronics" },
  { id: "Books", label: "Books" },
  { id: "Fashion", label: "Fashion" },
  { id: "Sports", label: "Sports" },
  { id: "Furniture", label: "Furniture" },
];

function HeroSpotlight() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-[2.5rem] overflow-hidden mb-12 group cursor-pointer" onClick={() => navigate('/browse')}>
      <motion.img 
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2681&auto=format&fit=crop" 
        alt="Spotlight" 
        loading="lazy" decoding="async" style={{ willChange: "transform" }}
        animate={{ scale: [1.05, 1.15, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[#000000]" />
      
      <div className="absolute inset-x-6 bottom-12 z-10 flex flex-col items-center text-center">
        <div className="relative flex flex-col items-center mt-4">
          <motion.span
            initial={{y: 20, opacity: 0, rotate: -6}}
            animate={{y: 0, opacity: 1, rotate: -6}}
            transition={{delay: 0.4, type: "spring"}}
            className="absolute -top-10 sm:-top-16 text-[3rem] sm:text-[4.5rem] text-orange-400 font-medium whitespace-nowrap z-20 select-none"
            style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", textShadow: "0px 10px 20px rgba(0,0,0,0.8)" }}
          >
            The Campus
          </motion.span>
          <motion.h1 
            initial={{y: 20, opacity: 0}} 
            animate={{y: 0, opacity: 1}} 
            transition={{delay: 0.3}} 
            className="text-[4.5rem] sm:text-[7.5rem] font-black text-white tracking-tighter leading-[0.8] text-center uppercase relative z-10 drop-shadow-2xl mb-4"
          >
            Bazzar
          </motion.h1>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodCat, setActiveFoodCat] = useState("all");
  const [homeMode, setHomeMode] = useState<"meal" | "vending" | "quick">("meal");
  const [showQuickTransition, setShowQuickTransition] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"takeaway" | "delivery">("delivery");

  // ─── LIVE SHOPS STATE ───
  const [liveShops, setLiveShops] = useState(shops);

  const fetchLiveStatus = async () => {
    try {
      const { data, error } = await supabase.from("shops").select("id, is_open");
      if (error) {
        console.warn("Shops table missing or RLS blocking:", error.message);
        return;
      }
      if (data && data.length > 0) {
        const statusMap = Object.fromEntries(data.map(s => [s.id, s.is_open]));
        setLiveShops(prev => prev.map(shop => ({
          ...shop,
          isOpen: statusMap[shop.id] ?? shop.isOpen
        })));
      }
    } catch (err) {
      console.error("Live shop status fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fastCategories = [
    { name: "Burger", img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&auto=format&fit=crop" },
    { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&auto=format&fit=crop" },
    { name: "Pasta", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&auto=format&fit=crop" },
    { name: "Noodles", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&auto=format&fit=crop" },
    { name: "Rolls", img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&auto=format&fit=crop" },
    { name: "Biryani", img: "https://images.unsplash.com/photo-1589302168068-1c459288350d?w=200&h=200&auto=format&fit=crop" },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      let query = supabase
        .from("products")
        .select(`*, profiles(full_name)`)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(5);

      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      setProducts(data || []);
      setProductsLoading(false);
    }
    fetchProducts();
  }, [activeCategory]);

  const modes = [
    { id: "meal", label: "Full Meals", icon: Utensils },
    { id: "vending", label: "Late Night", icon: Clock },
    { id: "quick", label: "Essential Shop", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <AnimatePresence>
        {showQuickTransition && (
          <BlinkitZomatoTransition onComplete={() => {
            setShowQuickTransition(false);
            setHomeMode("quick");
          }} />
        )}
      </AnimatePresence>

      <BlinkitAnnounceModal />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSpotlight />

        <div className="space-y-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (mode.id === "quick") {
                      setShowQuickTransition(true);
                    } else {
                      setHomeMode(mode.id as any);
                    }
                  }}
                  className={`relative z-10 px-3 sm:px-8 py-2 sm:py-3 rounded-[1.2rem] text-[10.5px] sm:text-[13px] font-bold transition-all duration-300 whitespace-nowrap flex items-center justify-center flex-shrink-0 ${
                    homeMode === mode.id ? "text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {homeMode === mode.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white rounded-[1.2rem] shadow-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {mode.id === "quick" && homeMode !== "quick" && (
                    <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20" />
                  )}
                  <span className={`relative z-20 flex items-center gap-1.5 sm:gap-2 ${mode.id === "quick" && homeMode !== "quick" ? "text-purple-300" : ""}`}>
                    {mode.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {homeMode === "meal" && (
              <motion.div
                key="meal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <HomeSpecialSections
                  activeCat={activeFoodCat}
                  onCatChange={setActiveFoodCat}
                />

                {/* ═══ SHOP DISCOVERY FLOW (STRUCTURED CARDS) ═══ */}
                {activeFoodCat === "all" && (
                  <div className="mt-8">
                    {/* 1. Circle Categories */}
                    <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide px-1">
                      {fastCategories.map((cat, i) => (
                        <motion.div
                          key={cat.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                        >
                          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden border-2 border-white/5 p-1 bg-[#1c1c1e] shadow-xl group hover:border-indigo-500/50 transition-all">
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-110" />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* 2. Service Toggle */}
                    <div className="flex justify-center mb-10 px-1">
                      <div className="bg-[#1c1c1e] p-1.5 rounded-full flex items-center shadow-lg border border-white/5 w-full max-w-[500px]">
                        <button
                          onClick={() => setDeliveryMode("takeaway")}
                          className={`flex-1 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${
                            deliveryMode === "takeaway" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                          }`}
                        >
                          Take-away
                        </button>
                        <button
                          onClick={() => setDeliveryMode("delivery")}
                          className={`flex-1 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${
                            deliveryMode === "delivery" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                          }`}
                        >
                          Fast Delivery
                        </button>
                      </div>
                    </div>

                    {/* 3. Section Title */}
                    <div className="mb-8 px-2 flex items-center gap-3">
                      <h2 className="text-[14px] sm:text-[16px] font-black tracking-[0.15em] text-zinc-500 uppercase">
                        All the good places around you
                      </h2>
                    </div>

                    {/* 4. Structured Shop Cards (Image 2 Aesthetic) */}
                    <div className="flex flex-col gap-8 px-1 mb-20">
                      {liveShops.map((shop, i) => (
                        <motion.div
                          key={shop.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => navigate(`/shop/${shop.id}`)}
                          className="group relative bg-[#1c1c1e] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl hover:border-white/10 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          {/* Top Image Section */}
                          <div className="aspect-video sm:aspect-[21/9] relative overflow-hidden">
                            <img 
                              src={shop.heroImage} 
                              alt={shop.name} 
                              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!shop.isOpen ? 'grayscale' : ''}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                            
                            {/* Heart Button */}
                            <button className="absolute top-4 right-4 p-2.5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white hover:text-red-500 transition-all z-10">
                              <Heart className="w-5 h-5" />
                            </button>

                            {/* Badge: Trending */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 px-3 py-1.5 rounded-full shadow-lg">
                              <Flame className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Trending</span>
                            </div>

                            {/* Badge: Prep Time */}
                            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                              {/* <Clock className="w-3 h-3 text-white/60" /> */}
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">{shop.deliveryTime}</span>
                            </div>

                            {/* Closed Overlay */}
                            {!shop.isOpen && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                <div className="bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/20 flex items-center gap-2.5 shadow-2xl">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[12px] font-black uppercase tracking-widest text-white font-mono">Currently Closed</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bottom Content Section */}
                          <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <h3 className="text-[22px] sm:text-[28px] font-black text-white leading-tight tracking-tight mb-1">
                                {shop.name}
                              </h3>
                            </div>

                            {/* Metadata Row */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-emerald-500 px-2.5 py-1 rounded-lg">
                                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                                  <span className="text-[13px] font-black text-white leading-none">{shop.rating}</span>
                                </div>
                                <div className="w-[1px] h-5 bg-white/10" />
                                <span className="text-white/40 text-[12px] font-bold uppercase tracking-[0.1em] truncate max-w-[150px]">
                                  {shop.tag.includes('•') ? shop.tag.split('•')[0] : shop.tag}
                                </span>
                              </div>

                              <button className="bg-[#FF3B30] text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2 group/btn">
                                Order Now
                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                              </button>
                            </div>

                            {/* Location Footer */}
                            <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-2.5 text-white/30">
                              <MapPin className="w-4 h-4 text-white/20" />
                              <span className="text-[11px] font-bold tracking-wide uppercase opacity-60">
                                {shop.distance} • Food Republic, CU Main Campus
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {homeMode === "vending" && (
              <motion.div
                key="vending"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="py-12"
              >
                <div className="flex flex-col items-center gap-12 text-center mb-24">
                  <div className="max-w-2xl px-4">
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter"
                    >
                      Midnight Hunger?<br /><span className="text-orange-400">We got you.</span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg sm:text-xl font-medium">
                      Real-time vending availability across all hostels. 
                      No more wasted walks.
                    </p>
                  </div>
                </div>
                <VendingMachine />
              </motion.div>
            )}

            {homeMode === "quick" && (
              <motion.div
                key="quick"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="py-12"
              >
                <div className="flex flex-col items-center gap-12 text-center mb-16 px-4">
                  <div className="max-w-2xl">
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-6"
                    >
                      <Flame className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-purple-300">Fast Forward Delivery</span>
                    </motion.div>
                    <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter">
                      Essential <span className="text-purple-400">Shopping</span> 
                    </h2>
                    <p className="text-gray-400 text-lg sm:text-xl font-medium">
                      Student essentials delivered in 10-15 minutes.<br className="hidden sm:block" />
                      Powered by CU Bazzar Network.
                    </p>
                  </div>
                </div>
                <MembershipBanner />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Explore Sellers Section (Always visible) */}
        {(homeMode === "meal" || homeMode === "vending" || homeMode === "quick") && (
          <section className="mt-32 pb-40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-8 bg-orange-500 rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Campus Market</h2>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-start no-scrollbar overflow-x-auto max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? "bg-white text-black shadow-lg"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard
                       key={product.id}
                       id={product.id}
                       image={product.image_url}
                       title={product.title}
                       price={product.price}
                       condition={product.condition}
                       category={product.category}
                       delay={0}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-40 text-center">
                    <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No listings found in this category</p>
                  </div>
                )}
              </div>
            )}
            
            <motion.div 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="mt-16 text-center"
            >
              <Link
                to="/browse"
                className="group inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-[2rem] text-[15px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.15)]"
              >
                Explore All Products
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
}
