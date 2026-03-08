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
    const [hasAutoShown, setHasAutoShown] = useState(false);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchIncomingOrders(); }, [user]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel("seller_orders_rt")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `seller_id=eq.${user.id}` },
                () => { fetchIncomingOrders(); toast.success("📦 New order received!"); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const pendingCount = incomingOrders.filter(o => o.status === "pending").length;

    const tabs: { id: TabId; label: string; count?: number }[] = [
        { id: 'listings', label: 'Listings', count: myProducts.length },
        { id: 'orders', label: 'Orders', count: pendingCount || undefined },
        { id: 'saved', label: 'Saved' },
    ];

    // Auto-show profile card on first load once profile is ready
    useEffect(() => {
        if (profile && !hasAutoShown) {
            const t = setTimeout(() => { setShowProfileCard(true); setHasAutoShown(true); }, 400);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    if (!user) return null;

    return (
        <div className="min-h-screen pt-16 pb-32 bg-slate-50">
            <div className="max-w-2xl mx-auto px-4">

                {/* ── PROFILE HEADER STRIP ── */}
                <div className="py-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        {/* Avatar — click to open animated profile card */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => { if (isEditing) fileInputRef.current?.click(); else setShowProfileCard(true); }}
                            >
                                {/* Pulsing ring hint */}
                                {!isEditing && (
                                    <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-brand" style={{ animationDuration: '2s' }} />
                                )}
                                <div className="relative w-14 h-14 rounded-full overflow-hidden transition-all group-hover:scale-105 bg-white border-2 border-brand-accent">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setShowProfileCard(true)}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors bg-white text-brand border border-brand-muted hover:bg-brand-50"
                                >
                                    View Card
                                </button>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Name"
                                        className="text-base font-semibold w-full rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-muted bg-white text-slate-900 border border-slate-200" />
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md flex-1 bg-white border border-slate-200">
                                            <span className="text-xs text-slate-400">@</span>
                                            <input value={profile?.username || ""} onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                                className="bg-transparent outline-none text-xs flex-1 min-w-0 text-slate-900" placeholder="username" maxLength={20} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} placeholder="Hostel + Room"
                                            className="text-xs rounded-md px-2.5 py-1.5 flex-1 focus:outline-none focus:ring-1 focus:ring-brand-muted bg-white text-slate-900 border border-slate-200" />
                                        <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone"
                                            className="text-xs rounded-md px-2.5 py-1.5 flex-1 focus:outline-none focus:ring-1 focus:ring-brand-muted bg-white text-slate-900 border border-slate-200" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-base font-bold text-slate-900">{profile?.full_name || "Student"}</h2>
                                    <p className="text-xs text-slate-500">@{profile?.username || "user"} · {user.email}</p>
                                    <div className="flex items-center gap-3 mt-1 text-slate-500">
                                        {profile?.hostel_block && (
                                            <span className="text-[11px] font-medium flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {profile.hostel_block}
                                            </span>
                                        )}
                                        {profile?.phone_number && (
                                            <span className="text-[11px] font-medium flex items-center gap-1">
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
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors border ${isEditing ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                    isEditing ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Save</span> :
                                        <span className="flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</span>}
                            </button>
                            <button
                                onClick={async () => { await signOut(); navigate("/login"); }}
                                className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors bg-white text-red-500 border border-slate-200 hover:bg-red-50 hover:border-red-100"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TAB NAVIGATION ── */}
                <div className="flex gap-6 mt-4 border-b border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative pb-3 text-sm font-bold transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'text-brand' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab.id === 'orders' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-t-full" />
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
                                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                                ) : myProducts.length === 0 ? (
                                    <div className="py-12 text-left">
                                        <p className="text-sm font-medium text-slate-500">No listings yet</p>
                                        <p className="text-xs mt-1 text-slate-400">Start selling items to your campus community.</p>
                                        <button onClick={() => navigate('/list')}
                                            className="mt-4 px-4 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 bg-white text-brand border border-brand-muted hover:bg-brand-50">
                                            <Plus className="w-3.5 h-3.5" /> Create a Listing
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {myProducts.map(item => (
                                            <div key={item.id}
                                                className="group flex items-center gap-3 py-3 px-3 rounded-lg transition-colors bg-white border border-slate-100 shadow-sm hover:border-slate-300"
                                            >
                                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                                                    <img src={item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate text-slate-900">{item.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-sm font-black text-brand">₹{item.price}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.status === 'sold' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {item.status === 'sold' ? 'Sold' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.status !== 'sold' && (
                                                        <button onClick={() => handleMarkSold(item.id)} className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-slate-400 transition-colors" title="Mark Sold">
                                                            <Tag className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteListing(item.id)} className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-slate-400 transition-colors" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5" />
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
                                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                                ) : incomingOrders.length === 0 ? (
                                    <div className="py-12 text-left">
                                        <p className="text-sm font-medium text-slate-500">No incoming orders</p>
                                        <p className="text-xs mt-1 text-slate-400">When someone buys your product, it'll appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {incomingOrders.map(order => (
                                            <div key={order.id} className="rounded-lg p-4 bg-white border border-slate-200 shadow-sm mb-3">
                                                {/* Order header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                                                        <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80"} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate text-slate-900">{order.products?.title || "Product"}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-sm font-black text-brand">₹{order.total_price}</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${order.status === "pending" ? 'bg-orange-50 text-orange-600' :
                                                                order.status === "seller_accepted" ? 'bg-emerald-50 text-emerald-600' :
                                                                    'bg-red-50 text-red-600'
                                                                }`}>
                                                                {order.status === "pending" ? "Pending" : order.status === "seller_accepted" ? "Accepted" : "Rejected"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium flex-shrink-0 text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </span>
                                                </div>

                                                {/* Buyer */}
                                                <div className="mt-4 pt-3 space-y-1.5 border-t border-slate-100">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer Details</p>
                                                    <p className="text-xs font-bold text-slate-900">{order.buyer?.full_name || "—"}</p>
                                                    <div className="flex gap-4">
                                                        <span className="text-[11px] font-medium flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3 text-slate-400" /> {order.buyer_phone || "—"}</span>
                                                        <span className="text-[11px] font-medium flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3 text-slate-400" /> {order.delivery_location}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {order.status === "pending" && (
                                                    <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-100">
                                                        <button onClick={() => handleAcceptOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100">
                                                            {processingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Accept
                                                        </button>
                                                        <button onClick={() => handleRejectOrder(order.id)} disabled={processingOrderId === order.id}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 bg-white text-red-500 border border-red-200 hover:bg-red-50">
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
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
                                    <p className="text-sm font-medium text-slate-500">No saved items</p>
                                    <p className="text-xs mt-1 text-slate-400">Tap the heart on products to save them here.</p>
                                    <button onClick={() => navigate('/browse')}
                                        className="mt-4 px-4 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 bg-white text-brand border border-brand-muted hover:bg-brand-50">
                                        Browse Products
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── REDESIGNED PROFILE CARD OVERLAY ── */}
            {showProfileCard && createPortal(
                <div className="fixed inset-0 z-[9999]" style={{ isolation: 'isolate' }}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 profile-card-backdrop" onClick={() => setShowProfileCard(false)} />

                    {/* Card */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 profile-card-appear">
                        <div className="w-[320px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
                            style={{ background: 'linear-gradient(165deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
                        >
                            {/* Close */}
                            <button onClick={() => setShowProfileCard(false)}
                                className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110"
                            >
                                <X className="w-4 h-4 text-white/80" />
                            </button>

                            {/* Decorative mesh */}
                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/20 rounded-full blur-[60px]" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-500/15 rounded-full blur-[60px]" />
                                <div className="absolute top-1/3 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[50px]" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center px-6 pt-10 pb-6">
                                {/* Avatar */}
                                <div className="profile-card-avatar mb-5">
                                    <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-brand-accent via-fuchsia-500 to-emerald-400">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a2e] border-2 border-[#1a1a2e]">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-10 h-10 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Name & Username */}
                                <div className="profile-card-content text-center mb-6">
                                    <h3 className="text-xl font-black text-white tracking-tight">{profile?.full_name || "Student"}</h3>
                                    <p className="text-sm font-bold text-brand-accent mt-0.5">@{profile?.username || "user"}</p>
                                    <p className="text-[11px] text-white/40 mt-1.5">CU Bazzar · Campus Marketplace</p>
                                </div>

                                {/* Info Rows */}
                                <div className="w-full space-y-2 profile-card-content mb-6">
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                                        <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                                        <span className="text-xs font-medium text-white/70 truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                                        <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                                        <span className="text-xs font-medium text-white/70 truncate">{profile?.hostel_block || "Not set"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                                            <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                                            <span className="text-xs font-medium text-white/70 truncate">{profile?.phone_number || "Not set"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                                            <Package className="w-4 h-4 text-white/40 flex-shrink-0" />
                                            <span className="text-xs font-bold text-white/70">{myProducts.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full flex gap-2.5 profile-card-content">
                                    <button onClick={() => { setShowProfileCard(false); setIsEditing(true); }}
                                        className="flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white/10 text-white border border-white/10 hover:bg-white/15 active:scale-[0.97]">
                                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                                    </button>
                                    <button onClick={() => navigate('/browse')}
                                        className="flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-white active:scale-[0.97]"
                                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(168,85,247,0.4) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
                                        <Globe className="w-3.5 h-3.5" /> Browse
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
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes profileCardAvatarIn {
                    0% { opacity: 0; transform: scale(0.6) translateY(8px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes profileCardContentIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .profile-card-backdrop {
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(8px);
                    animation: profileCardBackdropIn 0.2s ease forwards;
                }
                .profile-card-appear {
                    animation: profileCardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .profile-card-avatar {
                    animation: profileCardAvatarIn 0.4s 0.2s ease both;
                }
                .profile-card-content {
                    animation: profileCardContentIn 0.35s 0.25s ease both;
                }
            `}</style>
        </div>
    );
}
