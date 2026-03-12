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
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
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
      width = 60;
      content = null;
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
        @keyframes diGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.07) inset; }
          50%       { box-shadow: 0 4px 24px rgba(0,0,0,0.6),  0 0 0 0.5px rgba(255,255,255,0.12) inset; }
        }
      `}</style>

      <div
        className="w-full flex justify-center fixed top-4 sm:top-6 z-[100] pointer-events-none"
        style={{ gap: 8 }}
      >
        <AnimatePresence mode="popLayout">
          {/* Secondary Left Pill (Browsing Items) - slides out when entering Explore */}
          {islandState === "explore" && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={springTransition}
              className="flex items-center gap-2 px-4 shadow-lg pointer-events-none flex-shrink-0"
              style={{
                height: 40,
                background: "#000",
                borderRadius: 50,
                boxShadow: "0 4px 20px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.07) inset",
                color: "#fff",
                position: "relative",
                zIndex: 90, // below main island so it looks like it slides from behind
              }}
            >
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
              <motion.button
                onClick={(e) => { e.stopPropagation(); onSell?.(); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-1 flex items-center gap-1.5 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B, #ff3366)",
                  border: "none",
                  borderRadius: 20,
                  padding: "4px 10px",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(255,107,107,0.45)",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                <Tag style={{ width: 10, height: 10 }} />
                Sell
              </motion.button>
            </motion.div>
          )}

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
              zIndex: 100, // main island stays on top
            }}
          >
            {/* Green camera indicator dot — shown when not exploring */}
            {islandState !== "explore" && (
              <motion.div
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#30D158",
                  boxShadow: "0 0 8px rgba(48,209,88,0.9)",
                  zIndex: 10,
                }}
              />
            )}

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
                  paddingLeft: 16,
                  paddingRight: islandState !== "explore" ? 28 : 16,
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
