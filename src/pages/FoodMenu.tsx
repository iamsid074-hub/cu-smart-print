import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Coffee, Apple, ShoppingBag, Clock, Loader2, Plus, BadgeCheck, Cookie, Soup, FileText, Send, MessageSquare, Sparkles, X, MapPin, Phone, ShoppingCart, Smartphone, Store, ChevronDown, ChevronRight as ChevRight, Mic, Search, History, TrendingUp, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { shops, type Shop, type MenuCategory } from "@/config/shopMenus";
import { getFoodSuggestions, estimatePrice, QUICK_TAGS, POPULAR_FOODS } from "@/utils/foodUtils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const { addItem, totalItems: cartCount } = useCart();

    const [activeTab, setActiveTab] = useState<'shops' | 'custom'>('shops');
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [expandedShop, setExpandedShop] = useState<string | null>(null);
    const [expandedMenuCat, setExpandedMenuCat] = useState<string | null>(null);

    // Form State
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom Order State
    const [customItemInput, setCustomItemInput] = useState("");
    const [customQty, setCustomQty] = useState(1);
    const [customPrice, setCustomPrice] = useState<string>("");
    const [customNotes, setCustomNotes] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [previewOrder, setPreviewOrder] = useState<any>(null);
    const [customItemList, setCustomItemList] = useState<any[]>([]);

    const suggestions = getFoodSuggestions(customItemInput);

    // UPI Payment State
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiSnapshot, setUpiSnapshot] = useState<{ type: 'snack' | 'custom'; price: number; title: string; foodId: string; location: string; phone: string; customItems?: string; customNotes?: string } | null>(null);

    // ── Voice Input ──
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
            setCustomItemInput(transcript);
            // Auto-estimate price after voice input
            const estimated = estimatePrice(transcript);
            setCustomPrice(estimated.toString());
        };

        recognition.start();
    };

    const addItemToList = () => {
        if (!customItemInput.trim()) {
            toast({ title: "What would you like?", description: "Please enter a food item.", variant: "destructive" });
            return;
        }

        const finalPrice = customPrice ? parseInt(customPrice) : estimatePrice(customItemInput);
        const newItem = {
            id: `CUSTOM-LIST-${Date.now()}`,
            name: customItemInput,
            price: finalPrice,
            quantity: customQty,
            notes: customNotes
        };

        setCustomItemList(prev => [...prev, newItem]);
        toast({ title: "Added to List", description: `${customQty}x ${customItemInput}` });

        // Reset inputs
        setCustomItemInput("");
        setCustomQty(1);
        setCustomPrice("");
        setCustomNotes("");
    };

    const handleAddToCartCustom = () => {
        if (customItemList.length === 0) return;

        customItemList.forEach(item => {
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

        toast({ 
            title: "Success!", 
            description: `${customItemList.length} custom items added to cart.` 
        });

        setCustomItemList([]);
        setPreviewOrder(null);
    };

    const removeFromList = (id: string) => {
        setCustomItemList(prev => prev.filter(item => item.id !== id));
    };

    // ── Custom Order: validate → close modal → open UPI ──
    const handleCustomOrder = async () => {
        if (!user) { navigate('/login'); return; }
        // This old handler is for direct buy, we'll keep it for the modal if needed
        // but the new flow is "Add to Cart"
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
                const itemSummary = `[CUSTOM FOOD ORDER]\n${customItemInput}${customNotes ? `\n---\nNotes: ${customNotes}` : ''}`;
                const { error } = await supabase.from("orders").insert({
                    product_id: null,
                    buyer_id: user.id,
                    seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
                    base_price: 0,
                    commission: 0,
                    delivery_charge: 20,
                    total_price: 20,
                    delivery_location: `${location} [Custom Food: ${customItemInput}]`,
                    delivery_room: itemSummary,
                    buyer_phone: phone,
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
            setCustomItemInput(""); setCustomNotes(""); setLocation(""); setPhone("");
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
        <div className="min-h-screen bg-[#fafafa] pt-[5.5rem] pb-16 px-4 sm:px-6 overflow-x-hidden relative font-sans">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* ── Tab Switcher ── */}
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

                            {shops.map((shop, si) => {
                                const isOpen = expandedShop === shop.id;
                                return (
                                    <motion.div
                                        key={shop.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: si * 0.05 }}
                                        className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 group"
                                    >
                                        <button
                                            onClick={() => { setExpandedShop(isOpen ? null : shop.id); setExpandedMenuCat(null); }}
                                            className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                                                <Store className="w-6 h-6 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{shop.name}</h3>
                                                    {shop.veg && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight">VEG</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-0.5 font-medium">{shop.tag}</p>
                                            </div>
                                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                <ChevronDown className="w-5 h-5 text-slate-300" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                    className="overflow-hidden border-t border-slate-50"
                                                >
                                                    <div className="px-5 pb-6 sm:px-6 sm:pb-8 space-y-4">
                                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 -mx-1 px-1">
                                                            {shop.categories.map((mc) => (
                                                                <button
                                                                    key={mc.category}
                                                                    onClick={() => setExpandedMenuCat(expandedMenuCat === mc.category ? null : mc.category)}
                                                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                                                                        expandedMenuCat === mc.category
                                                                            ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {mc.category}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {shop.categories
                                                            .filter((mc) => !expandedMenuCat || mc.category === expandedMenuCat)
                                                            .map((mc) => (
                                                                <div key={mc.category} className="mb-6">
                                                                    <div className="flex items-center gap-3 mb-3 px-1">
                                                                        <div className="h-[2px] w-4 bg-brand/20" />
                                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.1em]">{mc.category}</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        {mc.items.map((item, idx) => (
                                                                            <div
                                                                                key={`${mc.category}-${idx}`}
                                                                                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all duration-300 group/item shadow-sm"
                                                                            >
                                                                                <div className="flex-1 min-w-0 pr-3">
                                                                                    <span className="text-sm font-semibold text-slate-700 block truncate">{item.name}</span>
                                                                                    <span className="text-xs font-bold text-brand mt-0.5 block">{"\u20B9"}{item.price}</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        addItem({
                                                                                            id: `${shop.id}-${mc.category}-${idx}`,
                                                                                            title: `${item.name} (${shop.name})`,
                                                                                            price: item.price,
                                                                                            image: '',
                                                                                            category: 'shops',
                                                                                        });
                                                                                        toast({ 
                                                                                            title: "Added to Cart", 
                                                                                            description: `${item.name} from ${shop.name}` 
                                                                                        });
                                                                                    }}
                                                                                    className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                                                                                >
                                                                                    <Plus className="w-5 h-5" />
                                                                                </button>
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="custom-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                                
                                <div className="flex flex-col gap-6 relative z-10">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Custom Order</h2>
                                        <p className="text-sm text-slate-500 font-medium">Order anything, even if not listed!</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={customItemInput}
                                                onChange={(e) => {
                                                    setCustomItemInput(e.target.value);
                                                    setShowSuggestions(true);
                                                    // Auto-price if not manual
                                                    if (!customPrice) {
                                                        const estimated = estimatePrice(e.target.value);
                                                        if (estimated !== 80) setCustomPrice(""); 
                                                    }
                                                }}
                                                placeholder="What's in your mind? (e.g. Chicken Biryani)"
                                                className="w-full h-16 pl-16 pr-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                                            />
                                            <button 
                                                onClick={startListening}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                    isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100 shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                            >
                                                {isListening ? <div className="flex gap-0.5"><div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay:'0s'}}/><div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay:'0.1s'}}/><div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay:'0.2s'}}/></div> : <Mic className="w-5 h-5" />}
                                            </button>

                                            {/* Smart Suggestions Floating Menu */}
                                            <AnimatePresence>
                                                {showSuggestions && (customItemInput.trim() || suggestions.length > 0) && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
                                                    >
                                                        <div className="flex items-center justify-between mb-3 px-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                                                                    <Sparkles className="w-3.5 h-3.5" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    {customItemInput.trim() ? "Matches Found" : "Popular on Campus"}
                                                                </p>
                                                            </div>
                                                            <button onClick={() => setShowSuggestions(false)}>
                                                                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                                            </button>
                                                        </div>

                                                        <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-1">
                                                            {(customItemInput.trim() ? suggestions : POPULAR_FOODS).map((item: any, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => {
                                                                        setCustomItemInput(item.name);
                                                                        setCustomPrice(item.price.toString());
                                                                        setShowSuggestions(false);
                                                                    }}
                                                                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 transition-all text-left group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-accent group-hover:border-brand-100 transition-colors shadow-sm">
                                                                            {customItemInput.trim() ? <Search className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                                                            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                                                <Store className="w-2.5 h-2.5" />
                                                                                {item.shop}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-black text-brand bg-brand/5 px-3 py-1.5 rounded-full">{"\u20B9"}{item.price}</span>
                                                                        <ChevronDown className="w-4 h-4 text-slate-200 -rotate-90" />
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Quick Suggest Tags with AI badge */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-5 h-[1.5px] bg-slate-200" />
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-brand" /> Suggestions for you
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {QUICK_TAGS.map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setCustomItemInput(tag)}
                                                        className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-brand shadow-sm hover:text-white hover:border-brand hover:shadow-lg hover:shadow-brand/20 transition-all duration-300 active:scale-95 flex items-center gap-2"
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Controls */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 h-14 items-center gap-2">
                                                <p className="px-4 text-xs font-black text-slate-400 uppercase tracking-tight">Qty</p>
                                                <div className="flex-1 flex items-center justify-between px-2">
                                                    <button 
                                                        onClick={() => setCustomQty(Math.max(1, customQty - 1))}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand transition-all"
                                                    >
                                                        <Plus className="w-4 h-4 rotate-45" />
                                                    </button>
                                                    <span className="text-lg font-black text-slate-800">{customQty}</span>
                                                    <button 
                                                        onClick={() => setCustomQty(customQty + 1)}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-brand">{"\u20B9"}</div>
                                                <input
                                                    type="number"
                                                    value={customPrice}
                                                    onChange={(e) => setCustomPrice(e.target.value)}
                                                    placeholder={customItemInput ? `${estimatePrice(customItemInput)} (Estimated)` : "Expected Price"}
                                                    className="w-full h-14 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative h-full min-h-[120px]">
                                            <textarea
                                                value={customNotes}
                                                onChange={(e) => setCustomNotes(e.target.value)}
                                                placeholder="Special instructions (e.g. Extra spicy, No onion...)"
                                                className="w-full h-full p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium resize-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={addItemToList}
                                        className="w-full h-16 rounded-2xl bg-brand text-white font-black text-lg shadow-xl shadow-brand/20 hover:bg-brand-dark active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2"
                                    >
                                        Add to List
                                        <Plus className="w-5 h-5" />
                                    </button>

                                    {/* List of custom items */}
                                    <AnimatePresence>
                                        {customItemList.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 pt-2"
                                            >
                                                <div className="flex items-center justify-between px-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <History className="w-3 h-3" /> Your Order List
                                                    </p>
                                                    <p className="text-[10px] font-bold text-brand">{customItemList.length} {customItemList.length === 1 ? 'Item' : 'Items'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    {customItemList.map((item) => (
                                                        <motion.div 
                                                            key={item.id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group/list-item"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] font-black text-brand uppercase">{"\u20B9"}{item.price}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => removeFromList(item.id)}
                                                                className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setPreviewOrder({ items: customItemList })}
                                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                                >
                                                    Review & Add to Cart
                                                    <div className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Magical Matching</p>
                                    <p className="text-xs text-emerald-700/80 font-medium leading-relaxed mt-0.5">
                                        Once you place the order, our system automatically finds the best local vendor or shop to fulfill your request!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Preview Modal ── */}
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
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Item</p>
                                                <p className="text-base font-bold text-slate-800 truncate">{item.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Qty</p>
                                                <p className="text-base font-bold text-slate-800">x{item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price/Unit</p>
                                                <p className="text-sm font-bold text-slate-600">{"\u20B9"}{item.price}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-0.5">Subtotal</p>
                                                <p className="text-lg font-black text-brand">{"\u20B9"}{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                        {item.notes && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/50">
                                                <p className="text-[10px] font-bold text-slate-400 italic flex items-center gap-1.5">
                                                    <MessageSquare className="w-3 h-3" /> {item.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-[2rem] bg-brand/5 border border-brand/10 mt-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-3xl font-black text-brand">
                                        {"\u20B9"}{previewOrder?.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setPreviewOrder(null)}
                                    className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                                >
                                    Refine
                                </button>
                                <button
                                    onClick={handleAddToCartCustom}
                                    className="flex-[2] h-14 rounded-2xl bg-brand text-white font-black shadow-lg shadow-brand/20 active:scale-95 transition-all"
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* UPI Payment Modal - Kept for direct buy compatibility */}
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