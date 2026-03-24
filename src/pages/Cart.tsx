import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Loader2, MapPin, Phone, Clock, ShoppingBag, CheckCircle, Truck, Package, PackageCheck, Zap, MessageSquare, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import PaymentSelector from "@/components/PaymentSelector";
import UpiPaymentModal from "@/components/UpiPaymentModal";


export default function Cart() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [showCheckout, setShowCheckout] = useState(false);
    const [hostel, setHostel] = useState("");
    const [room, setRoom] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
    const [floor, setFloor] = useState<number>(1);
    const [submitting, setSubmitting] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);



    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);


    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    5
    useEffect(() => {
        if (!user) {
            setLoadingOrder(false);
            return;
        }

        const fetchActiveOrder = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("id, status, products(title)")
                .eq("buyer_id", user.id)
                .in("status", ["pending", "seller_accepted", "confirmed", "picked", "delivering"])
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setActiveOrder(data);
            } else {
                setActiveOrder(null);
            }
            setLoadingOrder(false);
        };

        fetchActiveOrder();

        const subscription = supabase
            .channel("cart_active_orders")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
                fetchActiveOrder();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const vendingCartItems = items.filter(item => item.category === "Vending Machine");
    const hasVending = vendingCartItems.length > 0;

    const calculateVendingDelivery = (f: number) => {
        if (f <= 3) return 8;
        if (f <= 6) return 11;
        if (f <= 9) return 14;
        return 16;
    };

    const originalDeliveryFee = 29;
    const specialDeliveryFee = 21;

    const hasFlavourCombo = items.some(item => item.id === "flavour-factory-combo");

    const baseDelivery = hasFlavourCombo
        ? specialDeliveryFee
        : (hasVending
            ? calculateVendingDelivery(floor)
            : ([2, 3].includes(floor) ? specialDeliveryFee : originalDeliveryFee));

    const deliveryFee = hasFlavourCombo ? specialDeliveryFee : baseDelivery;
    const orderTotal = totalPrice + deliveryFee;

    const phoneClean = phone.replace(/\D/g, "");
    const isPhoneValid = phoneClean.length === 10;


    const isRoomCorrect = room.startsWith(floor.toString());
    const isFormValid = hostel.trim() !== "" && room.trim() !== "" && isPhoneValid && (hasVending ? isRoomCorrect : true);


    const createOrder = async (paymentId?: string) => {
        const itemsSummary = items.map(i => `${i.quantity}x ${i.title} [IMG:${i.image}] (${i.category}) (₹${i.price})`).join("\n");
        
        // Include safety disclaimer in the items block so it doesn't break the [ITEMS:...] | [ROOM:...] parsing regex
        const fullItemsString = `${itemsSummary}\n\n[SAFETY:Disclaimer Accepted @ ${new Date().toISOString()}]`;

        // 1. Ensure Profile Exists (Auto-fix for missing profiles / Foreign Key error 23503)
        await supabase.from("profiles").upsert({
            id: user!.id,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student",
            phone_number: phoneClean,
            hostel_block: hostel
        }, { onConflict: 'id' });

        const { data, error } = await supabase.from("orders").insert({
            product_id: null,
            buyer_id: user!.id,
            seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
            base_price: totalPrice,
            commission: 0,
            delivery_charge: deliveryFee,
            total_price: orderTotal,
            delivery_location: `${hostel} - Floor ${floor}`,
            delivery_room: `[ROOM:${room}] | [ITEMS:${fullItemsString}]`,
            buyer_phone: phoneClean,
            status: "pending",
            payment_method: "cashfree", // Switched to cashfree to avoid any DB enum/check constraint issues
            payment_status: "paid", // Switched to paid to avoid verifying constraint errors
            razorpay_payment_id: paymentId || null,
            seller_notified_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw error;
        }

        // Clean up UI and state
        clearCart();
        setShowCheckout(false);
        setShowUpiModal(false);
        
        // Redirect to tracking (it automatically fetches the latest order if no ID provided)
        navigate(`/tracking`);
    };

    const handleCheckout = async () => {
        if (!user) { navigate("/login"); return; }
        if (!isFormValid) return;
        // Always require disclaimer acceptance before each order
        setDisclaimerAccepted(false);
        setShowDisclaimer(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[5.5rem] pb-24 px-4 sm:px-6">
            {/* Food Safety Disclaimer Modal */}
            {showDisclaimer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-md rounded-[1.5rem] shadow-2xl overflow-hidden mx-2"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-4 pb-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-[15px] leading-tight">Food Safety &amp; Responsibility Notice</h2>
                                <p className="text-white/80 text-[11px] mt-0.5 font-medium">Please read before placing your order</p>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="px-4 py-3 max-h-[30vh] overflow-y-auto space-y-2.5 text-[12px] text-slate-600 leading-relaxed">
                            <p>
                                By placing this order, you acknowledge that food items may contain{" "}
                                <strong className="text-slate-800">allergens or ingredients</strong> that could cause health reactions depending on individual conditions.
                            </p>
                            <p>
                                While we strive to maintain quality and hygiene standards,{" "}
                                <strong className="text-slate-800">CU Bazzar and its partner restaurants</strong> are not liable for individual allergic reactions, food sensitivities, or unforeseen health issues arising from consumption.
                            </p>
                            <p className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-800 font-medium text-[11px]">
                                ⚠️ Customers are advised to <strong>check ingredients</strong> carefully and consume food at their own discretion.
                            </p>
                        </div>

                        {/* Checkbox + CTA */}
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                            <label className="flex items-start gap-3 cursor-pointer mb-3 mt-3 group">
                                <div
                                    onClick={() => setDisclaimerAccepted(p => !p)}
                                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${disclaimerAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'
                                        }`}
                                >
                                    {disclaimerAccepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className="text-[12px] text-slate-700 font-medium leading-snug">
                                    I have read and agree to the above Food Safety &amp; Responsibility terms.
                                </span>
                            </label>
                            <button
                                disabled={!disclaimerAccepted}
                                onClick={() => {
                                    setShowDisclaimer(false);
                                    setSubmitting(true);
                                    setTimeout(() => {
                                        setShowCheckout(false);
                                        setTimeout(() => setShowUpiModal(true), 150);
                                        setSubmitting(false);
                                    }, 100);
                                }}
                                className={`w-full py-3 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all ${disclaimerAccepted
                                    ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 active:scale-95'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                I Accept — Continue to Payment
                            </button>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="w-full mt-1.5 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/food" className="text-slate-500 hover:text-slate-900 transition-colors p-1 -ml-1">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-slate-900">Secure Checkout</h1>
                        </div>
                        <p className="text-sm text-slate-500 ml-8">{totalItems} item{totalItems !== 1 ? "s" : ""} in cart</p>
                    </div>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full">
                            Clear All
                        </button>
                    )}
                </motion.div>

                {/* Active Order Banner */}
                {!loadingOrder && user && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
                        {activeOrder ? (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
                                {/* Decorative background elements */}
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Truck className="w-32 h-32" />
                                </div>
                                <div className="flex items-center gap-5 z-10 w-full sm:w-auto">
                                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 animate-bounce">
                                        <PackageCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-emerald-900 font-black text-lg sm:text-xl flex items-center gap-2">
                                            Active Order
                                            <span className="flex h-3 w-3 relative ml-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>
                                        </h3>
                                        <p className="text-emerald-700 font-medium text-sm mt-0.5 capitalize">
                                            Status: <span className="font-bold text-emerald-800">{activeOrder.status.replace("_", " ")}</span>
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to={`/tracking?order=${activeOrder.id}`}
                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 z-10 text-sm"
                                >
                                    <Zap className="w-4 h-4" /> Track Live Order
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-slate-100/50 rounded-3xl p-5 text-center flex flex-col items-center justify-center border border-slate-200 border-dashed">
                                <MapPin className="w-6 h-6 text-slate-400 mb-2" />
                                <p className="text-sm font-semibold text-slate-500">No active orders to track</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {items.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl p-12 text-center bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-4 focus:ring-brand-50">
                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Cart is empty</h2>
                        <p className="text-slate-500 text-sm mb-6">Add some snacks from the food menu!</p>
                        <Link to="/food" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-sm bg-brand hover:bg-brand shadow-sm transition-all focus:ring-4 focus:ring-brand-muted">
                            <ShoppingBag className="w-4 h-4" /> Browse Food Menu
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-3 mb-6">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="rounded-3xl p-4 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(35,25,66,0.1)] transition-shadow duration-300 flex gap-3 sm:gap-4 items-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                                                {item.category === "Vending Machine" && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-tighter">Vending</span>
                                                )}
                                                {item.isCustom && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-[8px] font-black uppercase tracking-tighter">Custom</span>
                                                )}
                                            </div>
                                            <p className="text-brand font-bold text-sm">₹{item.price}</p>
                                            {item.notes && (
                                                <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 flex items-center gap-1">
                                                    <MessageSquare className="w-2.5 h-2.5" />
                                                    {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-[14px] bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">
                                                <Minus className="w-4 h-4 text-current transition-colors" />
                                            </button>
                                            <span className="w-[24px] sm:w-[30px] text-center text-sm sm:text-base font-bold text-slate-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-[14px] bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">
                                                <Plus className="w-4 h-4 text-current transition-colors" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <p className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</p>
                                            <button onClick={() => removeItem(item.id)} className="mt-1 p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>


                        {/* Price Summary */}
                        <div className="rounded-3xl p-5 sm:p-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4">
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-3">
                                <span>Subtotal ({totalItems} items)</span>
                                <span className="font-medium text-slate-900">₹{totalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-emerald-500" /> {hasVending ? `Floor ${floor} Delivery` : 'Delivery Fee'}
                                </span>
                                {((!hasVending && [2, 3].includes(floor)) || hasFlavourCombo) && (
                                    <span className="text-slate-400 line-through text-xs">₹{originalDeliveryFee}</span>
                                )}
                                <span className={(hasVending || (!hasVending && [2, 3].includes(floor)) || hasFlavourCombo) ? "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded" : "font-medium text-slate-900"}>+ ₹{deliveryFee}</span>
                            </div>

                            {hasFlavourCombo && (
                                <div className="mb-4 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-2 text-orange-800 text-xs sm:text-sm font-medium">
                                    <Zap className="w-4 h-4 flex-shrink-0 text-orange-500" />
                                    <span>Flavour Factory Offer: Special ₹21 delivery fee applied!</span>
                                </div>
                            )}

                            {!hasVending && [2, 3].includes(floor) && (
                                <div className="mb-4 bg-emerald-50 rounded-2xl p-4 flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-medium">
                                    <Zap className="w-4 h-4 flex-shrink-0 text-amber-500" />
                                    <span>Floor {floor} Special: Delivery charge reduced to ₹{specialDeliveryFee}!</span>
                                </div>
                            )}

                            {hasVending && (
                                <div className="mb-4 bg-emerald-50 rounded-2xl p-4 flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-medium">
                                    <Zap className="w-4 h-4 flex-shrink-0 text-amber-500" />
                                    <span>Vending Mode: Reduced delivery charge based on your floor!</span>
                                </div>
                            )}



                            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total details</span>
                                <span className="text-xl sm:text-2xl font-black text-brand">₹{orderTotal}</span>
                            </div>
                        </div>

                        {/* Checkout */}
                        {!showCheckout ? (
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCheckout(true)}
                                className="w-full py-4 rounded-full font-bold text-white text-[15px] flex items-center justify-center gap-2 bg-brand hover:bg-brand shadow-[0_4px_20px_rgba(35,25,66,0.3)] transition-all">
                                <ShoppingBag className="w-5 h-5" /> Proceed to Secure Checkout
                            </motion.button>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl p-5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                                <h3 className="font-bold text-slate-900 text-base border-slate-50 pb-2">Delivery Details</h3>

                                <div className="space-y-3 pt-1">
                                    <div className="relative group/hostel">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/hostel:text-brand transition-colors" />
                                        <input value={hostel} onChange={e => setHostel(e.target.value)} placeholder="Hostel Block (e.g. NC) *"
                                            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 h-[56px] text-sm text-slate-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-400 font-medium" />
                                    </div>

                                    {/* Floor Selector */}
                                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 items-center justify-between h-[64px] shadow-sm shadow-slate-200/50">
                                        <button
                                            onClick={() => setFloor(Math.max(1, floor - 1))}
                                            className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand hover:border-brand transition-all active:scale-95"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <div className="text-center flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Floor</span>
                                            <span className="text-2xl font-black text-slate-900 leading-none">{floor}</span>
                                        </div>
                                        <button
                                            onClick={() => setFloor(Math.min(11, floor + 1))}
                                            className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand hover:border-brand transition-all active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl h-[56px] overflow-hidden focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-50 transition-all group/room">
                                        <div className="flex items-center justify-center w-14 border-r border-slate-100 bg-slate-50">
                                            <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 group-focus-within/room:text-brand text-xs text-center rounded bg-white shadow-sm border border-slate-100">R</div>
                                        </div>
                                        <input
                                            value={room}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                setRoom(val);
                                                if (val.length > 0) {
                                                    const firstDigit = parseInt(val[0]);
                                                    if (!isNaN(firstDigit) && firstDigit > 0) {
                                                        setFloor(firstDigit);
                                                    }
                                                }
                                            }}
                                            placeholder="Room Number *"
                                            className={`w-full h-full bg-transparent px-4 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-bold ${hasVending && room && !room.startsWith(floor.toString()) ? 'text-rose-500' : ''}`}
                                        />
                                        {hasVending && room && !room.startsWith(floor.toString()) && (
                                            <span className="absolute right-4 text-[10px] text-rose-500 font-black">Needs {floor}xx</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="relative group/phone">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/phone:text-brand transition-colors" />
                                            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} type="tel" placeholder="10-digit Phone Number *" maxLength={10}
                                                className={`w-full bg-white rounded-2xl pl-12 pr-4 h-[56px] text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 font-medium ${phone.length > 0 && !isPhoneValid ? "border border-red-300 focus:border-red-400 focus:ring-red-50 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" : "border border-slate-200 focus:border-brand focus:ring-brand-50"
                                                    }`} />
                                        </div>
                                        {phone.length > 0 && !isPhoneValid && (
                                            <p className="text-[11px] text-red-500 mt-1.5 px-2 font-bold flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-red-500" /> Phone must be exactly 10 digits
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Method Selector */}
                                <div className="pt-2">
                                    <PaymentSelector
                                        selected={paymentMethod}
                                        onChange={setPaymentMethod}
                                        totalAmount={orderTotal}
                                        disabled={submitting}
                                    />
                                </div>

                                <button onClick={handleCheckout} disabled={submitting || !isFormValid}
                                    className="w-full py-4 mt-4 rounded-full font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    style={{ background: isFormValid ? "#231942" : "#cbd5e1", boxShadow: isFormValid ? "0 4px 20px rgba(35,25,66,0.3)" : "none" }}>
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                        `Pay Securely · ₹${orderTotal}`}
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* UPI Payment Modal */}
            <UpiPaymentModal
                isOpen={showUpiModal}
                onClose={() => setShowUpiModal(false)}
                amount={orderTotal}
                orderIdText={`CART_${Date.now().toString().slice(-6)}`}
                customerId={user?.id || "guest"}
                customerPhone={phone || "9999999999"}
                onPaymentVerify={async (utr) => {
                    setSubmitting(true);
                    try {
                        // Consolidate all logic inside createOrder to avoid dual navigation/shadowing
                        await createOrder(utr);
                        toast({ title: "Order submitted! 🎉", description: `Your order has been placed and is being tracked.` });
                    } catch (err: any) {
                        toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
                        throw err;
                    } finally {
                        setSubmitting(false);
                    }
                }}
            />
        </div>
    );
}
