import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Grid3X3, Laptop, BookOpen, Shirt, Bike, Headphones, Camera, Sofa, Utensils, Loader2, ShoppingBag, ShoppingCart, X, MapPin, Phone, Home as HomeIcon, Zap, UtensilsCrossed, Package, Rocket, ShieldCheck, BadgePercent, Users, Plus, Shield, Ban, Headset, ExternalLink, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const categories = [
  { icon: Laptop, label: "Electronics", count: "New", gradient: "from-cyan-400 to-blue-500", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop" },
  { icon: BookOpen, label: "Books", count: "Popular", gradient: "from-orange-400 to-rose-500", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format&fit=crop" },
  { icon: Shirt, label: "Fashion", count: "New", gradient: "from-pink-400 to-brand-accent", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop" },
  { icon: Bike, label: "Sports", count: "", gradient: "from-teal-400 to-cyan-500", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop" },
  { icon: Headphones, label: "Audio", count: "", gradient: "from-indigo-400 to-brand-accent", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" },
  { icon: Camera, label: "Camera", count: "", gradient: "from-amber-400 to-orange-500", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop" },
  { icon: Sofa, label: "Furniture", count: "", gradient: "from-rose-400 to-pink-500", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop" },
  { icon: Utensils, label: "Kitchen", count: "", gradient: "from-emerald-400 to-teal-500", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop" },
];

// campusEssentials imported from @/config/campusEssentials

type FeatureCardType = {
  icon: any;
  title: string;
  desc: string;
  cta: string;
  link: string;
  gradient: string;
  iconColor: string;
  borderColor: string;
  badge?: string;
};

const featureCards: FeatureCardType[] = [
  {
    icon: UtensilsCrossed,
    title: "Food Delivery to Your Room",
    desc: "Hungry? Get your favorite food delivered straight to your hostel. Fast, fresh, and hassle-free.",
    cta: "Order Food",
    link: "/food",
    gradient: "from-orange-500/20 via-red-500/10 to-amber-500/20",
    iconColor: "#FF6B6B",
    borderColor: "rgba(255,107,107,0.25)",
  },
  {
    icon: Package,
    title: "Sell Your Old Products",
    desc: "Got old books, gadgets, or clothes? List them in 30 seconds and turn them into cash.",
    cta: "Start Selling",
    link: "/list",
    gradient: "from-emerald-500/20 via-teal-500/10 to-green-500/20",
    iconColor: "#4DB8AC",
    borderColor: "rgba(77,184,172,0.25)",
  },
  {
    icon: Rocket,
    title: "Super Fast Campus Delivery",
    desc: "Within-campus delivery in under 30 minutes. From hostel to hostel, we handle it.",
    cta: "See How It Works",
    link: "/browse",
    gradient: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
    iconColor: "#60A5FA",
    borderColor: "rgba(96,165,250,0.25)",
  },

  {
    icon: ShieldCheck,
    title: "100% Safe & Verified",
    desc: "Every transaction is campus-verified. Buy and sell with full confidence in our student community.",
    cta: "Learn More",
    link: "/browse",
    gradient: "from-brand-accent/20 via-purple-500/10 to-indigo-500/20",
    iconColor: "#A78BFA",
    borderColor: "rgba(167,139,250,0.25)",
  },
  {
    icon: BadgePercent,
    title: "Student-Only Prices",
    desc: "Prices you won't find anywhere else. Save on everything from books to gadgets, only for CU students.",
    cta: "Browse Deals",
    link: "/browse",
    gradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    iconColor: "#FBBF24",
    borderColor: "rgba(251,191,36,0.25)",
  },

];

function FeatureCard({ card, index }: { card: FeatureCardType; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -14, y: (x - 0.5) * 14, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, active: false });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ scrollSnapAlign: 'start' }}
      className="flex-shrink-0"
    >
      <Link to={card.link} className="block w-full h-full">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-[68vw] sm:w-[230px] lg:w-[260px] h-full rounded-[2rem] overflow-hidden cursor-pointer"
          style={{ perspective: '800px' }}
        >
          <div
            className="relative p-5 rounded-[2rem] transition-transform duration-200 ease-out h-full flex flex-col justify-between bg-white border border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,0.1)] hover:shadow-[4px_4px_0px_rgba(15,23,42,0.15)]"
            style={{
              transform: tilt.active
                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.03)`
                : 'rotateX(0) rotateY(0) scale(1)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Cursor light reflection */}
            {tilt.active && (
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none z-0"
                style={{
                  background: `radial-gradient(circle at ${(tilt.y / 14 + 0.5) * 100}% ${(-tilt.x / 14 + 0.5) * 100}%, ${card.iconColor}10, transparent 60%)`,
                }}
              />
            )}

            <div className="flex flex-col items-start gap-3 relative z-10 h-full">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${card.iconColor}15` }}
              >
                <card.icon className="w-[18px] h-[18px]" style={{ color: card.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold leading-tight mb-1.5 text-slate-900" style={fontH}>
                  {card.title}
                </h3>
                <p className="text-[11px] leading-relaxed line-clamp-3 text-slate-500">
                  {card.desc}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-0.5 relative z-10 w-fit">
              <span className="text-[10px] font-semibold" style={{ color: card.iconColor }}>{card.cta}</span>
              <ChevronRight className="w-3 h-3" style={{ color: card.iconColor }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const heroSlides = [
  { src: "/banners/community.png", alt: "We Love CU Bazzar" },
  { src: "/banners/sell.png", alt: "Sell your unwanted stuff on CU Bazzar" },
  { src: "/banners/delivery.png", alt: "Room Delivery at CU Bazzar" },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const count = heroSlides.length;
  const INTERVAL = 5000;

  // Autoplay with progress bar
  useEffect(() => {
    const step = 50; // ms
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

  // Touch/swipe support
  const touchRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  return (
    <div>
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 group aspect-video max-h-[280px] sm:max-h-[450px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides with crossfade */}
        {heroSlides.map((slide, i) => (
          <motion.div
            key={slide.src}
            initial={false}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ zIndex: i === current ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover block"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        ))}

        {/* Gradient overlay at bottom for dots */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots + progress */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{
                width: i === current ? 32 : 8,
                backgroundColor: i === current ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)',
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
      </div>
    </div>
  );
}


const sliderItems = [
  { img: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=200&auto=format&fit=crop", label: "Stationery" },
  { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop", label: "Snacks" },
  { img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200&auto=format&fit=crop", label: "Electronics" },
  { img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=200&auto=format&fit=crop", label: "Books" },
  { img: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=200&auto=format&fit=crop", label: "Munchies" },
  { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop", label: "Audio" },
];

function AnimatedProductSlider() {
  return (
    <div className="w-full relative overflow-hidden h-32 flex items-center">
      <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#231942] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#231942] to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        className="flex gap-4 w-max"
      >
        {[...sliderItems, ...sliderItems].map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md rounded-2xl p-3 w-28 h-28 border border-white/20 flex-shrink-0 cursor-pointer shadow-lg">
            <div className="w-14 h-14 rounded-full overflow-hidden mb-2 shadow-inner bg-white/20">
              <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-xs font-bold tracking-wide shadow-sm">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [isReminded, setIsReminded] = useState(() => localStorage.getItem('cubazzar_sale_reminder') === '1');

  const handleRemindMe = () => {
    if (isReminded) {
      localStorage.removeItem('cubazzar_sale_reminder');
      setIsReminded(false);
      toast.success("Reminder cancelled");
    } else {
      localStorage.setItem('cubazzar_sale_reminder', '1');
      setIsReminded(true);
      toast.success("Reminder set! We'll notify you when the sale starts");
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
    image: p.image_url || '',
    title: p.title, price: p.price, originalPrice: p.original_price || undefined,
    condition: p.condition as any, category: p.category,
    seller: (p as any).profiles?.full_name || "Student", badge: "Hot",
  }));

  const freshMapped = products.filter((p) => !p.is_trending).map((p) => ({
    id: p.id,
    image: p.image_url || '',
    title: p.title, price: p.price, originalPrice: p.original_price || undefined,
    condition: p.condition as any, category: p.category,
    seller: (p as any).profiles?.full_name || "Student",
  }));

  return (
    <div className="min-h-screen bg-slate-50 pt-[4.5rem] pb-20">
      {/* ─── Top Purple Header Section ─── */}
      <div className="bg-[#231942] px-4 pt-8 pb-14 sm:px-6 lg:px-10 rounded-3xl sm:rounded-[2.5rem] mb-8 relative overflow-hidden shadow-sm mx-2 sm:mx-0 mt-2 sm:mt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-[1600px] mx-auto relative z-10">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <p className="text-sm mb-1.5 font-medium text-white/90">
              Welcome back, Student 👋
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white" style={fontH}>
              Discover Campus{' '}
              <span className="text-emerald-300">Marketplace</span>
            </h1>
          </motion.div>

          {/* Hero Image Carousel */}
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

        {/* ─── Promo Banner ─── */}
        <div className="mb-6 sm:mb-10 w-full">
          <PromoBanner />
        </div>





        <div className="w-full">
          {/* ─── 🔥 SUMMER SALE BANNER ─── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 sm:mb-12"
          >
            {/* Animated border wrapper */}
            <div className="relative rounded-[2rem] p-[3px] overflow-hidden" style={{
              background: 'linear-gradient(135deg, #e0b1cb, #d4a0be, #EC4899, #231942)',
              backgroundSize: '300% 300%',
              animation: 'sale-border-shift 4s ease infinite',
              boxShadow: '0 10px 40px -10px rgba(35,25,66,0.5)'
            }}>
              <div className="relative rounded-3xl sm:rounded-[2rem] overflow-hidden bg-slate-900" style={{ backgroundImage: 'radial-gradient(circle at top right, #312e81, #0f172a)' }}>

                {/* Glowing orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(35,25,66,0.25)' }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(236,72,153,0.15)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.1)' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative z-10 p-6 sm:p-10 lg:p-12">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">

                    {/* Left — Main content */}
                    <div className="flex-1">
                      {/*  Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                        style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(255,215,0,0.3)' }}
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#e0b1cb' }}></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#d4a0be' }}></span>
                        </span>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#e0b1cb]">Summer Sale · Special Offer</span>
                      </motion.div>

                      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-4 text-white tracking-tight" style={fontH}>
                        <span>Something </span>
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#e0b1cb] to-[#d4a0be] drop-shadow-sm">
                          massive
                          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 8" fill="none"><path d="M2 5C30 2 90 2 118 5" stroke="#e0b1cb" strokeWidth="3" strokeLinecap="round" opacity="0.6" /></svg>
                        </span>
                        <span> is coming</span>
                      </h2>

                      <p className="text-base sm:text-lg mb-2 max-w-md text-slate-300 font-medium">
                        March 20 · Up to <strong className="text-[#e0b1cb] font-black tracking-wide text-xl">70% OFF</strong> on everything
                      </p>
                      <p className="text-sm sm:text-base mb-8 text-slate-400 font-medium tracking-wide">
                        Exclusive for CU Students · Limited stock 🚀
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
                              <div className="rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-center min-w-[50px] sm:min-w-[64px] border border-white/10 bg-white/5 backdrop-blur-md shadow-inner">
                                <div className="text-xl sm:text-3xl font-black font-mono text-white tracking-wider">{t.value}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#e0b1cb]">{t.label}</div>
                              </div>
                              {i < 3 && <span className="text-xl sm:text-2xl font-black text-white/30">:</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right — Big discount + CTA */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6">
                      {/* Giant percentage */}
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="text-6xl sm:text-8xl lg:text-[140px] font-black select-none text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20"
                          style={{ ...fontH, lineHeight: 1, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                        >
                          70<span className="text-4xl sm:text-6xl lg:text-8xl">%</span>
                        </motion.div>
                        <div className="absolute top-0 right-[-20px] sm:right-[-40px]">
                          <span className="px-3 py-1 rounded-full bg-[#e0b1cb] text-slate-900 text-xs sm:text-sm font-black transform rotate-12 inline-block">UP TO</span>
                        </div>
                      </div>

                      <motion.button
                        onClick={handleRemindMe}
                        whileHover={{ y: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-white text-sm sm:text-base overflow-hidden transition-all duration-300 ${isReminded ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-brand to-fuchsia-600 shadow-[0_10px_30px_rgba(35,25,66,0.5)] hover:shadow-[0_15px_40px_rgba(35,25,66,0.7)] hover:from-brand-accent hover:to-fuchsia-500'}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center gap-2 tracking-wide uppercase" style={fontH}>
                          {isReminded ? "Reminder Set ✓" : "Remind Me 🔔"}
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

          {/* ─── BROWSE CATEGORIES ─── */}
          <section className="mb-10 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#4DB8AC' }} />
                <h2 className="text-base sm:text-xl font-bold" style={fontH}>Browse Categories</h2>
              </div>
              <Link to="/browse" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(77,184,172,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(77,184,172,0.15)', color: '#4DB8AC', boxShadow: '0 4px 16px rgba(77,184,172,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                See All <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={`/browse?category=${cat.label}`}
                  className="group relative flex-shrink-0 w-32 h-40 sm:w-48 sm:h-56 rounded-3xl sm:rounded-[2rem] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2"
                  style={{ border: '1px solid #544B43' }}
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
                  <p className="text-sm" style={{ color: '#AEA397' }}>No fresh listings yet.</p>
                </div>
              ) : (
                freshMapped.map((product) => (
                  <Link to={`/product/${product.id}`} key={`fresh-${product.id}`}
                    className="rounded-2xl sm:rounded-3xl overflow-hidden group block transition-all hover:-translate-y-1 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                  >
                    <div className="relative h-28 sm:h-36 overflow-hidden bg-slate-50">
                      <img src={product.image || `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400`} alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const cat = product.category as string | undefined;
                          const FALLBACKS: Record<string, string> = {
                            Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
                            Books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
                            Fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
                            Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
                            Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                            Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
                            Kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
                          };
                          (e.target as HTMLImageElement).src = (cat && FALLBACKS[cat]) || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400';
                        }} />
                    </div>
                    <div className="p-2.5 sm:p-3 border-t border-slate-50">
                      <p className="text-[11px] sm:text-xs font-semibold line-clamp-1 mb-1 text-slate-900">{product.title}</p>
                      <p className="text-sm font-bold text-brand">₹{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* ─── TRUST & SAFETY ─── */}
          <section className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl sm:rounded-[2rem] overflow-hidden bg-emerald-50 border border-emerald-100/50"
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-7 sm:pb-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-emerald-100 border border-emerald-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700">Safe & Trusted</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black mb-1 text-slate-900" style={fontH}>Your Safety is Our Priority</h2>
                <p className="text-xs sm:text-sm max-w-lg mx-auto text-slate-600">CU Bazzar is run with full transparency. Every delivery is handled personally with zero tolerance for prohibited items.</p>
              </div>

              {/* Trust Pillars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 pb-5 sm:px-6 sm:pb-7">
                {[
                  {
                    icon: Package,
                    title: "Personal Delivery",
                    desc: "Platform owner personally handles every single delivery. No third parties.",
                    color: "#10B981",
                    bg: "#ffffff",
                    border: "#d1fae5",
                  },
                  {
                    icon: Ban,
                    title: "No Illegal Items",
                    desc: "Strict zero-tolerance policy. No drugs, alcohol, weapons, or prohibited goods.",
                    color: "#F43F5E",
                    bg: "#ffffff",
                    border: "#ffe4e6",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Direct Accountability",
                    desc: "Real person, real responsibility. We stand behind every order and transaction.",
                    color: "#3B82F6",
                    bg: "#ffffff",
                    border: "#dbeafe",
                  },
                  {
                    icon: Headset,
                    title: "24/7 Help Center",
                    desc: "Need help? Our support is available round the clock. Instant response guaranteed.",
                    color: "#231942",
                    bg: "#ffffff",
                    border: "#ede9fe",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold mb-1 text-slate-900">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Help Center CTA */}
              <div className="px-4 pb-5 sm:px-6 sm:pb-7">
                <Link
                  to="/help"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto sm:mx-auto px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-[0.98] bg-white border border-emerald-200 text-emerald-600 shadow-sm"
                >
                  <Headset className="w-4 h-4" />
                  Visit Help Center
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </motion.div>
          </section>

        </div>
      </div>
    </div>
  );
}
