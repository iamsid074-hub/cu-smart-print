import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, ShoppingCart, Bell, Menu, X, Users,
    Trash2, CheckCircle, Truck, Home as HomeIcon, Clock, TrendingUp,
    AlertTriangle, ChevronRight, Loader2, Eye, RefreshCw, Shield,
    LogOut, Star, MapPin, Phone, User, Calendar, DollarSign,
    Activity, Box, ShoppingBag, Copy, AlertCircle, UtensilsCrossed, Filter, Wrench
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminSection = "dashboard" | "products" | "item_orders" | "food_orders" | "notifications";

interface Product {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    category: string;
    condition: string;
    status: string;
    created_at: string;
    seller_id: string;
    profiles?: { full_name: string; phone_number: string | null; hostel_block: string | null };
}

interface Order {
    id: string;
    product_id: string | null;
    buyer_id: string;
    seller_id: string;
    base_price: number;
    total_price: number;
    delivery_location: string;
    delivery_room: string | null;
    buyer_phone: string | null;
    status: string;
    payment_method?: string;
    payment_status?: string;
    razorpay_payment_id?: string;
    created_at: string;
    products?: { title: string; image_url: string | null; price: number; category: string | null; reason_for_selling: string | null } | null;
    buyer?: { full_name: string; phone_number: string | null; hostel_block: string | null };
    seller?: { full_name: string; phone_number: string | null; hostel_block: string | null };
}

interface AdminNotification {
    id: string;
    type: "new_product" | "new_order";
    payload: any;
    is_read: boolean;
    created_at: string;
}

interface Stats {
    totalProducts: number;
    activeOrders: number;
    totalUsers: number;
}

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: "Awaiting Seller", color: "text-yellow-400", bg: "bg-yellow-400/15", border: "border-yellow-400/30" },
    seller_accepted: { label: "Seller Confirmed", color: "text-neon-cyan", bg: "bg-cyan-400/15", border: "border-cyan-400/30" },
    seller_rejected: { label: "Seller Rejected", color: "text-red-400", bg: "bg-red-400/15", border: "border-red-400/30" },
    confirmed: { label: "Admin Accepted", color: "text-neon-blue", bg: "bg-blue-400/15", border: "border-blue-400/30" },
    picked: { label: "Picked Up", color: "text-purple-400", bg: "bg-purple-400/15", border: "border-purple-400/30" },
    delivering: { label: "Out for Delivery", color: "text-neon-orange", bg: "bg-orange-400/15", border: "border-orange-400/30" },
    completed: { label: "Delivered ✅", color: "text-green-400", bg: "bg-green-400/15", border: "border-green-400/30" },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/15", border: "border-red-400/30" },
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient, delay = 0 }: {
    icon: any; label: string; value: number | string; gradient: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all shadow-sm"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
        </motion.div>
    );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")} animate-pulse`} />
            {cfg.label}
        </span>
    );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: {
    message: string; onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-red-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-bold text-slate-900">Confirm Action</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                    >
                        Confirm Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Priority color helpers ─────────────────────────────────────────────────────
function getPriorityColor(status: string): { border: string; bg: string; dot: string; label: string } {
    switch (status) {
        case "pending":
            return { border: "border-red-500/40", bg: "bg-red-500/5", dot: "bg-red-500", label: "Urgent" };
        case "seller_accepted":
        case "confirmed":
        case "picked":
            return { border: "border-yellow-500/40", bg: "bg-yellow-500/5", dot: "bg-yellow-500", label: "Preparing" };
        case "delivering":
            return { border: "border-blue-500/40", bg: "bg-blue-500/5", dot: "bg-blue-500", label: "In Transit" };
        case "completed":
            return { border: "border-green-500/40", bg: "bg-green-500/5", dot: "bg-green-500", label: "Delivered" };
        case "cancelled":
        case "seller_rejected":
            return { border: "border-zinc-500/30", bg: "bg-zinc-500/5", dot: "bg-zinc-500", label: "Cancelled" };
        default:
            return { border: "border-slate-200", bg: "bg-white/5", dot: "bg-white", label: status };
    }
}

// ─── Dashboard Section (Fast Delivery Dashboard) ───────────────────────────────
function DashboardSection({ stats, recentProducts, recentOrders, loading, allOrders, onUpdateStatus, onVerifyUpi }: {
    stats: Stats; recentProducts: Product[]; recentOrders: Order[]; loading: boolean;
    allOrders: Order[]; onUpdateStatus: (id: string, status: string, timestamps?: Record<string, string>) => void; onVerifyUpi: (id: string) => void;
}) {
    const [dashFilter, setDashFilter] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");

    const dashFilters = [
        { id: "pending", label: "🔴 Pending", count: allOrders.filter(o => o.status === "pending").length },
        { id: "accepted", label: "🟡 Accepted", count: allOrders.filter(o => ["seller_accepted", "confirmed", "picked"].includes(o.status)).length },
        { id: "delivering", label: "🚀 Delivering", count: allOrders.filter(o => o.status === "delivering").length },
        { id: "completed", label: "✅ Completed", count: allOrders.filter(o => o.status === "completed").length },
        { id: "all", label: "All", count: allOrders.length },
    ];

    const filteredOrders = allOrders.filter(o => {
        // Status filter
        let statusMatch = true;
        switch (dashFilter) {
            case "pending": statusMatch = o.status === "pending"; break;
            case "accepted": statusMatch = ["seller_accepted", "confirmed", "picked"].includes(o.status); break;
            case "delivering": statusMatch = o.status === "delivering"; break;
            case "completed": statusMatch = o.status === "completed"; break;
            default: statusMatch = true;
        }
        // Search filter
        let searchMatch = true;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            searchMatch =
                o.id.toLowerCase().includes(q) ||
                (o.buyer?.full_name || "").toLowerCase().includes(q) ||
                (o.products?.title || "").toLowerCase().includes(q) ||
                (o.delivery_location || "").toLowerCase().includes(q);
        }
        return statusMatch && searchMatch;
    });

    const nextAction: Record<string, { label: string; status: string; icon: any; color: string; timestamps?: object } | null> = {
        pending: { label: "Accept Order", status: "confirmed", icon: CheckCircle, color: "bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        seller_accepted: { label: "Accept & Process", status: "confirmed", icon: CheckCircle, color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        confirmed: { label: "Picked ✓", status: "picked", icon: Package, color: "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30", timestamps: { picked_at: new Date().toISOString() } },
        picked: { label: "Out for Delivery 🚀", status: "delivering", icon: Truck, color: "bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30", timestamps: { out_for_delivery_at: new Date().toISOString() } },
        delivering: { label: "Mark Delivered ✅", status: "completed", icon: HomeIcon, color: "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30", timestamps: { delivered_at: new Date().toISOString() } },
        completed: null,
        cancelled: null,
        seller_rejected: { label: "Override & Accept", status: "confirmed", icon: CheckCircle, color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30", timestamps: { accepted_at: new Date().toISOString() } },
    };

    const copyPhone = (phone: string) => { navigator.clipboard.writeText(phone); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-neon-orange" /> Delivery Dashboard
                </h2>
                <p className="text-slate-900/70 text-sm">Real-time order management • {allOrders.filter(o => !["completed", "cancelled", "seller_rejected"].includes(o.status)).length} active orders</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={ShoppingCart} label="Active Orders" value={loading ? "—" : stats.activeOrders} gradient="from-red-500 to-orange-500" delay={0} />
                <StatCard icon={Package} label="Products" value={loading ? "—" : stats.totalProducts} gradient="from-neon-cyan to-neon-blue" delay={0.05} />
                <StatCard icon={Users} label="Users" value={loading ? "—" : stats.totalUsers} gradient="from-neon-blue to-neon-pink" delay={0.1} />
                <StatCard icon={TrendingUp} label="Completed Today" value={loading ? "—" : allOrders.filter(o => { const t = new Date(); t.setHours(0, 0, 0, 0); return o.status === "completed" && new Date(o.created_at) >= t; }).length} gradient="from-green-500 to-emerald-500" delay={0.15} />
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900/40" />
                    <input
                        type="text"
                        placeholder="Search order ID, customer..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white  border border-slate-200 text-sm text-slate-900 placeholder:text-slate-900/40 focus:outline-none focus:border-neon-orange/40 transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {dashFilters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setDashFilter(f.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${dashFilter === f.id ? "bg-neon-orange/20 text-neon-orange border border-neon-orange/30" : "bg-white/5 text-slate-900/70 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"}`}
                        >
                            {f.label}
                            {f.count > 0 && <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center px-1 ${dashFilter === f.id ? "bg-neon-orange text-slate-900" : "bg-white/10 text-slate-900/60"}`}>{f.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Cards */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neon-orange" /></div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white  rounded-2xl p-12 text-center border border-slate-200">
                    <ShoppingCart className="w-12 h-12 text-slate-900/30 mx-auto mb-3" />
                    <p className="text-slate-900/60 font-semibold">No orders match this filter</p>
                    <p className="text-slate-900/40 text-xs mt-1">Try a different filter or search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredOrders.map((order, i) => {
                        const priority = getPriorityColor(order.status);
                        const action = nextAction[order.status];
                        const isFood = isFoodOrder(order);
                        const details = parseOrderDetails(order);

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                className={`rounded-2xl border-l-4 ${priority.border} ${priority.bg} bg-white  overflow-hidden hover:bg-black/30 transition-all`}
                            >
                                {/* Card Header */}
                                <div className="p-3 sm:p-4 flex items-center gap-3 border-b border-slate-200">
                                    <div className={`w-2.5 h-2.5 rounded-full ${priority.dot} ${order.status === "pending" ? "animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" : ""} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-900/50 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                                            {isFood && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">FOOD</span>}
                                        </div>
                                        <p className="text-[11px] text-slate-900/40 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                {/* Card Body */}
                                <div className="p-3 sm:p-4 space-y-3">
                                    {/* Item + Price Row */}
                                    <div className="flex items-start gap-3">
                                        {order.products?.image_url && (
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-slate-200">
                                                <img src={order.products.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{isFood ? "Food/Cart Order" : (order.products?.title || "Custom Order")}</p>
                                            {details.items && (
                                                <div className="mt-1 space-y-0.5">
                                                    {details.items.split("\n").filter(Boolean).map((line, idx) => (
                                                        <p key={idx} className="text-xs text-slate-900/60">• {line.trim()}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-lg font-black text-neon-fire mt-1">₹{order.total_price.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Customer + Location */}
                                    <div className="bg-white rounded-xl p-2.5 border border-slate-200 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
                                            <span className="text-sm font-semibold text-slate-900 truncate">{order.buyer?.full_name || "Customer"}</span>
                                        </div>
                                        {(order.buyer_phone || order.buyer?.phone_number) && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-slate-900/40 flex-shrink-0" />
                                                <span className="text-xs text-slate-900/60">{order.buyer_phone || order.buyer?.phone_number}</span>
                                                <button onClick={() => copyPhone(order.buyer_phone || order.buyer?.phone_number || "")} className="p-0.5 rounded hover:bg-slate-100"><Copy className="w-3 h-3 text-slate-900/40" /></button>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3 h-3 text-slate-900/40 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs text-slate-900/60 break-words">{details.hostel}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-3 h-3 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-900/40 text-[10px]">🚪</span>
                                            <span className="text-xs text-brand font-black break-words uppercase">Room: {details.room || "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold ${order.payment_status === "verifying" ? "bg-orange-500/15 text-orange-400" : order.payment_status === "paid" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                                            {order.payment_status === "verifying" ? "🟡 Verify UTR" : order.payment_status === "paid" ? "💳 Paid" : "💵 Cash on Gate"}
                                        </span>
                                        {order.payment_status === "verifying" && (
                                            <button onClick={() => onVerifyUpi(order.id)} className="px-2.5 py-1 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all">
                                                <CheckCircle className="w-3 h-3" /> Verify UPI
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {action && (
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => onUpdateStatus(order.id, action.status, (action as any).timestamps)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${action.color}`}
                                            >
                                                <action.icon className="w-4 h-4" /> {action.label}
                                            </button>
                                            {order.status === "pending" && (
                                                <button onClick={() => onUpdateStatus(order.id, "cancelled")}
                                                    className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Products Section ──────────────────────────────────────────────────────────
function ProductsSection({ products, loading, onDelete }: {
    products: Product[]; loading: boolean; onDelete: (id: string, title: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between text-slate-900">
                <div>
                    <h2 className="text-2xl font-black mb-1">Product Management</h2>
                    <p className="text-slate-900/70 text-sm">{products.length} products listed on the platform</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
            ) : products.length === 0 ? (
                <div className="bg-white  rounded-2xl p-12 text-center border border-slate-200">
                    <Package className="w-12 h-12 text-slate-900/40 mx-auto mb-3" />
                    <p className="text-slate-900/70">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-white  rounded-2xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-all"
                        >
                            {/* Product Image */}
                            <div className="relative h-44 overflow-hidden bg-white/5">
                                <img
                                    src={product.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute top-3 left-3">
                                    <StatusBadge status={product.status} />
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white font-mono border border-white/10">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                    <p className="text-white font-black text-lg">₹{product.price.toLocaleString()}</p>
                                    {product.condition && (
                                        <span className="px-2 py-0.5 rounded bg-white/20 text-xs text-white font-medium">{product.condition}</span>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 leading-snug">{product.title}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neon-blue to-neon-cyan flex items-center justify-center flex-shrink-0">
                                        <User className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 truncate">{product.profiles?.full_name || "Unknown Seller"}</p>
                                        {product.profiles?.hostel_block && (
                                            <p className="text-xs text-slate-900/60 truncate">{product.profiles.hostel_block}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-900/60 mb-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(product.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => onDelete(product.id, product.title)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-all group/btn"
                                >
                                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    Delete Product
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Helper: detect food order ─────────────────────────────────────────────────
const NON_FOOD_KEYWORDS = ['practical file', 'notebook', 'register', 'pen', 'pencil', 'eraser', 'stapler', 'folder', 'chart', 'paper', 'assignment', 'lab manual', 'journal', 'project', 'file'];
function isFoodOrder(order: Order): boolean {
    // If product_id exists, it's a marketplace/listed item order
    if (order.product_id) return false;
    
    // If no product_id, it's a food/vending/grocery order from the cart/food menu
    // We check if the items list contains any non-food keywords
    const details = parseOrderDetails(order);
    const itemsText = details.items.toLowerCase();
    
    const hasNonFood = NON_FOOD_KEYWORDS.some(key => itemsText.includes(key));
    if (hasNonFood) return false;

    // Special case check for known categories
    if (itemsText.includes('(college essentials)') || itemsText.includes('(stationery)')) return false;

    return true;
}

// ─── Helper: parse order location/room cleanly ─────────────────────────────────
function parseOrderDetails(order: Order): { hostel: string; room: string; items: string; notes: string } {
    let hostel = (order.delivery_location || '').split(' - Floor')[0]; // Clean hostel block
    let room = '';
    let items = '';
    let notes = '';

    const rawRoom = order.delivery_room || '';

    // 1. Check for New Structured Format [ROOM:...] | [ITEMS:...]
    // Using greedy matching [\s\S]* to ensure it captures until the final closing bracket, avoiding early stops on [IMG:...] brackets
    const newFormatMatch = rawRoom.match(/\[ROOM:(.*?)\]\s*\|\s*\[ITEMS:([\s\S]*)\]/);
    if (newFormatMatch) {
        room = newFormatMatch[1].trim();
        items = newFormatMatch[2].trim();
    } 
    // 2. Vending Machine Parsing [VENDING MACHINE: Room XXX]
    else if (rawRoom.includes('[VENDING MACHINE:')) {
        const roomMatch = rawRoom.match(/\[VENDING MACHINE:\s*Room\s+(.+?)\]/);
        room = roomMatch ? roomMatch[1] : '';
        items = rawRoom.split(']\n')[1] || rawRoom;
    }
    // 3. Legacy Parsing
    else if (rawRoom.includes('[CUSTOM FOOD ORDER]')) {
        const cleaned = rawRoom.replace('[CUSTOM FOOD ORDER]\n', '').replace('[CUSTOM FOOD ORDER]', '');
        const parts = cleaned.split('\n---\n');
        items = parts[0] || '';
        notes = parts[1]?.replace('Notes: ', '') || '';
    } else if (rawRoom.includes('Room ')) {
        // Fallback for earlier "Room XXX" format
        const roomMatch = rawRoom.match(/Room\s+([^\s\]]+)/i);
        room = roomMatch ? roomMatch[1] : '';
        items = rawRoom.split('\n').slice(1).join('\n') || rawRoom;
    } else {
        items = rawRoom || 'N/A';
    }

    // Cleaning items for display if it's a single product marketplace order but showing in food section (unlikely but safe)
    if (!items && order.products?.title) {
        items = `1x ${order.products.title}`;
    }

    // Clean formatting and remove tags like [IMG:...], [SAFETY:...] and trailing categories globally
    items = items.split('\n')
        .map(line => line.trim())
        .filter(line => !!line && !line.includes('[SAFETY:Disclaimer'))
        .map(line => {
            let price = '';
            const priceMatch = line.match(/\(₹([\d,]+)\)/);
            if (priceMatch) {
                price = `₹${priceMatch[1]}`;
            }
            
            let name = line;
            if (line.includes('[IMG:')) {
                name = line.split('[IMG:')[0];
            } else if (priceMatch) {
                name = line.replace(priceMatch[0], '');
            }
            
            // Remove trailing empty parentheses or standalone (category) markers
            name = name.trim().replace(/\(\s*\)$/, '').trim();
            
            return price ? `${name} - ${price}` : name;
        })
        .join('\n');

    return { hostel, room, items, notes };
}

// ─── Filter Bar Component ──────────────────────────────────────────────────────
function FilterBar({ active, onChange }: { active: string; onChange: (f: string) => void }) {
    const filters = [
        { id: 'all', label: 'All' },
        { id: 'today', label: 'Today' },
        { id: 'pending', label: 'Pending' },
        { id: 'delivered', label: 'Delivered' },
        { id: 'cancelled', label: 'Cancelled' },
    ];
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map(f => (
                <button
                    key={f.id}
                    onClick={() => onChange(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${active === f.id ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/30' : 'bg-white/10 text-slate-900/80 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'}`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}

function applyFilter(orders: Order[], filter: string): Order[] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    switch (filter) {
        case 'today': return orders.filter(o => new Date(o.created_at) >= today);
        case 'pending': return orders.filter(o => ['pending', 'seller_accepted', 'confirmed', 'picked', 'delivering'].includes(o.status));
        case 'delivered': return orders.filter(o => o.status === 'completed');
        case 'cancelled': return orders.filter(o => ['cancelled', 'seller_rejected'].includes(o.status));
        default: return orders;
    }
}

// ─── Item Orders Section ────────────────────────────────────────────────────────
function ItemOrdersSection({ orders, loading, onUpdateStatus, onVerifyUpi }: {
    orders: Order[]; loading: boolean; onUpdateStatus: (id: string, status: string, timestamps?: Record<string, string>) => void; onVerifyUpi: (id: string) => void;
}) {
    const [filter, setFilter] = useState('all');
    const itemOrders = orders.filter(o => !isFoodOrder(o));
    const filtered = applyFilter(itemOrders, filter);

    const nextStatus: Record<string, { label: string; status: string; icon: any; color: string; timestamps?: object } | null> = {
        pending: { label: "Accept Order", status: "confirmed", icon: CheckCircle, color: "bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        seller_accepted: { label: "Accept & Pickup", status: "confirmed", icon: CheckCircle, color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        confirmed: { label: "Picked from Seller ✓", status: "picked", icon: Package, color: "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30", timestamps: { picked_at: new Date().toISOString() } },
        picked: { label: "Out for Delivery 🚀", status: "delivering", icon: Truck, color: "bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30", timestamps: { out_for_delivery_at: new Date().toISOString() } },
        delivering: { label: "Mark Delivered ✅", status: "completed", icon: HomeIcon, color: "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30", timestamps: { delivered_at: new Date().toISOString() } },
        completed: null, cancelled: null,
        seller_rejected: { label: "Override & Accept", status: "confirmed", icon: CheckCircle, color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30", timestamps: { accepted_at: new Date().toISOString() } },
    };

    const copyPhone = (phone: string) => { navigator.clipboard.writeText(phone); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
                <div>
                    <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-neon-cyan" /> Item Orders</h2>
                    <p className="text-slate-900/70 text-sm">{itemOrders.length} total • {itemOrders.filter(o => !['completed', 'cancelled', 'seller_rejected'].includes(o.status)).length} active</p>
                </div>
                <FilterBar active={filter} onChange={setFilter} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white  rounded-2xl p-12 text-center border border-slate-200">
                    <ShoppingCart className="w-12 h-12 text-slate-900/40 mx-auto mb-3" />
                    <p className="text-slate-900/70">No item orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filtered.map((order, i) => {
                        const action = nextStatus[order.status];
                        const details = parseOrderDetails(order);
                        return (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white  rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all">
                                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-900/50 font-mono">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-slate-900/60 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-slate-200">
                                            <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120"} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{order.products?.title || "Product Removed"}</p>
                                            <p className="text-neon-fire font-bold text-lg">₹{order.total_price.toLocaleString()}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {order.products?.category && <span className="inline-block px-2 py-0.5 rounded-lg bg-white/10 text-xs text-slate-900/70 font-mono truncate max-w-full">{order.products.category}</span>}
                                                <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold truncate max-w-full ${order.payment_status === 'verifying' ? 'bg-orange-500/15 text-orange-400' : order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                                    {order.payment_status === 'verifying' ? `🟡 Verify UTR: ${order.razorpay_payment_id || 'N/A'}` : order.payment_status === 'paid' ? '💳 Paid Online' : '💵 Cash on Gate'}
                                                </span>
                                            </div>
                                            {order.payment_status === 'verifying' && (
                                                <button onClick={() => onVerifyUpi(order.id)} className="px-3 py-1.5 mt-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Accept UPI Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50  rounded-xl p-3 border border-neon-cyan/20">
                                        <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><User className="w-3 h-3" /> Buyer</p>
                                        <p className="text-sm font-semibold text-slate-900">{order.buyer?.full_name || "Unknown"}</p>
                                        {(order.buyer_phone || order.buyer?.phone_number) && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-3 h-3 text-neon-cyan" />
                                                <span className="text-xs text-slate-900/70">{order.buyer_phone || order.buyer?.phone_number}</span>
                                                <button onClick={() => copyPhone(order.buyer_phone || order.buyer?.phone_number || "")} className="p-0.5 rounded hover:bg-slate-50"><Copy className="w-3 h-3 text-slate-900/70" /></button>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 mt-1">
                                            <MapPin className="w-3 h-3 text-slate-900/40 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs text-slate-900/70 break-words flex-1 min-w-0">{details.hostel}</span>
                                        </div>
                                        <div className="flex items-start gap-2 mt-1">
                                            <span className="w-3 h-3 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-900/40 text-[10px]">🚪</span>
                                            <span className="text-xs text-brand font-black break-words uppercase flex-1 min-w-0">Room: {details.room || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50  rounded-xl p-3 border border-neon-orange/20">
                                        <p className="text-xs text-neon-orange font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> Seller</p>
                                        <p className="text-sm font-semibold text-slate-900">{order.seller?.full_name || "Unknown"}</p>
                                        {order.seller?.phone_number && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-3 h-3 text-neon-orange" />
                                                <span className="text-xs text-slate-900/70">{order.seller.phone_number}</span>
                                                <button onClick={() => copyPhone(order.seller?.phone_number || "")} className="p-0.5 rounded hover:bg-slate-50"><Copy className="w-3 h-3 text-slate-900/70" /></button>
                                            </div>
                                        )}
                                        {order.seller?.hostel_block && <p className="text-xs text-slate-900/70 flex items-start gap-1 mt-1 break-words"><MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" /> <span className="flex-1 min-w-0">{order.seller.hostel_block}</span></p>}
                                    </div>
                                    {action && (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button onClick={() => onUpdateStatus(order.id, action.status, (action as any).timestamps)}
                                                className={`flex-1 flex w-full sm:w-auto items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${action.color}`}>
                                                <action.icon className="w-4 h-4" /> {action.label}
                                            </button>
                                            {order.status === 'pending' && (
                                                <button onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                                    className="px-4 w-full sm:w-auto py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
                                                    Decline
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Food Orders Section ────────────────────────────────────────────────────────
function FoodOrdersSection({ orders, loading, onUpdateStatus, onVerifyUpi }: {
    orders: Order[]; loading: boolean; onUpdateStatus: (id: string, status: string, timestamps?: Record<string, string>) => void; onVerifyUpi: (id: string) => void;
}) {
    const [filter, setFilter] = useState('all');
    const foodOrders = orders.filter(o => isFoodOrder(o));
    const filtered = applyFilter(foodOrders, filter);

    const nextStatus: Record<string, { label: string; status: string; icon: any; color: string; timestamps?: object } | null> = {
        pending: { label: "Accept Order", status: "confirmed", icon: CheckCircle, color: "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        confirmed: { label: "Out for Delivery 🚀", status: "delivering", icon: Truck, color: "bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30", timestamps: { out_for_delivery_at: new Date().toISOString() } },
        delivering: { label: "Mark Delivered ✅", status: "completed", icon: HomeIcon, color: "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30", timestamps: { delivered_at: new Date().toISOString() } },
        completed: null, cancelled: null,
        seller_accepted: { label: "Accept", status: "confirmed", icon: CheckCircle, color: "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30", timestamps: { accepted_at: new Date().toISOString() } },
        picked: { label: "Out for Delivery", status: "delivering", icon: Truck, color: "bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30", timestamps: { out_for_delivery_at: new Date().toISOString() } },
        seller_rejected: null,
    };

    const copyPhone = (phone: string) => { navigator.clipboard.writeText(phone); };

    // Data parsing handled by parseOrderDetails globally now

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><UtensilsCrossed className="w-6 h-6 text-orange-400" /> Food Orders</h2>
                    <p className="text-slate-500 text-sm">{foodOrders.length} total • {foodOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length} active</p>
                </div>
                <FilterBar active={filter} onChange={setFilter} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white  rounded-2xl p-12 text-center border border-slate-200">
                    <UtensilsCrossed className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
                    <p className="text-slate-500">No food orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filtered.map((order, i) => {
                        const action = nextStatus[order.status];
                        const details = parseOrderDetails(order);
                        return (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white  rounded-2xl border border-orange-500/15 overflow-hidden hover:border-orange-500/30 transition-all">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-200 flex items-center gap-3" style={{ background: 'rgba(255,107,0,0.03)' }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,0,0.12)' }}>
                                        <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 font-mono">FOOD #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Food Items */}
                                    <div className="rounded-xl p-3 border border-orange-500/15" style={{ background: 'rgba(255,107,0,0.04)' }}>
                                        <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <ShoppingBag className="w-3 h-3" /> Ordered Items
                                        </p>
                                        <div className="space-y-1">
                                            {details.items.split('\n').filter(Boolean).map((line, idx) => {
                                                const cleanLine = line.replace(/\s*\[IMG:[^\]]*\]/g, "");
                                                return (
                                                    <p key={idx} className="text-sm text-slate-900 flex items-start gap-2">
                                                        <span className="text-orange-400 mt-0.5 font-bold">•</span>
                                                        <span>{cleanLine.trim()}</span>
                                                    </p>
                                                );
                                            })}
                                        </div>
                                        {details.notes && (
                                            <div className="mt-2 pt-2 border-t border-orange-500/10">
                                                <p className="text-[10px] text-orange-300/60 uppercase font-bold mb-0.5">Notes</p>
                                                <p className="text-xs text-slate-500 italic">{details.notes}</p>
                                            </div>
                                        )}
                                        {order.total_price > 0 && (
                                            <div className="mt-2 pt-2 border-t border-orange-500/10 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">Total</span>
                                                <span className="text-base font-black text-orange-400">₹{order.total_price.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 flex flex-col items-start gap-2">
                                            <span className={`inline-block w-full sm:w-auto truncate px-2 py-1 rounded-lg text-xs font-bold ${order.payment_status === 'verifying' ? 'bg-orange-500/15 text-orange-400' : order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                                {order.payment_status === 'verifying' ? `🟡 Verify UTR: ${order.razorpay_payment_id || 'N/A'}` : order.payment_status === 'paid' ? '💳 Paid Online' : '💵 Cash on Gate'}
                                            </span>
                                            {order.payment_status === 'verifying' && (
                                                <button onClick={() => onVerifyUpi(order.id)} className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Accept UPI Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Buyer + Delivery */}
                                    <div className="bg-slate-50  rounded-xl p-3 border border-neon-cyan/20">
                                        <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><User className="w-3 h-3" /> Deliver To</p>
                                        <p className="text-sm font-semibold text-slate-900">{order.buyer?.full_name || "Student"}</p>
                                        {order.buyer_phone && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-3 h-3 text-neon-cyan" />
                                                <span className="text-xs text-slate-500">{order.buyer_phone}</span>
                                                <button onClick={() => copyPhone(order.buyer_phone || "")} className="p-0.5 rounded hover:bg-slate-100" title="Copy"><Copy className="w-3 h-3 text-slate-500" /></button>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 mt-1">
                                            <MapPin className="w-3 h-3 text-slate-900/40 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs text-slate-500 break-words flex-1 min-w-0">{details.hostel}</span>
                                        </div>
                                        <div className="flex items-start gap-2 mt-1">
                                            <span className="w-3 h-3 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-500 text-[10px]">🚪</span>
                                            <span className="text-xs text-brand font-black break-words uppercase flex-1 min-w-0">Room: {details.room || "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    {action && (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button onClick={() => onUpdateStatus(order.id, action.status, (action as any).timestamps)}
                                                className={`flex-1 flex w-full sm:w-auto items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${action.color}`}>
                                                <action.icon className="w-4 h-4" /> {action.label}
                                            </button>
                                            {order.status === 'pending' && (
                                                <button onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                                    className="px-4 w-full sm:w-auto py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
                                                    Decline
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Notifications Section ─────────────────────────────────────────────────────
function NotificationsSection({ notifications, loading, onMarkRead, onMarkAllRead }: {
    notifications: AdminNotification[]; loading: boolean;
    onMarkRead: (id: string) => void; onMarkAllRead: () => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black mb-1">Notifications</h2>
                    <p className="text-slate-500 text-sm">{notifications.filter(n => !n.is_read).length} unread notifications</p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button onClick={onMarkAllRead} className="text-xs font-bold text-neon-cyan hover:text-slate-900 transition-colors">
                        Mark all read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
            ) : notifications.length === 0 ? (
                <div className="bg-white  rounded-2xl p-12 text-center border border-slate-200">
                    <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
                    <p className="text-slate-500">No notifications yet</p>
                    <p className="text-xs text-slate-500 mt-1">You'll be notified when new products are listed or orders are placed</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n, i) => {
                        const isProduct = n.type === "new_product";
                        const payload = n.payload;
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => !n.is_read && onMarkRead(n.id)}
                                className={`bg-white  rounded-2xl border transition-all cursor-pointer ${n.is_read ? "border-slate-200 opacity-60" : "border-white/15 hover:border-slate-300"}`}
                            >
                                <div className="p-4 flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isProduct ? "bg-neon-cyan/15 border border-neon-cyan/30" : "bg-neon-orange/15 border border-neon-orange/30"}`}>
                                        {isProduct ? <Package className="w-5 h-5 text-neon-cyan" /> : <ShoppingCart className="w-5 h-5 text-neon-orange" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isProduct ? "text-neon-cyan" : "text-neon-orange"}`}>
                                                {isProduct ? "New Product Listed" : "New Order Placed"}
                                            </span>
                                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />}
                                        </div>

                                        {isProduct ? (
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 truncate">{payload.title || "New Product"}</p>
                                                <p className="text-xs text-slate-500">
                                                    ₹{(payload.price || 0).toLocaleString()} · {payload.category} · {payload.condition}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Order #{(payload.id || "").slice(0, 8).toUpperCase()}</p>
                                                <p className="text-xs text-slate-500">
                                                    Total: ₹{(payload.total_price || 0).toLocaleString()} · Deliver to: {payload.delivery_location || "N/A"}
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-500/50 font-mono mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!n.is_read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-neon-orange shadow-[0_0_8px_rgba(255,100,0,0.8)] flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin() {
    const { user, profile, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();

    const [section, setSection] = useState<AdminSection>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data states
    const [stats, setStats] = useState<Stats>({ totalProducts: 0, activeOrders: 0, totalUsers: 0 });
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingNotifs, setLoadingNotifs] = useState(true);

    // Confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState<{ productId: string; title: string } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // ── Maintenance mode ──────────────────────────────────────────────────────────
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [togglingMaintenance, setTogglingMaintenance] = useState(false);

    useEffect(() => {
        supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single()
            .then(({ data }) => setMaintenanceMode(data?.value === true || data?.value === 'true'));
    }, []);

    const toggleMaintenance = async () => {
        setTogglingMaintenance(true);
        const newVal = !maintenanceMode;
        await supabase.from('site_settings').upsert({ key: 'maintenance_mode', value: newVal }, { onConflict: 'key' });
        setMaintenanceMode(newVal);
        setTogglingMaintenance(false);
    };

    // ── Fetch Stats ──────────────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        const [{ count: productCount }, { count: orderCount }, { count: userCount }] = await Promise.all([
            supabase.from("products").select("*", { count: "exact", head: true }),
            supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "seller_accepted", "confirmed", "picked", "delivering"]),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);
        setStats({
            totalProducts: productCount || 0,
            activeOrders: orderCount || 0,
            totalUsers: userCount || 0,
        });
        setLoadingStats(false);
    }, []);

    // ── Fetch Products ───────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        const { data } = await supabase
            .from("products")
            .select(`*, profiles(full_name, phone_number, hostel_block)`)
            .order("created_at", { ascending: false });
        setProducts((data as Product[]) || []);
        setRecentProducts(((data as Product[]) || []).slice(0, 5));
        setLoadingProducts(false);
    }, []);

    // ── Fetch Orders ─────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        const { data } = await supabase
            .from("orders")
            .select(`
                *,
                products(title, image_url, price, category, reason_for_selling),
                buyer:profiles!orders_buyer_id_fkey(full_name, phone_number, hostel_block),
                seller:profiles!orders_seller_id_fkey(full_name, phone_number, hostel_block)
            `)
            .order("created_at", { ascending: false });
        const mapped = ((data as any[]) || []).map(o => ({
            ...o,
            buyer: o.buyer,
            seller: o.seller,
        }));
        setOrders(mapped as Order[]);
        setRecentOrders(mapped.slice(0, 5) as Order[]);
        setLoadingOrders(false);
    }, []);

    // ── Fetch Notifications ──────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        setLoadingNotifs(true);
        const { data } = await supabase
            .from("admin_notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        setNotifications((data as AdminNotification[]) || []);
        setLoadingNotifs(false);
    }, []);

    // ── Initial Load ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAdmin) return;
        fetchStats();
        fetchProducts();
        fetchOrders();
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    // ── Real-time subscriptions ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isAdmin) return;

        const productChannel = supabase.channel("admin_products_rt")
            .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
                fetchProducts(); fetchStats();
            }).subscribe();

        const orderChannel = supabase.channel("admin_orders_rt")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
                fetchOrders(); fetchStats();
            }).subscribe();

        const notifChannel = supabase.channel("admin_notifs_rt")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, () => {
                fetchNotifications();
            }).subscribe();

        return () => {
            supabase.removeChannel(productChannel);
            supabase.removeChannel(orderChannel);
            supabase.removeChannel(notifChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);
    // ── Audio alert for new orders ────────────────────────────────────────────────
    const prevPendingCountRef = useRef<number | null>(null);
    useEffect(() => {
        const pendingCount = orders.filter(o => o.status === "pending").length;
        // Skip initial load (when ref is null)
        if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
            // Play a short notification ping
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
                oscillator.type = "sine";
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
                // Audio may fail silently on some browsers
            }
        }
        prevPendingCountRef.current = pendingCount;
    }, [orders]);

    // ── Handlers ─────────────────────────────────────────────────────────────────
    const handleDeleteProduct = async (id: string) => {
        setDeletingId(id);
        setConfirmDialog(null);
        await supabase.from("products").delete().eq("id", id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setRecentProducts(prev => prev.filter(p => p.id !== id));
        await fetchStats();
        setDeletingId(null);
    };

    const handleUpdateOrderStatus = async (id: string, status: string, timestamps?: Record<string, string>) => {
        const updates: any = { status, ...timestamps };
        await supabase.from("orders").update(updates).eq("id", id);

        // --- NEW REWARD LOGIC ---
        if (status === "completed") {
            const { data: orderData } = await supabase.from("orders").select("buyer_id, delivery_room, total_price, product_id").eq("id", id).single();
            if (orderData?.buyer_id) {
                const buyerId = orderData.buyer_id;
                const { data: profileData } = await supabase.from("profiles").select("total_orders, wallet_balance").eq("id", buyerId).single();
                
                if (profileData) {
                    const newTotalOrders = (profileData.total_orders || 0) + 1;
                    let newBalance = profileData.wallet_balance || 0;
                    
                    if (newTotalOrders > 0 && newTotalOrders % 3 === 0) {
                        newBalance += 20;
                        await supabase.from("wallet_transactions").insert({
                            user_id: buyerId,
                            amount: 20,
                            type: 'reward',
                            description: 'Reward: 3 orders delivered!'
                        });
                    }

                    // Flavour Factory High Value Reward
                    if (!orderData.product_id && orderData.total_price >= 499 && orderData.delivery_room?.toLowerCase().includes("flavour factory")) {
                        newBalance += 30;
                        await supabase.from("wallet_transactions").insert({
                            user_id: buyerId,
                            amount: 30,
                            type: 'reward',
                            description: 'Flavour Factory Special Reward'
                        });
                    }
                    
                    await supabase.from("profiles").update({
                        total_orders: newTotalOrders,
                        wallet_balance: newBalance
                    }).eq("id", buyerId);
                }
            }
        }
        // ------------------------

        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        await fetchStats();
    };

    const handleVerifyUpi = async (id: string) => {
        await supabase.from("orders").update({ payment_status: 'paid' }).eq("id", id);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: 'paid' } : o));
        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: 'paid' } : o));
        await fetchStats();
        alert("UPI Payment Verified Successfully!");
    };

    const handleMarkRead = async (id: string) => {
        await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    // ── Sidebar navigation config ────────────────────────────────────────────────
    const navItems: { id: AdminSection; label: string; icon: any; badge?: number }[] = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Package, badge: products.length },
        { id: "item_orders", label: "Item Orders", icon: ShoppingCart, badge: orders.filter(o => !isFoodOrder(o) && o.status === 'pending').length || undefined },
        { id: "food_orders", label: "Food Orders", icon: UtensilsCrossed, badge: orders.filter(o => isFoodOrder(o) && o.status === 'pending').length || undefined },
        { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount || undefined },
    ];

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white  rounded-3xl p-12 text-center border border-red-500/20 max-w-md w-full"
                >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 overflow-hidden border border-slate-200">
                        <img src="/logo.webp" alt="CU Bazzar" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-6">You don't have admin privileges to access this area.</p>
                    <button onClick={() => navigate("/home")} className="btn-liquid-bg-slate-50  px-6 py-3 text-slate-900 font-bold rounded-xl">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
            {/* Overlay for mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Panel */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden bg-white  border-r border-slate-200 flex flex-col"
            >
                <SidebarContent
                    navItems={navItems}
                    section={section}
                    setSection={(s) => { setSection(s); setSidebarOpen(false); }}
                    profile={profile}
                    onSignOut={() => { signOut(); navigate("/"); }}
                />
            </motion.aside>

            {/* Desktop Sidebar (always visible) */}
            <aside className="hidden lg:flex w-64 flex-col fixed top-0 left-0 h-full bg-white  border-r border-slate-200 z-30">
                <SidebarContent
                    navItems={navItems}
                    section={section}
                    setSection={setSection}
                    profile={profile}
                    onSignOut={() => { signOut(); navigate("/"); }}
                />
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────────────── */}
            <main className="flex-1 lg:ml-64 min-h-screen w-full max-w-[100vw] overflow-x-hidden">
                {/* Top Bar */}
                <div className="sticky top-0 z-20 bg-white  border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg bg-slate-50  border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div className="flex-1">
                        <h1 className="font-bold text-slate-900 capitalize hidden sm:block">
                            {navItems.find(n => n.id === section)?.label}
                        </h1>
                    </div>

                    {/* Notification bell in topbar */}
                    <button
                        onClick={() => setSection("notifications")}
                        className="relative p-2.5 rounded-full bg-slate-50  border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-slate-500" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-neon-orange text-white text-[10px] font-black flex items-center justify-center px-1 shadow-[0_0_10px_rgba(255,100,0,0.8)]">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Maintenance Toggle */}
                    <button
                        onClick={toggleMaintenance}
                        disabled={togglingMaintenance}
                        title={maintenanceMode ? "Maintenance ON — click to disable" : "Site is live — click to enable maintenance"}
                        className={`relative p-2.5 rounded-full border transition-all ${maintenanceMode
                            ? 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-50  border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <Wrench className={`w-4 h-4 ${maintenanceMode ? 'text-amber-400' : 'text-slate-500'}`} />
                        {maintenanceMode && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1.5">
                            <img src="/logo.webp" alt="Admin" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 hidden sm:block">{profile?.full_name?.split(" ")[0] || "Admin"}</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={section}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {section === "dashboard" && (
                                <DashboardSection
                                    stats={stats}
                                    recentProducts={recentProducts}
                                    recentOrders={recentOrders}
                                    loading={loadingStats || loadingOrders}
                                    allOrders={orders}
                                    onUpdateStatus={handleUpdateOrderStatus}
                                    onVerifyUpi={handleVerifyUpi}
                                />
                            )}
                            {section === "products" && (
                                <ProductsSection
                                    products={products}
                                    loading={loadingProducts}
                                    onDelete={(id, title) => setConfirmDialog({ productId: id, title })}
                                />
                            )}
                            {section === "item_orders" && (
                                <ItemOrdersSection
                                    orders={orders}
                                    loading={loadingOrders}
                                    onUpdateStatus={handleUpdateOrderStatus}
                                    onVerifyUpi={handleVerifyUpi}
                                />
                            )}
                            {section === "food_orders" && (
                                <FoodOrdersSection
                                    orders={orders}
                                    loading={loadingOrders}
                                    onUpdateStatus={handleUpdateOrderStatus}
                                    onVerifyUpi={handleVerifyUpi}
                                />
                            )}
                            {section === "notifications" && (
                                <NotificationsSection
                                    notifications={notifications}
                                    loading={loadingNotifs}
                                    onMarkRead={handleMarkRead}
                                    onMarkAllRead={handleMarkAllRead}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Confirm Dialog ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {confirmDialog && (
                    <ConfirmDialog
                        message={`Are you sure you want to permanently delete "${confirmDialog.title}"? This action cannot be undone.`}
                        onConfirm={() => handleDeleteProduct(confirmDialog.productId)}
                        onCancel={() => setConfirmDialog(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Sidebar Content Component ─────────────────────────────────────────────────
function SidebarContent({
    navItems, section, setSection, profile, onSignOut
}: {
    navItems: { id: AdminSection; label: string; icon: any; badge?: number }[];
    section: AdminSection;
    setSection: (s: AdminSection) => void;
    profile: any;
    onSignOut: () => void;
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-lg">
                        <img src="/logo.webp" alt="CU Bazzar" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-sm leading-tight">Admin Portal</p>
                        <p className="text-xs text-slate-500">CU Bazzar Control</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-xs text-slate-500/50 font-bold uppercase tracking-wider px-3 mb-3">Navigation</p>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative ${section === item.id
                            ? "bg-gradient-to-r from-neon-orange/20 to-neon-pink/10 text-slate-900 border border-neon-orange/30 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                    >
                        {section === item.id && (
                            <motion.div layoutId="admin-nav-active" className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-orange/10 to-transparent -z-10" />
                        )}
                        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${section === item.id ? "text-neon-orange" : "text-slate-500 group-hover:text-slate-900"}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className={`min-w-[20px] h-5 rounded-full text-[11px] font-black flex items-center justify-center px-1.5 ${item.id === "notifications" ? "bg-neon-orange text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Admin User Info */}
            <div className="p-4 border-t border-slate-200">
                <div className="bg-slate-50  rounded-xl p-3 border border-slate-200 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-cyan flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || "Admin"}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-[10px] text-green-400 font-semibold">Admin Access</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
