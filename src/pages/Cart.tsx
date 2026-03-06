import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Loader2, MapPin, Phone, Clock, ShoppingBag, CheckCircle } from "lucide-react";
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
    const [submitting, setSubmitting] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);

    const phoneClean = phone.replace(/\D/g, "");
    const isPhoneValid = phoneClean.length === 10;
    const isFormValid = hostel.trim() !== "" && room.trim() !== "" && isPhoneValid;

    // Filter items by category to determine original delivery charge
    const campusShopsItems = items.filter(item => item.category === "Campus Shops");
    const otherItems = items.filter(item => item.category !== "Campus Shops");

    let originalDeliveryFee = 10; // Start with base 10
    if (campusShopsItems.length > 0) {
        // If there's a campus shop item, base delivery is 15
        originalDeliveryFee = 15;
        if (otherItems.length > 0) {
            // Mixed items means higher fee normally
            originalDeliveryFee = 20;
        }
    }

    // Apply promo code logic
    const deliveryFee = promoApplied ? 5 : originalDeliveryFee;
    const orderTotal = totalPrice + deliveryFee;

    const handleApplyPromo = () => {
        if (promoCode.trim().toUpperCase() === "CRICKET5") {
            setPromoApplied(true);
            toast({ title: "Promo Applied!", description: "Delivery fee reduced to ₹5. Enjoy the match!" });
        } else {
            setPromoApplied(false);
            toast({ title: "Invalid Code", description: "The promo code entered is not valid.", variant: "destructive" });
        }
    };

    const createOrder = async (paymentId?: string) => {
        const itemsSummary = items.map(i => `${i.quantity}x ${i.title} (₹${i.price})`).join("\n");
        const { error } = await supabase.from("orders").insert({
            product_id: null,
            buyer_id: user!.id,
            seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
            base_price: totalPrice,
            commission: 0,
            delivery_charge: deliveryFee,
            total_price: orderTotal,
            delivery_location: `${hostel} [Custom Food: ${items[0]?.title}${items.length > 1 ? ` +${items.length - 1} more` : ""}...]`,
            delivery_room: `[CUSTOM FOOD ORDER]\n${itemsSummary}`,
            buyer_phone: phoneClean,
            status: "pending",
            payment_method: paymentMethod === "online" ? "upi" : "cod",
            payment_status: paymentMethod === "online" ? "verifying" : "pending",
            razorpay_payment_id: paymentId || null,
            seller_notified_at: new Date().toISOString(),
        });
        if (error) throw error;
    };

    const handleCheckout = async () => {
        if (!user) { navigate("/login"); return; }
        if (!isFormValid) return;
        setSubmitting(true);
        try {
            if (paymentMethod === "online") {
                setShowCheckout(false); // Close checkout panel first
                setTimeout(() => setShowUpiModal(true), 150); // Smooth transition
                setSubmitting(false);
                return;
            } else {
                await createOrder();
                toast({ title: "Order placed", description: `${totalItems} items ordered. Pay ₹${orderTotal} on delivery.` });
                clearCart();
                setShowCheckout(false);
                navigate("/tracking");
            }
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[5.5rem] pb-24 px-4 sm:px-6">
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
                                            <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                                            <p className="text-brand font-bold">₹{item.price}</p>
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

                        {/* Promo Code Section */}
                        <div className="rounded-3xl p-5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4 flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Apply Promo Code
                                </label>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        if (promoApplied && e.target.value.toUpperCase() !== "CRICKET5") {
                                            setPromoApplied(false); // Reset if they start typing something else
                                        }
                                    }}
                                    placeholder="Enter CRICKET5"
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-400 uppercase"
                                    disabled={promoApplied}
                                />
                            </div>
                            <button
                                onClick={handleApplyPromo}
                                disabled={!promoCode.trim() || promoApplied}
                                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${promoApplied
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                                    }`}
                            >
                                {promoApplied ? "Applied!" : "Apply"}
                            </button>
                        </div>

                        {/* Price Summary */}
                        <div className="rounded-3xl p-5 sm:p-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4">
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-3">
                                <span>Subtotal ({totalItems} items)</span>
                                <span className="font-medium text-slate-900">₹{totalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-emerald-500" /> Delivery Fee
                                </span>
                                <div className="flex items-center gap-2">
                                    {promoApplied && <span className="text-slate-400 line-through text-xs">₹{campusShopsItems.length > 0 ? (otherItems.length > 0 ? 20 : 15) : 10}</span>}
                                    <span className={promoApplied ? "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded" : "font-medium text-slate-900"}>+ ₹{deliveryFee}</span>
                                </div>
                            </div>

                            {promoApplied && (
                                <div className="mb-4 bg-emerald-50 rounded-2xl p-4 flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-medium">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>You saved ₹{(campusShopsItems.length > 0 ? (otherItems.length > 0 ? 20 : 15) : 10) - 5} on delivery!</span>
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
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input value={hostel} onChange={e => setHostel(e.target.value)} placeholder="Hostel Block (e.g. BH-1) *"
                                            className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 h-[52px] text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-400" />
                                    </div>
                                    <div className="relative flex items-center bg-slate-50 rounded-2xl h-[52px] overflow-hidden focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-50 transition-all">
                                        <div className="flex items-center justify-center w-14 bg-slate-100/50">
                                            <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 text-xs text-center rounded bg-white shadow-sm">R</div>
                                        </div>
                                        <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room Number *"
                                            className="w-full h-full bg-transparent px-3 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} type="tel" placeholder="10-digit Phone Number *" maxLength={10}
                                                className={`w-full bg-slate-50 rounded-2xl pl-12 pr-4 h-[52px] text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-slate-400 ${phone.length > 0 && !isPhoneValid ? "border border-red-300 focus:border-red-400 focus:ring-red-50" : "border border-transparent focus:ring-brand-50 focus:border-brand-50"
                                                    }`} />
                                        </div>
                                        {phone.length > 0 && !isPhoneValid && (
                                            <p className="text-[11px] text-red-500 mt-1 px-1 font-medium">Phone must be exactly 10 digits</p>
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
                        await createOrder(utr);
                        toast({ title: "Order submitted", description: `Admin will verify your payment of ₹${orderTotal}.` });
                        clearCart();
                        setShowCheckout(false);
                        setShowUpiModal(false);
                        navigate("/tracking");
                    } catch (err: any) {
                        toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
                    } finally {
                        setSubmitting(false);
                    }
                }}
            />
        </div>
    );
}
