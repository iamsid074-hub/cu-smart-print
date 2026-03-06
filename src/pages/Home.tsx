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
import { campusEssentials, ADMIN_SELLER_ID, type CampusEssentialItem } from "@/config/campusEssentials";
import PaymentSelector from "@/components/PaymentSelector";
import UpiPaymentModal from "@/components/UpiPaymentModal";
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

function GroceryBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Link to="/groceries" className="block mb-6 sm:mb-8 transition-transform active:scale-[0.98]">
        <div className="relative overflow-hidden rounded-xl border border-emerald-600 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md">
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-emerald-400/30 to-transparent pointer-events-none" />
          <div className="px-4 py-3 xl:px-5 xl:py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hidden xs:flex bg-emerald-400/30">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm border-b border-transparent sm:text-base font-bold text-white">Groceries & Daily Needs</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-800 text-emerald-100">NEW</span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-50 leading-tight">Delivered straight to your hostel block daily.</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <span className="text-xs font-bold text-white hidden sm:block">Shop Now</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const cardCount = featureCards.length;

  const scrollToIdx = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement;
    if (card) {
      el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth || 230;
    const gap = 12;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIdx(Math.min(idx, cardCount - 1));
  }, [cardCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % cardCount;
        scrollToIdx(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [cardCount, scrollToIdx]);

  return (
    <section className="mb-8 sm:mb-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-2xl font-bold" style={fontH}>What we offer</h2>
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => { const prev = Math.max(activeIdx - 1, 0); setActiveIdx(prev); scrollToIdx(prev); }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white border border-slate-200 shadow-sm text-slate-400"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { const next = Math.min(activeIdx + 1, cardCount - 1); setActiveIdx(next); scrollToIdx(next); }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white border border-slate-200 shadow-sm text-slate-400"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 h-[200px]"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {featureCards.map((card, i) => (
          <FeatureCard key={card.title} card={card} index={i} />
        ))}
      </div>

      <div className="flex justify-center gap-1.5 mt-2">
        {featureCards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIdx(i); scrollToIdx(i); }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: activeIdx === i ? 16 : 5,
              height: 5,
              backgroundColor: activeIdx === i ? '#231942' : '#E2E8F0',
            }}
          />
        ))}
      </div>
    </section>
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
  // ── Campus Essentials Quick-Buy ──
  const [buyItem, setBuyItem] = useState<CampusEssentialItem | null>(null);
  const [buyHostel, setBuyHostel] = useState("");
  const [buyRoom, setBuyRoom] = useState("");
  const [buyPhone, setBuyPhone] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<"online" | "cod">("online");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiItemSnapshot, setUpiItemSnapshot] = useState<{ price: number; id: string; title: string } | null>(null);

  const handleQuickBuy = async () => {
    if (!user) { navigate('/login'); return; }
    if (!buyItem) return;
    const phoneClean = buyPhone.replace(/\D/g, "");
    if (!buyHostel.trim() || !buyRoom.trim()) {
      toast.error("Please fill in your hostel and room number.");
      return;
    }
    if (phoneClean.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    setBuyLoading(true);
    try {
      if (buyPaymentMethod === "online") {
        setUpiItemSnapshot({ price: buyItem.price, id: buyItem.id, title: buyItem.title }); // Save before closing
        setBuyItem(null); // Close delivery details modal first
        setTimeout(() => setShowUpiModal(true), 150); // Smooth transition
        setBuyLoading(false);
        return;
      }

      await finalizeOrder("cod", null);
    } catch (err: any) {
      toast.error(err.message || "Order failed. Please try again.");
      setBuyLoading(false);
    }
  };

  const finalizeOrder = async (method: "online" | "cod", utrNumber: string | null) => {
    if (!user) return;
    // Use upiItemSnapshot as buyItem is cleared before UPI modal opens
    const item = upiItemSnapshot ?? (buyItem ? { price: buyItem.price, id: buyItem.id, title: buyItem.title } : null);
    if (!item) { toast.error("Order data missing. Please try again."); return; }
    const phoneClean = buyPhone.replace(/\D/g, "");
    setBuyLoading(true);

    try {
      const { data, error } = await supabase.from("orders").insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: ADMIN_SELLER_ID,
        base_price: item.price,
        commission: 0,
        delivery_charge: 10,
        total_price: item.price + 10,
        delivery_location: `${buyHostel} [CE: ${item.title}]`,
        delivery_room: buyRoom || null,
        buyer_phone: phoneClean,
        status: 'pending',
        payment_method: method === "online" ? "cashfree" : "cod",
        payment_status: method === "online" ? "paid" : "pending",
        razorpay_payment_id: utrNumber,
        seller_notified_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      toast.success(method === "online" ? `Order submitted — admin will verify` : `Order placed for ${item.title}. Pay on delivery.`);
      setBuyItem(null);
      setUpiItemSnapshot(null);
      setBuyHostel(""); setBuyRoom(""); setBuyPhone(""); setBuyPaymentMethod("cod");
      setShowUpiModal(false);
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-2 pb-2">

            {/* Left text area */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <p className="text-sm mb-1.5 font-medium text-white/90">
                Welcome back, Student 👋
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2 lg:mb-0" style={fontH}>
                Discover Campus <br className="hidden sm:block" />
                <span className="text-emerald-300">Marketplace</span>
              </h1>
            </motion.div>

            {/* Right slider area filling the empty space */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-[55%] overflow-hidden"
            >
              <AnimatedProductSlider />
            </motion.div>

          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ─── Promo Banner ─── */}
        <div className="mb-8 sm:mb-12">
          <PromoBanner />
        </div>

        {/* ─── GROCERIES BANNER ─── */}
        <GroceryBanner />

        {/* ─── FEATURE CARDS CAROUSEL ─── */}
        <FeatureCarousel />

        {/* ─── 🔥 SUMMER SALE BANNER ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 sm:mb-12"
        >
          {/* Animated border wrapper */}
          <div className="relative rounded-3xl sm:rounded-[2rem] p-[3px] overflow-hidden" style={{
            background: 'linear-gradient(135deg, #FFD700, #F59E0B, #EC4899, #231942)',
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#FFD700' }}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#F59E0B' }}></span>
                      </span>
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">Summer Sale · Special Offer</span>
                    </motion.div>

                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-4 text-white tracking-tight" style={fontH}>
                      <span>Something </span>
                      <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#F59E0B] drop-shadow-sm">
                        massive
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 8" fill="none"><path d="M2 5C30 2 90 2 118 5" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" opacity="0.6" /></svg>
                      </span>
                      <span> is coming</span>
                    </h2>

                    <p className="text-base sm:text-lg mb-2 max-w-md text-slate-300 font-medium">
                      March 20 · Up to <strong className="text-[#FFD700] font-black tracking-wide text-xl">70% OFF</strong> on everything
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
                              <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">{t.label}</div>
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
                        <span className="px-3 py-1 rounded-full bg-[#FFD700] text-slate-900 text-xs sm:text-sm font-black transform rotate-12 inline-block">UP TO</span>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {campusEssentials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(35,25,66,0.1)]"
              >
                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500 text-white shadow-sm">
                    {item.badge}
                  </div>
                )}

                {/* Image area — warm glow, full view */}
                <div className="relative flex items-center justify-center p-4 sm:p-5" style={{ minHeight: '160px', background: 'radial-gradient(ellipse at center, rgba(255,165,80,0.06) 0%, transparent 70%)' }}>
                  <img src={item.image} alt={item.title} loading="lazy"
                    className="max-h-[120px] sm:max-h-[140px] w-auto max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                    style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.4))' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'; }}
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <p className="text-xs sm:text-[13px] font-semibold line-clamp-2 mb-2.5 leading-snug text-slate-800">{item.title}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-lg sm:text-xl font-extrabold text-brand">₹{item.price}</span>
                    <span className="text-[10px] font-medium text-slate-400">+ ₹10 delivery</span>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => {
                      addItem({ id: item.id, title: item.title, price: item.price, image: item.image, category: item.category });
                      toast.success(`${item.title} added to cart`);
                    }}
                    className="w-full mt-auto py-2.5 sm:py-3 rounded-2xl text-brand bg-brand-50 hover:bg-brand-50 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.97]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
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
                className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <img src={buyItem.image} alt={buyItem.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900" style={fontH}>{buyItem.title}</p>
                      <p className="text-base font-bold text-brand">₹{buyItem.price}</p>
                    </div>
                  </div>
                  <button onClick={() => setBuyItem(null)} className="p-1.5 rounded-lg transition-colors text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs font-medium mb-3 text-slate-500">Where should we deliver? ⚡</p>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={buyHostel} onChange={(e) => setBuyHostel(e.target.value)}
                      placeholder="Hostel Block (e.g. BH-1)"
                      className="w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-brand-muted focus:ring-4 focus:ring-brand-50"
                    />
                  </div>

                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={buyRoom} onChange={(e) => setBuyRoom(e.target.value)}
                      placeholder="Room Number *"
                      className="w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-brand-muted focus:ring-4 focus:ring-brand-50"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={buyPhone} onChange={(e) => setBuyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit Phone Number *"
                      type="tel"
                      maxLength={10}
                      className={`w-full rounded-xl pl-10 pr-4 h-[48px] text-sm focus:outline-none transition-all bg-slate-50 text-slate-900 border focus:bg-white focus:ring-4 ${buyPhone.length > 0 && buyPhone.length !== 10 ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-brand-muted focus:ring-brand-50'}`}
                    />
                  </div>
                  {buyPhone.length > 0 && buyPhone.length !== 10 && (
                    <p className="text-[11px] mt-1 px-1 text-red-500">Phone must be exactly 10 digits</p>
                  )}

                  <PaymentSelector
                    selected={buyPaymentMethod}
                    onChange={setBuyPaymentMethod}
                    totalAmount={(buyItem?.price || 0) + 10}
                    disabled={buyLoading}
                  />

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: '#4DB8AC' }} />
                    <span className="text-[11px]" style={{ color: '#4DB8AC' }}>Delivered by Campus Store · ₹10 delivery fee included</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100">
                  <motion.button
                    onClick={handleQuickBuy}
                    disabled={buyLoading || !buyHostel.trim() || !buyRoom.trim() || buyPhone.length !== 10}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ ...fontH, background: (!buyHostel.trim() || !buyRoom.trim() || buyPhone.length !== 10) ? '#cbd5e1' : '#231942', boxShadow: (!buyHostel.trim() || !buyRoom.trim() || buyPhone.length !== 10) ? 'none' : '0 4px 16px rgba(35,25,66,0.3)' }}
                  >
                    {buyLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>{buyPaymentMethod === "online" ? `Pay ₹${buyItem.price + 10} Online` : `COD · ₹${buyItem.price + 10}`}</>
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
            {/* UPI Payment Modal */}
            <UpiPaymentModal
              isOpen={showUpiModal}
              onClose={() => { setShowUpiModal(false); setUpiItemSnapshot(null); }}
              amount={(upiItemSnapshot?.price || 0) + 5}
              orderIdText={`CE_${upiItemSnapshot?.id || 'TEST'}`}
              customerId={user?.id || "guest"}
              customerPhone={buyPhone || "9999999999"}
              onPaymentVerify={async (utr) => {
                await finalizeOrder("online", utr);
              }}
            />
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
  );
}
