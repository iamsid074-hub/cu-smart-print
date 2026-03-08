import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, ShoppingBag } from "lucide-react";

// Fluid, bouncy spring animation mimicking Apple's Dynamic Island
const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1.2,
};

type IslandState = "default" | "browsing" | "cart" | "profile" | "added" | "updated";

export default function TopDynamicIsland() {
    const location = useLocation();
    const { items } = useCart();
    const [islandState, setIslandState] = useState<IslandState>("default");

    // Track previous cart state to detect "adds" vs "updates"
    const [prevItemsCount, setPrevItemsCount] = useState(items.reduce((acc, item) => acc + item.quantity, 0));
    const [latestAddedItem, setLatestAddedItem] = useState<{ name: string, price: number } | null>(null);

    // Route-based states
    useEffect(() => {
        // If we're currently showing a temporary state (like "added"), don't overwrite it immediately
        if (islandState === "added" || islandState === "updated") return;

        if (location.pathname.startsWith("/food")) {
            setIslandState("browsing");
        } else if (location.pathname === "/cart") {
            setIslandState("cart");
        } else if (location.pathname === "/profile") {
            setIslandState("profile");
        } else {
            setIslandState("default");
        }
    }, [location.pathname, islandState]);

    // Cart update states
    useEffect(() => {
        const currentCount = items.reduce((acc, item) => acc + item.quantity, 0);

        if (currentCount > prevItemsCount) {
            // Find the deeply added item to show it
            // For simplicity, just grab the last item or we assume the context will inform us
            const added = items[items.length - 1]; // Naive approach for demo
            if (added) {
                setLatestAddedItem({ name: added.title, price: added.price });
                setIslandState("added");
            } else {
                setIslandState("updated");
            }

            // Auto dismiss after 3 seconds
            const timer = setTimeout(() => {
                setIslandState("default"); // The route effect will catch it and map it to the right route next tick
                // Force a route re-check
                const path = window.location.pathname;
                if (path.startsWith("/food")) setIslandState("browsing");
                else if (path === "/cart") setIslandState("cart");
                else if (path === "/profile") setIslandState("profile");
                else setIslandState("default");
            }, 3000);

            setPrevItemsCount(currentCount);
            return () => clearTimeout(timer);
        } else if (currentCount !== prevItemsCount) {
            setPrevItemsCount(currentCount);
        }
    }, [items, prevItemsCount]);

    // Determine size and content based on state
    let width = 200;
    let height = 40;
    let content = null;

    switch (islandState) {
        case "browsing":
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
            content = <span className="text-[15px] font-bold tracking-widest text-[#F0C040] uppercase">CU Bazzar</span>;
            break;
    }

    return (
        <div className="w-full flex justify-center fixed top-4 sm:top-6 z-[100] pointer-events-none">
            <motion.div
                layout
                initial={false}
                animate={{ width, height }}
                transition={springTransition}
                className="pointer-events-auto flex items-center justify-center overflow-hidden"
                style={{
                    background: "#000",
                    borderRadius: 32,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
            >
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
    );
}
