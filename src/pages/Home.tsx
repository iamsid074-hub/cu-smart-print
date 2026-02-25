import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Sun, Grid3X3, Laptop, BookOpen, Shirt, Bike, Headphones, Camera, Sofa, Utensils, Loader2, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

const categories = [
  { icon: Laptop, label: "Electronics", count: "1.2K+", gradient: "from-neon-cyan to-neon-blue", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop" },
  { icon: BookOpen, label: "Books", count: "3.4K+", gradient: "from-neon-orange to-neon-pink", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format&fit=crop" },
  { icon: Shirt, label: "Fashion", count: "2.1K+", gradient: "from-neon-pink to-neon-blue", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop" },
  { icon: Bike, label: "Sports", count: "890+", gradient: "from-neon-cyan to-neon-orange", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop" },
  { icon: Headphones, label: "Audio", count: "560+", gradient: "from-neon-blue to-neon-pink", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" },
  { icon: Camera, label: "Camera", count: "320+", gradient: "from-neon-orange to-neon-cyan", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop" },
  { icon: Sofa, label: "Furniture", count: "780+", gradient: "from-neon-pink to-neon-orange", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop" },
  { icon: Utensils, label: "Kitchen", count: "240+", gradient: "from-neon-cyan to-neon-blue", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop" },
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
      targetDate.setMonth(2); // 0-indexed, 2 is March
      targetDate.setDate(20);
      targetDate.setHours(0, 0, 0, 0);

      const now = new Date();
      if (now > targetDate) {
        targetDate.setFullYear(now.getFullYear() + 1);
      }

      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) return { days: "00", hours: "00", minutes: "00", seconds: "00" };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, "0");
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select(`*, profiles(full_name)`)
        .eq("status", "available")
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const trendingMapped = products.filter((p) => p.is_trending).map((p) => ({
    id: p.id,
    image: p.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    title: p.title,
    price: p.price,
    originalPrice: p.original_price || undefined,
    condition: p.condition as any,
    rating: 4.5,
    seller: (p as any).profiles?.full_name || "Student",
    badge: "🔥 Hot",
  }));

  const freshMapped = products.filter((p) => !p.is_trending).map((p) => ({
    id: p.id,
    image: p.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    title: p.title,
    price: p.price,
    originalPrice: p.original_price || undefined,
    condition: p.condition as any,
    rating: 4.5,
    seller: (p as any).profiles?.full_name || "Student",
  }));

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-10"
        >
          <p className="text-muted-foreground text-sm font-mono mb-2 tracking-wide font-medium">NICE TO MEET YOU STUDENTS👋</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            What are you <span className="text-neon-fire">looking for</span>?
          </h1>
        </motion.div>

        {/* === TRENDING SECTION === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-neon-orange" />
              <h2 className="text-xl font-bold">Trending Right Now</h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-fire text-white font-bold">LIVE</span>
            </div>
            <Link to="/browse" className="flex items-center gap-1 text-sm text-neon-cyan hover:text-foreground transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {loading ? (
              <div className="flex justify-center w-full py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
              </div>
            ) : trendingMapped.length === 0 ? (
              <p className="text-muted-foreground w-full py-4">No trending products yet.</p>
            ) : (
              trendingMapped.map((product, i) => (
                <ProductCard key={product.id} {...product} delay={i * 0.08} />
              ))
            )}
          </div>
        </section>

        {/* === SUMMER SALE BANNER === */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12">
            {/* Gradient BG */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-orange via-neon-pink to-neon-blue animate-aurora opacity-90" />
            <div className="absolute inset-0 bg-grid opacity-20" />

            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-white" />
                  <span className="text-white/80 font-mono text-sm uppercase tracking-widest">Summer Sale</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2">
                  Summer Sale starts from 20 March
                </h2>
                <p className="text-white/80 text-sm sm:text-base">
                  UP TO 70% OFF · Exclusive deals for CU Students
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex gap-2">
                  {[
                    { value: timeLeft.days, label: "DAYS" },
                    { value: timeLeft.hours, label: "HRS" },
                    { value: timeLeft.minutes, label: "MIN" },
                    { value: timeLeft.seconds, label: "SEC" }
                  ].map((t, i) => (
                    <div key={i} className="glass-heavy rounded-xl px-3 py-2 text-center min-w-[52px]">
                      <div className="text-xl font-bold text-white font-mono">{t.value}</div>
                      <div className="text-xs text-white/60">{t.label}</div>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-liquid-glass px-8 py-4 font-bold text-white text-sm shadow-xl"
                >
                  Shop the Sale →
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === CAMPUS ESSENTIALS === */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-black tracking-tight">🎒 Campus Essentials</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">Always Available</span>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1 -mx-1 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none">
            {campusEssentials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group flex-shrink-0 w-[160px] sm:w-[200px] lg:w-full snap-start glass rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]"
              >
                <div className="relative h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-50" />
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-[85%] h-[85%] object-cover rounded-xl group-hover:scale-110 transition-transform duration-500 z-0"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 mb-1">{item.title}</p>
                  <p className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${item.gradient}`}>₹{item.price}</p>
                  <button className={`mt-2 w-full py-2 rounded-xl bg-gradient-to-r ${item.gradient} text-white text-xs font-bold opacity-90 hover:opacity-100 hover:shadow-lg transition-all duration-300`}>
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === BROWSE CATEGORIES === */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-6 h-6 text-neon-cyan" />
              <h2 className="text-2xl font-black tracking-tight">Browse Categories</h2>
            </div>
            <Link to="/browse" className="premium-glass-button group px-4 py-2 flex items-center gap-2 text-sm text-white">
              <span className="group-hover:text-neon-cyan transition-colors">See All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-neon-cyan transition-all" />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-8 pt-2 px-2 -mx-2">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to={`/browse?category=${cat.label}`}
                className="group relative flex-shrink-0 w-48 h-56 rounded-3xl overflow-hidden glass-heavy border border-white/10 hover:border-white/30 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              >
                {/* Photographic Background Image */}
                <div className="absolute inset-0 z-0">
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                {/* Dynamic Gradient Overlay that intensifies on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-40 mix-blend-overlay group-hover:opacity-70 transition-opacity duration-500 z-0`} />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-0" />

                {/* Giant semi-transparent background icon */}
                <cat.icon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out pointer-events-none z-0" />

                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10 pt-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5 mb-auto transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]`}>
                    <div className="w-full h-full bg-black/60 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                      <cat.icon className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <h3 className="font-black text-xl text-white tracking-wide mb-1 drop-shadow-md">{cat.label}</h3>
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono text-white/90 group-hover:bg-white/20 transition-colors shadow-sm">
                      {cat.count} listings
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* === SECOND ROW – More Products === */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">📦 Fresh Listings</h2>
            <Link to="/browse" className="flex items-center gap-1 text-sm text-neon-cyan">See all <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
              </div>
            ) : freshMapped.length === 0 ? (
              <div className="col-span-full text-muted-foreground py-4">No fresh listings.</div>
            ) : (
              freshMapped.map((product, i) => (
                <Link
                  to={`/product/${product.id}`}
                  key={`fresh-${product.id}`}
                  className="glass rounded-2xl overflow-hidden cursor-pointer group block"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground line-clamp-1 mb-1">{product.title}</p>
                    <p className="text-neon-fire font-bold text-sm">₹{product.price.toLocaleString()}</p>
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
