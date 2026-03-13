import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, ShoppingBag, Tag } from "lucide-react";

// Fluid, bouncy spring animation mimicking Apple's Dynamic Island
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 1.2,
};

type IslandState = "default" | "browsing" | "explore" | "cart" | "profile" | "added" | "updated" | "grocery" | "sell";

interface TopDynamicIslandProps {
  onSell?: () => void;
}

export default function TopDynamicIsland({ onSell }: TopDynamicIslandProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();

  const [islandState, setIslandState] = useState<IslandState>("default");
  const [prevItemsCount, setPrevItemsCount] = useState(items.reduce((acc, item) => acc + item.quantity, 0));
  const [latestAddedItem, setLatestAddedItem] = useState<{ name: string, price: number } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to set state and auto-dismiss after 2 seconds
  const triggerState = (newState: IslandState, data?: { name: string, price: number }) => {
    if (data) setLatestAddedItem(data);
    setIslandState(newState);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // "explore" state persists as long as you're on /browse — no auto-dismiss
    if (newState !== "explore") {
      timeoutRef.current = setTimeout(() => {
        if (location.pathname.startsWith("/browse")) {
          setIslandState("explore");
        } else {
          setIslandState("default");
        }
      }, 2000);
    }
  };

  useEffect(() => {
    if (location.pathname.startsWith("/food")) {
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
    } else if (location.pathname === "/cart") {
      triggerState("cart");
    } else if (location.pathname === "/profile") {
      triggerState("profile");
    } else {
      setIslandState("default");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [location.pathname]);

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
    if (islandState === "added" || islandState === "updated" || islandState === "cart") {
      navigate("/cart");
    }
  };

  let width: number | string = 160;
  let height = 40;
  let content = null;

  switch (islandState) {
    case "browsing":
      width = 220;
      content = <span className="text-sm font-medium tracking-wide">Browsing Food Shops</span>;
      break;

    case "explore":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-white/90">Browsing Items</span>
        </div>
      );
      break;

    case "grocery":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-white/90">Grocery</span>
        </div>
      );
      break;

    case "sell":
      width = 160;
      content = (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-white/90">Sell Item</span>
        </div>
      );
      break;

    case "cart":
      width = 160;
      content = <span className="text-sm font-medium tracking-wide">Opening Cart</span>;
      break;
    case "profile":
      width = 170;
      content = <span className="text-sm font-medium tracking-wide">Viewing Profile</span>;
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
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Added to Cart</span>
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
          <span className="text-sm font-medium tracking-wide">Cart Updated</span>
        </div>
      );
      break;
    default:
      width = 160;
      content = <span className="text-[15px] font-bold tracking-widest text-white uppercase">CU Bazzar</span>;
      break;
  }

  return (
    <>
      <div
        className="w-full flex justify-center fixed top-4 sm:top-6 z-[100] pointer-events-none"
      >
        <AnimatePresence mode="popLayout">

          {/* ── Main Pill ── */}
          <motion.div
            layout
            initial={false}
            animate={{ width, height }}
            transition={springTransition}
            onClick={handleIslandClick}
            className={`pointer-events-auto flex items-center justify-center overflow-hidden flex-shrink-0 ${(islandState === "added" || islandState === "updated" || islandState === "cart") ? "cursor-pointer hover:bg-zinc-900 transition-colors" : ""}`}
            style={{
              background: "#000",
              borderRadius: 50,
              animation: "diGlow 4s ease-in-out infinite",
              position: "relative",
              zIndex: 100,
              willChange: "transform, width",
            }}
          >
            {/* Green camera indicator dot */}
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                width: 6, height: 6, borderRadius: "50%",
                background: "#30D158",
                boxShadow: "0 0 8px rgba(48,209,88,0.9)",
                zIndex: 10,
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={islandState}
                initial={{ opacity: 0, y: 4, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.93 }}
                transition={{ duration: 0.16, ease: "easeInOut" }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", height: "100%",
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
      </div>
    </>
  );
}
