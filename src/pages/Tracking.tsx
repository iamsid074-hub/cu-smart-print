import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  Home as HomeIcon,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Star,
  AlertCircle,
  UtensilsCrossed,
  ShoppingBag,
  X,
  PartyPopper,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// â”€â”€â”€ Detect order type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getOrderType(order: any): "food" | "item" | "vending" | "cart" {
  const loc = order.delivery_location || "";
  const room = order.delivery_room || "";

  if (loc.includes("[VENDING MACHINE:") || room.includes("[VENDING MACHINE:"))
    return "vending";
  if (room.includes("[ITEMS:")) return "cart";
  if (loc.includes("[Custom Food:") || room.includes("[CUSTOM FOOD ORDER]"))
    return "food";
  return "item";
}

// â”€â”€â”€ Status Steps for Item Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ITEM_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Package,
    desc: "Your order has been placed and is being processed.",
  },
  {
    key: "seller_accepted",
    label: "Seller Confirmed",
    icon: CheckCircle,
    desc: "The seller has accepted and is preparing your order.",
  },
  {
    key: "confirmed",
    label: "Accepted",
    icon: User,
    desc: "Your order has been confirmed for delivery.",
  },
  {
    key: "picked",
    label: "Picked Up",
    icon: Package,
    desc: "Item has been collected from the seller.",
  },
  {
    key: "delivering",
    label: "Out for Delivery",
    icon: Truck,
    desc: "Your item is on its way to you!",
  },
  {
    key: "completed",
    label: "Delivered âœ…",
    icon: HomeIcon,
    desc: "Your order has been delivered. Enjoy!",
  },
];
const ITEM_ORDER: Record<string, number> = {
  pending: 0,
  seller_accepted: 1,
  confirmed: 2,
  picked: 3,
  delivering: 4,
  completed: 5,
  seller_rejected: -1,
  cancelled: -1,
};

// â”€â”€â”€ Status Steps for Food Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FOOD_STEPS = [
  {
    key: "pending",
    label: "Order Received",
    icon: ShoppingBag,
    desc: "Your food order has been submitted.",
  },
  {
    key: "confirmed",
    label: "Preparing",
    icon: CheckCircle,
    desc: "Your order has been accepted and is being prepared.",
  },
  {
    key: "delivering",
    label: "Out for Delivery",
    icon: Truck,
    desc: "Your food is on its way!",
  },
  {
    key: "completed",
    label: "Delivered âœ…",
    icon: HomeIcon,
    desc: "Delivered! Enjoy your food!",
  },
];
const FOOD_ORDER: Record<string, number> = {
  pending: 0,
  seller_accepted: 0,
  confirmed: 1,
  picked: 2,
  delivering: 2,
  completed: 3,
  seller_rejected: -1,
  cancelled: -1,
};

// â”€â”€â”€ Parse clean order details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseOrderDetails(order: any) {
  const type = getOrderType(order);
  const loc = order.delivery_location || "";
  const room = order.delivery_room || "";

  if (type === "food") {
    // Extract hostel from "BH-1 [Custom Food: ...]"
    const match = loc.match(/^(.+?)\s*\[Custom Food:\s*(.+?)\]$/);
    const hostel = match ? match[1].trim() : loc;
    let items = "";
    let notes = "";
    if (room.includes("[CUSTOM FOOD ORDER]")) {
      const parts = room.replace("[CUSTOM FOOD ORDER]\n", "").split("\n---\n");
      items = parts[0] || "";
      notes = parts[1]?.replace("Notes: ", "") || "";
    } else {
      items = match ? match[2] : room || "Food Order";
    }
    return {
      type,
      hostel,
      items,
      notes,
      title: items.split("\n")[0] || "Custom Food Order",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
    };
  }

  if (type === "vending" || type === "cart") {
    const isVending = type === "vending";
    const roomPart = room.match(/\[ROOM:(.+?)\]/)?.[1] || room;
    const itemsPart = room.match(/\[ITEMS:([\s\S]*)\]\s*$/)?.[1] || "";

    // Extract first item title. e.g. "1x Amul Taaza [IMG:...] (Toned Milk) (Milk) (â‚¹27)"
    const firstLine = itemsPart.split("\n")[0] || "";
    const firstItemTitle =
      firstLine.match(/\d+x\s+(.+?)\s+\[IMG:/)?.[1] ||
      firstLine.match(/\d+x\s+(.+?)\s+\(/)?.[1] ||
      firstLine ||
      "Campus Order";

    // Extract image URL from [IMG:url] tag
    const imageTagMatch = itemsPart.match(/\[IMG:(.+?)\]/);
    const image = imageTagMatch ? imageTagMatch[1] : "/logo.webp"; // Default to site logo if no tag found

    return {
      type,
      hostel: loc.split(" - ")[0],
      items: itemsPart.replace(/\[IMG:.+?\]\s*/g, ""), // Clean up the tags for display
      notes: "",
      title: firstItemTitle,
      image,
      roomInfo: roomPart,
    };
  }

  // Regular product order
  return {
    type,
    hostel: loc,
    items: "",
    notes: "",
    title: order.products?.title || "Product",
    image: order.products?.image_url || "/logo.webp",
  };
}

// â”€â”€â”€ Delivery Time Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getDeliveryInfo(
  order: any,
  type: "food" | "item"
): { text: string; subtext: string } {
  if (!order) return { text: "", subtext: "" };
  if (order.status === "completed")
    return { text: "Delivered!", subtext: "Your order has arrived" };

  if (order.status === "delivering") {
    const startTime = order.out_for_delivery_at
      ? new Date(order.out_for_delivery_at).getTime()
      : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    const remaining =
      type === "food" ? Math.max(1, 15 - elapsed) : Math.max(1, 25 - elapsed);
    return { text: `~${remaining} min`, subtext: "On the way to you" };
  }

  // Before "Out for Delivery" â€” don't show estimated time
  if (
    order.status === "confirmed" ||
    order.status === "picked" ||
    order.status === "seller_accepted"
  ) {
    return {
      text: type === "food" ? "Preparing..." : "Processing...",
      subtext: "Estimated time will appear once dispatched",
    };
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
    let query = supabase.from("orders").select(`
        *,
        products(id, title, image_url, price),
        buyer:profiles!orders_buyer_id_fkey(full_name, phone_number, hostel_block),
        seller:profiles!orders_seller_id_fkey(full_name, phone_number, hostel_block)
      `);

    if (orderId) {
      query = query.eq("id", orderId);
    } else {
      query = query
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    const { data } = await query.single();
    setOrder(data || null);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrder();
    // Failsafe: Ensure scrolling is unlocked when viewing order tracking
    document.body.style.overflow = "auto";
  }, [user, orderId]);

  // Real-time subscription
  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel(`order_tracking_${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  // Re-render every 30 seconds for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleHiddenCancel = async () => {
    if (!order || isCompleted || isRejected) return;
    if (
      window.confirm(
        "Are you sure you want to cancel this order?\n\nPlease note: Delivery charges will be deducted upon cancellation. You will not receive a full refund."
      )
    ) {
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      window.alert(
        "Order cancelled successfully. Refund will be processed after deducting delivery charges."
      );
      fetchOrder();
    }
  };

  // Derived
  const details = order ? parseOrderDetails(order) : null;
  const type = details?.type || "item";
  const displayType = type === "vending" || type === "cart" ? "item" : type;
  const steps = displayType === "food" ? FOOD_STEPS : ITEM_STEPS;
  const statusMap = displayType === "food" ? FOOD_ORDER : ITEM_ORDER;
  const currentStepIndex = order ? statusMap[order.status] ?? 0 : 0;
  const isRejected =
    order?.status === "seller_rejected" || order?.status === "cancelled";
  const isCompleted = order?.status === "completed";
  const totalSteps = steps.length - 1;
  const progressPercent = !order
    ? 0
    : isCompleted
    ? 100
    : Math.round((currentStepIndex / totalSteps) * 100);
  const deliveryInfo = order
    ? getDeliveryInfo(order, displayType)
    : { text: "", subtext: "" };

  // Thank You panel state
  const [showThankYou, setShowThankYou] = useState(false);
  const hasShownRef = useRef(false);
  useEffect(() => {
    if (isCompleted && !hasShownRef.current) {
      hasShownRef.current = true;
      // Small delay so the progress bar finishes animating first
      const timer = setTimeout(() => setShowThankYou(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header removed for Dynamic Island */}

        {!order ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]"
          >
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-slate-900">
              No active orders
            </h2>
            <p className="text-slate-500 max-w-sm mb-6 font-medium">
              Your tracking information will appear here once you place an
              order.
            </p>
            <Link
              to="/home"
              className="px-6 py-3 font-bold text-white bg-brand hover:bg-brand transition-colors shadow-sm rounded-xl"
            >
              Browse Marketplace
            </Link>
          </motion.div>
        ) : isRejected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 text-center border border-red-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-600">
              {order.status === "seller_rejected"
                ? "Order Rejected"
                : "Order Cancelled"}
            </h2>
            <p className="text-slate-500 mb-6 text-sm font-medium">
              {order.status === "seller_rejected"
                ? "The order couldn't be fulfilled. Please try again."
                : "This order has been cancelled."}
            </p>
            <Link
              to="/home"
              className="px-6 py-3 font-bold text-white bg-brand hover:bg-brand transition-colors shadow-sm rounded-xl inline-block"
            >
              Browse Again
            </Link>
          </motion.div>
        ) : (
          <>
            {/* â”€â”€ Delivery Status Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full border rounded-2xl p-4 mb-6 flex justify-between items-center ${
                  displayType === "food"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-brand-50 border-brand-muted"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      displayType === "food"
                        ? "bg-white text-orange-500 shadow-sm border border-orange-100"
                        : "bg-white text-brand shadow-sm border border-brand-50"
                    }`}
                  >
                    {order.status === "delivering" ? (
                      <Truck className={`w-6 h-6 animate-pulse`} />
                    ) : (
                      <Clock className={`w-6 h-6`} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        displayType === "food"
                          ? "text-orange-600"
                          : "text-brand"
                      }`}
                    >
                      {order.status === "delivering"
                        ? "Estimated Delivery"
                        : "Status"}
                    </p>
                    <p className="text-slate-900 font-black text-xl">
                      {deliveryInfo.text}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">
                    {deliveryInfo.subtext}
                  </p>
                </div>
              </motion.div>
            )}

            {/* â”€â”€ Order Summary Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-5 sm:p-6 mb-6 border border-slate-200 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Order image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                  <img
                    src={details?.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs text-slate-500 font-mono font-medium">
                      {type === "food" || type === "vending" || type === "cart"
                        ? type.toUpperCase()
                        : "ORDER"}{" "}
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        displayType === "food"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-brand-50 text-brand"
                      }`}
                    >
                      {type === "food"
                        ? "ðŸ• Food"
                        : type === "vending"
                        ? "ðŸ¤– Vending"
                        : "ðŸ“¦ Item"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 line-clamp-2 text-sm sm:text-base">
                    {details?.title}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {new Date(order.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {order.total_price > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-brand font-black text-lg sm:text-xl">
                      â‚¹{order.total_price?.toLocaleString()}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-1 ${
                        order.payment_status === "verifying"
                          ? "text-orange-500"
                          : order.payment_status === "paid"
                          ? "text-emerald-500"
                          : "text-slate-500"
                      }`}
                    >
                      {order.payment_status === "verifying"
                        ? "ðŸŸ¡ Verifying Payment..."
                        : order.payment_status === "paid"
                        ? "ðŸ’³ Paid Online âœ“"
                        : "ðŸ’µ Pay on Delivery"}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Delivery To
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {details?.hostel}
                  </p>
                  {((details as any)?.roomInfo ||
                    (!order.delivery_room?.includes("[ITEMS:") &&
                      !order.delivery_room?.includes("[CUSTOM FOOD ORDER]") &&
                      order.delivery_room)) && (
                    <p className="text-xs font-medium text-slate-500">
                      Room {(details as any)?.roomInfo || order.delivery_room}
                    </p>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] text-brand font-bold uppercase mb-1 tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> Delivery Partner
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Virat (Owner)
                  </p>
                  <a
                    href="tel:9466166750"
                    className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5 hover:text-brand transition-colors w-max"
                  >
                    <div className="bg-slate-200/50 p-1 rounded-full">
                      <Phone className="w-3 h-3" />
                    </div>
                    9466166750
                  </a>
                </div>
              </div>

              {/* Food items list (for food, vending, and cart orders) */}
              {(type === "food" || type === "vending" || type === "cart") &&
                details?.items && (
                  <div
                    className={`mt-3 rounded-xl p-4 border ${
                      displayType === "food"
                        ? "bg-orange-50 border-orange-100"
                        : "bg-emerald-50 border-emerald-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${
                        displayType === "food"
                          ? "text-orange-600/70"
                          : "text-emerald-700/70"
                      }`}
                    >
                      Items Ordered
                    </p>
                    {details.items
                      .split("\n")
                      .map((line: string) => line.trim())
                      .filter(
                        (line: string) =>
                          !!line && !line.includes("[SAFETY:Disclaimer")
                      )
                      .map((line: string, i: number) => {
                        let price = "";
                        const priceMatch = line.match(/\(â‚¹([\d,]+)\)/);
                        if (priceMatch) {
                          price = `â‚¹${priceMatch[1]}`;
                        }

                        let name = line;
                        if (line.includes("[IMG:")) {
                          name = line.split("[IMG:")[0];
                        } else if (priceMatch) {
                          name = line.replace(priceMatch[0], "");
                        }

                        name = name
                          .trim()
                          .replace(/\(\s*\)$/, "")
                          .trim();

                        return (
                          <div
                            key={i}
                            className="flex justify-between items-start gap-3 mb-2 last:mb-0"
                          >
                            <p className="text-sm text-slate-800 font-medium flex items-start gap-2 flex-1 min-w-0">
                              <span
                                className={`${
                                  displayType === "food"
                                    ? "text-orange-400"
                                    : "text-emerald-500"
                                } mt-0.5`}
                              >
                                â€¢
                              </span>
                              <span className="truncate whitespace-normal leading-snug">
                                {name}
                              </span>
                            </p>
                            {price && (
                              <p className="text-sm font-black text-slate-900 flex-shrink-0">
                                {price}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    {details.notes && (
                      <p
                        className={`text-xs text-slate-500 font-medium mt-3 pt-3 border-t ${
                          displayType === "food"
                            ? "border-orange-200/50"
                            : "border-emerald-200/50"
                        }`}
                      >
                        <span className="font-bold text-slate-600">Notes:</span>{" "}
                        {details.notes}
                      </p>
                    )}
                  </div>
                )}
            </motion.div>

            {/* â”€â”€ Progress Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              data-section="timeline"
              className="bg-white rounded-3xl p-5 sm:p-6 mb-6 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-lg text-slate-900">
                  Delivery Progress
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-brand">
                    {progressPercent}%
                  </div>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        displayType === "food" ? "bg-orange-500" : "bg-brand"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Background line */}
                <div className="absolute left-[21px] top-5 bottom-5 w-0.5 bg-slate-200" />
                {/* Active line progress */}
                <motion.div
                  className={`absolute left-[21px] top-5 w-0.5 ${
                    displayType === "food" ? "bg-orange-500" : "bg-brand"
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                <div className="space-y-6">
                  {steps.map((step, i) => {
                    const isDone = i < currentStepIndex;
                    const isActive = i === currentStepIndex;
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-start gap-5 relative"
                      >
                        <div
                          className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ring-4 ring-white ${
                            isDone
                              ? displayType === "food"
                                ? "bg-orange-500 text-white"
                                : "bg-brand text-white"
                              : isActive
                              ? displayType === "food"
                                ? "bg-orange-100 text-orange-600 border-2 border-orange-500"
                                : "bg-brand-50 text-brand border-2 border-brand"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <step.icon className={`w-5 h-5 flex-shrink-0`} />
                          )}
                        </div>
                        <div className="flex-1 pt-1.5 pb-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <p
                              className={`font-bold text-sm transition-colors duration-300 ${
                                isActive
                                  ? displayType === "food"
                                    ? "text-orange-600"
                                    : "text-brand"
                                  : isDone
                                  ? "text-slate-900"
                                  : "text-slate-500"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isActive && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${
                                  displayType === "food"
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-brand-50 text-brand"
                                }`}
                              >
                                Now
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                              isDone || isActive
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* â”€â”€ Cancel Order Action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {order &&
              !isCompleted &&
              !isRejected &&
              order.status === "pending" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex justify-center"
                >
                  <button
                    onClick={handleHiddenCancel}
                    className="px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" /> Cancel Order
                  </button>
                </motion.div>
              )}

            {/* â”€â”€ Thank You Overlay Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AnimatePresence>
              {showThankYou && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
                  onClick={() => setShowThankYou(false)}
                >
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                      mass: 0.8,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl relative overflow-hidden"
                    style={{ minHeight: "55vh", maxHeight: "70vh" }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setShowThankYou(false)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {/* Celebration background */}
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-50 to-transparent" />

                    {/* Content */}
                    <div className="relative flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center h-full">
                      {/* Animated checkmark circle */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.2,
                        }}
                        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200/50"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.4,
                          }}
                        >
                          <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </motion.div>
                      </motion.div>

                      {/* Confetti emojis */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl mb-2"
                      >
                        ðŸŽ‰
                      </motion.div>

                      {/* Title */}
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="text-2xl font-black text-slate-900 mb-3"
                      >
                        Thank You for Your Order!
                      </motion.h2>

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="space-y-2 mb-8"
                      >
                        <p className="text-slate-600 font-medium">
                          Thank you for waiting.
                        </p>
                        <p className="text-slate-600 font-medium">
                          Your order has been successfully delivered.
                        </p>
                        <p className="text-slate-500 text-sm mt-3">
                          We hope you enjoy your{" "}
                          {type === "food" ? "meal" : "purchase"} from{" "}
                          <span className="font-bold text-brand">
                            CU Bazzar
                          </span>
                          .
                        </p>
                      </motion.div>

                      {/* Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                        className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
                      >
                        <Link
                          to="/home"
                          onClick={() => setShowThankYou(false)}
                          className="flex-1 px-6 py-3.5 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:shadow-lg transition-all text-center"
                        >
                          Continue Shopping
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setShowThankYou(false)}
                          className="flex-1 px-6 py-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all text-center"
                        >
                          View Orders
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
