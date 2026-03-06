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
                    delivery_charge: 5,
                    total_price: upiSnapshot.price + 5,
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
                    delivery_charge: 5,
                    total_price: 5,
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
        <div className="min-h-screen bg-[#0A0505] pt-24 pb-16 px-4 sm:px-6 overflow-x-hidden relative">

            {/* Warm Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header removed for Dynamic Island */}



                {/* ─────── SHOPS VIEW ─────── */}
                {
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-sm text-muted-foreground">
                                <span className="text-white font-bold">{shops.length}</span> campus food shops
                            </p>
                            <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" /> ₹5 Delivery
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
                                    className="rounded-2xl border border-white/10 overflow-hidden"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                >
                                    {/* Shop header — click to expand */}
                                    <button
                                        onClick={() => { setExpandedShop(isOpen ? null : shop.id); setExpandedMenuCat(null); }}
                                        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left transition-colors hover:bg-white/[0.03]"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                            <Store className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-base font-bold text-white truncate">{shop.name}</h3>
                                                {shop.veg && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20 flex-shrink-0">VEG</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{shop.tag} · {shop.categories.length} categories</p>
                                        </div>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                                                <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                    {/* Category pills */}
                                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1">
                                                        {shop.categories.map((mc) => (
                                                            <button
                                                                key={mc.category}
                                                                onClick={() => setExpandedMenuCat(expandedMenuCat === mc.category ? null : mc.category)}
                                                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${expandedMenuCat === mc.category
                                                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                                                    : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10'
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
                                                                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 px-1">{mc.category}</p>
                                                                <div className="space-y-1">
                                                                    {mc.items.map((item, idx) => (
                                                                        <div
                                                                            key={`${mc.category}-${idx}`}
                                                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                                                                        >
                                                                            <span className="text-sm text-white/80 flex-1 min-w-0 truncate pr-3">{item.name}</span>
                                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                                <span className="text-sm font-bold text-orange-400">₹{item.price}</span>
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
                                                                                    className="w-[36px] h-[36px] rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-black hover:bg-[#10B981] hover:border-[#10B981] hover:text-white transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
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
                    <div className="relative rounded-2xl sm:rounded-3xl p-[2px] overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #FF6B00, #FF4444, #FF6B00, #FFAA00, #FF6B00)',
                        backgroundSize: '300% 300%',
                        animation: 'sale-border-shift 4s ease infinite',
                    }}>
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10" style={{ backgroundColor: '#120805' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.2)' }}>
                                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-400">New Feature</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                                        Can't find what you need?
                                    </h3>
                                    <p className="text-sm text-white/50 max-w-md mb-4">
                                        Tell us exactly what you want — list items, quantities, brands. We'll get it and deliver to your room. 📝
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {["🍕 Maggi Combo", "🥤 Energy Drinks", "📚 Stationery", "🧴 Daily Needs"].map(tag => (
                                            <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => user ? setShowCustomOrder(true) : navigate('/login')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group relative px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-white text-sm overflow-hidden flex-shrink-0 flex items-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF4444)', boxShadow: '0 4px 20px rgba(255,107,0,0.3)' }}
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
                            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
                            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                            onClick={() => !customSubmitting && setShowCustomOrder(false)}
                        >
                            <motion.div
                                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full sm:max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
                                style={{ backgroundColor: '#120805', border: '1px solid rgba(255,107,0,0.15)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 sm:p-5 sticky top-0 z-10" style={{ backgroundColor: '#120805', borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,107,0,0.12)' }}>
                                            <MessageSquare className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Custom Order</h3>
                                            <p className="text-[11px] text-white/40">Tell us what you need</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowCustomOrder(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="p-4 sm:p-5 space-y-4">
                                    {/* Items List */}
                                    <div>
                                        <label className="text-xs font-bold text-orange-200/60 uppercase mb-1.5 block flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Items You Need *
                                        </label>
                                        <textarea
                                            value={customItems}
                                            onChange={(e) => setCustomItems(e.target.value)}
                                            rows={4}
                                            className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20 resize-none"
                                            placeholder={"e.g.\n2x Maggi (Masala)\n1x Red Bull\n3x Dairy Milk Silk\n1x Notebook"}
                                        />
                                        <p className="text-[10px] text-white/25 mt-1 px-1">List each item with quantity. One per line works best.</p>
                                    </div>

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="text-xs font-bold text-orange-200/60 uppercase mb-1.5 block">Special Instructions</label>
                                        <textarea
                                            value={customNotes}
                                            onChange={(e) => setCustomNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20 resize-none"
                                            placeholder="Brand preferences, spice level, etc. (optional)"
                                        />
                                    </div>

                                    {/* Delivery Details */}
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200/40" />
                                            <input
                                                value={customHostel}
                                                onChange={(e) => setCustomHostel(e.target.value)}
                                                placeholder="Hostel Block + Room (e.g. BH-1, 402)"
                                                className="w-full bg-black/40 border border-orange-500/20 rounded-xl pl-10 pr-4 h-[48px] text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200/40" />
                                            <input
                                                value={customPhone}
                                                onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                type="tel"
                                                maxLength={10}
                                                placeholder="Phone Number (10 digits)"
                                                className="w-full bg-black/40 border border-orange-500/20 rounded-xl pl-10 pr-4 h-[48px] text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <Smartphone className="w-3.5 h-3.5 text-green-400/60" />
                                        <span className="text-[11px] text-green-400/60">UPI Payment Only · Admin will review & confirm your order</span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="p-4 sm:p-5" style={{ borderTop: '1px solid rgba(255,107,0,0.1)' }}>
                                    <button
                                        onClick={handleCustomOrder}
                                        disabled={customSubmitting}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #FF6B00, #FF4444)', boxShadow: '0 4px 16px rgba(255,107,0,0.25)' }}
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
                    amount={(upiSnapshot?.price || 0) + 5}
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