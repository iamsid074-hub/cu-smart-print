import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, Home as HomeIcon, CheckCircle, Clock, Loader2, ArrowLeft, Phone, MapPin, User, Star, AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Status Step Map ────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package, desc: "Your order has been placed. Waiting for seller confirmation." },
  { key: "seller_accepted", label: "Seller Confirmed", icon: CheckCircle, desc: "The seller has accepted your order and is packing it." },
  { key: "confirmed", label: "Admin Accepted", icon: User, desc: "Admin has taken responsibility for your delivery." },
  { key: "picked", label: "Picked from Seller", icon: Package, desc: "Item has been picked up from the seller." },
  { key: "delivering", label: "Out for Delivery", icon: Truck, desc: "Your item is on the way to your location!" },
  { key: "completed", label: "Delivered ✅", icon: HomeIcon, desc: "Your order has been delivered. Enjoy!" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  seller_accepted: 1,
  confirmed: 2,
  picked: 3,
  delivering: 4,
  completed: 5,
  seller_rejected: -1,
  cancelled: -1,
};

// ─── Dynamic estimated delivery time based on timestamps ─────────────────────
function getEstimatedMinutes(order: any): number {
  if (!order) return 45;
  const status = order.status;
  if (status === "completed") return 0;
  if (status === "delivering") {
    const startTime = order.out_for_delivery_at ? new Date(order.out_for_delivery_at).getTime() : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    return Math.max(1, 20 - elapsed);
  }
  if (status === "picked") {
    const startTime = order.picked_at ? new Date(order.picked_at).getTime() : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    return Math.max(5, 35 - elapsed);
  }
  if (status === "confirmed" || status === "seller_accepted") {
    const startTime = order.accepted_at ? new Date(order.accepted_at).getTime() : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    return Math.max(10, 45 - elapsed);
  }
  return 45;
}

export default function Tracking() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [, setTick] = useState(0); // force re-render every minute

  // ── Fetch order from Supabase ─────────────────────────────────────────────
  const fetchOrder = async () => {
    if (!user) return;
    let query = supabase
      .from("orders")
      .select(`
        *,
        products(id, title, image_url, price),
        buyer:profiles!orders_buyer_id_fkey(full_name, phone_number, hostel_block),
        seller:profiles!orders_seller_id_fkey(full_name, phone_number, hostel_block)
      `);

    if (orderId) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("buyer_id", user.id).order("created_at", { ascending: false }).limit(1);
    }

    const { data } = await query.single();
    setOrder(data || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [user, orderId]);

  // ── Real-time subscription for live status updates ────────────────────────
  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase.channel(`order_tracking_${order.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders",
        filter: `id=eq.${order.id}`
      }, (payload) => {
        setOrder((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  // ── Tick every minute to update estimated time ────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Update estimated minutes whenever order changes
  useEffect(() => {
    if (order) setEstimatedMinutes(getEstimatedMinutes(order));
  }, [order]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const currentStepIndex = order ? (STATUS_ORDER[order.status] ?? 0) : 0;
  const isRejected = order?.status === "seller_rejected" || order?.status === "cancelled";
  const isCompleted = order?.status === "completed";
  const progressPercent = !order ? 0 : isCompleted ? 100 : Math.round((currentStepIndex / 5) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-mono mb-1">LIVE ORDER TRACKING</p>
            <h1 className="text-3xl font-bold">Track Your <span className="text-neon-cyan">Order</span></h1>
          </div>
          <Link to="/home" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </motion.div>

        {!order ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center min-h-[400px]"
          >
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No active orders</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Your tracking information will appear here once you place an order.
            </p>
            <Link to="/home" className="premium-glass-button px-6 py-3 font-bold text-white rounded-xl">
              Browse Marketplace
            </Link>
          </motion.div>
        ) : isRejected ? (
          // ── Rejected/Cancelled ───────────────────────────────────────────
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-10 text-center border border-red-500/20">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-red-400">
              {order.status === "seller_rejected" ? "Seller Rejected the Order" : "Order Cancelled"}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {order.status === "seller_rejected"
                ? "The seller was unable to fulfill this order. Please try another product."
                : "This order has been cancelled."}
            </p>
            <Link to="/home" className="premium-glass-button px-6 py-3 font-bold text-white rounded-xl">
              Browse Again
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ── Estimated Delivery Banner ─────────────────────────────── */}
            {!isCompleted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 border border-neon-cyan/30 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-neon-cyan animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider">Estimated Delivery</p>
                    <p className="text-white font-black text-xl">
                      {estimatedMinutes > 0 ? `~${estimatedMinutes} Minutes` : "Very soon!"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-bold text-neon-orange capitalize">{order.status.replace("_", " ")}</p>
                </div>
              </motion.div>
            )}

            {/* ── Order Summary Card ───────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden border border-white/10">
                    <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100"} alt="product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-semibold line-clamp-1">{order.products?.title || "Product"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-fire font-bold text-xl">₹{order.total_price?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Cash on Delivery</p>
                </div>
              </div>

              {/* Buyer + Delivery Info */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-neon-cyan font-bold uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery To</p>
                  <p className="text-sm font-semibold">{order.delivery_location}</p>
                  {order.delivery_room && <p className="text-xs text-muted-foreground">Room {order.delivery_room}</p>}
                </div>
                <div className="glass rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-neon-orange font-bold uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</p>
                  <p className="text-sm font-semibold">{order.buyer_phone || "—"}</p>
                  <p className="text-xs text-muted-foreground">Buyer</p>
                </div>
              </div>

              {/* Seller info */}
              <div className="mt-3 glass rounded-xl p-3 border border-white/5">
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Seller</p>
                <p className="text-sm font-semibold">{order.seller?.full_name || "—"}</p>
                {order.seller?.hostel_block && <p className="text-xs text-muted-foreground">{order.seller.hostel_block}</p>}
              </div>
            </motion.div>

            {/* ── Progress Timeline ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Delivery Progress</h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{progressPercent}%</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-neon-orange to-neon-cyan rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Vertical line background */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-secondary" />
                {/* Vertical line active progress */}
                <motion.div
                  className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-neon-orange to-neon-cyan shadow-[0_0_10px_rgba(255,100,0,0.6)]"
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                <div className="space-y-5">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone = i < currentStepIndex;
                    const isActive = i === currentStepIndex;
                    return (
                      <motion.div key={step.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone ? "bg-gradient-fire shadow-neon-fire" :
                            isActive ? "bg-gradient-ocean shadow-neon-ocean animate-glow-pulse" :
                              "bg-secondary border border-white/10"}`}>
                          {isDone ? <CheckCircle className="w-5 h-5 text-white" /> :
                            <step.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold text-sm transition-colors duration-300 ${isActive ? "text-neon-cyan" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                              {isActive && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold tracking-widest uppercase">Now</span>}
                            </p>
                          </div>
                          <p className={`text-xs mt-0.5 transition-colors duration-300 ${isDone || isActive ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* ── Completed Banner ──────────────────────────────────────── */}
            {isCompleted && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-bold text-green-400 text-lg">Order Delivered!</p>
                <p className="text-muted-foreground text-sm mt-1">We hope you enjoy your purchase!</p>
                <Link to="/home" className="inline-block mt-4 px-6 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold hover:bg-green-500/30 transition-all">
                  Continue Shopping
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
