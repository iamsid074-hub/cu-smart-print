import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Sun, Grid3X3, Laptop, BookOpen, Shirt, Bike, Headphones, Camera, Sofa, Utensils, Loader2, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const categories = [
  { icon: Laptop, label: "Electronics", count: "1.2K+", gradient: "from-cyan-400 to-blue-500", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop" },
  { icon: BookOpen, label: "Books", count: "3.4K+", gradient: "from-orange-400 to-rose-500", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format&fit=crop" },
  { icon: Shirt, label: "Fashion", count: "2.1K+", gradient: "from-pink-400 to-violet-500", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop" },
  { icon: Bike, label: "Sports", count: "890+", gradient: "from-teal-400 to-cyan-500", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop" },
  { icon: Headphones, label: "Audio", count: "560+", gradient: "from-indigo-400 to-violet-500", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" },
  { icon: Camera, label: "Camera", count: "320+", gradient: "from-amber-400 to-orange-500", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop" },
  { icon: Sofa, label: "Furniture", count: "780+", gradient: "from-rose-400 to-pink-500", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop" },
  { icon: Utensils, label: "Kitchen", count: "240+", gradient: "from-emerald-400 to-teal-500", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop" },
];

const campusEssentials = [
  { id: "ce1", title: "Practical File (100pg)", price: 60, image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop", gradient: "from-emerald-500 to-teal-600" },
  { id: "ce2", title: "Spiral Notebook A4", price: 45, image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop", gradient: "from-blue-500 to-indigo-600" },
  { id: "ce3", title: "Pen Set (5 Pack)", price: 30, image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=400&auto=format&fit=crop", gradient: "from-violet-500 to-purple-600" },
  { id: "ce4", title: "Highlighter Set (4)", price: 80, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400&auto=format&fit=crop", gradient: "from-yellow-400 to-orange-500" },
  { id: "ce5", title: "Scientific Calculator", price: 350, image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=400&auto=format&fit=crop", gradient: "from-cyan-500 to-blue-600" },
  { id: "ce6", title: "Complete Stationery Kit", price: 150, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400&auto=format&fit=crop", gradient: "from-pink-500 to-rose-600" },
  { id: "ce7", title: "Graph Paper Pad", price: 40, image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop", gradient: "from-amber-400 to-orange-500" },
  { id: "ce8", title: "Geometry Box Set", price: 120, image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=400&auto=format&fit=crop", gradient: "from-teal-400 to-emerald-500" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date();
      targetDate.setMonth(2);
      targetDate.setDate(20);
      targetDate.setHours(0, 0, 0, 0);
      const now = new Date();
      if (now > targetDate) targetDate.setFullYear(now.getFullYear() + 1);
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) return { days: "00", hours: "00", minutes: "00", seconds: "00" };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, "0"),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0"),
        minutes: Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, "0"),
        seconds: Math.floor((diff / 1000) % 60).toString().padStart(2, "0"),
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products").select(`*, profiles(full_name)`)
        .eq("status", "available").order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const trendingMapped = products.filter((p) => p.is_trending).map((p) => ({
    id: p.id,
    image: p.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    title: p.title, price: p.price, originalPrice: p.original_price || undefined,
    condition: p.condition as any, rating: 4.5,
    seller: (p as any).profiles?.full_name || "Student", badge: "🔥 Hot",
  }));

  const freshMapped = products.filter((p) => !p.is_trending).map((p) => ({
    id: p.id,
    image: p.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    title: p.title, price: p.price, originalPrice: p.original_price || undefined,
    condition: p.condition as any, rating: 4.5,
    seller: (p as any).profiles?.full_name || "Student",
  }));

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-5 pb-6 sm:py-10"
        >
          <p className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium tracking-wide" style={{ color: '#8F8175' }}>
            Hey there, Student 👋
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={fontH}>
            What are you{" "}
            <span style={{ color: '#FF6B6B' }}>looking for</span>?
          </h1>
        </motion.div>

        {/* ─── TRENDING ─── */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
              <h2 className="text-base sm:text-xl font-bold truncate" style={fontH}>Trending</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white flex-shrink-0" style={{ background: '#FF6B6B' }}>LIVE</span>
            </div>
            <Link to="/browse" className="flex items-center gap-0.5 text-xs sm:text-sm flex-shrink-0" style={{ color: '#4DB8AC' }}>
              See all <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
            {loading ? (
              <div className="flex justify-center w-full py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#4DB8AC' }} />
              </div>
            ) : trendingMapped.length === 0 ? (
              <div className="w-full py-6 text-center">
                <p className="text-sm" style={{ color: '#8F8175' }}>No trending products yet.</p>
              </div>
            ) : (
              trendingMapped.map((product, i) => (
                <ProductCard key={product.id} {...product} delay={i * 0.08} />
              ))
            )}
          </div>
        </section>

        {/* ─── SUMMER SALE BANNER ─── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-5 sm:p-8 lg:p-12" style={{ backgroundColor: '#2A2420', border: '1px solid #3D342C' }}>
            {/* Subtle warm accent glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 sm:w-60 sm:h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,107,107,0.1)' }} />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 sm:w-60 sm:h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(77,184,172,0.06)' }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4" style={{ color: '#F0C040' }} />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest" style={{ color: '#8F8175' }}>Summer Sale</span>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight" style={{ ...fontH, color: '#E8DED4' }}>
                March 20 — <span style={{ color: '#FF6B6B' }}>Up to 70% off</span>
              </h2>
              <p className="text-xs sm:text-sm mb-5" style={{ color: '#8F8175' }}>
                Exclusive deals for CU Students
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    { value: timeLeft.days, label: "D" },
                    { value: timeLeft.hours, label: "H" },
                    { value: timeLeft.minutes, label: "M" },
                    { value: timeLeft.seconds, label: "S" }
                  ].map((t, i) => (
                    <div key={i} className="rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-center min-w-[40px] sm:min-w-[48px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #3D342C' }}>
                      <div className="text-base sm:text-lg font-bold font-mono" style={{ color: '#E8DED4' }}>{t.value}</div>
                      <div className="text-[9px] sm:text-[10px] font-medium" style={{ color: '#8F8175' }}>{t.label}</div>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm transition-shadow"
                  style={{ background: '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.2)' }}
                >
                  Shop Sale →
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── CAMPUS ESSENTIALS ─── */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#4DB8AC' }} />
              <h2 className="text-base sm:text-xl font-bold truncate" style={fontH}>Campus Essentials</h2>
            </div>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'rgba(77,184,172,0.1)', color: '#4DB8AC', border: '1px solid rgba(77,184,172,0.2)' }}>
              Always Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {campusEssentials.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#2A2420', border: '1px solid #3D342C', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
              >
                <div className="relative h-24 sm:h-32 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <img src={item.image} alt={item.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A2420] to-transparent opacity-60" />
                </div>
                <div className="p-2.5 sm:p-3">
                  <p className="text-[11px] sm:text-xs font-semibold line-clamp-1 mb-1" style={{ color: '#E8DED4' }}>{item.title}</p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: '#FF6B6B' }}>₹{item.price}</p>
                  <button className="mt-1.5 sm:mt-2 w-full py-1.5 sm:py-2 rounded-lg text-white text-[10px] sm:text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ background: '#FF6B6B' }}>
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── BROWSE CATEGORIES ─── */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#4DB8AC' }} />
              <h2 className="text-base sm:text-xl font-bold" style={fontH}>Browse Categories</h2>
            </div>
            <Link to="/browse" className="flex items-center gap-1 text-xs sm:text-sm" style={{ color: '#4DB8AC' }}>
              See All <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/browse?category=${cat.label}`}
                className="group relative flex-shrink-0 w-32 h-40 sm:w-48 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2"
                style={{ border: '1px solid #3D342C' }}
              >
                {/* Photo bg */}
                <div className="absolute inset-0 z-0">
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
                </div>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-30 mix-blend-overlay z-0`} />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-0" />

                <div className="relative h-full flex flex-col items-center justify-end p-3 sm:p-5 text-center z-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5 mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <div className="w-full h-full bg-black/50 backdrop-blur-sm rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                      <cat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg text-white tracking-wide mb-0.5 sm:mb-1">{cat.label}</h3>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full text-white/70 font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    {cat.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── FRESH LISTINGS ─── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl font-bold" style={fontH}>📦 Fresh Listings</h2>
            <Link to="/browse" className="flex items-center gap-0.5 text-xs sm:text-sm" style={{ color: '#4DB8AC' }}>See all <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#4DB8AC' }} />
              </div>
            ) : freshMapped.length === 0 ? (
              <div className="col-span-full text-center py-6">
                <p className="text-sm" style={{ color: '#8F8175' }}>No fresh listings yet.</p>
              </div>
            ) : (
              freshMapped.map((product) => (
                <Link to={`/product/${product.id}`} key={`fresh-${product.id}`}
                  className="rounded-xl sm:rounded-2xl overflow-hidden group block transition-all hover:-translate-y-1"
                  style={{ backgroundColor: '#2A2420', border: '1px solid #3D342C' }}>
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    <img src={product.image} alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2420]/80 to-transparent" />
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <p className="text-[11px] sm:text-xs font-semibold line-clamp-1 mb-1" style={{ color: '#E8DED4' }}>{product.title}</p>
                    <p className="text-sm font-bold" style={{ color: '#FF6B6B' }}>₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
