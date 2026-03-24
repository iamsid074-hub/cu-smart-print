import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Loader2, BadgeCheck, Sparkles, Store, ShoppingCart, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { shops } from "@/config/shopMenus";
import { getFoodSuggestions, estimatePrice } from "@/utils/foodUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ShopCard } from "@/components/FoodMenu/ShopCard";
import { CustomOrderForm } from "@/components/FoodMenu/CustomOrderForm";

// Add SpeechRecognition type for TS
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export default function FoodMenu() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { addItem } = useCart();
    const isTargetedUser = ["vedhantofficial@gmail.com", "iamsid074@gmail.com"].includes(user?.email || "");

    const [activeTab, setActiveTab] = useState<'shops' | 'custom'>('shops');
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [expandedShop, setExpandedShop] = useState<string | null>(null);
    const [expandedMenuCat, setExpandedMenuCat] = useState<string | null>(null);

    // Form State for direct buy (backward compatibility)
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");

    // Custom Order State
    const [isListening, setIsListening] = useState(false);
    const [previewOrder, setPreviewOrder] = useState<any>(null);
    const [customItemList, setCustomItemList] = useState<any[]>([]);

    // Memoized Handlers
    const handleAddCustomToList = useCallback((item: any) => {
        setCustomItemList(prev => [...prev, item]);
        toast({ title: "Added to List", description: `${item.quantity}x ${item.name}` });
    }, [toast]);

    const handleRemoveFromList = useCallback((id: string) => {
        setCustomItemList(prev => prev.filter(item => item.id !== id));
    }, []);

    const sortedShops = [...shops].sort((a, b) => {
        if (a.id === 'flavour-factory') return -1;
        if (b.id === 'flavour-factory') return 1;
        return 0;
    });

    const handleUpdateActiveShop = useCallback((id: string | null) => {
        setExpandedShop(id);
        setExpandedMenuCat(null);
    }, []);

    const handleUpdateMenuCat = useCallback((cat: string | null) => {
        setExpandedMenuCat(cat);
    }, []);

    const handleAddToCartItem = useCallback((item: any) => {
        addItem(item);
        toast({ title: "Added to Cart", description: item.title });
    }, [addItem, toast]);

    const handlePreviewCustom = useCallback((items: any[]) => {
        setPreviewOrder({ items });
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({ title: "Not Supported", description: "Voice input is not supported in this browser.", variant: "destructive" });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            // This would normally set input, but we've moved that to CustomOrderForm.
            // For now, we'll just toast the transcript since CustomOrderForm handles its own voice state.
            toast({ title: "Voice Detected", description: transcript });
        };
        recognition.start();
    };

    // UPI Payment Snapshot
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiSnapshot, setUpiSnapshot] = useState<any>(null);

    const finalizeOrder = async (utrNumber: string) => {
        if (!user || !upiSnapshot) return;
        try {
            const { data, error } = await supabase.from("orders").insert({
                product_id: null,
                buyer_id: user.id,
                seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
                base_price: upiSnapshot.price,
                commission: 0,
                delivery_charge: 20,
                total_price: upiSnapshot.price + 20,
                delivery_location: upiSnapshot.location,
                delivery_room: upiSnapshot.type === 'snack' ? `[FOOD] ${upiSnapshot.title}` : upiSnapshot.customNotes,
                buyer_phone: upiSnapshot.phone,
                status: 'pending',
                payment_method: 'cashfree',
                payment_status: 'paid',
                razorpay_payment_id: utrNumber,
                seller_notified_at: new Date().toISOString(),
            });

            if (error) throw error;

            toast({ title: "Order placed! 🎉", description: "Payment verified. Admin will process your order shortly." });
            setShowUpiModal(false);
            setUpiSnapshot(null);
            
            // Redirect to the tracking page (automatically fetches latest order)
            navigate(`/tracking`);
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pt-[5.5rem] pb-16 px-4 sm:px-6 overflow-x-hidden relative font-sans">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 mb-6 shadow-sm max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('shops')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                            activeTab === 'shops'
                                ? 'bg-white text-brand shadow-md border border-slate-100'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Store className="w-4 h-4" />
                        Hostel Shops
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                            activeTab === 'custom'
                                ? 'bg-white text-brand shadow-md border border-slate-100'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Custom Order
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'shops' ? (
                        <motion.div
                            key="shops-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2 px-1">
                                <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-slate-900 font-bold">{shops.length}</span> verified campus shops
                                </p>
                            </div>

                            {/* ─── Flavour Factory Offer Banner ─── */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="relative rounded-[1.75rem] overflow-hidden mb-4 shadow-[0_8px_30px_rgba(220,38,38,0.2)]"
                                style={{ background: 'linear-gradient(135deg, #1f0b0b 0%, #4a1313 100%)' }}
                            >
                                {/* Decorative background elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                                
                                <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                                    {/* Text */}
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/90" style={{ background: 'rgba(255,255,255,0.12)' }}>
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                                                </span>
                                                Combo Offer
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black text-white/90 uppercase tracking-widest" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                Top Pick
                                            </span>
                                        </div>
                                        <h3 className="text-[14px] sm:text-[15px] font-black text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] truncate">
                                            Garlic Bread <span className="font-semibold text-white/80">(Round Cheese)</span> + Coffee
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                                            <span className="text-[11px] font-bold text-white/60 line-through">₹220</span>
                                            <span className="text-white/30 text-[10px] self-center">•</span>
                                            <span className="text-[12px] font-black text-white px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-red-500 border border-red-400/30 shadow-sm">
                                                Only ₹149
                                            </span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addItem({
                                          id: "flavour-factory-combo",
                                          title: "Combo: Garlic Bread (Round Cheese) + Cold Coffee",
                                          price: 149,
                                          image: "/banners/flavour_factory.png",
                                          category: "Flavour Factory",
                                          quantity: 1,
                                        });
                                        navigate('/cart');
                                      }}
                                      className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-5 py-3 sm:py-2.5 bg-white text-red-700 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-stone-50 border border-white/20"
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </motion.div>

                            {sortedShops.map((shop) => (
                                <div key={shop.id} id={`${shop.id}-card`}>
                                    <ShopCard
                                        shop={shop}
                                        isExpanded={expandedShop === shop.id}
                                        onToggle={handleUpdateActiveShop}
                                        expandedMenuCat={expandedMenuCat}
                                        onToggleCategory={handleUpdateMenuCat}
                                        onAddItem={handleAddToCartItem}
                                    />
                                </div>
                            ))}

                        </motion.div>
                    ) : (
                        <CustomOrderForm
                            onAddToList={handleAddCustomToList}
                            customItemList={customItemList}
                            onRemoveFromList={handleRemoveFromList}
                            onPreview={handlePreviewCustom}
                            estimatePrice={estimatePrice}
                            suggestions={getFoodSuggestions("")}
                            isListening={isListening}
                            onStartListening={startListening}
                        />
                    )}
                </AnimatePresence>

                <Dialog open={!!previewOrder} onOpenChange={() => setPreviewOrder(null)}>
                    <DialogContent className="rounded-[3rem] max-w-[90vw] sm:max-w-md p-8 border-none bg-white shadow-2xl">
                        <DialogHeader className="space-y-3 mb-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-brand/10 text-brand flex items-center justify-center mx-auto">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-center text-slate-900">Order Preview</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div className="max-h-[350px] overflow-y-auto scrollbar-hide space-y-3 px-1">
                                {previewOrder?.items.map((item: any) => (
                                    <div key={item.id} className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-slate-800 truncate">{item.name}</p>
                                                <p className="text-sm font-bold text-brand">{"\u20B9"}{item.price} x {item.quantity}</p>
                                            </div>
                                        </div>
                                        {item.notes && (
                                            <div className="mt-2 pt-2 border-t border-slate-200/50">
                                                <p className="text-[10px] text-slate-400 italic flex items-center gap-1.5">
                                                    <MessageSquare className="w-3 h-3" /> {item.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    previewOrder?.items.forEach((item: any) => {
                                        addItem({
                                            id: item.id,
                                            title: item.name,
                                            price: item.price,
                                            image: '',
                                            category: 'custom',
                                            quantity: item.quantity,
                                            notes: item.notes,
                                            isCustom: true
                                        });
                                    });
                                    toast({ title: "Added to Cart", description: `${previewOrder?.items.length} items added.` });
                                    setCustomItemList([]);
                                    setPreviewOrder(null);
                                }}
                                className="w-full h-14 rounded-2xl bg-brand text-white font-black shadow-lg"
                            >
                                Confirm & Add to Cart
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

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