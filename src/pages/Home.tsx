import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, ShoppingBag, ShoppingCart, X, MapPin, Phone, Home as HomeIcon, Zap, UtensilsCrossed, Package, Rocket, ShieldCheck, BadgePercent, Users, Plus, Shield, Ban, Headset, ExternalLink, Search, Download, ArrowRight, Store, Clock, Compass, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import VendingMachine from "@/components/VendingMachine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { groceryItems } from "@/config/groceryItems";
import { ADMIN_SELLER_ID } from "@/config/campusEssentials";
import type { Database } from "@/types/supabase";

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

const fontH: React.CSSProperties = { fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" };

const LiquidGlassScreen = ({ children }: { children: React.ReactNode }) => (
  <div className="relative p-2 sm:p-4 bg-white/40 backdrop-blur-3xl rounded-[2.2rem] sm:rounded-[3.2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/60">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 blur-[60px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 blur-[60px] rounded-full pointer-events-none" />
    <div className="relative rounded-[1.6rem] sm:rounded-[2.6rem] overflow-hidden border border-white/40 shadow-sm bg-white/20">
      {children}
    </div>
  </div>
);

import FlavourFactoryBanner from "@/components/FlavourFactoryBanner";

const heroSlides = [
  <FlavourFactoryBanner key="1" />,
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

  const goTo = (idx: number) => { setCurrent(idx); setProgress(0); };
  const prev = () => goTo((current - 1 + count) % count);
  const next = () => goTo((current + 1) % count);

  const touchRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (count <= 1) return;
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  return (
    <LiquidGlassScreen>
      <div
        className="relative w-full overflow-hidden group aspect-video max-h-[280px] sm:max-h-[450px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ zIndex: i === current ? 1 : 0 }}
          >
            {slide}
          </motion.div>
        ))}

        {count > 1 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />

            <button
              onClick={prev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/60 hover:scale-110 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/60 hover:scale-110 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: i === current ? 32 : 8,
                    backgroundColor: i === current ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
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
    </LiquidGlassScreen>
  );
}

export default function Home() {
  const isNativeApp = Capacitor.isNativePlatform();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-[5.5rem] pb-32 relative text-[#1D1D1F]">
      <div className="max-w-[1600px] mx-auto relative px-4">
      </div>

      {/* ─── Hero Section ─── */}
      <div className="relative px-4 pt-4 pb-8 sm:px-8 sm:pt-8 sm:pb-12 mb-8 mx-2 sm:mx-0 rounded-[2.2rem] sm:rounded-[2.8rem] overflow-hidden">
        <div className="max-w-[1600px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 backdrop-blur px-3.5 py-1 mb-4 sm:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] shadow-[0_0_6px_2px_rgba(0,122,255,0.4)]" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#8E8E93] uppercase tracking-[0.18em]">CU Bazzar &nbsp;·&nbsp; Your Campus Store</span>
            </div>

            <h1 className="font-extrabold tracking-tight text-[#1D1D1F] leading-[1.05] mb-0" style={{ ...fontH, fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
              Everything{' '}
              <span style={{ color: '#007AFF' }}>
                Delivered
              </span>
              <br className="sm:hidden" />
              {' '}To Your Room
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10">
        <div className="w-full">

          {/* ─── Digital Vending Machine Section ─── */}
          <VendingMachine />

          {/* ─── EXPLORE / BROWSE SECTION ─── */}
          <section className="mb-10 sm:mb-16 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#007AFF]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
                  Explore Products
                </h2>
              </div>

              <Link to="/browse" className="flex items-center gap-1 text-[13px] sm:text-[15px] text-[#007AFF] font-semibold hover:underline mr-auto sm:mr-0 sm:ml-auto pr-4">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all duration-200 flex-shrink-0 text-[13px] sm:text-[15px] whitespace-nowrap shadow-sm ${
                      isActive
                        ? 'bg-[#1D1D1F] text-white ios-shadow scale-105'
                        : 'ios-glass text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-white/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
                <p className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-widest">Finding Items...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 ios-glass rounded-[2rem]">
                <Package className="w-12 h-12 text-[#8E8E93] mx-auto mb-4" />
                <p className="text-lg font-semibold text-[#1D1D1F]">No products found</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
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
                    image={p.image_url || ''}
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

          {/* ─── TRUST & SAFETY ─── */}
          <section className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl sm:rounded-[2.5rem] overflow-hidden ios-glass shadow-sm"
            >
              {/* Header */}
              <div className="px-5 pt-8 pb-3 sm:px-8 sm:pt-10 sm:pb-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-[#34C759]/10 border border-[#34C759]/20">
                  <Shield className="w-4 h-4 text-[#34C759]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#34C759]">Safe & Trusted</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#1D1D1F] tracking-tight">Your Safety is Our Priority</h2>
                <p className="text-[15px] max-w-lg mx-auto text-[#8E8E93] font-medium leading-relaxed">CU Bazzar is run with full transparency. Every delivery is handled personally with zero tolerance for prohibited items.</p>
              </div>

              {/* Trust Pillars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 pb-6 sm:px-8 pb-8">
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
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col transition-all duration-300 bg-white/50 border border-white/60 shadow-sm"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-sm border border-black/5">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-[15px] sm:text-base font-bold mb-1.5 text-[#1D1D1F] tracking-tight">{item.title}</h3>
                    <p className="text-[13px] leading-relaxed text-[#8E8E93] font-medium">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

        </div>
      </div>
    </div>
  );
}
