import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  ShoppingBag,
  Tag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Home as HomeIcon,
  XCircle,
  Wallet,
  Search,
  User,
} from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    navigator.vibrate?.(10);
  }
};

// Fluid, bouncy spring animation mimicking Apple's Dynamic Island
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 1.2,
};

type IslandState =
  | "default"
  | "browsing"
  | "explore"
  | "cart"
  | "profile"
  | "wallet"
  | "added"
  | "updated"
  | "grocery"
  | "sell"
  | "tracking"
  | "active_cart";

// ── Tracking status configuration ───────────────────────────────────────────
const TRACKING_STATUSES: Record<
  string,
  { label: string; icon: typeof Package; color: string; stepIndex: number }
> = {
  pending: {
    label: "Order Placed",
    icon: Package,
    color: "#F59E0B",
    stepIndex: 0,
  },
  seller_accepted: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "#10B981",
    stepIndex: 1,
  },
  confirmed: {
    label: "Preparing",
    icon: Clock,
    color: "#3B82F6",
    stepIndex: 2,
  },
  picked: { label: "Picked Up", icon: Package, color: "#8B5CF6", stepIndex: 3 },
  delivering: {
    label: "Out for Delivery",
    icon: Truck,
    color: "#10B981",
    stepIndex: 4,
  },
  completed: {
    label: "Delivered!",
    icon: HomeIcon,
    color: "#10B981",
    stepIndex: 5,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "#EF4444",
    stepIndex: -1,
  },
  seller_rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "#EF4444",
    stepIndex: -1,
  },
};

const STEP_KEYS = ["pending", "confirmed", "picked", "delivering", "completed"];

interface TopDynamicIslandProps {
  onSell?: () => void;
}

const TopDynamicIsland = memo(({ onSell }: TopDynamicIslandProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const { user } = useAuth();

  const [islandState, setIslandState] = useState<IslandState>("default");
  const [prevItemsCount, setPrevItemsCount] = useState(
    items.reduce((acc, item) => acc + item.quantity, 0)
  );
  const [latestAddedItem, setLatestAddedItem] = useState<{
    name: string;
    price: number;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Tracking state ──────────────────────────────────────────────────────
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [prevTrackingStatus, setPrevTrackingStatus] = useState<string | null>(
    null
  );
  const [statusAnimating, setStatusAnimating] = useState(false);

  // Helper to set state and auto-dismiss after 2 seconds
  const triggerState = (
    newState: IslandState,
    data?: { name: string; price: number }
  ) => {
    if (data) setLatestAddedItem(data);
    setIslandState(newState);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // "explore", "tracking", "grocery", "sell", "wallet" states persist — no auto-dismiss
    if (
      newState !== "explore" &&
      newState !== "tracking" &&
      newState !== "grocery" &&
      newState !== "sell" &&
      newState !== "wallet"
    ) {
      timeoutRef.current = setTimeout(() => {
        if (location.pathname.startsWith("/browse")) {
          setIslandState("explore");
        } else if (location.pathname.startsWith("/tracking")) {
          setIslandState("tracking");
        } else if (location.pathname.startsWith("/grocery")) {
          setIslandState("grocery");
        } else if (
          location.pathname.startsWith("/sell") ||
          location.pathname.startsWith("/list")
        ) {
          setIslandState("sell");
        } else if (location.pathname.startsWith("/wallet")) {
          setIslandState("wallet");
        } else {
          setIslandState("default");
        }
      }, 2000);
    }
  };

  // ── Route-based state switching ─────────────────────────────────────────
  useEffect(() => {
    if (location.pathname.startsWith("/tracking")) {
      setIslandState("tracking");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname.startsWith("/food")) {
      triggerState("browsing");
    } else if (location.pathname.startsWith("/browse")) {
      setIslandState("explore");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname.startsWith("/grocery")) {
      setIslandState("grocery");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname.startsWith("/list")) {
      setIslandState("sell");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname.startsWith("/wallet")) {
      setIslandState("wallet");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname === "/cart") {
      triggerState("cart");
    } else if (location.pathname === "/profile") {
      triggerState("profile");
    } else {
      setIslandState("default");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [location.pathname]);

  // ── Fetch tracking order & subscribe to real-time updates ───────────────
  const fetchTrackingOrder = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order");

    let query = supabase
      .from("orders")
      .select(
        "id, status, delivery_location, delivery_room, total_price, created_at, products(title, image_url)"
      );

    if (orderId) {
      query = query.eq("id", orderId);
    } else {
      query = query
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    const { data } = await query.single();
    if (data) {
      setTrackingOrder(data);
    }
  }, [user, location.search]);

  useEffect(() => {
    if (!location.pathname.startsWith("/tracking")) return;
    fetchTrackingOrder();
  }, [location.pathname, fetchTrackingOrder]);

  // Real-time subscription for tracking order
  useEffect(() => {
    if (!trackingOrder?.id || !location.pathname.startsWith("/tracking"))
      return;

    const channel = supabase
      .channel(`top_di_tracking_${trackingOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${trackingOrder.id}`,
        },
        (payload) => {
          setTrackingOrder((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    // Polling fallback every 15s
    const pollInterval = setInterval(fetchTrackingOrder, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [trackingOrder?.id, location.pathname, fetchTrackingOrder]);

  // Detect status changes for animation
  useEffect(() => {
    if (!trackingOrder) return;
    if (prevTrackingStatus && prevTrackingStatus !== trackingOrder.status) {
      setStatusAnimating(true);
      setTimeout(() => setStatusAnimating(false), 1500);
    }
    setPrevTrackingStatus(trackingOrder.status);
  }, [trackingOrder?.status]);

  // ── Cart item tracking ──────────────────────────────────────────────────
  useEffect(() => {
    const currentCount = items.reduce((acc, item) => acc + item.quantity, 0);

    if (currentCount > prevItemsCount) {
      const added = items[items.length - 1];
      if (added) {
        triggerState("added", { name: added.title, price: added.price });
      } else {
        triggerState("updated");
      }
      setPrevItemsCount(currentCount);
    } else if (currentCount !== prevItemsCount) {
      setPrevItemsCount(currentCount);
    }
  }, [items, prevItemsCount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleIslandClick = () => {
    // Determine what the current visible state is for the click handler
    const currentCount = items.reduce((acc, item) => acc + item.quantity, 0);
    let effectiveState = islandState;
    if (
      currentCount > 0 &&
      ["default", "explore", "grocery", "sell", "wallet", "profile"].includes(islandState)
    ) {
      effectiveState = "active_cart";
    }

    if (
      effectiveState === "added" ||
      effectiveState === "updated" ||
      effectiveState === "cart" ||
      effectiveState === "active_cart"
    ) {
      navigate("/cart");
    } else if (effectiveState === "tracking") {
      navigate("/tracking");
    }
  };

  const pointerDownTimeRef = useRef<number>(0);

  const handlePointerDown = () => {
    pointerDownTimeRef.current = Date.now();
    triggerHaptic(ImpactStyle.Light);
  };

  const handlePointerUp = () => {
    const elapsed = Date.now() - pointerDownTimeRef.current;
    if (elapsed < 300) {
      // Tap (Navigate safely)
      triggerHaptic(ImpactStyle.Light);
      handleIslandClick();
    } else {
      // Long press (Expand widget logic / Navigate to active context)
      triggerHaptic(ImpactStyle.Medium);
      // If we are showing something like "added" and user long presses, route deeply
      navigate(trackingOrder && islandState !== "added" ? `/tracking?order=${trackingOrder.id}` : "/cart");
    }
  };

  // ── Tracking status helpers ─────────────────────────────────────────────
  const trackingStatus = trackingOrder
    ? TRACKING_STATUSES[trackingOrder.status] || TRACKING_STATUSES.pending
    : null;
  const isTrackingFailed =
    trackingOrder &&
    (trackingOrder.status === "cancelled" ||
      trackingOrder.status === "seller_rejected");
  const isTrackingDone = trackingOrder?.status === "completed";

  let width: number | string = 160;
  let height = 40;
  let content = null;
  const currentCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Automatically render the cart pill if there are items and we are currently in an 'idle' navigation state. 
  let displayState = islandState;
  if (
    currentCount > 0 &&
    ["default", "explore", "grocery", "sell", "wallet", "profile"].includes(islandState)
  ) {
    displayState = "active_cart";
  }

  switch (displayState) {
    case "browsing":
      width = 220;
      content = (
        <span className="text-sm font-medium tracking-wide">
          Browsing Food Shops
        </span>
      );
      break;

    case "explore":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-white/90">
            Browsing Items
          </span>
        </div>
      );
      break;

    case "grocery":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-white/90">
            Grocery
          </span>
        </div>
      );
      break;

    case "sell":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-white/90">
            Sell Item
          </span>
        </div>
      );
      break;

    case "cart":
      width = 160;
      content = (
        <span className="text-sm font-medium tracking-wide">Opening Cart</span>
      );
      break;
    case "profile":
      width = 170;
      content = (
        <span className="text-sm font-medium tracking-wide">
          Viewing Profile
        </span>
      );
      break;
    case "wallet":
      width = 140;
      content = (
        <div className="flex items-center justify-center gap-2">
          <Wallet className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold tracking-wide text-white/90">
            Wallet
          </span>
        </div>
      );
      break;
    case "active_cart":
      width = 280;
      height = 46;
      const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      content = (
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
             <div className="w-[30px] h-[30px] rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
             </div>
             <span className="text-[14px] font-bold text-white ml-2 tracking-wide">
                {currentCount} item{currentCount > 1 ? 's' : ''}
             </span>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-[15px] font-black text-white">
                ₹{totalAmount}
             </span>
             <div className="bg-white px-3.5 py-1.5 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                <span className="text-[11px] font-black text-black uppercase tracking-wider pt-0.5">VIEW</span>
             </div>
          </div>
        </div>
      );
      break;
    case "added":
      width = 300;
      height = 64;
      content = (
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Added to Cart
              </span>
              <span className="text-xs font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                {latestAddedItem?.name || "Item"}
              </span>
            </div>
          </div>
          <div className="font-mono text-sm font-bold text-white flex-shrink-0">
            ₹{latestAddedItem?.price || 0}
          </div>
        </div>
      );
      break;
    case "updated":
      width = 190;
      content = (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium tracking-wide">
            Cart Updated
          </span>
        </div>
      );
      break;

    case "tracking":
      width = trackingOrder ? 280 : 160;
      height = trackingOrder ? 48 : 40;
      if (trackingOrder && trackingStatus) {
        const StatusIcon = trackingStatus.icon;
        content = (
          <div className="flex items-center gap-2.5 w-full px-1">
            {/* Animated status icon */}
            <motion.div
              key={trackingOrder.status}
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex-shrink-0"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: `${trackingStatus.color}25` }}
              >
                <StatusIcon
                  className="w-4 h-4"
                  style={{ color: trackingStatus.color }}
                />
              </div>
            </motion.div>

            {/* Status text */}
            <div className="flex-1 min-w-0 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.span
                  key={trackingOrder.status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] font-bold text-white truncate leading-tight"
                >
                  {trackingStatus.label}
                </motion.span>
              </AnimatePresence>
              {trackingOrder.total_price > 0 && (
                <span className="text-[10px] font-medium text-white/40 leading-tight">
                  ₹{trackingOrder.total_price}
                </span>
              )}
            </div>

            {/* Mini step dots */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {STEP_KEYS.map((key, i) => {
                const currentIdx = trackingStatus.stepIndex;
                const isDone = currentIdx > i;
                const isActive = currentIdx === i;
                return (
                  <motion.div
                    key={key}
                    animate={{
                      scale: isActive ? 1.3 : 1,
                      backgroundColor: isDone
                        ? trackingStatus.color
                        : isActive
                        ? trackingStatus.color
                        : "rgba(255,255,255,0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: isActive ? 8 : 5,
                      height: 5,
                      borderRadius: 10,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      } else {
        content = (
          <span className="text-[15px] font-bold tracking-widest text-white uppercase">
            CU Bazzar
          </span>
        );
      }
      break;

    default:
      width = 160;
      content = (
        <span className="text-[15px] font-bold tracking-widest text-white uppercase">
          CU Bazzar
        </span>
      );
      break;
  }

  // ── Determine glow animation ────────────────────────────────────────────
  const getAnimation = () => {
    if (islandState === "tracking" && trackingOrder) {
      if (statusAnimating) return "diTrackingPulse 0.8s ease-out 1";
      if (trackingOrder.status === "delivering")
        return "diTrackingDelivery 2s ease-in-out infinite";
      return "diTrackingGlow 3s ease-in-out infinite";
    }
    return "diGlow 4s ease-in-out infinite";
  };

  return (
    <>
      {/* Tracking glow keyframes */}
      <style>{`
        @keyframes diTrackingGlow {
          0%, 100% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.15), 0 2px 12px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.08); }
          50% { box-shadow: 0 0 0 1px rgba(16,185,129,0.3), 0 2px 16px rgba(0,0,0,0.4), 0 0 30px rgba(16,185,129,0.15); }
        }
        @keyframes diTrackingDelivery {
          0%, 100% { box-shadow: 0 0 0 1px rgba(16,185,129,0.2), 0 2px 12px rgba(0,0,0,0.5), 0 0 25px rgba(16,185,129,0.12); }
          50% { box-shadow: 0 0 0 2px rgba(16,185,129,0.4), 0 2px 20px rgba(0,0,0,0.35), 0 0 40px rgba(16,185,129,0.22); }
        }
        @keyframes diTrackingPulse {
          0% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.2), 0 2px 12px rgba(0,0,0,0.5); transform: scale(1); }
          30% { box-shadow: 0 0 0 3px rgba(16,185,129,0.5), 0 2px 20px rgba(0,0,0,0.35), 0 0 40px rgba(16,185,129,0.3); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.15), 0 2px 12px rgba(0,0,0,0.5); transform: scale(1); }
        }
      `}</style>

      {/* Apple-style gradient glass blur background for the top header */}
      <div
        className="fixed top-0 left-0 right-0 h-[4.5rem] sm:h-20 z-[9998] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      />

      <div
        className="w-full flex justify-center fixed top-0 left-0 right-0 z-[9999] pointer-events-none px-4 pt-4 sm:pt-5"
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center gap-3 max-w-md w-full justify-center">
          {/* Relative wrapper for pill + dropdown alignment */}
          <div className="relative flex items-center justify-center gap-2">
            <AnimatePresence mode="popLayout">
              {/* ── Main Pill ── */}
              <motion.div
                layout
                initial={false}
                animate={{ width, height }}
                transition={springTransition}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className={`pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0 ${
                  islandState === "added" ||
                  islandState === "updated" ||
                  islandState === "cart" ||
                  islandState === "tracking"
                    ? "cursor-pointer hover:bg-zinc-900 transition-colors"
                    : ""
                }`}
                style={{
                  background: "#000",
                  borderRadius: 50,
                  animation: getAnimation(),
                  position: "relative",
                  zIndex: 100,
                  willChange: "transform, width",
                }}
              >
                {/* Green camera indicator dot */}
                <motion.div
                  animate={{
                    opacity: [0.55, 1, 0.55],
                    background:
                      islandState === "tracking" && trackingOrder
                        ? trackingStatus?.color || "#30D158"
                        : "#30D158",
                    boxShadow:
                      islandState === "tracking" && trackingOrder
                        ? `0 0 8px ${trackingStatus?.color || "#30D158"}`
                        : "0 0 8px rgba(48,209,88,0.9)",
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    zIndex: 10,
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={islandState + (trackingOrder?.status || "")}
                    initial={{ opacity: 0, y: 4, scale: 0.93 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.93 }}
                    transition={{ duration: 0.16, ease: "easeInOut" }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      paddingLeft: 28,
                      paddingRight: 16,
                      color: "#fff",
                    }}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* ── Liquid Splitting Secondary Pill for Background Orders ── */}
            <AnimatePresence>
              {trackingOrder && islandState !== "tracking" && !isTrackingDone && !isTrackingFailed && (
                <motion.div
                  layout
                  initial={{ width: 0, opacity: 0, scale: 0.5, marginLeft: -16 }}
                  animate={{ width: 40, opacity: 1, scale: 1, marginLeft: 0 }}
                  exit={{ width: 0, opacity: 0, scale: 0.5, marginLeft: -16 }}
                  transition={springTransition}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  className="pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:bg-zinc-900"
                  style={{
                    background: "#000",
                    height: 40, // consistent dot size
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                    zIndex: 100,
                  }}
                >
                  {trackingOrder.status === "delivering" ? (
                    <Truck size={16} color="#10B981" />
                  ) : trackingOrder.status === "picked" ? (
                    <Package size={16} color="#8B5CF6" />
                  ) : (
                    <div
                      className="rounded-full bg-emerald-500"
                      style={{
                        width: 8, height: 8,
                        animation: "greenPulse 2s infinite ease-in-out"
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Liquid Splitting Secondary Pill when Cart takes over Main Display ── */}
            <AnimatePresence>
              {!trackingOrder && currentCount > 0 && ["explore", "grocery", "sell", "wallet", "profile"].includes(islandState) && (
                <motion.div
                  layout
                  initial={{ width: 0, opacity: 0, scale: 0.5, marginLeft: -16 }}
                  animate={{ width: 40, opacity: 1, scale: 1, marginLeft: 0 }}
                  exit={{ width: 0, opacity: 0, scale: 0.5, marginLeft: -16 }}
                  transition={springTransition}
                  className="pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    background: "#000",
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                    zIndex: 100,
                  }}
                >
                  {islandState === "explore" ? <Search size={16} color="#3b82f6" /> :
                   islandState === "sell" ? <Tag size={16} color="#8b5cf6" /> :
                   islandState === "grocery" ? <ShoppingBag size={16} color="#10b981" /> :
                   islandState === "wallet" ? <Wallet size={16} color="#f59e0b" /> :
                   islandState === "profile" ? <User size={16} color="#ec4899" /> : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* close relative wrapper */}
        </div>
      </div>
    </>
  );
});

export default TopDynamicIsland;
