import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Share2, MapPin, Clock, BadgeCheck, Loader2, ArrowLeft, ShoppingBag, ShoppingCart, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import PaymentSelector from "@/components/PaymentSelector";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { validatePromo, getDeliveryFee, PROMO_CODE } from "@/utils/offerTimer";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const { addItem } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryRoom, setDeliveryRoom] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);

    // ── Favourites (localStorage) ──
    const favKey = `cubazzar_fav_${id}`;
    const [isFav, setIsFav] = useState(() => localStorage.getItem(favKey) === '1');

    const handleFav = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !isFav;
        setIsFav(next);
        if (next) {
            localStorage.setItem(favKey, '1');
            toast({ title: `${product?.title || 'Product'} saved to favourites` });
        } else {
            localStorage.removeItem(favKey);
            toast({ title: `Removed from favourites` });
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const text = `Check out "${product?.title}" for ₹${product?.price} on CU Bazzar!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: product?.title, text, url });
            } catch {/* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast({ title: "Link copied!", description: "Share it with your friends." });
            setTimeout(() => setCopied(false), 2500);
        }
    };

    useEffect(() => {
        async function fetchProduct() {
            if (!id) return;



            const { data, error } = await supabase
                .from("products")
                .select(`*, profiles(*)`)
                .eq("id", id)
                .single();

            if (error) {
                console.error("Product fetch error:", error);
            }

            setProduct(data);
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 text-center">
                <h1 className="text-3xl font-bold mb-4 text-slate-900">Product Not Found</h1>
                <button onClick={() => navigate(-1)} className="text-brand underline font-semibold">Go back</button>
            </div>
        );
    }

    const isOwner = user?.id === product.seller_id;



    // Delivery fee — ₹20 default, ₹12 with promo
    const deliveryFee = getDeliveryFee(promoApplied);
    const totalAmount = product ? product.price + deliveryFee : 0;

    const handleApplyPromo = () => {
        if (validatePromo(promoCode)) {
            setPromoApplied(true);
        } else {
            setPromoApplied(false);
        }
    };

    const handleBuyNow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!deliveryLocation.trim() || !deliveryRoom.trim()) {
            toast({ title: "Details missing", description: "Please enter hostel and room number.", variant: "destructive" });
            return;
        }
        const phoneClean = phone.replace(/\D/g, "");
        if (phoneClean.length !== 10) {
            toast({ title: "Invalid phone", description: "Phone must be exactly 10 digits.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            if (paymentMethod === "online") {
                setIsBuyModalOpen(false); // Close delivery modal first
                setTimeout(() => setShowUpiModal(true), 150); // Smooth transition
                setIsSubmitting(false);
                return;
            }

            await finalizeOrder("cod", null);
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    const finalizeOrder = async (method: "online" | "cod", utrNumber: string | null) => {
        setIsSubmitting(true);
        try {
            const commission = Math.round(product.price * 0.05);
            const { data, error } = await supabase.from("orders").insert({
                product_id: product.id,
                buyer_id: user!.id,
                seller_id: product.seller_id,
                base_price: product.price,
                commission,
                delivery_charge: deliveryFee,
                total_price: totalAmount,
                delivery_location: deliveryLocation,
                delivery_room: deliveryRoom || null,
                buyer_phone: phone.replace(/\D/g, ""),
                status: 'pending',
                payment_method: method === "online" ? "cashfree" : "cod",
                payment_status: method === "online" ? "paid" : "pending",
                razorpay_payment_id: utrNumber,
                seller_notified_at: new Date().toISOString(),
            }).select().single();

            if (error) throw error;

            toast({ title: method === "online" ? "Order submitted" : "Order placed", description: method === "online" ? `Admin will verify payment.` : "Pay on delivery." });
            setIsBuyModalOpen(false);
            setShowUpiModal(false);
            navigate(`/tracking?order=${data.id}`);
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-32 px-4">
            <div className="max-w-6xl mx-auto">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column - Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-[2.5rem] overflow-hidden relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                    >
                        <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'}
                            alt={product.title}
                            className="w-full h-full object-contain mix-blend-multiply sm:p-4"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'; }}
                        />
                        {/* Top right actions */}
                        <div className="absolute top-6 right-6 flex gap-3 z-10">
                            <button
                                onClick={handleFav}
                                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 ${isFav
                                    ? 'bg-pink-50 text-pink-500'
                                    : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-pink-500 hover:bg-white'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 transition-all ${isFav ? 'fill-current scale-110' : ''}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                title="Share this product"
                                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 ${copied
                                    ? 'bg-emerald-50 text-emerald-500 scale-110'
                                    : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-brand-accent hover:bg-white'
                                    }`}
                            >
                                {copied
                                    ? <span className="text-xs font-bold">✓</span>
                                    : <Share2 className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Status badge */}
                        {product.status !== 'available' && (
                            <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                                <span className="text-4xl font-black text-rose-500 tracking-widest uppercase rotate-[-15deg] border-4 border-rose-500 px-8 py-3 rounded-full bg-white shadow-sm">
                                    {product.status}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column - Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-brand mb-2 block">{product.category}</span>
                                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2 text-slate-900">
                                    {product.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <p className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{product.price.toLocaleString()}</p>
                            {product.original_price && (
                                <p className="text-lg text-slate-400 line-through font-medium mt-2">₹{product.original_price.toLocaleString()}</p>
                            )}
                            {product.original_price && product.original_price > product.price && (
                                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm mt-2">
                                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <div className="px-5 py-2.5 rounded-full bg-brand-50 text-brand text-sm font-bold flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-brand" /> {product.condition}
                            </div>
                            <div className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" /> {product.age || 'Unknown age'}
                            </div>
                        </div>

                        {/* Seller Info box */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-accent to-brand-light p-[3px] shadow-sm">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                                        {product.profiles?.avatar_url ? (
                                            <img src={product.profiles.avatar_url} alt="Seller" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xl text-slate-700">{product.profiles?.full_name?.charAt(0) || "S"}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-slate-900">{product.profiles?.full_name || "Student User"}</p>
                                    <p className="text-sm text-brand font-medium">@{product.profiles?.username || "student"}</p>
                                    {product.profiles?.hostel_block && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {product.profiles.hostel_block}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!isOwner && product.status === 'available' && (
                                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                                    <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                                        <DialogTrigger asChild>
                                            <button
                                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand hover:bg-brand text-white font-bold shadow-sm transition-transform flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <ShoppingBag className="w-5 h-5" /> Buy Now
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-6 sm:p-8">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black text-slate-900">Checkout</DialogTitle>
                                                <DialogDescription className="text-slate-500">
                                                    Complete your purchase securely.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="mt-4 flex flex-col gap-6">
                                                {/* Product Summary */}
                                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50/80">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white hidden sm:block shadow-sm">
                                                        <img src={product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt="product" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold line-clamp-1 text-slate-900">{product.title}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-sm text-slate-500">Base Price</p>
                                                            <p className="font-semibold text-slate-900">₹{product.price.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center gap-1 text-sm text-brand">
                                                                <Clock className="w-3 h-3" /> Delivery
                                                            </div>
                                                            <p className="font-semibold text-brand">+ ₹{deliveryFee}</p>
                                                        </div>
                                                        <div className="w-full h-[1px] bg-slate-200 my-2.5" />
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-slate-900">Total</p>
                                                            <p className="font-black text-brand text-lg">₹{totalAmount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Promo Code */}
                                                <div className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3 text-emerald-500" /> Promo Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={promoCode}
                                                            onChange={(e) => {
                                                                setPromoCode(e.target.value.toUpperCase());
                                                                if (promoApplied && e.target.value.toUpperCase() !== PROMO_CODE) setPromoApplied(false);
                                                            }}
                                                            placeholder="Enter Promo Code"
                                                            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-50 placeholder:text-slate-400 font-bold uppercase"
                                                            disabled={promoApplied}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyPromo}
                                                        disabled={!promoCode.trim() || promoApplied}
                                                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${promoApplied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'}`}
                                                    >
                                                        {promoApplied ? '✓ Applied' : 'Apply'}
                                                    </button>
                                                </div>
                                                {promoApplied && (
                                                    <p className="text-xs text-emerald-600 font-medium -mt-4">🏆 {PROMO_CODE} applied — Delivery ₹12!</p>
                                                )}

                                                {/* Checkout Form */}
                                                <form onSubmit={handleBuyNow} className="flex flex-col gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Hostel / Block</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={deliveryLocation}
                                                            onChange={e => setDeliveryLocation(e.target.value)}
                                                            className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-400"
                                                            placeholder="e.g. Zakir Hussain Block A"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Room Number *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={deliveryRoom}
                                                            onChange={e => setDeliveryRoom(e.target.value)}
                                                            className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-400"
                                                            placeholder="e.g. 402"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Phone Number *</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={phone}
                                                            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                            maxLength={10}
                                                            className={`w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 ${phone.length > 0 && phone.length !== 10
                                                                ? 'border border-red-300 focus:ring-red-50 focus:border-red-400'
                                                                : 'border border-transparent focus:ring-brand-50 focus:border-brand-muted'
                                                                }`}
                                                            placeholder="e.g. 9876543210"
                                                        />
                                                        {phone.length > 0 && phone.length !== 10 && (
                                                            <p className="text-[11px] text-red-500 font-medium mt-1">Phone must be exactly 10 digits</p>
                                                        )}
                                                    </div>
                                                    <PaymentSelector
                                                        selected={paymentMethod}
                                                        onChange={setPaymentMethod}
                                                        totalAmount={totalAmount}
                                                        disabled={isSubmitting}
                                                    />

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || !deliveryLocation.trim() || !deliveryRoom.trim() || phone.length !== 10}
                                                        className="w-full py-4 mt-4 rounded-full bg-brand text-white font-bold tracking-wide hover:bg-brand hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${totalAmount.toLocaleString()} Online`}
                                                    </button>
                                                </form>
                                            </div>
                                        </DialogContent>
                                    </Dialog>


                                    <button
                                        onClick={() => {
                                            addItem({
                                                id: product.id,
                                                title: product.title,
                                                price: product.price,
                                                image: product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                                                category: product.category,
                                            });
                                            toast({ title: `${product.title} added to cart` });
                                        }}
                                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold transition-transform flex items-center justify-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description Tab */}
                        <div className="space-y-6 flex-1 bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900">Reason for Selling</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {product.reason_for_selling || "No reason provided."}
                                </p>
                            </div>

                            <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-8 pt-4 border-t border-slate-100">
                                <span>Listed on {new Date(product.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>ID: {product.id.slice(0, 8)}...</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>

            {/* UPI Payment Modal */}
            <UpiPaymentModal
                isOpen={showUpiModal}
                onClose={() => setShowUpiModal(false)}
                amount={totalAmount}
                orderIdText={`PRD_${product?.id?.slice(0, 6) || "ID"}`}
                customerId={user?.id || "guest"}
                customerPhone={phone || "9999999999"}
                onPaymentVerify={async (utr) => {
                    await finalizeOrder("online", utr);
                }}
            />
        </div>
    );
}
