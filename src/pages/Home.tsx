import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Sun, Grid3X3, Laptop, BookOpen, Shirt, Bike, Headphones, Camera, Sofa, Utensils, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

const categories = [
  { icon: Laptop, label: "Electronics", count: "1.2K+", gradient: "from-neon-cyan to-neon-blue" },
  { icon: BookOpen, label: "Books", count: "3.4K+", gradient: "from-neon-orange to-neon-pink" },
  { icon: Shirt, label: "Fashion", count: "2.1K+", gradient: "from-neon-pink to-neon-blue" },
  { icon: Bike, label: "Sports", count: "890+", gradient: "from-neon-cyan to-neon-orange" },
  { icon: Headphones, label: "Audio", count: "560+", gradient: "from-neon-blue to-neon-pink" },
  { icon: Camera, label: "Camera", count: "320+", gradient: "from-neon-orange to-neon-cyan" },
  { icon: Sofa, label: "Furniture", count: "780+", gradient: "from-neon-pink to-neon-orange" },
  { icon: Utensils, label: "Kitchen", count: "240+", gradient: "from-neon-cyan to-neon-blue" },
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
          <p className="text-muted-foreground text-sm font-mono mb-2 tracking-wide font-medium">GOOD MORNING, STUDENT 👋</p>
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
                  className="px-6 py-3 rounded-2xl bg-white text-background font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  Shop the Sale →
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === BROWSE CATEGORIES === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-xl font-bold">Browse Categories</h2>
            </div>
            <Link to="/browse" className="flex items-center gap-1 text-sm text-neon-cyan hover:text-foreground transition-colors">
              All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to={`/browse?category=${cat.label}`}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-2 border border-white/5 hover:border-white/15 transition-all duration-200 group relative block"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center group-hover:shadow-neon-fire transition-all`}>
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-foreground">{cat.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{cat.count}</span>
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
