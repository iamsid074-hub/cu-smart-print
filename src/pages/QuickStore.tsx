import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Clock,
  Zap,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GroceryProductCard from "@/components/GroceryProductCard";

const fontH: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const PARTNERS = [
  { 
    name: "Virat", 
    phone: "9466166750", 
    available: true, 
    status: "Priority Delivery", 
    image: "/images/partner_virat.png",
    bio: "Expert urban navigator. Fast hosteler-to-hosteler delivery specialist."
  },
  { 
    name: "Rahul", 
    phone: "9876543210", 
    available: false, 
    status: "Active Squad", 
    image: "/images/partner_rahul.png",
    bio: "Late-night essential specialist. Ensures your snacks arrive hot and fresh."
  },
  { 
    name: "Shreya", 
    phone: "9123456789", 
    available: false, 
    status: "Night Owl", 
    image: "/images/partner_shreya.png",
    bio: "Highly efficient with 500+ successful night deliveries this month."
  },
];

export default function QuickStore() {
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();
  const { user, profile, isAdmin } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [isSquadTime, setIsSquadTime] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  // Check if store is open (10 PM - 2 AM)
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      // Store open from 10 PM to 2 AM
      setIsOpen(hour >= 22 || hour < 2);
      // Squad only from 12 AM to 2 AM (or always for Admin)
      setIsSquadTime(isAdmin || (hour >= 0 && hour < 2));
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [isAdmin]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_quick", true)
          .eq("status", "available");

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching quick store products:", err);
        // Silent fail for non-critical query
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products;

  const handleAddToCart = (item: any) => {
    if (!user) {
      toast.error("Please login to order");
      navigate("/login");
      return;
    }
    if (!isOpen) {
      toast.error("Blinkit / Zwigato is closed now. Try between 10 PM - 2 AM");
      return;
    }
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image_url || "/placeholder.jpg",
      category: item.category,
    });
    toast.success(`Added ${item.title} to cart`);
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-32 overflow-x-hidden text-white selection:bg-orange-500">
      

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5 pt-12 pb-6 px-4">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2" style={fontH}>
                  Blinkit / Zwigato
                </h1>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  {profile?.hostel_block || "Set Location"} • {profile?.room_number || "Add Room"}
                </div>
              </div>
            </div>
            
          </div>



          {/* Luxury Delivery Squad Section */}
          {isSquadTime && (
            <div className="pt-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-[14px] font-black text-white uppercase tracking-[0.15em]" style={fontH}>
                      Fast Delivery Squad
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-1">
                {PARTNERS.map((partner) => (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPartner(partner)}
                    key={partner.phone}
                    className="relative group w-full"
                  >
                    {/* Shadow Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                    
                    <div className="relative bg-[#1c1c1e] border border-white/5 rounded-[1.5rem] overflow-hidden flex items-center p-3 gap-4 shadow-xl transition-all duration-300 group-hover:border-white/10 group-hover:bg-[#252528]">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                        <img 
                          src={partner.image} 
                          alt={partner.name} 
                          loading="lazy"
                          className={`w-full h-full object-cover ${partner.available ? "grayscale-0" : "grayscale"} transition-all duration-500`} 
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-[15px] font-black ${partner.available ? "text-white" : "text-gray-500"} tracking-tight`}>{partner.name}</p>
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${partner.available ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                            <div className={`w-1 h-1 rounded-full ${partner.available ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            <p className={`text-[8px] ${partner.available ? "text-green-500" : "text-red-500"} font-black uppercase tracking-widest`}>
                              {partner.available ? "Available" : "Unavailable"}
                            </p>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.1em]">{partner.status}</p>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Loading Essentials...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id}
                className="bg-[#1c1c1e] rounded-[2rem] border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-all duration-500"
              >
                <div className="aspect-square relative overflow-hidden bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e]">
                  <img 
                    src={item.image_url || "/placeholder.jpg"} 
                    alt={item.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" 
                  />
                  {item.price < 50 && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                      Hot Deal
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.category}</p>
                    <h3 className="font-bold text-[15px] text-white line-clamp-1 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-white">₹{item.price}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Incl. Taxes</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Quick Checkout Float ── */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[60]"
          >
            <div className="max-w-xl mx-auto">
              <button 
                onClick={() => navigate("/cart")}
                className="w-full h-16 bg-white text-black rounded-[1.5rem] flex items-center justify-between px-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-black uppercase tracking-tight leading-none mb-1">View Cart • {cartItems.length} Items</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Checkout to Deliver</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tighter">₹{cartItems.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1), 0)}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Luxury Partner Detail Drawer ── */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPartner(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#0a0a0b] rounded-t-[3.5rem] z-[110] overflow-hidden border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="relative">
                {/* Pull Handle */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20 z-[90]" />

                <div className="h-[45vh] w-full relative overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    src={selectedPartner.image} 
                    alt={selectedPartner.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/20 to-transparent" />
                  <button 
                    onClick={() => setSelectedPartner(null)}
                    className="absolute top-8 right-8 w-11 h-11 rounded-full bg-black/50 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="px-10 pb-12 -mt-20 relative space-y-10">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <h2 className="text-5xl font-black text-white tracking-tighter" style={fontH}>{selectedPartner.name}</h2>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                         <p className="text-orange-500 font-bold uppercase tracking-[0.25em] text-[11px]">{selectedPartner.status}</p>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                      <ShieldCheck className="w-7 h-7 text-green-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 space-y-6 col-span-2">
                       <p className="text-[15px] text-gray-300 font-medium leading-relaxed italic">
                         "{selectedPartner.bio}"
                       </p>
                       <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3 text-orange-500">
                           <Clock className="w-5 h-5" />
                           <span className="text-[12px] font-black uppercase tracking-widest">Midnight Ops</span>
                         </div>
                         <span className="text-[12px] font-black text-white uppercase tracking-widest">12:00 — 02:00</span>
                       </div>
                    </div>

                    <div className="bg-orange-500/5 rounded-3xl p-5 border border-orange-500/20 col-span-2 flex items-start gap-5">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                        <AlertCircle className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-white uppercase tracking-tight mb-0.5">Late Night Premium</p>
                        <p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest opacity-80 leading-snug">₹30 Delivery surcharge applies for midnight orders.</p>
                      </div>
                    </div>
                  </div>

                  {selectedPartner.available && (
                    <motion.a 
                      whileHover={{ scale: 1.02, backgroundColor: "#fff" }}
                      whileTap={{ scale: 0.95 }}
                      href={`tel:${selectedPartner.phone}`}
                      className="w-full h-20 rounded-[2rem] bg-white/95 text-black flex items-center justify-center gap-4 text-xl font-black transition-all shadow-[0_25px_50px_rgba(255,255,255,0.15)] mt-4"
                    >
                      <Phone className="w-7 h-7" /> Contact {selectedPartner.name}
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
