import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera, ShoppingCart, CheckCircle, XCircle, Clock, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Editable fields
    const [fullName, setFullName] = useState("");
    const [hostelBlock, setHostelBlock] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // My Listings
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);

    // Seller: Incoming Orders
    const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfileAndListings() {
            if (!user) return;
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (data) {
                setProfile(data);
                setFullName(data.full_name || "");
                setHostelBlock(data.hostel_block || "");
                setPhoneNumber(data.phone_number || "");
            }

            const { data: listings } = await supabase
                .from("products")
                .select("*")
                .eq("seller_id", user.id)
                .order("created_at", { ascending: false });

            setMyProducts(listings || []);
            setLoadingListings(false);
        }
        fetchProfileAndListings();
    }, [user]);

    // ── Seller: fetch incoming orders ──────────────────────────────────────────
    const fetchIncomingOrders = async () => {
        if (!user) return;
        const { data } = await supabase
            .from("orders")
            .select(`
                *,
                products(title, image_url, price),
                buyer:profiles!orders_buyer_id_fkey(full_name, phone_number, hostel_block)
            `)
            .eq("seller_id", user.id)
            .in("status", ["pending", "seller_accepted", "seller_rejected"])
            .order("created_at", { ascending: false });

        const orders = (data || []) as any[];

        // Auto-forward orders pending > 8 minutes to admin
        const now = Date.now();
        for (const o of orders) {
            if (o.status === "pending") {
                const placedAt = new Date(o.seller_notified_at || o.created_at).getTime();
                if ((now - placedAt) / 60000 > 8) {
                    await supabase.from("orders").update({ status: "confirmed", accepted_at: new Date().toISOString() }).eq("id", o.id);
                    o.status = "confirmed";
                }
            }
        }
        setIncomingOrders(orders.filter((o: any) => ["pending", "seller_accepted", "seller_rejected"].includes(o.status)));
        setLoadingOrders(false);
    };

    useEffect(() => { fetchIncomingOrders(); }, [user]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel("seller_orders_rt")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `seller_id=eq.${user.id}` },
                () => { fetchIncomingOrders(); toast.success("📦 New order received!"); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const handleAcceptOrder = async (orderId: string) => {
        setProcessingOrderId(orderId);
        const { error } = await supabase.from("orders")
            .update({ status: "seller_accepted", accepted_at: new Date().toISOString() }).eq("id", orderId);
        if (error) toast.error("Failed to accept order");
        else { toast.success("Order accepted! Admin will pickup."); fetchIncomingOrders(); }
        setProcessingOrderId(null);
    };

    const handleRejectOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to reject this order?")) return;
        setProcessingOrderId(orderId);
        const { error } = await supabase.from("orders")
            .update({ status: "seller_rejected" }).eq("id", orderId);
        if (error) toast.error("Failed to reject order");
        else { toast.warning("Order rejected."); fetchIncomingOrders(); }
        setProcessingOrderId(null);
    };

    const handleMarkSold = async (id: string) => {
        const { error } = await supabase.from("products").update({ status: 'sold' }).eq('id', id);
        if (!error) {
            setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' } : p));
            toast.success("Item marked as sold!");
        } else {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        const { error } = await supabase.from("products").delete().eq('id', id);
        if (!error) {
            setMyProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Listing deleted.");
        } else {
            toast.error("Failed to delete listing");
        }
    };


    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const formattedUsername = profile.username?.toLowerCase().trim();
            if (formattedUsername && !/^[a-zA-Z0-9_]{3,20}$/.test(formattedUsername)) {
                throw new Error("Username must be 3-20 characters long and contain no spaces.");
            }

            const payload: any = {
                id: user.id,
                full_name: fullName || user.email?.split('@')[0] || "Student User",
                hostel_block: hostelBlock,
                phone_number: phoneNumber,
            };

            if (formattedUsername) {
                payload.username = formattedUsername;
            }

            const { data, error } = await supabase
                .from("profiles")
                .upsert(payload, { onConflict: 'id' })
                .select();

            if (error) {
                if (error.code === '23505') throw new Error("That username is already taken!");
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error("Update failed. Data was not persisted.");
            }

            setProfile(data[0]);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            // Upload to Supabase Storage - assuming a public bucket named 'avatars' exists. 
            // If it fails, ensure the bucket is created in Supabase Dashboard.
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Graceful fallback if "avatars" bucket doesn't exist yet, we can try "product-images" temporarily
                const { error: fallbackError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (fallbackError) throw fallbackError;

                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                await updateAvatarUrl(data.publicUrl);
                return;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await updateAvatarUrl(data.publicUrl);

        } catch (error: any) {
            toast.error("Error uploading avatar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateAvatarUrl = async (url: string) => {
        if (!user) return;
        const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
        if (error) throw error;
        setProfile({ ...profile, avatar_url: url });
        toast.success("Avatar updated!");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Col - Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 glass-heavy rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center shadow-xl h-fit relative group"
                >
                    {/* Edit Toggle */}
                    <button
                        onClick={() => {
                            if (isEditing) handleSaveProfile();
                            else setIsEditing(true);
                        }}
                        disabled={loading}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Check className="w-5 h-5 text-neon-green" /> : <Edit2 className="w-5 h-5" />}
                    </button>

                    <div className="relative group/avatar cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-pink to-neon-orange p-1 mb-4 shadow-neon-pink transition-transform group-hover/avatar:scale-105">
                            <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 top-0 left-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity mx-auto">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col items-center w-full mb-1">
                            <input
                                className="bg-black/20 border-b border-white/20 outline-none text-center text-foreground font-bold text-2xl py-1 rounded w-full focus:border-neon-cyan transition-colors"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold mb-1">{profile?.full_name || "Student User"}</h2>
                    )}

                    {isEditing ? (
                        <div className="flex flex-col items-center mt-1 mb-6">
                            <span className="text-muted-foreground font-mono text-sm mb-1">@</span>
                            <input
                                className="bg-black/20 border-b border-white/20 outline-none text-center text-foreground font-mono py-1 rounded w-3/4 focus:border-neon-cyan transition-colors text-sm"
                                value={profile?.username || ""}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                placeholder="new_username"
                                maxLength={20}
                            />
                            <span className="text-xs text-muted-foreground mt-2">{user.email}</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-neon-cyan font-mono mb-1">@{profile?.username || "student"}</p>
                            <p className="text-xs text-muted-foreground mb-6">{user.email}</p>
                        </>
                    )}

                    <div className="w-full space-y-3 mb-8 text-sm text-left">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <MapPin className="w-4 h-4 text-neon-cyan font-bold flex-shrink-0" />
                            {isEditing ? (
                                <input
                                    className="bg-transparent border-b border-white/20 outline-none w-full text-foreground placeholder:text-muted-foreground/50 py-1"
                                    value={hostelBlock}
                                    onChange={(e) => setHostelBlock(e.target.value)}
                                    placeholder="e.g. Block A, Room 102"
                                />
                            ) : (
                                <span className={profile?.hostel_block ? "text-foreground" : "text-muted-foreground italic"}>
                                    {profile?.hostel_block || "No hostel added"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <Phone className="w-4 h-4 text-neon-green flex-shrink-0" />
                            {isEditing ? (
                                <input
                                    className="bg-transparent border-b border-white/20 outline-none w-full text-foreground placeholder:text-muted-foreground/50 py-1"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. +91 9876543210"
                                />
                            ) : (
                                <span className={profile?.phone_number ? "text-foreground" : "text-muted-foreground italic"}>
                                    {profile?.phone_number || "No phone number added"}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await signOut();
                            navigate("/login");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-medium relative group overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </motion.div>

                {/* Right Col - Activity */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-3xl p-6 sm:p-8 border border-white/5"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-neon-blue" /> My Active Listings
                        </h3>

                        {loadingListings ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-neon-cyan" /></div>
                        ) : myProducts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                                No listings yet. <button onClick={() => navigate('/list')} className="text-neon-cyan underline inline ml-1">Sell something</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {myProducts.map((cmd) => (
                                    <div key={cmd.id} className="relative group overflow-hidden rounded-2xl glass border border-white/5 hover:border-white/20 transition-all p-3 flex gap-4 items-center">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-background/50">
                                            <img src={cmd.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt={cmd.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-foreground truncate">{cmd.title}</h4>
                                            <p className="text-neon-fire font-bold">₹{cmd.price}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${cmd.status === 'sold' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{cmd.status}</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-background via-background/90 to-transparent w-24 flex flex-col justify-center items-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity gap-2 translate-x-4 group-hover:translate-x-0">
                                            {cmd.status !== 'sold' && (
                                                <button onClick={() => handleMarkSold(cmd.id)} className="premium-glass-button text-[10px] font-bold text-green-400 hover:text-green-300 uppercase underline px-2 py-1">Mark Sold</button>
                                            )}
                                            <button onClick={() => handleDeleteListing(cmd.id)} className="premium-glass-button text-[10px] font-bold text-red-400 hover:text-red-300 uppercase underline px-2 py-1">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass rounded-3xl p-6 sm:p-8 border border-white/5"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-neon-orange" /> Incoming Orders
                            {incomingOrders.filter(o => o.status === "pending").length > 0 && (
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neon-orange/20 border border-neon-orange/30 text-neon-orange font-bold animate-pulse">
                                    {incomingOrders.filter(o => o.status === "pending").length} new
                                </span>
                            )}
                        </h3>
                        {loadingOrders ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-neon-cyan" /></div>
                        ) : incomingOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No incoming orders yet.
                            </div>
                        ) : (
                            <AnimatePresence>
                                <div className="space-y-4">
                                    {incomingOrders.map((order) => (
                                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className={`glass rounded-2xl border p-4 ${order.status === "pending" ? "border-neon-orange/30 bg-neon-orange/5" :
                                                order.status === "seller_accepted" ? "border-neon-cyan/30 bg-neon-cyan/5" :
                                                    "border-red-500/20 bg-red-500/5 opacity-70"}`}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                                    <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80"} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{order.products?.title || "Product"}</p>
                                                    <p className="text-neon-fire font-bold text-sm">₹{order.total_price?.toLocaleString()}</p>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === "pending" ? "bg-neon-orange/20 text-neon-orange" :
                                                        order.status === "seller_accepted" ? "bg-neon-cyan/20 text-neon-cyan" :
                                                            "bg-red-500/20 text-red-400"}`}>
                                                        {order.status === "pending" ? "Awaiting Your Response" :
                                                            order.status === "seller_accepted" ? "Accepted — Admin Pickup Pending" : "Rejected"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="glass rounded-xl p-3 border border-white/5 mb-3 space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Buyer Details</p>
                                                <p className="text-sm font-semibold">{order.buyer?.full_name || "Buyer"}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {order.buyer_phone || "—"}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.delivery_location}{order.delivery_room ? `, Room ${order.delivery_room}` : ""}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                                                <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                            {order.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAcceptOrder(order.id)}
                                                        disabled={processingOrderId === order.id}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/25 transition-all disabled:opacity-50">
                                                        {processingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept
                                                    </button>
                                                    <button onClick={() => handleRejectOrder(order.id)}
                                                        disabled={processingOrderId === order.id}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50">
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass rounded-3xl p-6 sm:p-8 border border-white/5"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-neon-pink" /> Saved Items
                        </h3>
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                            No saved items.
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
