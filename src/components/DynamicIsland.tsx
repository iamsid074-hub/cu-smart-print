import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingCart, Truck, Zap, ChevronRight, CheckCircle, Package, Utensils, MapPin, ShoppingBag } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════════════
   DYNAMIC ISLAND v2 — Smart Priority System
   ─────────────────────────────────────────────────
   P1 🔴 Delivery tracking, Cart changes, Order placed
   P2 🟡 (reserved for future: messages, price drops)
   P3 🟢 Flash sale, logo (idle content)
   
   Higher priority ALWAYS interrupts lower priority.
   Auto-dismiss timers return to next-highest priority.
   ═══════════════════════════════════════════════════════════════════ */

type IslandView = "default" | "search" | "cart" | "delivery" | "flash" | "context";
type ActiveOrder = { id: string; status: string; delivery_location: string; delivery_room: string | null; total_price: number; title: string };

// Notification that can appear in the compact pill
interface IslandNotification {
    id: string;
    priority: 1 | 2 | 3;
    type: "cart-add" | "cart-remove" | "order-placed" | "delivery" | "flash" | "logo";
    label: string;
    icon: "cart" | "truck" | "zap" | "check" | "package" | "logo";
    color: string;         // accent color for glow
    expiresAt: number;     // timestamp when this auto-dismisses (0 = never)
}

// Extremely wavy/liquid spring physics for morph animation
const spring = { type: "spring" as const, stiffness: 350, damping: 24, mass: 1.2 };

// Flash sale config
const FLASH_SALE = {
    active: false,
    title: "Buy 1 Pen (₹10) → Get 1 Free",
    originalPrice: 20,
    salePrice: 15,
    discount: "₹10 Pen + ₹5 Pen FREE!",
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    link: "/product/ce-pen-10",
};

export default function DynamicIsland({ onExpandChange }: { onExpandChange?: (expanded: boolean) => void }) {
    const [view, setView] = useState<IslandView>("default");
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const islandRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItems, totalItems: cartCount, totalPrice: cartTotal, removeItem, lastAction } = useCart();
    const { user } = useAuth();

    // ─── PAGE CONTEXT ───
    const getPageContext = () => {
        const p = location.pathname;
        if (p === '/food') return { id: 'food', title: '🍔 CU Food Menu', subtitle: 'Order from campus restaurants', icon: Utensils, actions: [{ label: 'Browse Menu', link: '/food' }, { label: 'View Cart', link: '/cart' }] };
        if (p === '/sell' || p === '/list') return { id: 'sell', title: '📦 Sell Your Item', subtitle: 'List in 30 seconds, earn cash', icon: Package, actions: [{ label: 'Quick Sell', link: '/list' }, { label: 'My Listings', link: '/profile' }] };
        if (p === '/tracking') return { id: 'tracking', title: '📍 Track Orders', subtitle: 'See all your orders', icon: MapPin, actions: [{ label: 'Active Orders', link: '/tracking' }, { label: 'Past Orders', link: '/profile' }] };
        if (p === '/browse') return { id: 'browse', title: '🛍️ Browse Products', subtitle: 'Find what you need', icon: Search, actions: [{ label: 'Filters', link: '/browse' }, { label: 'Sort', link: '/browse' }] };
        if (p === '/groceries') return { id: 'groceries', title: '🛒 Grocery & Essentials', subtitle: '30 min delivery', icon: ShoppingBag, actions: [{ label: 'Dairy', link: '/groceries' }, { label: 'Snacks', link: '/groceries' }, { label: 'Beverages', link: '/groceries' }] };
        if (p === '/cart') return { id: 'cart_page', title: '🛒 Shopping Cart', subtitle: 'Ready to checkout', icon: ShoppingCart, actions: [{ label: 'Checkout', link: '/cart' }, { label: 'Continue Shopping', link: '/browse' }] };
        return null;
    };
    const pageContext = getPageContext();

    // ─── Active order tracking ───
    const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
    const [justDelivered, setJustDelivered] = useState(false);

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
                setJustDelivered(false);
            } else {
                // If we HAD an active order and now don't, it was delivered
                if (activeOrder) {
                    setJustDelivered(true);
                    setTimeout(() => setJustDelivered(false), 10000);
                }
                setActiveOrder(null);
            }
        };
        fetchActive();
        const ch = supabase.channel("di_orders").on("postgres_changes", {
            event: "*", schema: "public", table: "orders",
        }, () => fetchActive()).subscribe();
        return () => { supabase.removeChannel(ch); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // ═══════════════════════════════════════════════════════════════
    //  PRIORITY-BASED NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════

    const [notifications, setNotifications] = useState<IslandNotification[]>([]);
    const [activeNotif, setActiveNotif] = useState<IslandNotification | null>(null);
    const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track rapid cart additions
    const rapidAddRef = useRef<{ count: number; totalPrice: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, totalPrice: 0, timer: null });
    const lastProcessedActionRef = useRef<number>(0);

    // Push a notification into the queue
    const pushNotification = useCallback((notif: Omit<IslandNotification, "id">) => {
        const newNotif: IslandNotification = { ...notif, id: `${notif.type}-${Date.now()}` };

        setNotifications(prev => {
            // Remove existing notifications of same type
            const filtered = prev.filter(n => n.type !== notif.type);
            // Add new and sort by priority (lower number = higher priority)
            return [...filtered, newNotif].sort((a, b) => a.priority - b.priority);
        });
    }, []);

    // Determine what to show — highest priority notification
    useEffect(() => {
        if (notifications.length === 0) {
            setActiveNotif(null);
            return;
        }
        const top = notifications[0]; // Already sorted by priority
        setActiveNotif(top);

        // Set auto-dismiss timer if notification has an expiry
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        if (top.expiresAt > 0) {
            const remaining = top.expiresAt - Date.now();
            if (remaining <= 0) {
                // Already expired, remove it
                setNotifications(prev => prev.filter(n => n.id !== top.id));
            } else {
                dismissTimerRef.current = setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== top.id));
                }, remaining);
            }
        }

        return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
    }, [notifications]);

    // ─── React to CART changes (P1) ───
    useEffect(() => {
        if (!lastAction || lastAction.timestamp <= lastProcessedActionRef.current) return;
        lastProcessedActionRef.current = lastAction.timestamp;

        if (lastAction.type === "add") {
            // Rapid addition detection
            const rapid = rapidAddRef.current;
            rapid.count++;
            rapid.totalPrice += (lastAction.itemPrice || 0);

            if (rapid.timer) clearTimeout(rapid.timer);

            // Wait 500ms to see if more items are added rapidly
            rapid.timer = setTimeout(() => {
                const label = rapid.count > 1
                    ? `🛒 ${rapid.count} Items Added · ₹${rapid.totalPrice}`
                    : `🛒 ${lastAction.itemTitle || "Item"} Added · ₹${lastAction.itemPrice || 0}`;

                pushNotification({
                    priority: 1,
                    type: "cart-add",
                    label,
                    icon: "cart",
                    color: "#FF6B6B",
                    expiresAt: Date.now() + 3000, // Brief flash, then persistent cart-summary takes over
                });

                // Reset rapid counter
                rapid.count = 0;
                rapid.totalPrice = 0;
                rapid.timer = null;
            }, 500);
        } else if (lastAction.type === "remove") {
            pushNotification({
                priority: 1,
                type: "cart-remove",
                label: `🛒 ${lastAction.itemTitle || "Item"} Removed`,
                icon: "cart",
                color: "#FF6B6B",
                expiresAt: Date.now() + 3000,
            });
        } else if (lastAction.type === "clear") {
            pushNotification({
                priority: 1,
                type: "cart-remove",
                label: "🛒 Cart Cleared",
                icon: "cart",
                color: "#FF6B6B",
                expiresAt: Date.now() + 3000,
            });
        }

        try { navigator.vibrate?.(15); } catch { /* ignore */ }
    }, [lastAction, pushNotification]);

    // ─── Persistent cart summary (stays as long as cart has items) ───
    useEffect(() => {
        if (cartCount > 0) {
            pushNotification({
                priority: 2, // P2: below brief P1 add/remove flashes, but above P3 flash sale
                type: "cart-add" as any, // reuse type — won't conflict since persistent uses different id pattern
                label: `🛒 ${cartCount} item${cartCount !== 1 ? "s" : ""} in cart · ₹${cartTotal}`,
                icon: "cart",
                color: "#FF6B6B",
                expiresAt: 0, // Never auto-dismiss — persistent while cart has items
            });
        } else {
            // Cart is empty — remove persistent cart notification
            setNotifications(prev => prev.filter(n => !(n.priority === 2 && n.icon === "cart")));
        }
    }, [cartCount, cartTotal, pushNotification]);

    // ─── React to DELIVERY status (P1, persistent) ───
    useEffect(() => {
        if (activeOrder) {
            const statusText: Record<string, string> = {
                pending: "📦 Order Placed", seller_accepted: "✅ Order Confirmed",
                confirmed: "👨‍🍳 Preparing…", picked: "📦 Picked Up", delivering: "🚚 On the way!",
            };
            pushNotification({
                priority: 1,
                type: "delivery",
                label: statusText[activeOrder.status] || "📦 Processing…",
                icon: "truck",
                color: "#30D158",
                expiresAt: 0, // Never auto-dismiss — persistent while delivery active
            });
        } else if (justDelivered) {
            pushNotification({
                priority: 1,
                type: "delivery",
                label: "✅ Order Delivered!",
                icon: "check",
                color: "#30D158",
                expiresAt: Date.now() + 10000,
            });
        } else {
            // Remove delivery notification if no active order
            setNotifications(prev => prev.filter(n => n.type !== "delivery"));
        }
    }, [activeOrder, justDelivered, pushNotification]);

    // ─── Flash sale as P3 idle content ───
    const [idleMode, setIdleMode] = useState<"logo" | "flash">("logo");
    useEffect(() => {
        if (!FLASH_SALE.active) return;
        const id = setInterval(() => {
            setIdleMode(prev => prev === "logo" ? "flash" : "logo");
        }, 8000);
        return () => clearInterval(id);
    }, []);

    // ─── Event handlers ───
    const close = useCallback(() => { setView("default"); setQuery(""); }, []);
    const open = useCallback((v: IslandView) => { setView(v); try { navigator.vibrate?.(10); } catch { /* ignore */ } }, []);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        const outside = (e: MouseEvent) => {
            if (islandRef.current && !islandRef.current.contains(e.target as Node)) close();
        };
        document.addEventListener("keydown", esc);
        document.addEventListener("mousedown", outside);
        return () => { document.removeEventListener("keydown", esc); document.removeEventListener("mousedown", outside); };
    }, [close]);

    useEffect(() => {
        if (view === "search") setTimeout(() => inputRef.current?.focus(), 200);
    }, [view]);

    const handleSearch = () => {
        if (query.trim()) { navigate(`/browse?q=${encodeURIComponent(query.trim())}`); close(); }
    };

    const handleCollapsedClick = () => {
        // Click behavior based on what's currently showing
        if (activeNotif) {
            if (activeNotif.type === "delivery" && activeOrder) { open("delivery"); return; }
            if (activeNotif.type === "cart-add" || activeNotif.type === "cart-remove") { open("cart"); return; }
        }
        if (activeNotif?.type === "delivery") { open("delivery"); return; }
        if (pageContext && !activeNotif) { open("context"); return; }
        if (idleMode === "flash" && !activeNotif && FLASH_SALE.active && !pageContext) { open("flash"); return; }
        if (cartCount > 0 && !activeNotif) { open("cart"); return; }
        open("search");
    };

    const statusLabel: Record<string, string> = {
        pending: "Order Placed", seller_accepted: "Confirmed",
        confirmed: "Preparing", picked: "Picked Up", delivering: "On the way!",
    };
    const statusEmoji: Record<string, string> = {
        pending: "📦", seller_accepted: "✅", confirmed: "👨‍🍳", picked: "📦", delivering: "🚚",
    };

    // Determine pill appearance
    const isDropdownOpen = view === "cart" || view === "delivery" || view === "flash" || view === "context";
    const isSearchOpen = view === "search";
    const isExpanded = isDropdownOpen || isSearchOpen;

    // What compact content to show
    const showingNotif = !isExpanded && activeNotif;
    const showingIdle = !isExpanded && !activeNotif;

    // The pill is "wide" when it's NOT in compact default logo/flash mode
    // This includes: search, dropdown, notification, and page context
    const isPillWide = isExpanded || !!showingNotif || (showingIdle && !!pageContext);

    // Notify parent when wide state changes (for navbar icon swap)
    useEffect(() => {
        onExpandChange?.(isPillWide);
    }, [isPillWide, onExpandChange]);

    // Glow animation based on content
    const getAnimation = () => {
        if (isExpanded) return "none";
        if (activeNotif?.color === "#FF6B6B") return "diCartPulse 1.5s ease-in-out 1";
        if (activeNotif?.color === "#30D158") return "diDeliveryBreathe 3s ease-in-out infinite";
        if (showingIdle && idleMode === "flash") return "diFlash 2s ease-in-out infinite";
        return "diBreathe 4s ease-in-out infinite";
    };

    // Pill width
    const getPillWidth = () => {
        if (isSearchOpen) return "min(420px, calc(100vw - 120px))";
        if (showingNotif) return "min(280px, calc(100vw - 120px))";
        if (showingIdle && pageContext) return "min(220px, calc(100vw - 160px))";
        if (showingIdle && idleMode === "flash" && !pageContext) return "min(250px, calc(100vw - 160px))";
        return 150;
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
        @keyframes diCartPulse {
          0% { box-shadow: 0 0 0 0.5px rgba(255,107,107,0.1), 0 2px 10px rgba(0,0,0,0.5); }
          20% { box-shadow: 0 0 0 2px rgba(255,107,107,0.4), 0 2px 14px rgba(0,0,0,0.4), 0 0 25px rgba(255,107,107,0.25); }
          40% { box-shadow: 0 0 0 1px rgba(255,107,107,0.2), 0 2px 12px rgba(0,0,0,0.5), 0 0 15px rgba(255,107,107,0.1); }
          100% { box-shadow: 0 0 0 0.5px rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.5); }
        }
        @keyframes diDeliveryBreathe {
          0%,100% { box-shadow: 0 0 0 0.5px rgba(48,209,88,0.15), 0 2px 10px rgba(0,0,0,0.5), 0 0 15px rgba(48,209,88,0.08); }
          50% { box-shadow: 0 0 0 1px rgba(48,209,88,0.3), 0 2px 14px rgba(0,0,0,0.4), 0 0 25px rgba(48,209,88,0.15); }
        }
        @keyframes greenPulse {
          0%,100% { opacity: 1; box-shadow: 0 0 4px #30D158; }
          50% { opacity: 0.6; box-shadow: 0 0 8px #30D158; }
        }
        @keyframes notifSlideIn {
          0% { transform: translateY(-2px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

            {/* Wrapper reserves space in the navbar for the top pill. It doesn't constrict the absolute child. */}
            <motion.div ref={islandRef} layout transition={spring} style={{ position: "relative", height: 40, width: getPillWidth(), flexShrink: 0, zIndex: 100 }}>

                {/* ═══ THE MORPHING ISLAND (Absolutely positioned within wrapper) ═══ */}
                <motion.div
                    layout
                    animate={{
                        width: isDropdownOpen ? "min(360px, calc(100vw - 32px))" : getPillWidth(),
                        height: isDropdownOpen ? "auto" : 40,
                        borderRadius: isDropdownOpen ? 32 : 50,
                    }}
                    transition={spring}
                    onClick={() => { if (!isExpanded) handleCollapsedClick(); }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        cursor: isExpanded ? "default" : "pointer",
                        background: "rgba(0, 0, 0, 0.94)",
                        backdropFilter: "blur(40px) saturate(180%)",
                        WebkitBackdropFilter: "blur(40px) saturate(180%)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                        animation: getAnimation(),
                        boxShadow: isExpanded
                            ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.1)"
                            : undefined,
                        border: "0.5px solid rgba(255,255,255,0.06)",
                        transformOrigin: "top left",
                    }}
                >
                    {/* TOP HEADER ROW: Always 40px tall, holds the normal pill content. Fades out when expanded (unless search). */}
                    >
                    <AnimatePresence mode="wait">
                        {isSearchOpen ? (
                            /* ─── SEARCH (inline in pill) ─── */
                            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.08 }}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 6px 0 12px", height: "100%", width: "100%" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", flexShrink: 0, animation: "greenPulse 2s ease-in-out infinite" }} />
                                <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: "0 4px 0 10px", height: 30, border: "1px solid rgba(255,255,255,0.06)", minWidth: 0 }}>
                                    <Search style={{ width: 12, height: 12, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                                    <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                        placeholder="Search products..."
                                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, padding: "0 6px", fontFamily: "inherit", minWidth: 0 }} />
                                    {query && (
                                        <button onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus(); }}
                                            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                            <X style={{ width: 10, height: 10, color: "rgba(255,255,255,0.6)" }} />
                                        </button>
                                    )}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                                    style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: query.trim() ? "#FF6B6B" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
                                    <Search style={{ width: 13, height: 13, color: query.trim() ? "#fff" : "rgba(255,255,255,0.4)" }} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); close(); }}
                                    style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                    <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                                </button>
                            </motion.div>
                        ) : showingNotif ? (
                            /* ─── PRIORITY NOTIFICATION (P1/P2 active) ─── */
                            <motion.div
                                key={`notif-${activeNotif!.id}`}
                                initial={{ opacity: 0, scale: 0.85, y: -2 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 14px", height: "100%", width: "100%" }}
                            >
                                {/* Colored indicator dot */}
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: activeNotif!.color, flexShrink: 0, boxShadow: `0 0 6px ${activeNotif!.color}` }} />

                                {/* Icon */}
                                {activeNotif!.icon === "cart" && <ShoppingCart style={{ width: 14, height: 14, color: activeNotif!.color, flexShrink: 0 }} />}
                                {activeNotif!.icon === "truck" && <Truck style={{ width: 14, height: 14, color: activeNotif!.color, flexShrink: 0 }} />}
                                {activeNotif!.icon === "check" && <CheckCircle style={{ width: 14, height: 14, color: activeNotif!.color, flexShrink: 0 }} />}
                                {activeNotif!.icon === "package" && <Package style={{ width: 14, height: 14, color: activeNotif!.color, flexShrink: 0 }} />}

                                {/* Label */}
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                                    {activeNotif!.label}
                                </span>

                                <ChevronRight style={{ width: 12, height: 12, color: `${activeNotif!.color}66`, marginLeft: "auto", flexShrink: 0 }} />
                            </motion.div>
                        ) : (
                            /* ─── IDLE STATE (logo ↔ flash sale cycling OR PAGE CONTEXT) ─── */
                            <motion.div
                                key={`idle-${pageContext ? pageContext.id : idleMode}`}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.18 }}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 14px", height: "100%", width: "100%" }}
                            >
                                {pageContext ? (
                                    <>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4DB8AC", flexShrink: 0, animation: "greenPulse 2s ease-in-out infinite" }} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{pageContext.title}</span>
                                        <ChevronRight style={{ width: 12, height: 12, color: "rgba(255,255,255,0.4)", marginLeft: "auto", flexShrink: 0 }} />
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", flexShrink: 0, animation: "greenPulse 2s ease-in-out infinite" }} />

                                        {idleMode === "logo" && (
                                            <>
                                                <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                                                    <img src="/logo.png" alt="CU" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", display: "flex", gap: 4 }}>
                                                    <span style={{ color: "#FF6B6B" }}>CU</span>
                                                    <span style={{ color: "#fff" }}>BAZZAR</span>
                                                </span>
                                            </>
                                        )}
                                        {idleMode === "flash" && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
                                                <Zap style={{ width: 13, height: 13, color: "#FFD60A", fill: "#FFD60A", flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFD60A", whiteSpace: "nowrap" }}>
                                                    Flash Sale · {FLASH_SALE.discount}
                                                </span>
                                                <ChevronRight style={{ width: 12, height: 12, color: "rgba(255,200,0,0.4)", marginLeft: "auto", flexShrink: 0 }} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ═══ DROPDOWN CONTENT ROW: Morphs open underneath ═══ */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(4px)" }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                width: "100%",
                                overflow: "hidden",
                                paddingBottom: view === "context" ? 12 : 16,
                            }}
                        >
                            {view === "cart" && (
                                /* ═══ CART PREVIEW ═══ */
                                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <ShoppingCart style={{ width: 14, height: 14, color: "#FF6B6B" }} />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Cart · ₹{cartTotal}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); close(); }}
                                            style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                                        </button>
                                    </div>
                                    <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                                        {cartItems.slice(0, 5).map((item) => (
                                            <div key={item.id} style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                                            }}>
                                                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.title} {item.quantity > 1 ? `×${item.quantity}` : ""}
                                                </span>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginLeft: 10, flexShrink: 0 }}>₹{item.price * item.quantity}</span>
                                                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 8, padding: 2, flexShrink: 0 }}>
                                                    <X style={{ width: 11, height: 11, color: "rgba(255,255,255,0.3)" }} />
                                                </button>
                                            </div>
                                        ))}
                                        {cartItems.length > 5 && (
                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 6 }}>
                                                +{cartItems.length - 5} more items
                                            </span>
                                        )}
                                        {cartItems.length === 0 && (
                                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 16 }}>
                                                Cart is empty
                                            </span>
                                        )}
                                    </div>
                                    {cartItems.length > 0 && (
                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                            <Link to="/cart" onClick={() => close()}
                                                style={{ flex: 1, padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                                                View Cart
                                            </Link>
                                            <Link to="/cart" onClick={() => close()}
                                                style={{ flex: 1, padding: "9px 12px", borderRadius: 12, background: "#FF6B6B", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none", boxShadow: "0 2px 10px rgba(255,107,107,0.3)" }}>
                                                Checkout Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {view === "delivery" && activeOrder && (
                                /* ═══ DELIVERY TRACKING ═══ */
                                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Truck style={{ width: 14, height: 14, color: "#30D158" }} />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                                                {activeOrder.status === "delivering" ? "On the way!" : statusLabel[activeOrder.status] || "Processing"}
                                            </span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); close(); }}
                                            style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                                        </button>
                                    </div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                                        "{activeOrder.title}" is {activeOrder.status === "delivering" ? "on the way" : "being processed"}
                                    </div>
                                    {/* Status progress bar */}
                                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                        {["pending", "confirmed", "picked", "delivering"].map((s, i) => {
                                            const orderIdx = ["pending", "seller_accepted", "confirmed", "picked", "delivering"].indexOf(activeOrder.status);
                                            const done = orderIdx >= (i === 0 ? 0 : i + 1);
                                            return (
                                                <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                                                    <div style={{
                                                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                                                        background: done ? "#30D158" : "rgba(255,255,255,0.1)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 9, color: "#fff",
                                                    }}>{done ? "✓" : ""}</div>
                                                    {i < 3 && <div style={{ flex: 1, height: 2, borderRadius: 1, background: done ? "#30D158" : "rgba(255,255,255,0.1)" }} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                                        📍 {activeOrder.delivery_location?.replace(/\[.*?\]/g, "").trim()}{activeOrder.delivery_room && !activeOrder.delivery_room.includes("[") ? `, Room ${activeOrder.delivery_room}` : ""}
                                    </div>
                                    <Link to={`/tracking?order=${activeOrder.id}`} onClick={() => close()}
                                        style={{ padding: "9px 12px", borderRadius: 12, background: "rgba(48,209,88,0.15)", border: "1px solid rgba(48,209,88,0.3)", color: "#30D158", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                                        Track Delivery
                                    </Link>
                                </div>
                            )}

                            {view === "flash" && (
                                /* ═══ FLASH SALE ═══ */
                                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Zap style={{ width: 14, height: 14, color: "#FFD60A", fill: "#FFD60A" }} />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "#FFD60A" }}>⚡ Flash Sale</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); close(); }}
                                            style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                                        </button>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{FLASH_SALE.title}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>₹{FLASH_SALE.originalPrice}</span>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: "#FF6B6B" }}>₹{FLASH_SALE.salePrice}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,214,10,0.15)", color: "#FFD60A", padding: "2px 8px", borderRadius: 6 }}>{FLASH_SALE.discount}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Ends in</div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: "#FFD60A", fontVariantNumeric: "tabular-nums" }}>{saleTimeLeft}</div>
                                        </div>
                                    </div>
                                    <Link to={FLASH_SALE.link} onClick={() => close()}
                                        style={{ padding: "10px 14px", borderRadius: 12, background: "linear-gradient(135deg, #FF6B6B, #FF3366)", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", boxShadow: "0 2px 12px rgba(255,107,107,0.3)" }}>
                                        Grab Deal Now 🔥
                                    </Link>
                                </div>
                            )}

                            {view === "context" && pageContext && (
                                /* ═══ PAGE CONTEXT DROPDOWN ═══ */
                                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <pageContext.icon style={{ width: 14, height: 14, color: "#4DB8AC" }} />
                                            {/* eslint-disable-next-line no-control-regex */}
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pageContext.title.replace(/^[\u0000-\u26FF]+\s?/, '')}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); close(); navigate(-1); }}
                                            style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                            <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)" }} />
                                        </button>
                                    </div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: -4 }}>
                                        {pageContext.subtitle}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                                        {pageContext.actions.map((act, i) => (
                                            <Link key={i} to={act.link} onClick={() => close()}
                                                style={{ flex: 1, padding: "9px 12px", borderRadius: 12, background: i === 0 ? "#4DB8AC" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none", minWidth: "100px", boxShadow: i === 0 ? "0 2px 10px rgba(77,184,172,0.3)" : "none" }}>
                                                {act.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div >
        </>
    );
}
