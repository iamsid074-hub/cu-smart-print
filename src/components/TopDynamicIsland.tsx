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
  ShoppingCart,
  Bike,
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
  stiffness: 320,
  damping: 30,
  mass: 1,
};

type IslandState =
  | "default"
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

    // If we already have a tracked order ID, always fetch for that specific order
    const currentId = trackingOrder?.id;
    let query = supabase
      .from("orders")
      .select(
        "id, status, delivery_location, delivery_room, total_price, created_at, products(title, image_url)"
      );

    if (currentId) {
      query = query.eq("id", currentId);
    } else {
      // No tracked order yet — find a recent active order
      query = query
        .eq("buyer_id", user.id)
        .not("status", "in", '("completed","cancelled","seller_rejected")')
        .order("created_at", { ascending: false })
        .limit(1);
    }

    const { data } = await query.single();
    if (data) {
      setTrackingOrder(data);
    }
  }, [user, trackingOrder?.id]);

  useEffect(() => {
    fetchTrackingOrder();
  }, [fetchTrackingOrder]);

  // Real-time subscription for tracking order
  useEffect(() => {
    if (!trackingOrder?.id) return;

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
  }, [trackingOrder?.id, fetchTrackingOrder]);

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
    const hasActiveTracking = trackingOrder && !isTrackingDone && !isTrackingFailed;

    let effectiveState = islandState;
    if (
      hasActiveTracking &&
      ["default", "explore", "grocery", "sell", "wallet", "profile"].includes(islandState)
    ) {
      effectiveState = "tracking";
    } else if (
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
    } else if (effectiveState === "tracking" || hasActiveTracking) {
      navigate("/tracking" + (trackingOrder?.id ? `?order=${trackingOrder.id}` : ""));
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

  // Automatically render tracking or cart pill if in an 'idle' navigation state. 
  let displayState = islandState;
  
  if (
    trackingOrder && !isTrackingDone && !isTrackingFailed &&
    ["default", "explore", "grocery", "sell", "wallet", "profile"].includes(islandState)
  ) {
    displayState = "tracking";
  } else if (
    currentCount > 0 &&
    ["default", "explore", "grocery", "sell", "wallet", "profile"].includes(islandState)
  ) {
    displayState = "active_cart";
  }

  switch (displayState) {
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
        <span className="text-[13px] font-bold tracking-wider text-white/90 uppercase">Opening Cart</span>
      );
      break;
    case "profile":
      width = 170;
      content = (
        <span className="text-[13px] font-bold tracking-wider text-white/90 uppercase">
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
      height = 44;
      const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      content = (
        <div className="flex items-center justify-between w-full h-full pr-0.5">
          <div className="flex items-center gap-2.5 ml-1">
             <div className="relative">
               <ShoppingBag className="w-4.5 h-4.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
               <motion.div 
                 animate={{ opacity: [0.4, 0.8, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full"
               />
             </div>
             <div className="flex flex-col items-start leading-none">
                <span className="text-[13px] font-black text-white">
                   {currentCount}
                </span>
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-tighter">
                   ITEM{currentCount !== 1 ? 'S' : ''}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-[15px] font-black text-white tabular-nums">
                ₹{totalAmount}
             </span>
             <div 
               onClick={() => {
                 triggerHaptic(ImpactStyle.Light);
                 navigate("/cart");
               }}
               className="bg-zinc-800/80 hover:bg-zinc-700/80 px-4 py-2 rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-white/10 shadow-lg"
               style={{
                 backdropFilter: "blur(8px)",
                 WebkitBackdropFilter: "blur(8px)"
               }}
             >
                <span className="text-[10px] font-black text-white uppercase tracking-[0.15em] leading-none">VIEW</span>
             </div>
          </div>
        </div>
      );
      break;
    case "added":
      width = 300;
      height = 60;
      content = (
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start overflow-hidden pt-0.5">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Added
              </span>
              <span className="text-[13px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] leading-tight mt-0.5">
                {latestAddedItem?.name || "Item"}
              </span>
            </div>
          </div>
          <div className="font-black text-[15px] text-white flex-shrink-0 tracking-tight">
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
      width = trackingOrder ? 200 : 160;
      height = 40; // Default pill height for perfect vertical centering
      
      const stepIndex = trackingStatus?.stepIndex ?? 0;
      // Calculate realistic width progression (0% at pending to 100% at completed)
      const pct = Math.max(0, Math.min(100, (stepIndex / 4) * 100));

      if (trackingOrder && trackingStatus) {
        content = (
          <div className="flex flex-col w-full h-full justify-center px-1 relative"> 
            {/* The Pure Scooter Animation Track - Centered perfectly */}
            <div className="w-full flex items-center h-full">
               <div className="relative w-full h-full flex items-center mx-2 pl-1">
                 {/* Background Track Strip */}
                 <div className="absolute left-1 right-12 h-[2px] bg-white/10 rounded-full" />
                 
                 {/* Glowing Action Fill */}
                 <motion.div 
                   className="absolute left-1 h-[2px] rounded-full"
                   style={{ background: trackingStatus.color, boxShadow: `0 0 8px ${trackingStatus.color}` }}
                   initial={{ width: 0 }}
                   animate={{ width: `calc((100% - 52px) * (${pct} / 100))` }}
                   transition={{ type: "spring", stiffness: 45, damping: 14 }}
                 />

                 {/* Scooter Vehicle Bubble */}
                 <motion.div 
                   className="absolute z-10 flex items-center justify-center p-1 rounded-full"
                   style={{ 
                      background: trackingStatus.color, 
                      boxShadow: `0 2px 8px ${trackingStatus.color}60` 
                   }}
                   initial={{ left: 0 }}
                   animate={{ left: `calc(4px + (100% - 50px) * (${pct} / 100) - 9px)` }}
                   transition={{ type: "spring", stiffness: 45, damping: 14 }}
                 >
                   <motion.div
                     animate={stepIndex > 0 && stepIndex < 5 ? { y: [0, -1, 0], rotate: [0, -2, 2, 0] } : {}}
                     transition={{ repeat: Infinity, duration: 0.3 }}
                   >
                     {stepIndex < 0 ? (
                        <XCircle className="w-2.5 h-2.5 text-[#111]" />
                     ) : (
                        <Bike className="w-2.5 h-2.5 text-[#111]" />
                     )}
                   </motion.div>
                 </motion.div>
                 
                 {/* Right side: Compact "CART" Button */}
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                   <div
                     onPointerDown={(e) => e.stopPropagation()}
                     onPointerUp={(e) => { 
                       e.stopPropagation(); 
                       triggerHaptic(ImpactStyle.Light); 
                       navigate("/cart"); 
                     }}
                     className="cursor-pointer flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 transition-all rounded-lg px-2 py-1.5 border border-white/10 shadow-lg"
                     style={{
                       backdropFilter: "blur(8px)",
                       WebkitBackdropFilter: "blur(8px)"
                     }}
                   >
                     <span className="text-[10px] font-black text-white tracking-widest leading-none">CART</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        );
      } else {
        content = (
          <span className="text-[13px] font-black tracking-widest text-white/90 uppercase z-10 drop-shadow-md">
            CU BAZZAR
          </span>
        );
      }
      break;

    default:
      width = 160;
      content = (
        <span className="text-[13px] font-black tracking-widest text-white/90 uppercase z-10 drop-shadow-md">
          CU BAZZAR
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
      <style>{`
        @keyframes diGlow {
          0%, 100% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.1); }
        }
        @keyframes diTrackingGlow {
          0%, 100% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.15), 0 0 20px rgba(16,185,129,0.08); }
          50% { box-shadow: 0 0 0 1px rgba(16,185,129,0.3), 0 0 30px rgba(16,185,129,0.15); }
        }
        @keyframes diTrackingDelivery {
          0%, 100% { box-shadow: 0 0 0 1px rgba(16,185,129,0.2), 0 0 25px rgba(16,185,129,0.12); }
          50% { box-shadow: 0 0 0 2px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.22); }
        }
        @keyframes diTrackingPulse {
          0% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.2); transform: scale(1); }
          30% { box-shadow: 0 0 0 3px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0.5px rgba(16,185,129,0.2); transform: scale(1); }
        }
      `}</style>

      {/* Smart Glass Header - Enhanced with Mesh Blur Aura */}
      <motion.div
        initial={false}
        animate={{
          opacity: scrolled ? 1 : 0,
        }}
        className="fixed top-0 left-0 right-0 z-[9997] pointer-events-none overflow-hidden"
        style={{
          height: `calc(var(--sat,env(safe-area-inset-top,20px)) + 120px)`,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
        }}
      >
        {/* Mesh Blur Blobs - GPU Optimized for Mobile */}
        <motion.div
          animate={{
            x: scrolled ? [-80, 80, -80] : 0,
            y: [-15, 15, -15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500/15 rounded-full blur-[60px] sm:blur-[80px] will-change-transform"
          style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
        />
        <motion.div
          animate={{
            x: scrolled ? [80, -80, 80] : 0,
            y: [15, -15, 15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 right-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-purple-500/15 rounded-full blur-[80px] sm:blur-[100px] will-change-transform"
          style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
        />
        <motion.div
          animate={{
            scale: scrolled ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[100px] sm:blur-[120px] will-change-transform"
          style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
        />
      </motion.div>

      <div
        className="w-full flex justify-center fixed top-0 left-0 right-0 z-[9999] pointer-events-none px-4 pt-[calc(var(--sat,env(safe-area-inset-top,20px))+12px)] sm:pt-[calc(var(--sat,env(safe-area-inset-top,20px))+16px)]"
        style={{ willChange: "transform, width" }}
      >
        <div className="flex items-center gap-3 max-w-md w-full justify-center">
          {/* Shared Layout Wrapper for smooth separation */}
          <motion.div 
            layout 
            className="relative flex items-center justify-center gap-2"
            transition={springTransition}
          >
            <AnimatePresence mode="popLayout">


              {/* ── Main Pill ── */}
              <motion.div
                layout
                key="main-pill"
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
                  background: "rgba(15, 15, 15, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 50,
                  animation: getAnimation(),
                  position: "relative",
                  zIndex: 100,
                  willChange: "transform, width",
                }}
              >
                {/* Green camera indicator dot */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
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
                    background: "#30D158",
                    boxShadow: "0 0 8px rgba(48,209,88,0.9)",
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
                      paddingLeft: islandState === "tracking" ? 22 : 24,
                      paddingRight: islandState === "tracking" ? 2 : 10,
                      color: "#fff",
                    }}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* ── Secondary Navigation Pill ── */}
              {displayState === "tracking" && currentCount > 0 ? (
                <motion.div
                  layout
                  key="split-pill-tracking"
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -20 }}
                  transition={springTransition}
                  onPointerDown={(e) => { e.stopPropagation(); triggerHaptic(ImpactStyle.Light); }}
                  onPointerUp={(e) => { e.stopPropagation(); triggerHaptic(ImpactStyle.Light); navigate("/cart"); }}
                  className="pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:bg-zinc-900 shadow-xl"
                  style={{
                    background: "rgba(15, 15, 15, 0.98)",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    zIndex: 101,
                  }}
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                </motion.div>
              ) : displayState === "active_cart" && islandState !== "default" ? (
                <motion.div
                  layout
                  key="split-pill-context"
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -20 }}
                  transition={springTransition}
                  className="pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg"
                  style={{
                    background: "rgba(15, 15, 15, 0.98)",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    zIndex: 101,
                  }}
                >
                  {islandState === "explore" ? <Search size={16} color="#3b82f6" /> :
                   islandState === "sell" ? <Tag size={16} color="#8b5cf6" /> :
                   islandState === "grocery" ? <ShoppingBag size={16} color="#10b981" /> :
                   islandState === "wallet" ? <Wallet size={16} color="#f59e0b" /> :
                   islandState === "profile" ? <User size={16} color="#ec4899" /> : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
});

export default TopDynamicIsland;
