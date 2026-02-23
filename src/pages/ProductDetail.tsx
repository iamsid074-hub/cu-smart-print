import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Share2, MapPin, Clock, BadgeCheck, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                                <button
                                    onClick={handleChatWithSeller}
                                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-blue text-white font-bold shadow-neon-blue hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" /> Chat Seller
                                </button>
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
