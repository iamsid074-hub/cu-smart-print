import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera, ShoppingCart, CheckCircle, XCircle, Clock, Bell, Plus, Trash2, Tag, X, Mail, Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type TabId = 'listings' | 'orders' | 'saved';

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

    const [activeTab, setActiveTab] = useState<TabId>('listings');
    const [showProfileCard, setShowProfileCard] = useState(false);

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
            .select(`*, products(title, image_url, price), buyer:profiles!orders_buyer_id_fkey(full_name, phone_number, hostel_block)`)
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
        else { toast.success("Order accepted!"); fetchIncomingOrders(); }
        setProcessingOrderId(null);
    };

    const handleRejectOrder = async (orderId: string) => {
        if (!confirm("Reject this order?")) return;
        setProcessingOrderId(orderId);
        const { error } = await supabase.from("orders")
            .update({ status: "seller_rejected" }).eq("id", orderId);
        if (error) toast.error("Failed to reject order");
        else { toast.warning("Order rejected."); fetchIncomingOrders(); }
        setProcessingOrderId(null);
    };

    const handleMarkSold = async (id: string) => {
        const { error } = await supabase.from("products").update({ status: 'sold' }).eq('id', id);
        if (!error) { setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' } : p)); toast.success("Marked as sold"); }
        else toast.error("Failed");
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm("Delete this listing?")) return;
        const { error } = await supabase.from("products").delete().eq('id', id);
        if (!error) { setMyProducts(prev => prev.filter(p => p.id !== id)); toast.success("Deleted"); }
        else toast.error("Failed");
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const formattedUsername = profile.username?.toLowerCase().trim();
            if (formattedUsername && !/^[a-zA-Z0-9_]{3,20}$/.test(formattedUsername)) throw new Error("Username: 3-20 chars, no spaces.");
            const payload: any = { id: user.id, full_name: fullName || user.email?.split('@')[0] || "Student", hostel_block: hostelBlock, phone_number: phoneNumber };
            if (formattedUsername) payload.username = formattedUsername;
            const { data, error } = await supabase.from("profiles").upsert(payload, { onConflict: 'id' }).select();
            if (error) { if (error.code === '23505') throw new Error("Username taken"); throw error; }
            if (!data?.length) throw new Error("Update failed");
            setProfile(data[0]);
            toast.success("Profile saved");
            setIsEditing(false);
        } catch (err: any) { toast.error(err.message || "Failed"); }
        finally { setLoading(false); }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            if (!event.target.files?.length) return;
            const file = event.target.files[0];
            const filePath = `${user?.id}-${Math.random()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) {
                const { error: fb } = await supabase.storage.from('product-images').upload(filePath, file);
                if (fb) throw fb;
                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                await updateAvatarUrl(data.publicUrl);
                return;
            }
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await updateAvatarUrl(data.publicUrl);
        } catch (e: any) { toast.error("Upload error: " + e.message); }
        finally { setLoading(false); }
    };

    const updateAvatarUrl = async (url: string) => {
        if (!user) return;
        const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
        if (error) throw error;
        setProfile({ ...profile, avatar_url: url });
        toast.success("Avatar updated");
    };

    if (!user) return null;

    const pendingCount = incomingOrders.filter(o => o.status === "pending").length;

    const tabs: { id: TabId; label: string; count?: number }[] = [
        { id: 'listings', label: 'Listings', count: myProducts.length },
        { id: 'orders', label: 'Orders', count: pendingCount || undefined },
        { id: 'saved', label: 'Saved' },
    ];

    return (
        <div className="min-h-screen pt-16 pb-24" style={{ backgroundColor: '#0f0f10' }}>
            <div className="max-w-2xl mx-auto px-4">

                {/* ── PROFILE HEADER STRIP ── */}
                <div className="py-6 border-b" style={{ borderColor: '#1e1e21' }}>
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => { if (isEditing) fileInputRef.current?.click(); else setShowProfileCard(true); }}>
                            <div className="w-14 h-14 rounded-full overflow-hidden transition-transform hover:scale-105" style={{ backgroundColor: '#1a1a1d', border: '1px solid #2a2a2e' }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-6 h-6" style={{ color: '#555' }} />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 w-14 h-14 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Name"
                                        className="text-base font-semibold w-full rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/20"
                                        style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }} />
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md flex-1" style={{ backgroundColor: '#1a1a1d', border: '1px solid #2a2a2e' }}>
                                            <span className="text-xs" style={{ color: '#555' }}>@</span>
                                            <input value={profile?.username || ""} onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                                className="bg-transparent outline-none text-xs flex-1 min-w-0" style={{ color: '#e0e0e0' }} placeholder="username" maxLength={20} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} placeholder="Hostel + Room"
                                            className="text-xs rounded-md px-2.5 py-1.5 flex-1 focus:outline-none"
                                            style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }} />
                                        <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone"
                                            className="text-xs rounded-md px-2.5 py-1.5 flex-1 focus:outline-none"
                                            style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-base font-semibold" style={{ color: '#e0e0e0' }}>{profile?.full_name || "Student"}</h2>
                                    <p className="text-xs" style={{ color: '#777' }}>@{profile?.username || "user"} · {user.email}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {profile?.hostel_block && (
                                            <span className="text-xs flex items-center gap-1" style={{ color: '#666' }}>
                                                <MapPin className="w-3 h-3" /> {profile.hostel_block}
                                            </span>
                                        )}
                                        {profile?.phone_number && (
                                            <span className="text-xs flex items-center gap-1" style={{ color: '#666' }}>
                                                <Phone className="w-3 h-3" /> {profile.phone_number}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: isEditing ? '#1a3a2a' : '#1a1a1d',
                                    color: isEditing ? '#4ade80' : '#999',
                                    border: `1px solid ${isEditing ? '#2a5a3a' : '#2a2a2e'}`,
                                }}
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                    isEditing ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Save</span> :
                                        <span className="flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</span>}
                            </button>
                            <button
                                onClick={async () => { await signOut(); navigate("/login"); }}
                                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                style={{ backgroundColor: '#1a1a1d', color: '#ef4444', border: '1px solid #2a2a2e' }}
                            >
                                <LogOut className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TAB NAVIGATION ── */}
                <div className="flex gap-6 mt-4 border-b" style={{ borderColor: '#1e1e21' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative pb-3 text-sm font-medium transition-colors flex items-center gap-1.5"
                            style={{ color: activeTab === tab.id ? '#e0e0e0' : '#555' }}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{
                                    backgroundColor: tab.id === 'orders' ? '#3b2a0a' : '#1a2a1a',
                                    color: tab.id === 'orders' ? '#f59e0b' : '#4ade80',
                                }}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#e0e0e0' }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT ── */}
                <div className="mt-4">
                    <AnimatePresence mode="wait">

                        {/* LISTINGS */}
                        {activeTab === 'listings' && (
                            <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                {loadingListings ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#555' }} /></div>
                                ) : myProducts.length === 0 ? (
                                    <div className="py-12 text-left">
                                        <p className="text-sm font-medium" style={{ color: '#888' }}>No listings yet</p>
                                        <p className="text-xs mt-1" style={{ color: '#555' }}>Start selling items to your campus community.</p>
                                        <button onClick={() => navigate('/list')}
                                            className="mt-4 px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                                            style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }}>
                                            <Plus className="w-3 h-3" /> Create a Listing
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {myProducts.map(item => (
                                            <div key={item.id}
                                                className="group flex items-center gap-3 py-3 px-3 rounded-lg transition-colors"
                                                style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#161618')}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: '#1a1a1d' }}>
                                                    <img src={item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#d0d0d0' }}>{item.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-semibold" style={{ color: '#e0e0e0' }}>₹{item.price}</span>
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={
                                                            item.status === 'sold' ? { backgroundColor: '#2a1a1a', color: '#ef4444' } : { backgroundColor: '#1a2a1a', color: '#4ade80' }
                                                        }>
                                                            {item.status === 'sold' ? 'Sold' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.status !== 'sold' && (
                                                        <button onClick={() => handleMarkSold(item.id)} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1a2a1a' }} title="Mark Sold">
                                                            <Tag className="w-3 h-3" style={{ color: '#4ade80' }} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteListing(item.id)} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#2a1a1a' }} title="Delete">
                                                        <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ORDERS */}
                        {activeTab === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                {loadingOrders ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#555' }} /></div>
                                ) : incomingOrders.length === 0 ? (
                                    <div className="py-12 text-left">
                                        <p className="text-sm font-medium" style={{ color: '#888' }}>No incoming orders</p>
                                        <p className="text-xs mt-1" style={{ color: '#555' }}>When someone buys your product, it'll appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {incomingOrders.map(order => (
                                            <div key={order.id} className="rounded-lg p-4" style={{ backgroundColor: '#161618', border: '1px solid #1e1e21' }}>
                                                {/* Order header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: '#1a1a1d' }}>
                                                        <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80"} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate" style={{ color: '#d0d0d0' }}>{order.products?.title || "Product"}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs font-semibold" style={{ color: '#e0e0e0' }}>₹{order.total_price}</span>
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={
                                                                order.status === "pending" ? { backgroundColor: '#3b2a0a', color: '#f59e0b' } :
                                                                    order.status === "seller_accepted" ? { backgroundColor: '#1a2a1a', color: '#4ade80' } :
                                                                        { backgroundColor: '#2a1a1a', color: '#ef4444' }
                                                            }>
                                                                {order.status === "pending" ? "Pending" : order.status === "seller_accepted" ? "Accepted" : "Rejected"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] flex-shrink-0" style={{ color: '#555' }}>
                                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </span>
                                                </div>

                                                {/* Buyer */}
                                                <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid #1e1e21' }}>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#555' }}>Buyer</p>
                                                    <p className="text-xs font-medium" style={{ color: '#ccc' }}>{order.buyer?.full_name || "—"}</p>
                                                    <div className="flex gap-4">
                                                        <span className="text-[11px] flex items-center gap-1" style={{ color: '#666' }}><Phone className="w-2.5 h-2.5" /> {order.buyer_phone || "—"}</span>
                                                        <span className="text-[11px] flex items-center gap-1" style={{ color: '#666' }}><MapPin className="w-2.5 h-2.5" /> {order.delivery_location}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {order.status === "pending" && (
                                                    <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #1e1e21' }}>
                                                        <button onClick={() => handleAcceptOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                            style={{ backgroundColor: '#1a2a1a', color: '#4ade80', border: '1px solid #2a3a2a' }}>
                                                            {processingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Accept
                                                        </button>
                                                        <button onClick={() => handleRejectOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                            style={{ backgroundColor: '#2a1a1a', color: '#ef4444', border: '1px solid #3a2a2a' }}>
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* SAVED */}
                        {activeTab === 'saved' && (
                            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                <div className="py-12 text-left">
                                    <p className="text-sm font-medium" style={{ color: '#888' }}>No saved items</p>
                                    <p className="text-xs mt-1" style={{ color: '#555' }}>Tap the heart on products to save them here.</p>
                                    <button onClick={() => navigate('/browse')}
                                        className="mt-4 px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                                        style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }}>
                                        Browse Products
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── ANIMATED PROFILE CARD OVERLAY ── */}
            {showProfileCard && createPortal(
                <div className="fixed inset-0 z-[9999]" style={{ isolation: 'isolate' }}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 profile-card-backdrop" onClick={() => setShowProfileCard(false)} />

                    {/* Card */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 profile-card-appear">
                        <div className="w-[300px] rounded-xl overflow-hidden" style={{ backgroundColor: '#161618', border: '1px solid #1e1e21', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                            {/* Close */}
                            <button onClick={() => setShowProfileCard(false)} className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: '#1a1a1d' }}>
                                <X className="w-3.5 h-3.5" style={{ color: '#999' }} />
                            </button>

                            {/* Header bg */}
                            <div className="h-20 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,107,107,0.15), transparent 60%)' }} />
                            </div>

                            {/* Avatar overlapping header */}
                            <div className="flex justify-center -mt-10 relative z-10">
                                <div className="w-20 h-20 rounded-full p-[2px] profile-card-avatar" style={{ background: '#161618' }}>
                                    <div className="w-full h-full rounded-full overflow-hidden" style={{ border: '2px solid #2a2a2e' }}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1d' }}>
                                                <User className="w-8 h-8" style={{ color: '#555' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-5 pt-3 text-center profile-card-content">
                                <h3 className="text-lg font-semibold" style={{ color: '#e0e0e0' }}>{profile?.full_name || "Student"}</h3>
                                <p className="text-xs font-medium mt-0.5" style={{ color: '#ef4444' }}>@{profile?.username || "user"}</p>

                                {/* Bio / Email */}
                                <p className="text-xs mt-3 leading-relaxed" style={{ color: '#888' }}>
                                    CU Bazzar member · Campus marketplace user
                                </p>

                                {/* Divider */}
                                <div className="my-4 h-px" style={{ backgroundColor: '#1e1e21' }} />

                                {/* Info grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#1a1a1d' }}>
                                        <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
                                        <span className="text-[11px] truncate" style={{ color: '#999' }}>{user.email?.split('@')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#1a1a1d' }}>
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
                                        <span className="text-[11px] truncate" style={{ color: '#999' }}>{profile?.hostel_block || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#1a1a1d' }}>
                                        <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
                                        <span className="text-[11px] truncate" style={{ color: '#999' }}>{profile?.phone_number || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#1a1a1d' }}>
                                        <Package className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
                                        <span className="text-[11px] truncate" style={{ color: '#999' }}>{myProducts.length} listings</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => { setShowProfileCard(false); setIsEditing(true); }}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                        style={{ backgroundColor: '#1a1a1d', color: '#e0e0e0', border: '1px solid #2a2a2e' }}>
                                        <Edit2 className="w-3 h-3" /> Edit Profile
                                    </button>
                                    <button onClick={() => navigate('/browse')}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                        style={{ backgroundColor: '#1a2a1a', color: '#4ade80', border: '1px solid #2a3a2a' }}>
                                        <Globe className="w-3 h-3" /> Browse
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Profile Card Animation Styles */}
            <style>{`
                @keyframes profileCardBackdropIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes profileCardIn {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); border-radius: 50%; }
                    60% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); border-radius: 12px; }
                    100% { transform: translate(-50%, -50%) scale(1); border-radius: 12px; }
                }
                @keyframes profileCardAvatarIn {
                    0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes profileCardContentIn {
                    0% { opacity: 0; transform: translateY(12px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .profile-card-backdrop {
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    animation: profileCardBackdropIn 0.25s ease forwards;
                }
                .profile-card-appear {
                    animation: profileCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .profile-card-avatar {
                    animation: profileCardAvatarIn 0.4s 0.3s ease both;
                }
                .profile-card-content {
                    animation: profileCardContentIn 0.4s 0.35s ease both;
                }
            `}</style>
        </div>
    );
}
