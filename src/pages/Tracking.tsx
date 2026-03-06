import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, Home as HomeIcon, CheckCircle, Clock, Loader2, ArrowLeft, Phone, MapPin, User, Star, AlertCircle, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { campusEssentials } from "@/config/campusEssentials";

// ─── Detect order type ──────────────────────────────────────────────────────────
function getOrderType(order: any): "food" | "item" {
  if (
    order.delivery_location?.includes("[Custom Food:") ||
    order.delivery_room?.includes("[CUSTOM FOOD ORDER]")
  ) return "food";
  return "item";
}

// ─── Status Steps for Item Orders ───────────────────────────────────────────────
const ITEM_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package, desc: "Your order has been placed and is being processed." },
  { key: "seller_accepted", label: "Seller Confirmed", icon: CheckCircle, desc: "The seller has accepted and is preparing your order." },
  { key: "confirmed", label: "Accepted", icon: User, desc: "Your order has been confirmed for delivery." },
  { key: "picked", label: "Picked Up", icon: Package, desc: "Item has been collected from the seller." },
  { key: "delivering", label: "Out for Delivery", icon: Truck, desc: "Your item is on its way to you!" },
  { key: "completed", label: "Delivered ✅", icon: HomeIcon, desc: "Your order has been delivered. Enjoy!" },
];
const ITEM_ORDER: Record<string, number> = { pending: 0, seller_accepted: 1, confirmed: 2, picked: 3, delivering: 4, completed: 5, seller_rejected: -1, cancelled: -1 };

// ─── Status Steps for Food Orders ───────────────────────────────────────────────
const FOOD_STEPS = [
  { key: "pending", label: "Order Received", icon: ShoppingBag, desc: "Your food order has been submitted." },
  { key: "confirmed", label: "Preparing", icon: CheckCircle, desc: "Your order has been accepted and is being prepared." },
  { key: "delivering", label: "Out for Delivery", icon: Truck, desc: "Your food is on its way!" },
  { key: "completed", label: "Delivered ✅", icon: HomeIcon, desc: "Delivered! Enjoy your food!" },
];
const FOOD_ORDER: Record<string, number> = { pending: 0, seller_accepted: 0, confirmed: 1, picked: 2, delivering: 2, completed: 3, seller_rejected: -1, cancelled: -1 };

// ─── Parse clean order details ──────────────────────────────────────────────────
function parseOrderDetails(order: any) {
  const type = getOrderType(order);
  const loc = order.delivery_location || "";

  if (type === "food") {
    // Extract hostel from "BH-1 [Custom Food: ...]"
    const match = loc.match(/^(.+?)\s*\[Custom Food:\s*(.+?)\]$/);
    const hostel = match ? match[1].trim() : loc;
    let items = "";
    let notes = "";
    const room = order.delivery_room || "";
    if (room.includes("[CUSTOM FOOD ORDER]")) {
      const parts = room.replace("[CUSTOM FOOD ORDER]\n", "").split("\n---\n");
      items = parts[0] || "";
      notes = parts[1]?.replace("Notes: ", "") || "";
    } else {
      items = match ? match[2] : room || "Food Order";
    }
    return { type, hostel, items, notes, title: items.split("\n")[0] || "Custom Food Order", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop" };
  }

  // Item order — may be Campus Essential [CE: title]
  const ceMatch = loc.match(/^(.+?)\s*\[CE:\s*(.+?)\]$/);
  if (ceMatch) {
    const ceTitle = ceMatch[2];
    const ceItem = campusEssentials.find(e => e.title === ceTitle);
    return { type, hostel: ceMatch[1].trim(), items: "", notes: "", title: ceTitle, image: ceItem?.image || order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200" };
  }

  // Regular product order
  return { type, hostel: loc, items: "", notes: "", title: order.products?.title || "Product", image: order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200" };
}

// ─── Delivery Time Logic ────────────────────────────────────────────────────────
function getDeliveryInfo(order: any, type: "food" | "item"): { text: string; subtext: string } {
  if (!order) return { text: "", subtext: "" };
  if (order.status === "completed") return { text: "Delivered!", subtext: "Your order has arrived" };

  if (order.status === "delivering") {
    const startTime = order.out_for_delivery_at ? new Date(order.out_for_delivery_at).getTime() : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    const remaining = type === "food" ? Math.max(1, 15 - elapsed) : Math.max(1, 25 - elapsed);
    return { text: `~${remaining} min`, subtext: "On the way to you" };
  }

  // Before "Out for Delivery" — don't show estimated time
  if (order.status === "confirmed" || order.status === "picked" || order.status === "seller_accepted") {
    return { text: type === "food" ? "Preparing..." : "Processing...", subtext: "Estimated time will appear once dispatched" };
  }

  return { text: "Order received", subtext: "Waiting for confirmation" };
}

export default function Tracking() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

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

  useEffect(() => { fetchOrder(); }, [user, orderId]);

  // Real-time subscription
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

  // Re-render every 30 seconds for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Derived
  const details = order ? parseOrderDetails(order) : null;
  const type = details?.type || "item";
  const steps = type === "food" ? FOOD_STEPS : ITEM_STEPS;
  const statusMap = type === "food" ? FOOD_ORDER : ITEM_ORDER;
  const currentStepIndex = order ? (statusMap[order.status] ?? 0) : 0;
  const isRejected = order?.status === "seller_rejected" || order?.status === "cancelled";
  const isCompleted = order?.status === "completed";
  const totalSteps = steps.length - 1;
  const progressPercent = !order ? 0 : isCompleted ? 100 : Math.round((currentStepIndex / totalSteps) * 100);
  const deliveryInfo = order ? getDeliveryInfo(order, type) : { text: "", subtext: "" };

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
        {/* Header removed for Dynamic Island */}

        {!order ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No active orders</h2>
            <p className="text-muted-foreground max-w-sm mb-6">Your tracking information will appear here once you place an order.</p>
            <Link to="/home" className="premium-glass-button px-6 py-3 font-bold text-white rounded-xl">Browse Marketplace</Link>
          </motion.div>
        ) : isRejected ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-10 text-center border border-red-500/20">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-red-400">
              {order.status === "seller_rejected" ? "Order Rejected" : "Order Cancelled"}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {order.status === "seller_rejected" ? "The order couldn't be fulfilled. Please try again." : "This order has been cancelled."}
            </p>
            <Link to="/home" className="premium-glass-button px-6 py-3 font-bold text-white rounded-xl">Browse Again</Link>
          </motion.div>
        ) : (
          <>
            {/* ── Delivery Status Banner ─────────────────────────────── */}
            {!isCompleted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`w-full border rounded-2xl p-4 mb-6 flex justify-between items-center ${type === "food"
                  ? "bg-gradient-to-r from-orange-500/15 to-red-500/15 border-orange-500/25 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
                  : "bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 border-neon-cyan/30 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                  }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === "food" ? "bg-orange-500/20" : "bg-neon-cyan/20"}`}>
                    {order.status === "delivering" ? (
                      <Truck className={`w-5 h-5 animate-pulse ${type === "food" ? "text-orange-400" : "text-neon-cyan"}`} />
                    ) : (
                      <Clock className={`w-5 h-5 ${type === "food" ? "text-orange-400" : "text-neon-cyan"}`} />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${type === "food" ? "text-orange-400" : "text-neon-cyan"}`}>
                      {order.status === "delivering" ? "Estimated Delivery" : "Status"}
                    </p>
                    <p className="text-white font-black text-xl">{deliveryInfo.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{deliveryInfo.subtext}</p>
                </div>
              </motion.div>
            )}

            {/* ── Order Summary Card ───────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-5 sm:p-6 mb-6 border border-white/5">
              <div className="flex items-start gap-4 mb-4">
                {/* Order image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black/40 overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={details?.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs text-muted-foreground font-mono">
                      {type === "food" ? "FOOD" : "ORDER"} #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${type === "food"
                      ? "bg-orange-500/15 border border-orange-500/30 text-orange-400"
                      : "bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan"
                      }`}>
                      {type === "food" ? "🍕 Food" : "📦 Item"}
                    </span>
                  </div>
                  <p className="font-semibold line-clamp-2 text-sm sm:text-base">{details?.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {order.total_price > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-neon-fire font-bold text-lg sm:text-xl">₹{order.total_price?.toLocaleString()}</p>
                    <p className={`text-xs font-bold ${order.payment_status === 'verifying' ? 'text-orange-400' : order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {order.payment_status === 'verifying' ? '🟡 Verifying Payment...' : order.payment_status === 'paid' ? '💳 Paid Online ✓' : '💵 Pay on Delivery'}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="glass rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-neon-cyan font-bold uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery To</p>
                  <p className="text-sm font-semibold">{details?.hostel}</p>
                  {order.delivery_room && !order.delivery_room.includes("[CUSTOM FOOD ORDER]") && (
                    <p className="text-xs text-muted-foreground">Room {order.delivery_room}</p>
                  )}
                </div>
                <div className="glass rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-neon-orange font-bold uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</p>
                  <p className="text-sm font-semibold">{order.buyer_phone || "—"}</p>
                </div>
              </div>

              {/* Food items list (only for food orders) */}
              {type === "food" && details?.items && (
                <div className="mt-3 rounded-xl p-3 border border-orange-500/15" style={{ background: 'rgba(255,107,0,0.04)' }}>
                  <p className="text-xs text-orange-400 font-bold uppercase mb-1.5">Items Ordered</p>
                  {details.items.split("\n").filter(Boolean).map((line: string, i: number) => (
                    <p key={i} className="text-sm text-white flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span> {line.trim()}
                    </p>
                  ))}
                  {details.notes && (
                    <p className="text-xs text-muted-foreground italic mt-1.5 pt-1.5 border-t border-orange-500/10">
                      Notes: {details.notes}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* ── Progress Timeline ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-5 sm:p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Delivery Progress</h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{progressPercent}%</div>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${type === "food" ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-neon-orange to-neon-cyan"}`}
                      initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-secondary" />
                <motion.div
                  className={`absolute left-5 top-5 w-0.5 ${type === "food" ? "bg-gradient-to-b from-orange-500 to-red-500 shadow-[0_0_10px_rgba(255,107,0,0.6)]" : "bg-gradient-to-b from-neon-orange to-neon-cyan shadow-[0_0_10px_rgba(255,100,0,0.6)]"}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                <div className="space-y-5">
                  {steps.map((step, i) => {
                    const isDone = i < currentStepIndex;
                    const isActive = i === currentStepIndex;
                    return (
                      <motion.div key={step.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone ? (type === "food" ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-lg" : "bg-gradient-fire shadow-neon-fire") :
                          isActive ? (type === "food" ? "bg-orange-500/30 shadow-lg border border-orange-500/50" : "bg-gradient-ocean shadow-neon-ocean animate-glow-pulse") :
                            "bg-secondary border border-white/10"
                          }`}>
                          {isDone ? <CheckCircle className="w-5 h-5 text-white" /> :
                            <step.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <p className={`font-semibold text-sm transition-colors duration-300 ${isActive ? (type === "food" ? "text-orange-400" : "text-neon-cyan") :
                              isDone ? "text-foreground" : "text-muted-foreground"
                              }`}>
                              {step.label}
                            </p>
                            {isActive && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${type === "food"
                                ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                                : "bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan"
                                }`}>Now</span>
                            )}
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
                <p className="text-muted-foreground text-sm mt-1">
                  {type === "food" ? "Enjoy your food!" : "We hope you enjoy your purchase!"}
                </p>
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
