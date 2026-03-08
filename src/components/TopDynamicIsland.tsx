import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useRef } from "react";

// Fluid, bouncy spring animation mimicking Apple's Dynamic Island
const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1.2,
};

type IslandState = "default" | "browsing" | "explore" | "cart" | "profile" | "added" | "updated";

export default function TopDynamicIsland() {
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

        timeoutRef.current = setTimeout(() => {
            setIslandState("default");
        }, 2000);
    };

    // Route-based events (only trigger once per navigation)
    useEffect(() => {
        if (location.pathname.startsWith("/food")) {
            triggerState("browsing");
        } else if (location.pathname.startsWith("/browse")) {
            triggerState("explore");
        } else if (location.pathname === "/cart") {
            triggerState("cart");
        } else if (location.pathname === "/profile") {
            triggerState("profile");
        }
        // If they navigate home, it just does nothing and defaults to CU Bazzar naturally over time.
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
    }, [items, prevItemsCount]);

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleIslandClick = () => {
        if (islandState === "added" || islandState === "updated" || islandState === "cart") {
            navigate("/cart");
        }
    };

    // Determine size and content based on state
    let width = 200;
    let height = 40;
    let content = null;

    switch (islandState) {
        case "browsing":
            width = 200;
            content = <span className="text-sm font-medium tracking-wide">Browsing Food Shops</span>;
            break;
        case "explore":
            width = 180;
            content = <span className="text-sm font-medium tracking-wide">Browsing Items</span>;
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
            width = 140;
            content = <span className="text-[15px] font-bold tracking-widest text-white uppercase">CU Bazzar</span>;
            break;
    }

    return (
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
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    position: "relative",
                }}
            >
                {/* iOS Style Green Indicator Dot */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10"
                />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={islandState}
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="flex items-center justify-center w-full h-full pl-10 pr-4 text-white"
                    >
                        {content}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
