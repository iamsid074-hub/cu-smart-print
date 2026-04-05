import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Package, Heart, Edit2, Check, Loader2, Camera, ShoppingCart, CheckCircle, XCircle, Clock, Bell, Plus, Trash2, Tag, X, Mail, Globe, Shield, ArrowLeft, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMembership } from "@/hooks/useMembership";
import MembershipPlansModal from "@/components/MembershipPlansModal";

type TabId = 'listings' | 'orders' | 'saved' | 'membership';

export default function Profile() {
    const { user, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();
    const fontH = { fontFamily: "'Outfit', sans-serif" };

    const membership = useMembership();
    const [isPlansOpen, setIsPlansOpen] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [hostelBlock, setHostelBlock] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    
    // Hostel Options
    const HOSTEL_GROUPS = [
        { name: "NC Series", options: ["NC1", "NC2", "NC3", "NC4", "NC5", "NC6"] },
        { name: "Zakir Series", options: ["Zakir A", "Zakir B", "Zakir C", "Zakir D"] }
    ];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);

    const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<TabId>('membership');

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
                () => { fetchIncomingOrders(); toast.success("ðŸ“¦ New order received!"); })
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
        { id: 'membership', label: 'Membership' },
        { id: 'listings', label: 'Listings', count: myProducts.length },
        { id: 'orders', label: 'Orders', count: pendingCount || undefined },
        { id: 'saved', label: 'Saved' },
    ];


    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-32">
            {/* â”€â”€ IMMERSIVE HEADER â”€â”€ */}
            <div className="relative h-48 sm:h-64 bg-[#1D1D1F] overflow-hidden">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] opacity-80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[100px]" />
                
                {/* Back Button */}
                <div className="absolute top-20 left-4 z-20">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Cover Actions */}
                <div className="absolute top-20 right-4 z-20 flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2 px-4"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Admin</span>
                        </button>
                    )}
                    <button
                        onClick={async () => { await signOut(); navigate("/login"); }}
                        className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-500/30 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-10">
                {/* â”€â”€ IDENTITY CARD â”€â”€ */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="ios-glass bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-white/60"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                        {/* Avatar */}
                        <div className="relative group -mt-16 sm:-mt-20">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] p-1.5 bg-white/80 backdrop-blur-md shadow-lg border border-white/60 relative z-10">
                                <div 
                                    className="w-full h-full rounded-[2.2rem] overflow-hidden bg-[#F5F5F7] cursor-pointer relative"
                                    onClick={() => { if (isEditing) fileInputRef.current?.click(); }}
                                >
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-[#8E8E93]" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <Camera className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Status Indicator */}
                            <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#34C759] border-4 border-white z-20 shadow-sm" />
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center sm:text-left">
                            {isEditing ? (
                                <div className="space-y-3 pt-2">
                                    <input 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        placeholder="Full Name"
                                        className="text-2xl font-black w-full rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 bg-white/60 border border-white/60 shadow-sm text-[#1D1D1F]" 
                                    />
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 bg-white/60 border border-white/60 shadow-sm">
                                            <span className="text-[#8E8E93] font-bold">@</span>
                                            <input 
                                                value={profile?.username || ""} 
                                                onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().trim() })}
                                                className="bg-transparent outline-none font-bold text-[#1D1D1F] w-full" 
                                                placeholder="username" 
                                                maxLength={20} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                        <h1 className="text-[28px] tracking-tight font-black text-[#1D1D1F]">{profile?.full_name || "Student"}</h1>
                                        <CheckCircle className="w-5 h-5 text-[#007AFF] fill-[#007AFF]/10" />
                                        {membership.isActive && (
                                            <button 
                                                onClick={() => { setActiveTab('membership'); }}
                                                className="ml-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all outline outline-2 outline-white/50"
                                            >
                                                MEMBER
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[#8E8E93] font-bold text-sm tracking-wide">
                                        @{profile?.username || "user"} <span className="mx-1.5 opacity-30">|</span> {user.email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Edit Button */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }}
                                disabled={loading}
                                className={`px-6 py-3 rounded-full font-black text-[15px] transition-all flex items-center gap-2 ios-action-button duration-300 ${
                                    isEditing 
                                    ? 'bg-[#34C759] text-white shadow-lg shadow-[#34C759]/30 hover:bg-[#32B853]' 
                                    : 'bg-[#1D1D1F] text-white shadow-md hover:shadow-lg'
                                }`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    isEditing ? <><Check className="w-4 h-4" /> Done</> :
                                        <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                            </button>
                        </div>
                    </div>

                    {/* Stats & Detailed Info */}
                    <div className="mt-10 pt-8 border-t border-black/5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="text-center sm:text-left">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Listings</p>
                            <p className="text-[22px] font-black tracking-tight text-[#1D1D1F]">{myProducts.length}</p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Sold</p>
                            <p className="text-[22px] font-black tracking-tight text-[#34C759]">{myProducts.filter(p => p.status === 'sold').length}</p>
                        </div>
                        <div className="col-span-2 space-y-3">
                            {isEditing ? (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/60 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">Hostel Block</span>
                                        </div>
                                        <div className="space-y-3">
                                            {HOSTEL_GROUPS.map((group) => (
                                                <div key={group.name} className="space-y-1.5">
                                                    <p className="text-[10px] font-bold text-[#8E8E93] px-1 tracking-tight">{group.name}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {group.options.map((opt) => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => setHostelBlock(opt)}
                                                                className={`py-1.5 px-3 rounded-full text-[12px] font-bold transition-all border ${
                                                                    hostelBlock === opt 
                                                                    ? "bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md scale-[1.02]" 
                                                                    : "bg-white/80 text-[#8E8E93] border-white/60 hover:text-[#1D1D1F] hover:bg-white"
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-[1.2rem] bg-white/60 border border-white/60 shadow-sm">
                                        <Phone className="w-4 h-4 text-[#8E8E93]" />
                                        <input 
                                            value={phoneNumber} 
                                            onChange={e => setPhoneNumber(e.target.value)} 
                                            placeholder="Phone Number"
                                            className="bg-transparent text-[14px] font-bold outline-none w-full text-[#1D1D1F] placeholder:font-medium placeholder:text-[#8E8E93]" 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center justify-center sm:justify-start gap-2.5 text-[#1D1D1F]">
                                        <MapPin className="w-4 h-4 text-[#007AFF]" />
                                        <span className="text-[14px] font-bold">{profile?.hostel_block || "Location not set"}</span>
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-2.5 text-[#1D1D1F]">
                                        <Phone className="w-4 h-4 text-[#007AFF]" />
                                        <span className="text-[14px] font-bold">{profile?.phone_number || "Contact not set"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* â”€â”€ TABS â”€â”€ */}
                <div className="mt-12">
                    <div className="flex gap-8 border-b border-black/5 px-2 overflow-x-auto hide-scroll">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-4 text-[15px] sm:text-[16px] font-bold tracking-tight transition-all flex items-center gap-2.5 whitespace-nowrap ${
                                    activeTab === tab.id ? 'text-[#1D1D1F]' : 'text-[#8E8E93] hover:text-[#505055]'
                                }`}
                            >
                                {tab.id === 'listings' && <Package className="w-4 h-4" />}
                                {tab.id === 'orders' && <ShoppingCart className="w-4 h-4" />}
                                {tab.id === 'saved' && <Heart className="w-4 h-4" />}
                                {tab.id === 'membership' && <Crown className="w-4 h-4" />}
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-black shadow-sm ${
                                        tab.id === 'orders' ? 'bg-[#FF9500] text-white' : 'bg-[#007AFF] text-white'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="active-tab" 
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D1D1F] rounded-t-full shadow-sm" 
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <AnimatePresence mode="wait">
                            {/* LISTINGS */}
                            {activeTab === 'listings' && (
                                <motion.div key="listings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                    {loadingListings ? (
                                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#8E8E93]" /></div>
                                    ) : myProducts.length === 0 ? (
                                        <div className="py-20 text-center bg-white/40 ios-glass rounded-[2.5rem] border border-white/60 border-dashed shadow-sm">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 xl-shadow shadow-sm">
                                                <Package className="w-8 h-8 text-[#8E8E93]" />
                                            </div>
                                            <h3 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight">No active listings</h3>
                                            <p className="text-[14px] text-[#8E8E93] mt-1 mb-8 font-medium">Ready to turn your stuff into cash?</p>
                                            <button onClick={() => navigate('/list')}
                                                className="px-6 py-3 rounded-full bg-[#1D1D1F] text-white text-[15px] font-bold shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all">
                                                Start Selling
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {myProducts.map(item => (
                                                <motion.div 
                                                    layout
                                                    key={item.id}
                                                    className="group ios-glass bg-white/50 p-4 rounded-3xl border border-white/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                                                >
                                                    <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden bg-[#F5F5F7] shadow-inner flex-shrink-0">
                                                        <img src={item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[15px] font-bold text-[#1D1D1F] truncate mb-1 tracking-tight">{item.title}</h4>
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-[17px] font-black tracking-tight text-[#1D1D1F]">â‚¹{item.price}</span>
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                                item.status === 'sold' ? 'bg-black/5 text-[#8E8E93]' : 'bg-[#34C759]/10 text-[#34C759]'
                                                            }`}>
                                                                {item.status === 'sold' ? 'Sold' : 'Active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        {item.status !== 'sold' && (
                                                            <button 
                                                                onClick={() => handleMarkSold(item.id)} 
                                                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-white/60 text-[#8E8E93] hover:bg-[#34C759] hover:text-white transition-all shadow-sm"
                                                                title="Mark Sold"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDeleteListing(item.id)} 
                                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-white/60 text-[#8E8E93] hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ORDERS */}
                            {activeTab === 'orders' && (
                                <motion.div key="orders" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                    {loadingOrders ? (
                                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#8E8E93]" /></div>
                                    ) : incomingOrders.length === 0 ? (
                                        <div className="py-20 text-center bg-white/40 ios-glass rounded-[2.5rem] border border-white/60 border-dashed shadow-sm">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <ShoppingCart className="w-8 h-8 text-[#8E8E93]" />
                                            </div>
                                            <h3 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight">No incoming orders</h3>
                                            <p className="text-[14px] text-[#8E8E93] font-medium mt-1">Orders from buyers will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {incomingOrders.map(order => (
                                                <motion.div 
                                                    layout
                                                    key={order.id} 
                                                    className="ios-glass bg-white/50 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/60 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start gap-4 mb-6">
                                                        <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden bg-[#F5F5F7] shadow-inner flex-shrink-0">
                                                            <img src={order.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100"} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Incoming Order</p>
                                                            <h4 className="text-[16px] font-bold text-[#1D1D1F] truncate tracking-tight">{order.products?.title || "Product"}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[18px] font-black text-[#1D1D1F]">â‚¹{order.total_price}</span>
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm ${
                                                                    order.status === "pending" ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                                                                    order.status === "seller_accepted" ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                                                }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Date</p>
                                                            <p className="text-[12px] font-bold text-[#1D1D1F] mt-[1px]">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/60 border border-white/60 rounded-[1.2rem] p-4 flex flex-col sm:flex-row gap-4 mb-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8E8E93] shadow-sm">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Buyer</p>
                                                                <p className="text-[13px] font-bold text-[#1D1D1F]">{order.buyer?.full_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8E8E93] shadow-sm">
                                                                <Phone className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Contact</p>
                                                                <p className="text-[13px] font-bold text-[#1D1D1F]">{order.buyer_phone}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8E8E93] shadow-sm">
                                                                <MapPin className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Location</p>
                                                                <p className="text-[13px] font-bold text-[#1D1D1F]">{order.delivery_location}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {order.status === "pending" && (
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleAcceptOrder(order.id)} 
                                                                disabled={processingOrderId === order.id}
                                                                className="flex-1 h-12 rounded-full ios-action-button text-[14px] font-bold bg-[#34C759] text-white hover:bg-[#32B853] flex items-center justify-center gap-2"
                                                            >
                                                                {processingOrderId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Accept Order</>}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRejectOrder(order.id)} 
                                                                disabled={processingOrderId === order.id}
                                                                className="h-12 w-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center hover:bg-[#FF3B30] hover:text-white transition-all active:scale-95"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* SAVED */}
                            {activeTab === 'saved' && (
                                <motion.div key="saved" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="py-20 text-center bg-white/40 ios-glass rounded-[2.5rem] border border-white/60 border-dashed shadow-sm">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Heart className="w-8 h-8 text-[#FF3B30]/40" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight">Your wishlist is empty</h3>
                                    <p className="text-[14px] text-[#8E8E93] mt-1 mb-8 font-medium">Save items you like for later!</p>
                                    <button onClick={() => navigate('/browse')}
                                        className="px-6 py-3 rounded-full ios-action-button text-[15px] font-bold flex items-center gap-2 mx-auto">
                                        Explore Items
                                    </button>
                                </motion.div>
                            )}

                            {/* MEMBERSHIP */}
                            {activeTab === 'membership' && (
                                <motion.div key="membership" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                    {membership.isPendingApproval ? (
                                        <div className="py-20 text-center bg-white/40 ios-glass rounded-[2.5rem] border border-orange-500/30 shadow-[0_4px_24px_rgba(249,115,22,0.1)] relative overflow-hidden">
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse border border-orange-500/20">
                                                <Clock className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight mb-2">Verification Pending</h3>
                                            <p className="text-[14px] text-[#8E8E93] font-medium px-4">
                                                Your payment for <span className="text-orange-500 font-bold">{membership.pendingPlan || 'CB Membership'}</span> is verifying.
                                            </p>
                                            <p className="text-[12px] text-[#8E8E93] font-medium px-4 mt-1">Our admin will approve it shortly!</p>
                                        </div>
                                    ) : !membership.isActive ? (
                                        <div className="py-20 text-center bg-white/40 ios-glass rounded-[2.5rem] border border-white/60 border-dashed shadow-sm">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 xl-shadow shadow-sm">
                                                <Crown className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight">Unlock free deliveries</h3>
                                            <p className="text-[14px] text-[#8E8E93] mt-1 mb-8 font-medium">Get CB Membership for exclusive perks.</p>
                                            <button onClick={() => setIsPlansOpen(true)}
                                                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[15px] font-bold shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all">
                                                Explore Plans
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="ios-glass bg-white/50 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 border border-white/60 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
                                            
                                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                                    <Crown className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Active Plan</p>
                                                    <h3 className="text-[24px] font-black text-[#1D1D1F] tracking-tight">CB {membership.plan?.replace('_', ' ').toUpperCase()}</h3>
                                                </div>
                                            </div>

                                            <div className="bg-white/60 border border-white/60 rounded-[1.5rem] p-5 mb-6 shadow-sm relative z-10">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[#8E8E93] tracking-tight mb-1">Free Deliveries This Week</p>
                                                        <p className="text-[16px] font-black text-[#1D1D1F]">
                                                            {membership.remainingDeliveries} <span className="text-[#8E8E93]">/ {membership.totalDeliveriesLimit}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[12px] font-bold text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-full">
                                                            {membership.usedDeliveries} Used
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-3 w-full bg-[#1D1D1F]/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(membership.usedDeliveries / membership.totalDeliveriesLimit) * 100}%` }}
                                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                                        transition={{ duration: 1, type: "spring" }}
                                                    />
                                                </div>
                                                <p className="text-[11px] font-bold text-[#8E8E93] tracking-tight mt-3 text-center">
                                                    Counter auto-resets every 7 days.
                                                </p>
                                            </div>

                                            <div className="text-center relative z-10">
                                                 <p className="text-[13px] font-bold text-[#8E8E93]">Member since: {new Date(membership.startDate!).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <MembershipPlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />

            <style>{`
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
