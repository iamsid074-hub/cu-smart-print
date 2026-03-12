import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, ShoppingBag, Tag } from "lucide-react";
import { useRef } from "react";

// Fluid, bouncy spring animation mimicking Apple's Dynamic Island
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 1.2,
};

type IslandState = "default" | "browsing" | "explore" | "cart" | "profile" | "added" | "updated";

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
        // After dismissal, re-check location to stay "explore" if still browsing
        if (location.pathname.startsWith("/browse")) {
          setIslandState("explore");
        } else {
          setIslandState("default");
        }
      }, 2000);
    }
  };

  // Route-based events (only trigger once per navigation)
  useEffect(() => {
    if (location.pathname.startsWith("/food")) {
      triggerState("browsing");
    } else if (location.pathname.startsWith("/browse")) {
      // Always enter explore state on /browse — and keep it
      setIslandState("explore");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (location.pathname === "/cart") {
      triggerState("cart");
    } else if (location.pathname === "/profile") {
      triggerState("profile");
    } else {
      // Any other route: go default
      setIslandState("default");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Cart update events
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, prevItemsCount]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleIslandClick = () => {
    if (islandState === "added" || islandState === "updated" || islandState === "cart") {
      navigate("/cart");
    }
  };

  // Determine size and content based on state
  let width: number | string = 200;
  let height = 40;
  let content = null;

  switch (islandState) {
    case "browsing":
      width = 220;
      content = <span className="text-sm font-medium tracking-wide">Browsing Food Shops</span>;
      break;

    case "explore":
      // Wider pill to fit label + sell button
      width = "min(340px, calc(100vw - 32px))";
      height = 44;
      content = (
        <div className="flex items-center justify-between w-full px-1 gap-3">
          {/* Left: status label */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: "#30D158",
                boxShadow: "0 0 6px #30D158",
                animation: "islandPulse 2s ease-in-out infinite",
              }}
            />
            <span className="text-sm font-semibold tracking-wide text-white/90 whitespace-nowrap">
              Browsing Items
            </span>
          </div>

          {/* Right: sell button */}
          <motion.button
            onClick={e => { e.stopPropagation(); onSell?.(); }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #FF6B6B, #ff3366)",
              border: "none",
              borderRadius: 20,
              padding: "5px 12px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(255,107,107,0.45)",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            <Tag style={{ width: 11, height: 11 }} />
            Sell / List Item
          </motion.button>
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
      <style>{`
        @keyframes islandPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div className="w-full flex justify-center fixed top-4 sm:top-6 z-[100] pointer-events-none">
        <motion.div
          layout
          initial={false}
          animate={{ width, height }}
          transition={springTransition}
          onClick={handleIslandClick}
          className={`pointer-events-auto flex items-center justify-center overflow-hidden ${(islandState === "added" || islandState === "updated" || islandState === "cart") ? "cursor-pointer hover:bg-zinc-900 transition-colors" : ""}`}
          style={{
            background: "#000",
            borderRadius: 32,
            boxShadow: islandState === "explore"
              ? "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset, 0 0 18px rgba(255,107,107,0.08)"
              : "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "relative",
            padding: islandState === "explore" ? "0 10px" : undefined,
          }}
        >
          {/* iOS Style Green Indicator Dot — hidden in explore state (we have our own dot) */}
          {islandState !== "explore" && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10"
            />
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={islandState}
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex items-center justify-center w-full h-full px-4 text-white"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
