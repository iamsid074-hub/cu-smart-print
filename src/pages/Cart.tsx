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

    const phoneClean = phone.replace(/\D/g, "");
    const isPhoneValid = phoneClean.length === 10;
    const isFormValid = hostel.trim() !== "" && room.trim() !== "" && isPhoneValid;

    // Flat delivery fee
    const deliveryFee = 5;
    const orderTotal = totalPrice + deliveryFee;

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
        <div className="min-h-screen bg-[#0A0505] pt-24 pb-24 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/food" className="text-muted-foreground hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Your Cart</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""} in cart</p>
                    </div>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors">
                            Clear All
                        </button>
                    )}
                </motion.div>

                {items.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl p-12 text-center border border-white/10" style={{ backgroundColor: "#120805" }}>
                        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h2 className="text-xl font-bold text-white mb-2">Cart is empty</h2>
                        <p className="text-muted-foreground text-sm mb-6">Add some snacks from the food menu!</p>
                        <Link to="/food" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
                            style={{ background: "linear-gradient(135deg, #FF6B00, #FF4444)" }}>
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
                                        className="rounded-xl p-3 sm:p-4 border border-white/10 flex gap-3 sm:gap-4 items-center" style={{ backgroundColor: "#120805" }}>
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{item.title}</p>
                                            <p className="text-orange-400 font-bold">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                                <Minus className="w-3 h-3 text-white" />
                                            </button>
                                            <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                                <Plus className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <p className="text-sm font-bold text-white">₹{item.price * item.quantity}</p>
                                            <button onClick={() => removeItem(item.id)} className="mt-1 p-1 text-red-400/60 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Price Summary */}
                        <div className="rounded-xl p-4 border border-orange-500/15 mb-4" style={{ backgroundColor: "#120805" }}>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                                <span>Subtotal ({totalItems} items)</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-neon-cyan mb-3">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Delivery</span>
                                <span>+ ₹{deliveryFee}</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                <span className="font-bold text-white">Total</span>
                                <span className="text-xl font-black text-orange-400">₹{orderTotal}</span>
                            </div>
                        </div>

                        {/* Checkout */}
                        {!showCheckout ? (
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCheckout(true)}
                                className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                                style={{ background: "linear-gradient(135deg, #FF6B00, #FF4444)", boxShadow: "0 4px 16px rgba(255,107,0,0.25)" }}>
                                <ShoppingBag className="w-4 h-4" /> Proceed to Checkout
                            </motion.button>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl p-4 border border-orange-500/15 space-y-3" style={{ backgroundColor: "#120805" }}>
                                <h3 className="font-bold text-white text-sm">Delivery Details</h3>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200/40" />
                                    <input value={hostel} onChange={e => setHostel(e.target.value)} placeholder="Hostel Block (e.g. BH-1) *"
                                        className="w-full bg-black/40 border border-orange-500/20 rounded-xl pl-10 pr-4 h-[48px] text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20" />
                                </div>
                                <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room Number *"
                                    className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 h-[48px] text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20" />
                                <div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200/40" />
                                        <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} type="tel" placeholder="10-digit Phone Number *" maxLength={10}
                                            className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 h-[48px] text-sm text-orange-50 focus:outline-none focus:ring-1 transition-all placeholder:text-orange-200/20 ${phone.length > 0 && !isPhoneValid ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-orange-500/20 focus:border-orange-500 focus:ring-orange-500"
                                                }`} />
                                    </div>
                                    {phone.length > 0 && !isPhoneValid && (
                                        <p className="text-[11px] text-red-400 mt-1 px-1">Phone must be exactly 10 digits</p>
                                    )}
                                </div>

                                {/* Payment Method Selector */}
                                <PaymentSelector
                                    selected={paymentMethod}
                                    onChange={setPaymentMethod}
                                    totalAmount={orderTotal}
                                    disabled={submitting}
                                />

                                <button onClick={handleCheckout} disabled={submitting || !isFormValid}
                                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    style={{ background: isFormValid ? "linear-gradient(135deg, #FF6B00, #FF4444)" : "rgba(255,255,255,0.1)" }}>
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                        `Pay ₹${orderTotal} Online`}
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
