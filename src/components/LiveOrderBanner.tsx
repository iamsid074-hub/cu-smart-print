import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Package, CheckCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; pulse: string; icon: typeof Truck }> = {
    pending:          { label: "Order Received",      color: "text-slate-600",   bg: "bg-slate-50 border-slate-200",  pulse: "bg-slate-400",   icon: Package },
    seller_accepted:  { label: "Seller Confirmed",    color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",    pulse: "bg-blue-400",    icon: CheckCircle },
    confirmed:        { label: "Accepted â€” On Hold",  color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",pulse: "bg-purple-400",  icon: Package },
    picked:           { label: "Item Picked Up",      color: "text-orange-600",  bg: "bg-orange-50 border-orange-200",pulse: "bg-orange-400",  icon: Package },
    delivering:       { label: "Out for Delivery ðŸ›µ", color: "text-brand",       bg: "bg-brand-50 border-brand-muted",pulse: "bg-brand",       icon: Truck },
    completed:        { label: "Delivered! ðŸŽ‰",       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200",pulse: "bg-emerald-400",icon: CheckCircle },
};

interface ActiveOrder {
    id: string;
    status: string;
    products?: { title?: string };
    delivery_location?: string;
    delivery_room?: string;
    total_price?: number;
}

export default function LiveOrderBanner() {
    const { user } = useAuth();
    const [order, setOrder] = useState<ActiveOrder | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const [prevStatus, setPrevStatus] = useState<string>("");
    const [justChanged, setJustChanged] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchActive = async () => {
            const { data } = await supabase
                .from("orders")
                .select("id, status, total_price, delivery_location, delivery_room, products(title)")
                .eq("buyer_id", user.id)
                .in("status", ["pending", "seller_accepted", "confirmed", "picked", "delivering"])
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setOrder(data as ActiveOrder);
                setPrevStatus(data.status);
            }
        };

        fetchActive();
    }, [user]);

    // Real-time subscription on the active order
    useEffect(() => {
        if (!order?.id) return;

        const channel = supabase
            .channel(`live_banner_${order.id}`)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "orders",
                filter: `id=eq.${order.id}`,
            }, (payload) => {
                const newStatus = payload.new.status as string;

                // Animate the change
                if (newStatus !== prevStatus) {
                    setJustChanged(true);
                    setPrevStatus(newStatus);
                    setTimeout(() => setJustChanged(false), 1500);
                }

                if (newStatus === "completed" || newStatus === "cancelled" || newStatus === "seller_rejected") {
                    // Show completed briefly then fade
                    setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
                    setTimeout(() => setOrder(null), 8000);
                } else {
                    setOrder(prev => prev ? { ...prev, ...payload.new } : prev);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [order?.id, prevStatus]);

    const config = order ? STATUS_CONFIG[order.status] : null;
    const isDelivering = order?.status === "delivering";
    const isCompleted = order?.status === "completed";

    // Don't show if no active order, dismissed, or missing config
    if (!order || dismissed || !config) return null;

    const Icon = config.icon;
    const isFood = order.delivery_location?.includes("[Custom Food:") || order.delivery_room?.includes("[CUSTOM FOOD ORDER]");

    return (
        <AnimatePresence>
            <motion.div
                key={order.id + order.status}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`fixed top-14 left-0 right-0 z-[9998] px-3 pt-1`}
            >
                <Link to={`/tracking?order=${order.id}`}>
                    <div className={`rounded-2xl border p-3 flex items-center gap-3 shadow-md ${config.bg} ${justChanged ? "ring-2 ring-offset-1 ring-brand" : ""} transition-all`}>
                        {/* Animated status dot */}
                        <div className="relative flex-shrink-0">
                            <div className={`w-9 h-9 rounded-xl ${isDelivering ? "bg-brand/10" : isCompleted ? "bg-emerald-100" : "bg-white"} flex items-center justify-center shadow-sm`}>
                                <Icon className={`w-4 h-4 ${config.color} ${isDelivering ? "animate-pulse" : ""}`} />
                            </div>
                            {/* Pulse ring for delivering */}
                            {isDelivering && (
                                <span className="absolute -inset-0.5 rounded-xl border-2 border-brand animate-ping opacity-40" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black ${config.color}`}>{config.label}</p>
                            <p className="text-slate-600 text-[11px] font-medium truncate">
                                {isFood ? "Food Order" : order.products?.title || "Your Order"}
                                {order.total_price ? ` Â· â‚¹${order.total_price}` : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${config.color} bg-white/60`}>
                                Track â†’
                            </span>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
                                className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
