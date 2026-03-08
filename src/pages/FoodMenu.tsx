import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Coffee, Apple, ShoppingBag, Clock, Loader2, Plus, BadgeCheck, Cookie, Soup, FileText, Send, MessageSquare, Sparkles, X, MapPin, Phone, ShoppingCart, Smartphone, Store, ChevronDown, ChevronRight as ChevRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { isOfferActive } from "@/utils/offerTimer";
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
                    delivery_charge: isOfferActive() ? 12 : 20,
                    total_price: upiSnapshot.price + (isOfferActive() ? 12 : 20),
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
                    delivery_charge: isOfferActive() ? 12 : 20,
                    total_price: isOfferActive() ? 12 : 20,
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
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" /> ₹{isOfferActive() ? 12 : 20} Delivery
                            </span>
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

                {/* ─── Custom Order Section ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 sm:mt-16 mb-8"
                >
                    <div className="relative rounded-3xl sm:rounded-[2rem] p-[2px] overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #FF6B00, #FF4444, #FF6B00, #FFAA00, #FF6B00)',
                        backgroundSize: '300% 300%',
                        animation: 'sale-border-shift 4s ease infinite',
                    }}>
                        <div className="rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-orange-50 border border-orange-100">
                                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-600">New Feature</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 leading-tight">
                                        Can't find what you need?
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-md mb-4">
                                        Tell us exactly what you want — list items, quantities, brands. We'll get it and deliver to your room. 📝
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {["🍕 Maggi Combo", "🥤 Energy Drinks", "📚 Stationery", "🧴 Daily Needs"].map(tag => (
                                            <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium bg-slate-50 border border-slate-100 text-slate-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => user ? setShowCustomOrder(true) : navigate('/login')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group relative px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-white text-sm overflow-hidden flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.4)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <FileText className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">Create Custom Order</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes sale-border-shift {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                        }
                    `}</style>
                </motion.div>

                {/* ─── Custom Order Modal ─── */}
                <AnimatePresence>
                    {showCustomOrder && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !customSubmitting && setShowCustomOrder(false)}
                        >
                            <motion.div
                                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full sm:max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 sm:p-5 sticky top-0 z-10 bg-white border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50 border border-orange-100">
                                            <MessageSquare className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Custom Order</h3>
                                            <p className="text-[11px] text-slate-500">Tell us what you need</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowCustomOrder(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="p-4 sm:p-5 space-y-4">
                                    {/* Items List */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Items You Need *
                                        </label>
                                        <textarea
                                            value={customItems}
                                            onChange={(e) => setCustomItems(e.target.value)}
                                            rows={4}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400 resize-none"
                                            placeholder={"e.g.\n2x Maggi (Masala)\n1x Red Bull\n3x Dairy Milk Silk\n1x Notebook"}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1 px-1">List each item with quantity. One per line works best.</p>
                                    </div>

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Special Instructions</label>
                                        <textarea
                                            value={customNotes}
                                            onChange={(e) => setCustomNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400 resize-none"
                                            placeholder="Brand preferences, spice level, etc. (optional)"
                                        />
                                    </div>

                                    {/* Delivery Details */}
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={customHostel}
                                                onChange={(e) => setCustomHostel(e.target.value)}
                                                placeholder="Hostel Block + Room (e.g. BH-1, 402)"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 h-[48px] text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={customPhone}
                                                onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                type="tel"
                                                maxLength={10}
                                                placeholder="Phone Number (10 digits)"
                                                className={`w-full bg-slate-50 border rounded-full pl-10 pr-4 h-[48px] text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-slate-400 ${customPhone.length > 0 && customPhone.length !== 10 ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-orange-400 focus:ring-orange-50'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-[11px] text-emerald-600">UPI Payment Only · Admin will review & confirm your order</span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="p-4 sm:p-5 border-t border-slate-100">
                                    <button
                                        onClick={handleCustomOrder}
                                        disabled={customSubmitting}
                                        className="w-full py-3.5 rounded-full text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
                                    >
                                        {customSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <><Send className="w-4 h-4" /> Pay & Submit Order</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* UPI Payment Modal */}
                <UpiPaymentModal
                    isOpen={showUpiModal}
                    onClose={() => { setShowUpiModal(false); setUpiSnapshot(null); }}
                    amount={(upiSnapshot?.price || 0) + (isOfferActive() ? 12 : 20)}
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