import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingCart, Truck, Zap, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════
   DYNAMIC ISLAND — CU Bazaar Marketplace
   States (priority order):
   1. Flash Sale (if active deal)
   2. Delivery Tracking (if order in transit)
   3. Cart Preview (if items in cart)
   4. Default: logo + search
   ═══════════════════════════════════════════════ */

type IslandView = "default" | "search" | "cart" | "delivery" | "flash";
type ActiveOrder = { id: string; status: string; delivery_location: string; delivery_room: string | null; total_price: number; title: string };

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

// Flash sale config – edit these to set a live deal
const FLASH_SALE = {
    active: true,
    title: "Spiral Notebook",
    originalPrice: 120,
    salePrice: 60,
    discount: "50% OFF",
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
    link: "/browse",
};

export default function DynamicIsland() {
    const [view, setView] = useState<IslandView>("default");
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const islandRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { items: cartItems, totalItems: cartCount, totalPrice: cartTotal, removeItem } = useCart();
    const { user } = useAuth();

    // ─── Active order tracking ───
    const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchActive = async () => {
            const { data } = await supabase
                .from("orders")
                .select("id, status, delivery_location, delivery_room, total_price, products(title)")
                .eq("buyer_id", user.id)
                .in("status", ["pending", "seller_accepted", "confirmed", "picked", "delivering"])
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setActiveOrder({
                    id: data.id, status: data.status,
                    delivery_location: data.delivery_location || "",
                    delivery_room: data.delivery_room,
                    total_price: data.total_price,
                    title: (data as any).products?.title || "Your order",
                });
            } else { setActiveOrder(null); }
        };
        fetchActive();
        // Real-time updates
        const ch = supabase.channel("di_orders").on("postgres_changes", {
            event: "*", schema: "public", table: "orders",
            filter: `buyer_id=eq.${user.id}`,
        }, () => fetchActive()).subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [user]);

    // ─── Flash sale timer ───
    const [saleTimeLeft, setSaleTimeLeft] = useState("");
    useEffect(() => {
        if (!FLASH_SALE.active) return;
        const tick = () => {
            const diff = FLASH_SALE.endsAt.getTime() - Date.now();
            if (diff <= 0) { setSaleTimeLeft("Ended"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setSaleTimeLeft(`${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // ─── Compact info text (cycles through available states) ───
    const [compactMode, setCompactMode] = useState<"logo" | "cart" | "delivery" | "flash">("logo");
    useEffect(() => {
        // Auto-cycle compact text every 5s
        const modes: typeof compactMode[] = ["logo"];
        if (FLASH_SALE.active) modes.push("flash");
        if (activeOrder) modes.push("delivery");
        if (cartCount > 0) modes.push("cart");
        if (modes.length <= 1) { setCompactMode("logo"); return; }
        let i = 0;
        const id = setInterval(() => {
            i = (i + 1) % modes.length;
            setCompactMode(modes[i]);
        }, 5000);
        return () => clearInterval(id);
    }, [cartCount, activeOrder, FLASH_SALE.active]);

    // ─── Event handlers ───
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        const outside = (e: MouseEvent) => {
            if (islandRef.current && !islandRef.current.contains(e.target as Node)) close();
        };
        document.addEventListener("keydown", esc);
        document.addEventListener("mousedown", outside);
        return () => { document.removeEventListener("keydown", esc); document.removeEventListener("mousedown", outside); };
    }, []);

    useEffect(() => {
        if (view === "search") setTimeout(() => inputRef.current?.focus(), 200);
    }, [view]);

    const close = useCallback(() => { setView("default"); setQuery(""); }, []);
    const open = useCallback((v: IslandView) => {
        setView(v);
        try { navigator.vibrate?.(10); } catch { }
    }, []);

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
            close();
        }
    };

    // Delivery status helpers
    const statusLabel: Record<string, string> = {
        pending: "Order Placed", seller_accepted: "Confirmed",
        confirmed: "Preparing", picked: "Picked Up", delivering: "On the way!",
    };
    const statusEmoji: Record<string, string> = {
        pending: "📦", seller_accepted: "✅", confirmed: "👨‍🍳",
        picked: "📦", delivering: "🚚",
    };

    // ─── Size logic ───
    const isExpanded = view !== "default";
    const getHeight = () => {
        if (view === "cart") return Math.min(42 + cartItems.length * 36 + 60, 280);
        if (view === "delivery") return 180;
        if (view === "flash") return 140;
        if (view === "search") return 48;
        return 40;
    };

    // ─── Click handler for collapsed state ───
    const handleCollapsedClick = () => {
        // Open the search by default, or open the relevant view based on compact mode
        if (compactMode === "cart" && cartCount > 0) open("cart");
        else if (compactMode === "delivery" && activeOrder) open("delivery");
        else if (compactMode === "flash" && FLASH_SALE.active) open("flash");
        else open("search");
    };

    return (
        <>
            <style>{`
        @keyframes diBreathe {
          0%,100% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.1), 0 2px 14px rgba(0,0,0,0.4), 0 0 18px rgba(255,107,107,0.05); }
        }
        @keyframes diFlash {
          0%,100% { box-shadow: 0 0 0 0.5px rgba(255,200,0,0.2), 0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,200,0,0.1); }
          50% { box-shadow: 0 0 0 1px rgba(255,200,0,0.35), 0 2px 14px rgba(0,0,0,0.4), 0 0 30px rgba(255,200,0,0.18); }
        }
        @keyframes greenPulse {
          0%,100% { opacity: 1; box-shadow: 0 0 4px #30D158; }
          50% { opacity: 0.6; box-shadow: 0 0 8px #30D158; }
        }
      `}</style>

            <motion.div
                ref={islandRef}
                layout
                animate={{
                    width: isExpanded ? "min(500px, calc(100vw - 110px))" : compactMode === "logo" ? 150 : "min(280px, calc(100vw - 140px))",
                    height: getHeight(),
                }}
                transition={spring}
                onClick={() => { if (!isExpanded) handleCollapsedClick(); }}
                style={{
                    cursor: isExpanded ? "default" : "pointer",
                    background: "rgba(0, 0, 0, 0.94)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    borderRadius: isExpanded && (view === "cart" || view === "delivery" || view === "flash") ? 22 : 50,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: isExpanded ? "flex-start" : "center",
                    justifyContent: "center",
                    userSelect: "none",
                    flexShrink: 0,
                    WebkitTapHighlightColor: "transparent",
                    animation: !isExpanded ? (compactMode === "flash" ? "diFlash 2s ease-in-out infinite" : "diBreathe 4s ease-in-out infinite") : "none",
                    boxShadow: isExpanded
                        ? "0 0 0 0.5px rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.6), 0 0 50px rgba(255,107,107,0.08)"
                        : undefined,
                    border: "0.5px solid rgba(255,255,255,0.06)",
                    transition: "border-radius 0.3s ease",
                }}
            >
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        /* ═══════════════════════════════════════
                           COLLAPSED — cycles through states
                           ═══════════════════════════════════════ */
                        <motion.div
                            key={`compact-${compactMode}`}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 7,
                                padding: "0 14px", height: "100%", width: "100%",
                            }}
                        >
                            {/* Green indicator light */}
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#30D158", flexShrink: 0,
                                animation: "greenPulse 2s ease-in-out infinite",
                            }} />

                            {compactMode === "logo" && (
                                <>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: "50%", overflow: "hidden",
                                        border: "1.5px solid rgba(255,255,255,0.1)", flexShrink: 0,
                                    }}>
                                        <img src="/logo.png" alt="CU" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", display: "flex", gap: 4 }}>
                                        <span style={{ color: "#FF6B6B" }}>CU</span>
                                        <span style={{ color: "#fff" }}>BAZZAR</span>
                                    </span>
                                </>
                            )}

                            {compactMode === "cart" && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                                    <ShoppingCart style={{ width: 14, height: 14, color: "#FF6B6B" }} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {cartCount} item{cartCount !== 1 ? "s" : ""} · ₹{cartTotal}
                                    </span>
                                    <ChevronRight style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto", flexShrink: 0 }} />
                                </div>
                            )}

                            {compactMode === "delivery" && activeOrder && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                                    <span style={{ fontSize: 13 }}>{statusEmoji[activeOrder.status] || "📦"}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {activeOrder.status === "delivering" ? "Delivering..." : statusLabel[activeOrder.status] || "Processing..."}
                                    </span>
                                    <ChevronRight style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto", flexShrink: 0 }} />
                                </div>
                            )}

                            {compactMode === "flash" && (
                                <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
                                    <Zap style={{ width: 13, height: 13, color: "#FFD60A", fill: "#FFD60A" }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#FFD60A", whiteSpace: "nowrap" }}>
                                        Flash Sale · {FLASH_SALE.discount}
                                    </span>
                                    <ChevronRight style={{ width: 12, height: 12, color: "rgba(255,200,0,0.4)", marginLeft: "auto", flexShrink: 0 }} />
                                </div>
                            )}
                        </motion.div>
                    ) : view === "search" ? (
                        /* ═══ SEARCH ═══ */
                        <motion.div
                            key="search"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.08 }}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px 0 12px", height: "100%", width: "100%" }}
                        >
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", flexShrink: 0, animation: "greenPulse 2s ease-in-out infinite" }} />
                            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: "0 4px 0 10px", height: 32, border: "1px solid rgba(255,255,255,0.06)", minWidth: 0 }}>
                                <Search style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                                <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                    placeholder="Search products..."
                                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, padding: "0 6px", fontFamily: "inherit", minWidth: 0 }} />
                                {query && (
                                    <button onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus(); }}
                                        style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                        <X style={{ width: 11, height: 11, color: "rgba(255,255,255,0.6)" }} />
                                    </button>
                                )}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                                style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: query.trim() ? "#FF6B6B" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
                                <Search style={{ width: 14, height: 14, color: query.trim() ? "#fff" : "rgba(255,255,255,0.4)" }} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); close(); }}
                                style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                <X style={{ width: 13, height: 13, color: "rgba(255,255,255,0.5)" }} />
                            </button>
                        </motion.div>
                    ) : view === "cart" ? (
                        /* ═══ CART PREVIEW ═══ */
                        <motion.div
                            key="cart"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: "flex", flexDirection: "column", width: "100%", padding: "12px 14px", gap: 6 }}
                        >
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", animation: "greenPulse 2s ease-in-out infinite" }} />
                                    <ShoppingCart style={{ width: 14, height: 14, color: "#FF6B6B" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Cart · ₹{cartTotal}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                    <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
                                </button>
                            </div>

                            {/* Items */}
                            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                                {cartItems.slice(0, 5).map((item) => (
                                    <div key={item.id} style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    }}>
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.title} {item.quantity > 1 ? `×${item.quantity}` : ""}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginLeft: 8, flexShrink: 0 }}>₹{item.price * item.quantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                            style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 6, padding: 2, flexShrink: 0 }}>
                                            <X style={{ width: 10, height: 10, color: "rgba(255,255,255,0.3)" }} />
                                        </button>
                                    </div>
                                ))}
                                {cartItems.length > 5 && (
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 4 }}>
                                        +{cartItems.length - 5} more items
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                <Link to="/cart" onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ flex: 1, padding: "7px 10px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none", cursor: "pointer" }}>
                                    View Cart
                                </Link>
                                <Link to="/cart" onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ flex: 1, padding: "7px 10px", borderRadius: 10, background: "#FF6B6B", color: "#fff", fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(255,107,107,0.3)" }}>
                                    Checkout Now
                                </Link>
                            </div>
                        </motion.div>
                    ) : view === "delivery" && activeOrder ? (
                        /* ═══ DELIVERY TRACKING ═══ */
                        <motion.div
                            key="delivery"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: "flex", flexDirection: "column", width: "100%", padding: "12px 14px", gap: 8 }}
                        >
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", animation: "greenPulse 2s ease-in-out infinite" }} />
                                    <Truck style={{ width: 14, height: 14, color: "#30D158" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                                        {activeOrder.status === "delivering" ? "On the way!" : statusLabel[activeOrder.status] || "Processing"}
                                    </span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                    <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
                                </button>
                            </div>

                            {/* Order info */}
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                                <div style={{ fontWeight: 500 }}>"{activeOrder.title}" is {activeOrder.status === "delivering" ? "on the way" : "being processed"}</div>
                            </div>

                            {/* Status steps */}
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                {["pending", "confirmed", "picked", "delivering"].map((s, i) => {
                                    const orderIdx = ["pending", "seller_accepted", "confirmed", "picked", "delivering"].indexOf(activeOrder.status);
                                    const stepIdx = ["pending", "confirmed", "picked", "delivering"].indexOf(s);
                                    const done = orderIdx >= (i === 0 ? 0 : i + 1);
                                    const active = stepIdx <= orderIdx;
                                    return (
                                        <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                                            <div style={{
                                                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                                                background: done ? "#30D158" : active ? "rgba(48,209,88,0.3)" : "rgba(255,255,255,0.1)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 8, color: "#fff",
                                            }}>{done ? "✓" : active ? "●" : ""}</div>
                                            {i < 3 && <div style={{ flex: 1, height: 2, borderRadius: 1, background: done ? "#30D158" : "rgba(255,255,255,0.1)" }} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Location */}
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                📍 {activeOrder.delivery_location?.replace(/\[.*?\]/g, "").trim()}{activeOrder.delivery_room ? `, Room ${activeOrder.delivery_room}` : ""}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 6 }}>
                                <Link to={`/tracking?order=${activeOrder.id}`} onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ flex: 1, padding: "7px 10px", borderRadius: 10, background: "rgba(48,209,88,0.15)", border: "1px solid rgba(48,209,88,0.3)", color: "#30D158", fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                                    Track Delivery
                                </Link>
                            </div>
                        </motion.div>
                    ) : view === "flash" ? (
                        /* ═══ FLASH SALE ═══ */
                        <motion.div
                            key="flash"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: "flex", flexDirection: "column", width: "100%", padding: "12px 14px", gap: 8 }}
                        >
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Zap style={{ width: 14, height: 14, color: "#FFD60A", fill: "#FFD60A" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#FFD60A" }}>⚡ Flash Sale</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                    <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
                                </button>
                            </div>

                            {/* Deal details */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{FLASH_SALE.title}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>₹{FLASH_SALE.originalPrice}</span>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#FF6B6B" }}>₹{FLASH_SALE.salePrice}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,214,10,0.15)", color: "#FFD60A", padding: "2px 6px", borderRadius: 6 }}>{FLASH_SALE.discount}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Ends in</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD60A", fontVariantNumeric: "tabular-nums" }}>{saleTimeLeft}</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link to={FLASH_SALE.link} onClick={(e) => { e.stopPropagation(); close(); }}
                                style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(135deg, #FF6B6B, #FF3366)", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none", boxShadow: "0 2px 10px rgba(255,107,107,0.3)" }}>
                                Grab Deal Now 🔥
                            </Link>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
