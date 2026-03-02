import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera, ShoppingCart, CheckCircle, XCircle, Clock, Bell, Sparkles, ExternalLink, Trash2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* ─── Liquid-glass shared style helpers ─────────────────────────────────── */
const glass = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const glassHeavy = {
    ...glass,
    background: 'rgba(255,255,255,0.04)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [hostelBlock, setHostelBlock] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);

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
            if (formattedUsername) payload.username = formattedUsername;

            const { data, error } = await supabase.from("profiles").upsert(payload, { onConflict: 'id' }).select();
            if (error) {
                if (error.code === '23505') throw new Error("That username is already taken!");
                throw error;
            }
            if (!data || data.length === 0) throw new Error("Update failed.");
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

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) {
                const { error: fallbackError } = await supabase.storage.from('product-images').upload(filePath, file);
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
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 relative overflow-hidden" style={{ backgroundColor: '#0A0505' }}>
            {/* ── Ambient background glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(255,107,107,0.06)' }} />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(77,184,172,0.04)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'rgba(240,192,64,0.03)' }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">

                {/* ═══════════════════════════════════════════════════════
                    LEFT — PROFILE CARD
                ═══════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 rounded-3xl p-6 flex flex-col items-center text-center h-fit relative overflow-hidden"
                    style={glassHeavy}
                >
                    {/* Glass shine */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />

                    {/* Edit Toggle */}
                    <button
                        onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }}
                        disabled={loading}
                        className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all z-10"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#8F8175' }} /> :
                            isEditing ? <Check className="w-4 h-4" style={{ color: '#4DB8AC' }} /> :
                                <Edit2 className="w-4 h-4" style={{ color: '#8F8175' }} />}
                    </button>

                    {/* Avatar */}
                    <div className="relative group/avatar cursor-pointer mt-2 mb-4" onClick={() => isEditing && fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full p-[3px] transition-transform group-hover/avatar:scale-105" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4444, #F0C040)' }}>
                            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#1A120E' }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10" style={{ color: '#8F8175' }} />
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    {/* Name */}
                    {isEditing ? (
                        <input
                            className="text-xl font-black text-center w-full mb-1 rounded-lg px-3 py-2 focus:outline-none transition-all"
                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8DED4', border: '1px solid #3D342C' }}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your Name"
                        />
                    ) : (
                        <h2 className="text-xl font-black mb-0.5" style={{ color: '#E8DED4' }}>{profile?.full_name || "Student User"}</h2>
                    )}

                    {/* Username & Email */}
                    {isEditing ? (
                        <div className="flex flex-col items-center mt-1 mb-5 w-full">
                            <div className="flex items-center gap-1 w-3/4 rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #3D342C' }}>
                                <span className="text-sm font-mono" style={{ color: '#8F8175' }}>@</span>
                                <input
                                    className="bg-transparent outline-none text-sm font-mono flex-1"
                                    style={{ color: '#E8DED4' }}
                                    value={profile?.username || ""}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                    placeholder="username"
                                    maxLength={20}
                                />
                            </div>
                            <span className="text-[11px] mt-2" style={{ color: '#6B5F54' }}>{user.email}</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-mono font-bold mb-0.5" style={{ color: '#FF6B6B' }}>@{profile?.username || "student"}</p>
                            <p className="text-[11px] mb-5" style={{ color: '#6B5F54' }}>{user.email}</p>
                        </>
                    )}

                    {/* Info Pills */}
                    <div className="w-full space-y-2.5 mb-6">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ ...glass }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(77,184,172,0.12)' }}>
                                <MapPin className="w-3.5 h-3.5" style={{ color: '#4DB8AC' }} />
                            </div>
                            {isEditing ? (
                                <input className="bg-transparent outline-none w-full text-sm" style={{ color: '#E8DED4' }}
                                    value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="Block A, Room 102" />
                            ) : (
                                <span className="text-sm" style={{ color: profile?.hostel_block ? '#E8DED4' : '#6B5F54' }}>
                                    {profile?.hostel_block || "No hostel added"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ ...glass }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(240,192,64,0.12)' }}>
                                <Phone className="w-3.5 h-3.5" style={{ color: '#F0C040' }} />
                            </div>
                            {isEditing ? (
                                <input className="bg-transparent outline-none w-full text-sm" style={{ color: '#E8DED4' }}
                                    value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 9876543210" />
                            ) : (
                                <span className="text-sm" style={{ color: profile?.phone_number ? '#E8DED4' : '#6B5F54' }}>
                                    {profile?.phone_number || "No phone added"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={async () => { await signOut(); navigate("/login"); }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', color: '#FF5050' }}
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    RIGHT — ACTIVITY PANELS
                ═══════════════════════════════════════════════════════ */}
                <div className="col-span-1 md:col-span-2 space-y-5">

                    {/* ─── My Active Listings ─────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="rounded-3xl p-5 sm:p-7 relative overflow-hidden"
                        style={glass}
                    >
                        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(77,184,172,0.03) 0%, transparent 60%)' }} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-black flex items-center gap-2.5" style={{ color: '#E8DED4' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(77,184,172,0.12)', border: '1px solid rgba(77,184,172,0.15)' }}>
                                        <Package className="w-4 h-4" style={{ color: '#4DB8AC' }} />
                                    </div>
                                    My Listings
                                </h3>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(77,184,172,0.1)', color: '#4DB8AC' }}>
                                    {myProducts.length} items
                                </span>
                            </div>

                            {loadingListings ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin" style={{ color: '#4DB8AC' }} /></div>
                            ) : myProducts.length === 0 ? (
                                <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <Package className="w-10 h-10 mx-auto mb-3" style={{ color: '#3D342C' }} />
                                    <p className="text-sm mb-3" style={{ color: '#6B5F54' }}>No listings yet</p>
                                    <button onClick={() => navigate('/list')}
                                        className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 mx-auto"
                                        style={{ background: '#FF6B6B', color: '#fff', boxShadow: '0 4px 16px rgba(255,107,107,0.2)' }}>
                                        <Sparkles className="w-3.5 h-3.5" /> Sell Something
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {myProducts.map((cmd) => (
                                        <div key={cmd.id} className="group rounded-2xl p-3 flex gap-3 items-center transition-all hover:scale-[1.01]"
                                            style={{ ...glass }}>
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                <img src={cmd.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt={cmd.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate" style={{ color: '#E8DED4' }}>{cmd.title}</h4>
                                                <p className="font-black text-sm" style={{ color: '#FF6B6B' }}>₹{cmd.price}</p>
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-0.5" style={cmd.status === 'sold' ? { background: 'rgba(255,80,80,0.12)', color: '#FF5050' } : { background: 'rgba(77,184,172,0.12)', color: '#4DB8AC' }}>
                                                    {cmd.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {cmd.status !== 'sold' && (
                                                    <button onClick={() => handleMarkSold(cmd.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(77,184,172,0.1)' }} title="Mark Sold">
                                                        <Tag className="w-3.5 h-3.5" style={{ color: '#4DB8AC' }} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteListing(cmd.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(255,80,80,0.1)' }} title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" style={{ color: '#FF5050' }} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ─── Incoming Orders ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                        className="rounded-3xl p-5 sm:p-7 relative overflow-hidden"
                        style={glass}
                    >
                        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,168,50,0.03) 0%, transparent 60%)' }} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-black flex items-center gap-2.5" style={{ color: '#E8DED4' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,168,50,0.12)', border: '1px solid rgba(255,168,50,0.15)' }}>
                                        <ShoppingCart className="w-4 h-4" style={{ color: '#FFA832' }} />
                                    </div>
                                    Incoming Orders
                                </h3>
                                {incomingOrders.filter(o => o.status === "pending").length > 0 && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold animate-pulse" style={{ background: 'rgba(255,168,50,0.15)', color: '#FFA832', border: '1px solid rgba(255,168,50,0.2)' }}>
                                        {incomingOrders.filter(o => o.status === "pending").length} new
                                    </span>
                                )}
                            </div>

                            {loadingOrders ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin" style={{ color: '#FFA832' }} /></div>
                            ) : incomingOrders.length === 0 ? (
                                <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: '#3D342C' }} />
                                    <p className="text-sm" style={{ color: '#6B5F54' }}>No incoming orders yet</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    <div className="space-y-3">
                                        {incomingOrders.map((order) => (
                                            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="rounded-2xl p-4 transition-all"
                                                style={{
                                                    ...glass,
                                                    borderColor: order.status === "pending" ? 'rgba(255,168,50,0.2)' :
                                                        order.status === "seller_accepted" ? 'rgba(77,184,172,0.2)' : 'rgba(255,80,80,0.15)',
                                                    background: order.status === "pending" ? 'rgba(255,168,50,0.04)' :
                                                        order.status === "seller_accepted" ? 'rgba(77,184,172,0.04)' : 'rgba(255,80,80,0.03)',
                                                }}>
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                        <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80"} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate" style={{ color: '#E8DED4' }}>{order.products?.title || "Product"}</p>
                                                        <p className="font-black text-sm" style={{ color: '#FF6B6B' }}>₹{order.total_price?.toLocaleString()}</p>
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5" style={
                                                            order.status === "pending" ? { background: 'rgba(255,168,50,0.15)', color: '#FFA832' } :
                                                                order.status === "seller_accepted" ? { background: 'rgba(77,184,172,0.15)', color: '#4DB8AC' } :
                                                                    { background: 'rgba(255,80,80,0.12)', color: '#FF5050' }
                                                        }>
                                                            {order.status === "pending" ? "Awaiting Your Response" :
                                                                order.status === "seller_accepted" ? "Accepted" : "Rejected"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="rounded-xl p-3 mb-3 space-y-1" style={{ ...glass }}>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B5F54' }}>Buyer Details</p>
                                                    <p className="text-sm font-bold" style={{ color: '#E8DED4' }}>{order.buyer?.full_name || "Buyer"}</p>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: '#8F8175' }}><Phone className="w-3 h-3" /> {order.buyer_phone || "—"}</p>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: '#8F8175' }}><MapPin className="w-3 h-3" /> {order.delivery_location}{order.delivery_room ? `, Room ${order.delivery_room}` : ""}</p>
                                                </div>
                                                <p className="text-xs flex items-center gap-1 mb-3" style={{ color: '#6B5F54' }}>
                                                    <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                                {order.status === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAcceptOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                                            style={{ background: 'rgba(77,184,172,0.1)', border: '1px solid rgba(77,184,172,0.2)', color: '#4DB8AC' }}>
                                                            {processingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept
                                                        </button>
                                                        <button onClick={() => handleRejectOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                                            style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', color: '#FF5050' }}>
                                                            <XCircle className="w-4 h-4" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>

                    {/* ─── Saved Items ─────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="rounded-3xl p-5 sm:p-7 relative overflow-hidden"
                        style={glass}
                    >
                        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.03) 0%, transparent 60%)' }} />
                        <div className="relative z-10">
                            <h3 className="text-lg font-black flex items-center gap-2.5 mb-5" style={{ color: '#E8DED4' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.15)' }}>
                                    <Heart className="w-4 h-4" style={{ color: '#FF6B6B' }} />
                                </div>
                                Saved Items
                            </h3>
                            <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: '#3D342C' }} />
                                <p className="text-sm" style={{ color: '#6B5F54' }}>No saved items</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
