import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera, ShoppingCart, CheckCircle, XCircle, Clock, Bell, Sparkles, Trash2, Tag, ChevronRight, Shield, Mail, Copy } from "lucide-react";
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
        } else toast.error("Failed to update status");
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        const { error } = await supabase.from("products").delete().eq('id', id);
        if (!error) {
            setMyProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Listing deleted.");
        } else toast.error("Failed to delete listing");
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

    const pendingCount = incomingOrders.filter(o => o.status === "pending").length;

    const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
        { id: 'listings', label: 'Listings', icon: Package, count: myProducts.length },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, count: pendingCount || undefined },
        { id: 'saved', label: 'Saved', icon: Heart },
    ];

    return (
        <div className="min-h-screen pb-24 relative" style={{ backgroundColor: '#0A0505' }}>
            {/* ── Ambient glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'rgba(255,107,107,0.05)' }} />
                <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(77,184,172,0.04)' }} />
            </div>

            {/* ═══════════════════════════════════════════════════════
                HERO HEADER — Full-width profile section
            ═══════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden">
                {/* Cover gradient */}
                <div className="h-44 sm:h-56" style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 30%, #0d1a18 60%, #0A0505 100%)' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,107,107,0.1) 0%, transparent 60%)' }} />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 80%, rgba(77,184,172,0.08) 0%, transparent 60%)' }} />
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>

                {/* Profile card overlapping the cover */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                        style={{
                            background: 'rgba(14,8,8,0.85)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
                            {/* Avatar */}
                            <div className="relative group/avatar cursor-pointer flex-shrink-0" onClick={() => isEditing && fileInputRef.current?.click()}>
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-[3px] transition-transform group-hover/avatar:scale-105" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4444, #4DB8AC)' }}>
                                    <div className="w-full h-full rounded-[13px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#140A0A' }}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12" style={{ color: '#4D3D34' }} />
                                        )}
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                        <Camera className="w-7 h-7 text-white" />
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                {/* Online indicator */}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2" style={{ background: '#10B981', borderColor: '#0E0808' }}>
                                    <Shield className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                                {isEditing ? (
                                    <input
                                        className="text-2xl sm:text-3xl font-black w-full mb-1 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition-all text-center sm:text-left"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8DED4', border: '1px solid rgba(255,255,255,0.1)' }}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#F0E6DC' }}>
                                        {profile?.full_name || "Student User"}
                                    </h1>
                                )}

                                {isEditing ? (
                                    <div className="flex items-center gap-1 max-w-[250px] mx-auto sm:mx-0 rounded-lg px-3 py-1.5 mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <span className="text-sm font-mono" style={{ color: '#6B5F54' }}>@</span>
                                        <input
                                            className="bg-transparent outline-none text-sm font-mono flex-1 min-w-0"
                                            style={{ color: '#FF6B6B' }}
                                            value={profile?.username || ""}
                                            onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                            placeholder="username"
                                            maxLength={20}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm font-mono font-bold mt-0.5" style={{ color: '#FF6B6B' }}>
                                        @{profile?.username || "student"}
                                    </p>
                                )}

                                {/* Quick info row */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#8F8175' }}>
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </div>
                                    {profile?.hostel_block && !isEditing && (
                                        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(77,184,172,0.08)', color: '#4DB8AC' }}>
                                            <MapPin className="w-3 h-3" /> {profile.hostel_block}
                                        </div>
                                    )}
                                    {profile?.phone_number && !isEditing && (
                                        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(240,192,64,0.08)', color: '#F0C040' }}>
                                            <Phone className="w-3 h-3" /> {profile.phone_number}
                                        </div>
                                    )}
                                </div>

                                {/* Editable fields row */}
                                {isEditing && (
                                    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4DB8AC' }} />
                                            <input className="bg-transparent outline-none w-full text-sm" style={{ color: '#E8DED4' }}
                                                value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="Hostel Block + Room" />
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F0C040' }} />
                                            <input className="bg-transparent outline-none w-full text-sm" style={{ color: '#E8DED4' }}
                                                value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 9876543210" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                <button
                                    onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }}
                                    disabled={loading}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                    style={{
                                        background: isEditing ? 'rgba(77,184,172,0.12)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isEditing ? 'rgba(77,184,172,0.25)' : 'rgba(255,255,255,0.1)'}`,
                                        color: isEditing ? '#4DB8AC' : '#8F8175',
                                    }}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        isEditing ? <><Check className="w-4 h-4" /> Save</> :
                                            <><Edit2 className="w-4 h-4" /> Edit</>}
                                </button>
                                <button
                                    onClick={async () => { await signOut(); navigate("/login"); }}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                    style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', color: '#FF5050' }}
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                TAB NAVIGATION
            ═══════════════════════════════════════════════════════ */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 relative z-10">
                <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative`}
                            style={{
                                background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                                color: activeTab === tab.id ? '#F0E6DC' : '#6B5F54',
                                border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                            }}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center" style={{
                                    background: tab.id === 'orders' ? 'rgba(255,168,50,0.15)' : 'rgba(77,184,172,0.12)',
                                    color: tab.id === 'orders' ? '#FFA832' : '#4DB8AC',
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                TAB CONTENT
            ═══════════════════════════════════════════════════════ */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-5 relative z-10">
                <AnimatePresence mode="wait">
                    {/* ─── LISTINGS TAB ─── */}
                    {activeTab === 'listings' && (
                        <motion.div key="listings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                            {loadingListings ? (
                                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin" style={{ color: '#4DB8AC' }} /></div>
                            ) : myProducts.length === 0 ? (
                                <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(77,184,172,0.08)' }}>
                                        <Package className="w-7 h-7" style={{ color: '#3D342C' }} />
                                    </div>
                                    <p className="text-base font-bold mb-1" style={{ color: '#6B5F54' }}>No listings yet</p>
                                    <p className="text-xs mb-5" style={{ color: '#4D3D34' }}>Start selling and earn from your campus!</p>
                                    <button onClick={() => navigate('/list')}
                                        className="px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 mx-auto hover:scale-[1.03] active:scale-[0.97]"
                                        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4444)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,107,0.25)' }}>
                                        <Sparkles className="w-4 h-4" /> Sell Something
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myProducts.map((item, i) => (
                                        <motion.div key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="group rounded-2xl p-4 flex gap-4 items-center transition-all hover:scale-[1.005]"
                                            style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}>
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                <img src={item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm sm:text-base truncate" style={{ color: '#E8DED4' }}>{item.title}</h4>
                                                <p className="font-black text-base" style={{ color: '#FF6B6B' }}>₹{item.price?.toLocaleString()}</p>
                                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md inline-block mt-1" style={
                                                    item.status === 'sold'
                                                        ? { background: 'rgba(255,80,80,0.12)', color: '#FF5050' }
                                                        : { background: 'rgba(77,184,172,0.12)', color: '#4DB8AC' }
                                                }>
                                                    {item.status === 'sold' ? '● Sold' : '● Active'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {item.status !== 'sold' && (
                                                    <button onClick={() => handleMarkSold(item.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(77,184,172,0.1)' }} title="Mark Sold">
                                                        <Tag className="w-4 h-4" style={{ color: '#4DB8AC' }} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteListing(item.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,80,80,0.1)' }} title="Delete">
                                                    <Trash2 className="w-4 h-4" style={{ color: '#FF5050' }} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── ORDERS TAB ─── */}
                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                            {loadingOrders ? (
                                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin" style={{ color: '#FFA832' }} /></div>
                            ) : incomingOrders.length === 0 ? (
                                <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,168,50,0.08)' }}>
                                        <Bell className="w-7 h-7" style={{ color: '#3D342C' }} />
                                    </div>
                                    <p className="text-base font-bold mb-1" style={{ color: '#6B5F54' }}>No incoming orders</p>
                                    <p className="text-xs" style={{ color: '#4D3D34' }}>When someone buys your product, it'll show up here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {incomingOrders.map((order, i) => (
                                        <motion.div key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="rounded-2xl p-4 sm:p-5 transition-all"
                                            style={{
                                                background: order.status === "pending" ? 'rgba(255,168,50,0.03)' :
                                                    order.status === "seller_accepted" ? 'rgba(77,184,172,0.03)' : 'rgba(255,80,80,0.02)',
                                                border: `1px solid ${order.status === "pending" ? 'rgba(255,168,50,0.15)' :
                                                    order.status === "seller_accepted" ? 'rgba(77,184,172,0.15)' : 'rgba(255,80,80,0.12)'}`,
                                            }}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                    <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80"} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate" style={{ color: '#E8DED4' }}>{order.products?.title || "Product"}</p>
                                                    <p className="font-black text-base" style={{ color: '#FF6B6B' }}>₹{order.total_price?.toLocaleString()}</p>
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-0.5" style={
                                                        order.status === "pending" ? { background: 'rgba(255,168,50,0.15)', color: '#FFA832' } :
                                                            order.status === "seller_accepted" ? { background: 'rgba(77,184,172,0.15)', color: '#4DB8AC' } :
                                                                { background: 'rgba(255,80,80,0.12)', color: '#FF5050' }
                                                    }>
                                                        {order.status === "pending" ? "⏳ Awaiting Response" :
                                                            order.status === "seller_accepted" ? "✓ Accepted" : "✕ Rejected"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Buyer info */}
                                            <div className="rounded-xl p-3 mb-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4D3D34' }}>Buyer</p>
                                                <p className="text-sm font-bold" style={{ color: '#E8DED4' }}>{order.buyer?.full_name || "Buyer"}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                    <p className="text-xs flex items-center gap-1" style={{ color: '#8F8175' }}><Phone className="w-3 h-3" /> {order.buyer_phone || "—"}</p>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: '#8F8175' }}><MapPin className="w-3 h-3" /> {order.delivery_location}{order.delivery_room ? `, ${order.delivery_room}` : ""}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs flex items-center gap-1 mb-3" style={{ color: '#4D3D34' }}>
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
                            )}
                        </motion.div>
                    )}

                    {/* ─── SAVED TAB ─── */}
                    {activeTab === 'saved' && (
                        <motion.div key="saved" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                            <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,107,107,0.08)' }}>
                                    <Heart className="w-7 h-7" style={{ color: '#3D342C' }} />
                                </div>
                                <p className="text-base font-bold mb-1" style={{ color: '#6B5F54' }}>No saved items</p>
                                <p className="text-xs mb-5" style={{ color: '#4D3D34' }}>Tap the heart icon on products to save them here</p>
                                <button onClick={() => navigate('/browse')}
                                    className="px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 mx-auto hover:scale-[1.03]"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8F8175' }}>
                                    Browse Products <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
