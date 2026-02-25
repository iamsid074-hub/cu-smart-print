import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Share2, MapPin, Clock, BadgeCheck, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryRoom, setDeliveryRoom] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            if (!id) return;

            const { data } = await supabase
                .from("products")
                .select(`*, profiles(*)`)
                .eq("id", id)
                .single();

            setProduct(data);
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-16 px-4 flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-16 px-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <button onClick={() => navigate(-1)} className="text-neon-cyan underline">Go back</button>
            </div>
        );
    }

    const isOwner = user?.id === product.seller_id;

    const handleChatWithSeller = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Navigate to Chat page and pass the seller profile as state so Chat auto-opens it
        navigate('/chat', { state: { contact: product.profiles } });
    };

    // Calculate Dynamic Delivery Fee based on Time of Day
    const getDeliveryFee = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 15; // Morning: Low
        if (hour >= 12 && hour < 18) return 25; // Afternoon: Moderate
        return 40; // Night: Highest
    };

    const deliveryFee = getDeliveryFee();
    const totalAmount = product ? product.price + deliveryFee : 0;

    const handleBuyNow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!deliveryLocation.trim() || !phone.trim()) {
            toast({ title: "Details missing", description: "Please enter delivery location and phone number.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const commission = Math.round(product.price * 0.05); // 5% commission
            const { data, error } = await supabase.from("orders").insert({
                product_id: product.id,
                buyer_id: user.id,
                seller_id: product.seller_id,
                base_price: product.price,
                commission,
                delivery_charge: deliveryFee,
                total_price: totalAmount,
                delivery_location: deliveryLocation,
                delivery_room: deliveryRoom || null,
                buyer_phone: phone,
                status: 'pending',
                seller_notified_at: new Date().toISOString(),
            }).select().single();

            if (error) throw error;

            toast({ title: "Order Placed! 🎉", description: "Waiting for seller confirmation..." });
            setIsBuyModalOpen(false);
            navigate(`/tracking?order=${data.id}`);
        } catch (err: any) {
            toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column - Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl overflow-hidden glass border border-white/5 relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-black/40"
                    >
                        <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'}
                            alt={product.title}
                            className="w-full h-full object-contain"
                        />
                        {/* Top right actions */}
                        <div className="absolute top-4 right-4 flex gap-3">
                            <button className="premium-glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-neon-pink shadow-lg">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="premium-glass-button w-12 h-12 flex items-center justify-center text-foreground hover:text-neon-cyan shadow-lg">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status badge */}
                        {product.status !== 'available' && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                                <span className="text-4xl font-black text-rose-500 tracking-widest uppercase rotate-[-15deg] border-4 border-rose-500 px-6 py-2 rounded-xl bg-black/50 shadow-neon-fire">
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
                                <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan mb-2 block">{product.category}</span>
                                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2">
                                    {product.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <p className="text-4xl font-extrabold text-neon-fire tracking-tight">₹{product.price.toLocaleString()}</p>
                            {product.original_price && (
                                <p className="text-lg text-muted-foreground line-through font-medium mt-2">₹{product.original_price.toLocaleString()}</p>
                            )}
                            {product.original_price && product.original_price > product.price && (
                                <span className="bg-green-500/20 text-green-400 font-bold px-3 py-1 rounded-full text-sm mt-2">
                                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-neon-cyan" /> {product.condition}
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" /> {product.age || 'Unknown age'}
                            </div>
                        </div>

                        {/* Seller Info box */}
                        <div className="p-6 rounded-3xl glass border border-white/10 mb-8 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-neon-pink to-neon-orange p-0.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                                        {product.profiles?.avatar_url ? (
                                            <img src={product.profiles.avatar_url} alt="Seller" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xl">{product.profiles?.full_name?.charAt(0) || "S"}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{product.profiles?.full_name || "Student User"}</p>
                                    <p className="text-sm text-neon-cyan font-mono">@{product.profiles?.username || "student"}</p>
                                    {product.profiles?.hostel_block && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
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
                                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-fire text-white font-bold shadow-neon-fire hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag className="w-5 h-5" /> Buy Now
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md glass-heavy border border-white/10 bg-[#0A0A0F]/95 backdrop-blur-xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black">Checkout</DialogTitle>
                                                <DialogDescription className="text-muted-foreground">
                                                    Complete your purchase securely.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="mt-4 flex flex-col gap-6">
                                                {/* Product Summary */}
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 hidden sm:block">
                                                        <img src={product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt="product" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold line-clamp-1">{product.title}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-sm text-muted-foreground">Base Price</p>
                                                            <p className="font-semibold">₹{product.price.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center gap-1 text-sm text-neon-cyan">
                                                                <Clock className="w-3 h-3" /> Delivery
                                                            </div>
                                                            <p className="font-semibold text-neon-cyan">+ ₹{deliveryFee}</p>
                                                        </div>
                                                        <div className="w-full h-[1px] bg-white/10 my-2" />
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold">Total</p>
                                                            <p className="font-black text-neon-fire text-lg">₹{totalAmount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkout Form */}
                                                <form onSubmit={handleBuyNow} className="flex flex-col gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Hostel / Block</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={deliveryLocation}
                                                            onChange={e => setDeliveryLocation(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all"
                                                            placeholder="e.g. Zakir Hussain Block A"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Room Number (optional)</label>
                                                        <input
                                                            type="text"
                                                            value={deliveryRoom}
                                                            onChange={e => setDeliveryRoom(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all"
                                                            placeholder="e.g. 402"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Contact Number</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={phone}
                                                            onChange={e => setPhone(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all"
                                                            placeholder="e.g. 9876543210"
                                                        />
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                                                        <p className="text-sm text-green-400 font-semibold gap-1 flex items-center justify-center">
                                                            <BadgeCheck className="w-4 h-4" /> Cash on Delivery available
                                                        </p>
                                                        <p className="text-xs text-green-400/70 mt-0.5">Pay when your item is delivered.</p>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full py-4 mt-2 rounded-xl bg-neon-fire text-black font-black uppercase tracking-wide hover:shadow-neon-fire transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Place Order (₹${totalAmount.toLocaleString()})`}
                                                    </button>
                                                </form>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <button
                                        onClick={handleChatWithSeller}
                                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-transform flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-5 h-5" /> Chat Seller
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description Tab */}
                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-lg font-bold mb-3 border-b border-white/10 pb-2">Reason for Selling</h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {product.reason_for_selling || "No reason provided."}
                                </p>
                            </div>

                            <div className="text-xs text-muted-foreground/50 font-mono flex items-center gap-2 mt-8">
                                <span>Listed on {new Date(product.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>ID: {product.id}</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
