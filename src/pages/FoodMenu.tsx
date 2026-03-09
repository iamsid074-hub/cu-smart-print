import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Coffee, Apple, ShoppingBag, Clock, Loader2, Plus, BadgeCheck, Cookie, Soup, FileText, Send, MessageSquare, Sparkles, X, MapPin, Phone, ShoppingCart, Smartphone, Store, ChevronDown, ChevronRight as ChevRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { shops, type Shop, type MenuCategory } from "@/config/shopMenus";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";



export default function FoodMenu() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { addItem, totalItems: cartCount } = useCart();

    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [expandedShop, setExpandedShop] = useState<string | null>(null);
    const [expandedMenuCat, setExpandedMenuCat] = useState<string | null>(null);

    // Form State
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom Order State
    const [showCustomOrder, setShowCustomOrder] = useState(false);
    const [customItems, setCustomItems] = useState("");
    const [customNotes, setCustomNotes] = useState("");
    const [customHostel, setCustomHostel] = useState("");
    const [customPhone, setCustomPhone] = useState("");
    const [customSubmitting, setCustomSubmitting] = useState(false);

    // UPI Payment State
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiSnapshot, setUpiSnapshot] = useState<{ type: 'snack' | 'custom'; price: number; title: string; foodId: string; location: string; phone: string; customItems?: string; customNotes?: string } | null>(null);

    // ── Custom Order: validate → close modal → open UPI ──
    const handleCustomOrder = async () => {
        if (!user) { navigate('/login'); return; }
        if (!customItems.trim()) {
            toast({ title: "List your items", description: "Please type what you'd like to order.", variant: "destructive" });
            return;
        }
        if (!customHostel.trim()) {
            toast({ title: "Details missing", description: "Please enter your hostel block.", variant: "destructive" });
            return;
        }
        const phoneClean = customPhone.replace(/\D/g, "");
        if (phoneClean.length !== 10) {
            toast({ title: "Invalid phone", description: "Phone must be exactly 10 digits.", variant: "destructive" });
            return;
        }
        // Snapshot data, close modal, open UPI
        setUpiSnapshot({
            type: 'custom',
            price: 0, // Admin sets price later, but payment is recorded
            title: `Custom: ${customItems.split('\n')[0]}`,
            foodId: `CUSTOM-${Date.now()}`,
            location: customHostel,
            phone: phoneClean,
            customItems: customItems,
            customNotes: customNotes,
        });
        setShowCustomOrder(false);
        setTimeout(() => setShowUpiModal(true), 150);
    };

    // ── Finalize order after UTR verification ──
    const finalizeOrder = async (utrNumber: string) => {
        if (!user || !upiSnapshot) return;
        try {
            if (upiSnapshot.type === 'snack') {
                // Create Supabase order for snack
                const { error } = await supabase.from("orders").insert({
                    product_id: null,
                    buyer_id: user.id,
                    seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
                    base_price: upiSnapshot.price,
                    commission: 0,
                    delivery_charge: 20,
                    total_price: upiSnapshot.price + 20,
                    delivery_location: upiSnapshot.location,
                    delivery_room: `[FOOD] ${upiSnapshot.title}`,
                    buyer_phone: upiSnapshot.phone,
                    status: 'pending',
                    razorpay_payment_id: utrNumber,
                    seller_notified_at: new Date().toISOString(),
                });
                if (error) throw error;
            } else {
                // Create Supabase order for custom food
                const itemSummary = `[CUSTOM FOOD ORDER]\n${upiSnapshot.customItems}${upiSnapshot.customNotes ? `\n---\nNotes: ${upiSnapshot.customNotes}` : ''}`;
                const { error } = await supabase.from("orders").insert({
                    product_id: null,
                    buyer_id: user.id,
                    seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
                    base_price: 0,
                    commission: 0,
                    delivery_charge: 20,
                    total_price: 20,
                    delivery_location: `${upiSnapshot.location} [Custom Food: ${upiSnapshot.customItems?.split('\n')[0]}...]`,
                    delivery_room: itemSummary,
                    buyer_phone: upiSnapshot.phone,
                    status: 'pending',
                    razorpay_payment_id: utrNumber,
                    seller_notified_at: new Date().toISOString(),
                });
                if (error) throw error;
            }

            toast({ title: "Order placed", description: "Payment verified. Admin will process your order shortly." });
            setShowUpiModal(false);
            setUpiSnapshot(null);
            // Reset forms
            setCustomItems(""); setCustomNotes(""); setCustomHostel(""); setCustomPhone("");
            setLocation(""); setPhone("");
            navigate('/tracking');
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
        }
    };



    // ── Snack Buy: validate → close modal → open UPI ──
    const handleBuyNow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!location.trim()) {
            toast({ title: "Details missing", description: "Please enter delivery location.", variant: "destructive" });
            return;
        }
        const phoneClean = phone.replace(/\D/g, "");
        if (phoneClean.length !== 10) {
            toast({ title: "Invalid phone", description: "Phone must be exactly 10 digits.", variant: "destructive" });
            return;
        }

        // Snapshot snack data, close modal, open UPI
        setUpiSnapshot({
            type: 'snack',
            price: selectedFood.price,
            title: selectedFood.title,
            foodId: selectedFood.id,
            location: location,
            phone: phoneClean,
        });
        setIsBuyModalOpen(false);
        setTimeout(() => setShowUpiModal(true), 150);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[5.5rem] pb-16 px-4 sm:px-6 overflow-x-hidden relative">

            {/* Soft Ambient Glows (Light Mode) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header removed for Dynamic Island */}



                {/* ─────── SHOPS VIEW ─────── */}
                {
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-sm text-slate-500">
                                <span className="text-slate-900 font-bold">{shops.length}</span> campus food shops
                            </p>
                        </div>

                        {shops.map((shop, si) => {
                            const isOpen = expandedShop === shop.id;
                            return (
                                <motion.div
                                    key={shop.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: si * 0.06 }}
                                    className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-[#faf5f8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-[#e0b1cb] transition-all duration-300"
                                >
                                    {/* Shop header — click to expand */}
                                    <button
                                        onClick={() => { setExpandedShop(isOpen ? null : shop.id); setExpandedMenuCat(null); }}
                                        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left transition-colors hover:bg-slate-50"
                                    >
                                        <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-50 flex items-center justify-center flex-shrink-0">
                                            <Store className="w-5 h-5 text-brand-accent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{shop.name}</h3>
                                                {shop.veg && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">VEG</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{shop.tag} · {shop.categories.length} categories</p>
                                        </div>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        </motion.div>
                                    </button>

                                    {/* Expanded menu */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2 border-t border-slate-50">
                                                    {/* Category pills */}
                                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1">
                                                        {shop.categories.map((mc) => (
                                                            <button
                                                                key={mc.category}
                                                                onClick={() => setExpandedMenuCat(expandedMenuCat === mc.category ? null : mc.category)}
                                                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${expandedMenuCat === mc.category
                                                                    ? 'bg-brand-50 text-brand border border-brand-muted'
                                                                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {mc.category}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Items for selected category */}
                                                    {shop.categories
                                                        .filter((mc) => !expandedMenuCat || mc.category === expandedMenuCat)
                                                        .map((mc) => (
                                                            <div key={mc.category} className="mb-3">
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{mc.category}</p>
                                                                <div className="space-y-1">
                                                                    {mc.items.map((item, idx) => (
                                                                        <div
                                                                            key={`${mc.category}-${idx}`}
                                                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                                                        >
                                                                            <span className="text-sm font-medium text-slate-700 flex-1 min-w-0 truncate pr-3">{item.name}</span>
                                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                                <span className="text-sm font-bold text-brand">₹{item.price}</span>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        addItem({
                                                                                            id: `${shop.id}-${mc.category}-${idx}`,
                                                                                            title: `${item.name} (${shop.name})`,
                                                                                            price: item.price,
                                                                                            image: '',
                                                                                            category: 'shops',
                                                                                        });
                                                                                        toast({ title: `${item.name} added`, description: `From ${shop.name}` });
                                                                                    }}
                                                                                    className="w-[36px] h-[36px] rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                                                                >
                                                                                    <Plus className="w-4 h-4 text-current transition-colors" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                }

                {/* Custom Order block removed */}

                {/* UPI Payment Modal */}
                <UpiPaymentModal
                    isOpen={showUpiModal}
                    onClose={() => { setShowUpiModal(false); setUpiSnapshot(null); }}
                    amount={(upiSnapshot?.price || 0) + 20}
                    orderIdText={`FOOD_${upiSnapshot?.foodId || 'X'}`}
                    customerId={user?.id || "guest"}
                    customerPhone={upiSnapshot?.phone || phone || "9999999999"}
                    onPaymentVerify={async (utr) => {
                        await finalizeOrder(utr);
                    }}
                />

            </div>
        </div>
    );
}