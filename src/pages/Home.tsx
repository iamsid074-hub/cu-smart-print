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
  Heart,
  Share2,
  MoreVertical
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
import ThreeDStreet from "@/components/ThreeDStreet";
import type { Database } from "@/types/supabase";
import { LayoutGrid, Boxes } from "lucide-react";

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
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=70&w=1200&auto=format&fit=crop" 
        alt="Spotlight" 
        loading="lazy" decoding="async" style={{ willChange: "transform" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
  const [deliveryMode, setDeliveryMode] = useState<"takeaway" | "delivery">("takeaway");
  const [viewMode, setViewMode] = useState<"grid" | "immersive">("grid");

  // ─── LIVE SHOPS STATE ───
  const [liveShops, setLiveShops] = useState(shops);

  const fetchLiveStatus = async () => {
    try {
      const { data, error } = await supabase.from("shops").select("id, is_open");
      
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const currentTotal = hour * 60 + min;
      const isAutoOpen = currentTotal >= 10 * 60 && currentTotal <= 23 * 60 + 30;

      if (error) {
        console.warn("Shops table missing or RLS blocking:", error.message);
        // Fallback to time bounds if no DB data
        setLiveShops(prev => prev.map(shop => ({
          ...shop,
          isOpen: isAutoOpen ? shop.isOpen : false
        })));
        return;
      }
      
      if (data && data.length > 0) {
        const statusMap = Object.fromEntries(data.map(s => [s.id, s.is_open]));
        setLiveShops(prev => prev.map(shop => ({
          ...shop,
          isOpen: isAutoOpen ? (statusMap[shop.id] ?? shop.isOpen) : false
        })));
      } else {
        // Fallback if data is empty
        setLiveShops(prev => prev.map(shop => ({
          ...shop,
          isOpen: isAutoOpen ? shop.isOpen : false
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
    { name: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b2164bb3fe?w=200&h=200&auto=format&fit=crop" },
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
    { id: "quick", label: "Blinkit / Zwigato", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <AnimatePresence>
        {showQuickTransition && (
          <BlinkitZomatoTransition onComplete={() => {
            setShowQuickTransition(false);
            navigate('/quick-store');
          }} />
        )}
      </AnimatePresence>

      <BlinkitAnnounceModal onCheck={() => setShowQuickTransition(true)} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSpotlight />

        <div className="space-y-16">
          {/* ═══ TOP NAV: MODE TABS + SEARCH ═══ */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Gradient connector line at top of the block */}
            <div className="h-[2px] w-full rounded-full mb-3 bg-gradient-to-r from-transparent via-orange-500/40 to-purple-500/40" />

            <div
              className="flex items-center gap-2 p-1.5 rounded-[1.6rem] border border-white/[0.07]"
              style={{
                background: "linear-gradient(135deg, rgba(25,25,25,0.9) 0%, rgba(255,140,0,0.1) 50%, rgba(139,92,246,0.1) 100%)",
              }}
            >
              {/* Full Meals pill */}
              <button
                onClick={() => setHomeMode("meal" as any)}
                className="relative flex-shrink-0 px-4 py-2.5 rounded-[1.2rem] text-[11px] sm:text-[13px] font-black tracking-tight whitespace-nowrap transition-all duration-300 active:scale-[0.96]"
              >
                {homeMode === "meal" && (
                  <motion.div
                    layoutId="top-mode-pill"
                    className="absolute inset-0 rounded-[1.2rem] bg-white shadow-lg"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span
                  className="relative z-10 flex items-center gap-1.5"
                  style={{
                    color: homeMode === "meal" ? "#000" : "rgba(255,255,255,0.4)",
                  }}
                >
                  <Utensils size={13} />
                  Full Meals
                </span>
              </button>

              {/* Blinkit / Zwigato pill */}
              <button
                onClick={() => setShowQuickTransition(true)}
                className="relative flex-shrink-0 px-4 py-2.5 rounded-[1.2rem] text-[11px] sm:text-[13px] font-black tracking-tight whitespace-nowrap transition-all duration-300 active:scale-[0.96]"
              >
                {/* Subtle permanent glow for Blinkit */}
                <div
                  className="absolute inset-0 rounded-[1.2rem]"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(217,70,239,0.15) 100%)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                />
                <span className="relative z-10 flex items-center gap-1.5" style={{ color: "#c084fc" }}>
                  <Flame size={13} className="text-fuchsia-400" />
                  Blinkit / Zwigato
                </span>
              </button>

              {/* Search – grows to fill remaining space */}
              <button
                onClick={() => navigate('/search')}
                className="flex-1 min-w-0 relative py-2.5 px-4 rounded-[1.2rem] flex items-center gap-2.5 active:scale-[0.97] transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Search size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                <span className="text-[11px] sm:text-[13px] font-bold tracking-tight truncate" style={{ color: "rgba(255,255,255,0.3)" }}>Search...</span>
              </button>
            </div>

            {/* Gradient connector line at bottom — ties to SHOPS/VENDING below */}
            <div className="h-[2px] w-full rounded-full mt-3 bg-gradient-to-r from-orange-500/40 via-purple-500/30 to-transparent" />
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
                    {/* 2. Service Toggle — visually connected to the top bar */}
                    <div className="flex justify-center mb-10 px-1">
                      <div
                        className="relative p-1.5 rounded-[2rem] flex items-center w-full max-w-[440px] overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,140,0,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* Animated sliding background — white pill */}
                        <motion.div
                          className="absolute rounded-[1.6rem] top-1.5 bottom-1.5 bg-white shadow-lg"
                          animate={{
                            left: deliveryMode === "takeaway" ? "6px" : "50%",
                            width: "calc(50% - 6px)",
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />

                        <button
                          onClick={() => setDeliveryMode("takeaway")}
                          className="relative z-10 flex-1 py-3.5 rounded-[1.6rem] text-[13px] font-black uppercase tracking-widest transition-colors duration-200"
                          style={{ color: deliveryMode === "takeaway" ? "#000" : "rgba(255,255,255,0.4)" }}
                        >
                          SHOPS
                        </button>
                        <button
                          onClick={() => setDeliveryMode("delivery")}
                          className="relative z-10 flex-1 py-3.5 rounded-[1.6rem] text-[13px] font-black uppercase tracking-widest transition-colors duration-200"
                          style={{ color: deliveryMode === "delivery" ? "#000" : "rgba(255,255,255,0.4)" }}
                        >
                          VENDING
                        </button>
                      </div>
                    </div>

                    {/* 3. Render Shops OR Vending Machine */}
                    {deliveryMode === "takeaway" ? (
                      <>
                        <div className="flex items-center justify-between mb-8 px-1">
                          <div className="flex flex-col">
                            <h2 className="text-[14px] sm:text-[16px] font-black tracking-[0.15em] text-zinc-500 uppercase">
                                Campus Spotlight
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{liveShops.filter(s => s.isOpen).length} SHOPS OPEN NOW</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 p-1 rounded-full mr-2">
                              <button 
                                onClick={() => setViewMode("grid")}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-white text-black" : "text-zinc-500"}`}
                              >
                                <LayoutGrid size={14} />
                              </button>
                              <button 
                                onClick={() => setViewMode("immersive")}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${viewMode === "immersive" ? "bg-white text-black" : "text-zinc-500"}`}
                              >
                                <Boxes size={14} />
                              </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. Textured Shop Grid OR 3D Street */}
                    <AnimatePresence mode="wait">
                      {viewMode === "grid" ? (
                        <motion.div 
                          key="grid"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-2 gap-3 sm:gap-6 px-1 mb-20"
                        >
                          {liveShops.map((shop, i) => (
                            <motion.div
                              key={shop.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => navigate(`/shop/${shop.id}`)}
                              className="group relative bg-[#1c1c1e] rounded-[1.8rem] overflow-hidden border border-white/5 shadow-xl hover:border-white/10 transition-all active:scale-[0.97] cursor-pointer"
                            >
                              {/* Image Section */}
                              <div className="aspect-[4/3] relative overflow-hidden">
                                <img 
                                  src={shop.heroImage} 
                                  alt={shop.name} 
                                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!shop.isOpen ? 'grayscale opacity-40' : ''}`} 
                                />
                                
                                {/* Floating Rating Badge */}
                                <div className="absolute bottom-0 left-0 bg-emerald-600 px-3 py-1.5 rounded-tr-2xl border-r border-t border-white/10 flex items-center gap-1.5 shadow-2xl z-10 transition-colors">
                                  <Star className="w-3 h-3 fill-white text-white" />
                                  <span className="text-[11px] font-black text-white tracking-tight">{shop.rating}</span>
                                </div>
    
                                {/* Floating Time Badge */}
                                <div className="absolute bottom-0 right-0 bg-[#0d0d0f]/90 px-3 py-1.5 rounded-tl-2xl border-l border-t border-white/10 flex items-center gap-1.5 shadow-2xl z-10 transition-colors">
                                  <Clock className="w-3 h-3 text-red-500" />
                                  <span className="text-[11px] font-black text-white tracking-tight">{shop.deliveryTime}</span>
                                </div>
    
                                {/* Closed Overlay */}
                                {!shop.isOpen && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                                  </div>
                                )}
                              </div>
    
                              {/* Detail Section */}
                              <div className="p-3">
                                <h3 className="text-[14px] sm:text-[16px] font-black text-white leading-tight mb-1 line-clamp-1">
                                  {shop.name}
                                </h3>
                                
                                <div className="mt-4">
                                  <button className="bg-white text-black text-[12px] font-black px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all w-full tracking-tight">
                                    ORDER NOW
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="immersive"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <ThreeDStreet shops={liveShops} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="w-full pb-10">
                    <div className="text-center mb-8 px-4">
                      <p className="text-gray-400 text-[13px] font-bold uppercase tracking-widest">
                        Real-time Vending Availability
                      </p>
                    </div>
                    <VendingMachine />
                  </div>
                )}
                  </div>
                )}
              </motion.div>
            )}




          </AnimatePresence>
        </div>

        {/* Explore Sellers Section (Always visible) */}
        {(homeMode === "meal" || homeMode === "quick") && (
          <section className="mt-32 pb-40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-8 bg-orange-500 rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Campus Market</h2>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-start scrollbar-hide overflow-x-auto max-w-full">
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
