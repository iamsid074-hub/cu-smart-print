import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Flame, Grid3X3, Laptop, BookOpen, Shirt, Bike, Headphones, Camera, Sofa, Utensils, Loader2, ShoppingBag, X, MapPin, Phone, Home as HomeIcon, Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { campusEssentials, ADMIN_SELLER_ID, type CampusEssentialItem } from "@/config/campusEssentials";
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

// campusEssentials imported from @/config/campusEssentials

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  // ── Campus Essentials Quick-Buy ──
  const [buyItem, setBuyItem] = useState<CampusEssentialItem | null>(null);
  const [buyHostel, setBuyHostel] = useState("");
  const [buyRoom, setBuyRoom] = useState("");
  const [buyPhone, setBuyPhone] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);

  const handleQuickBuy = async () => {
    if (!user) { navigate('/login'); return; }
    if (!buyItem) return;
    if (!buyHostel.trim() || !buyPhone.trim()) {
      toast.error("Please fill in your hostel and phone number.");
      return;
    }
    setBuyLoading(true);
    try {
      const { data, error } = await supabase.from("orders").insert({
        product_id: null, // campus essentials don't have a DB product row
        buyer_id: user.id,
        seller_id: ADMIN_SELLER_ID,
        base_price: buyItem.price,
        commission: 0,
        delivery_charge: 0,
        total_price: buyItem.price,
        delivery_location: `${buyHostel} [CE: ${buyItem.title}]`,
        delivery_room: buyRoom || null,
        buyer_phone: buyPhone,
        status: 'pending',
        seller_notified_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      toast.success(`Order placed for ${buyItem.title}! 🎉`);
      setBuyItem(null);
      setBuyHostel(""); setBuyRoom(""); setBuyPhone("");
      navigate(`/tracking?order=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Order failed. Please try again.");
    } finally {
      setBuyLoading(false);
    }
  };

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

        {/* ─── 🔥 SUMMER SALE BANNER ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 sm:mb-12"
        >
          {/* Animated border wrapper */}
          <div className="relative rounded-2xl sm:rounded-3xl p-[2px] overflow-hidden" style={{
            background: 'linear-gradient(135deg, #FF6B6B, #F0C040, #FF6B6B, #4DB8AC, #FF6B6B)',
            backgroundSize: '300% 300%',
            animation: 'sale-border-shift 4s ease infinite',
          }}>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ backgroundColor: '#1E1815' }}>

              {/* Glowing orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(255,107,107,0.15)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(240,192,64,0.08)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(77,184,172,0.06)' }} />

              {/* Sparkle particles */}
              <div className="absolute top-4 right-8 text-xl sm:text-2xl animate-pulse pointer-events-none" style={{ animationDuration: '2s' }}>✨</div>
              <div className="absolute bottom-6 right-16 sm:right-24 text-lg animate-pulse pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>🌟</div>
              <div className="absolute top-8 left-[40%] text-sm animate-pulse pointer-events-none" style={{ animationDuration: '2.5s', animationDelay: '1s' }}>⭐</div>

              <div className="relative z-10 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

                  {/* Left — Main content */}
                  <div className="flex-1">
                    {/*  Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                      style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.2)' }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#FF6B6B' }}></span>
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FF6B6B' }}></span>
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>Summer Sale · Limited Time</span>
                    </motion.div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-2" style={fontH}>
                      <span style={{ color: '#E8DED4' }}>Something </span>
                      <span className="relative" style={{ color: '#FF6B6B' }}>
                        massive
                        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 120 8" fill="none"><path d="M2 5C30 2 90 2 118 5" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" /></svg>
                      </span>
                      <span style={{ color: '#E8DED4' }}> is coming</span>
                    </h2>

                    <p className="text-sm sm:text-base mb-1 max-w-md" style={{ color: 'rgba(232,222,212,0.5)' }}>
                      March 20 · Up to <strong style={{ color: '#F0C040' }}>70% off</strong> on everything
                    </p>
                    <p className="text-xs sm:text-sm mb-5" style={{ color: 'rgba(232,222,212,0.25)' }}>
                      Exclusive for CU Students · First come, first served 🎯
                    </p>

                    {/* Countdown */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {[
                          { value: timeLeft.days, label: "Days" },
                          { value: timeLeft.hours, label: "Hrs" },
                          { value: timeLeft.minutes, label: "Min" },
                          { value: timeLeft.seconds, label: "Sec" }
                        ].map((t, i) => (
                          <div key={i} className="flex items-center gap-1 sm:gap-1.5">
                            <div className="rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-center min-w-[44px] sm:min-w-[56px]" style={{ backgroundColor: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)' }}>
                              <div className="text-lg sm:text-2xl font-bold font-mono" style={{ color: '#E8DED4' }}>{t.value}</div>
                              <div className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8F8175' }}>{t.label}</div>
                            </div>
                            {i < 3 && <span className="text-lg font-bold" style={{ color: 'rgba(255,107,107,0.3)' }}>:</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right — Big discount + CTA */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
                    {/* Giant percentage */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="text-5xl sm:text-7xl lg:text-8xl font-black select-none"
                        style={{ ...fontH, color: 'rgba(255,107,107,0.12)', lineHeight: 1 }}
                      >
                        70<span className="text-3xl sm:text-5xl">%</span>
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>UP TO</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ y: -2, scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-bold text-white text-xs sm:text-sm overflow-hidden transition-shadow"
                      style={{ background: '#FF6B6B', boxShadow: '0 4px 20px rgba(255,107,107,0.3)' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative flex items-center gap-2" style={fontH}>
                        Remind Me 🔔
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyframe for animated border */}
          <style>{`
            @keyframes sale-border-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </motion.section>

        {/* ─── CAMPUS ESSENTIALS ─── */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#4DB8AC' }} />
              <h2 className="text-base sm:text-xl font-bold truncate" style={fontH}>Campus Essentials</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'rgba(77,184,172,0.1)', color: '#4DB8AC', border: '1px solid rgba(77,184,172,0.2)' }}>
              <Zap className="w-3 h-3" /> Fast Delivery
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {campusEssentials.map((item, i) => (
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
                  {item.badge && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-white" style={{ background: '#FF6B6B' }}>
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3">
                  <p className="text-[11px] sm:text-xs font-semibold line-clamp-1 mb-1" style={{ color: '#E8DED4' }}>{item.title}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm sm:text-base font-bold" style={{ color: '#FF6B6B' }}>₹{item.price}</p>
                    <div className="flex items-center gap-0.5 text-[9px]" style={{ color: '#4DB8AC' }}>
                      <Zap className="w-2.5 h-2.5" /> Fast
                    </div>
                  </div>
                  <button
                    onClick={() => setBuyItem(item)}
                    className="w-full py-1.5 sm:py-2 rounded-lg text-white text-[10px] sm:text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ background: '#FF6B6B' }}
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Quick Buy Modal ─── */}
        <AnimatePresence>
          {buyItem && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => !buyLoading && setBuyItem(null)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#2A2420', border: '1px solid #3D342C' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5" style={{ borderBottom: '1px solid #3D342C' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid #3D342C' }}>
                      <img src={buyItem.image} alt={buyItem.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ ...fontH, color: '#E8DED4' }}>{buyItem.title}</p>
                      <p className="text-base font-bold" style={{ color: '#FF6B6B' }}>₹{buyItem.price}</p>
                    </div>
                  </div>
                  <button onClick={() => setBuyItem(null)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#8F8175' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs font-medium mb-3" style={{ color: '#8F8175' }}>Where should we deliver? ⚡</p>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8F8175' }} />
                    <input
                      value={buyHostel} onChange={(e) => setBuyHostel(e.target.value)}
                      placeholder="Hostel Block (e.g. BH-1)"
                      className="w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8DED4', border: '1px solid #3D342C' }}
                    />
                  </div>

                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8F8175' }} />
                    <input
                      value={buyRoom} onChange={(e) => setBuyRoom(e.target.value)}
                      placeholder="Room Number (optional)"
                      className="w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8DED4', border: '1px solid #3D342C' }}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8F8175' }} />
                    <input
                      value={buyPhone} onChange={(e) => setBuyPhone(e.target.value)}
                      placeholder="Phone Number"
                      type="tel"
                      className="w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8DED4', border: '1px solid #3D342C' }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: '#4DB8AC' }} />
                    <span className="text-[11px]" style={{ color: '#4DB8AC' }}>Delivered by Campus Store · No extra charges</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5" style={{ borderTop: '1px solid #3D342C' }}>
                  <motion.button
                    onClick={handleQuickBuy}
                    disabled={buyLoading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
                    style={{ ...fontH, background: '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.25)' }}
                  >
                    {buyLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>Place Order · ₹{buyItem.price}</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
