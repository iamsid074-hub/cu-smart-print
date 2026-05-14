import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Settings,
  MapPin,
  Phone,
  Camera,
  CheckCircle,
  Crown,
  Box,
  Wallet as WalletIcon,
  Headphones,
  ChevronRight,
  Package,
  Truck,
  ShoppingBag,
  DoorClosed,
  Loader2,
  ArrowLeft,
  Trash2,
  Check,
  Heart
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useMembership } from "@/hooks/useMembership";
import MembershipPlansModal from "@/components/MembershipPlansModal";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const membership = useMembership();
  
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeView = searchParams.get("view") || "main";

  useEffect(() => {
    async function fetchProfileAndData() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);

      const { data: listings } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setMyProducts(listings || []);
      setLoadingListings(false);
    }
    fetchProfileAndData();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      if (!event.target.files?.length) return;
      const file = event.target.files[0];
      const filePath = `${user?.id}-${Math.random()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) {
        const { error: fb } = await supabase.storage.from("product-images").upload(filePath, file);
        if (fb) throw fb;
        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
        await updateAvatarUrl(data.publicUrl);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await updateAvatarUrl(data.publicUrl);
    } catch (e: any) {
      toast.error("Upload error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarUrl = async (url: string) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    if (error) throw error;
    setProfile({ ...profile, avatar_url: url });
    toast.success("Avatar updated");
  };

  const handleMarkSold = async (id: string) => {
    const { error } = await supabase.from("products").update({ status: "sold" }).eq("id", id);
    if (!error) {
      setMyProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "sold" } : p)));
      toast.success("Marked as sold");
    } else toast.error("Failed");
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setMyProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    } else toast.error("Failed");
  };

  const openView = (view: string) => setSearchParams({ view });
  const closeView = () => setSearchParams({});

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f9f8f6] font-sans relative overflow-x-hidden">
      
      <AnimatePresence mode="wait">
        {activeView === "main" ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-32"
          >
            {/* Background Golden Wave SVG */}
            <svg className="absolute top-0 right-0 w-full h-[400px] pointer-events-none z-0" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 150 C 200 250, 250 50, 400 150 L 400 0 L 0 0 Z" fill="url(#goldGradient)" opacity="0.05"/>
              <path d="M0 160 C 200 260, 250 60, 400 160" stroke="url(#goldGradient)" strokeWidth="2" fill="none" opacity="0.3"/>
              <path d="M0 170 C 200 270, 250 70, 400 170" stroke="url(#goldGradient)" strokeWidth="6" fill="none" opacity="0.1" filter="blur(4px)"/>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D4AF37" />
                  <stop offset="1" stopColor="#F3E5AB" />
                </linearGradient>
              </defs>
            </svg>

            {/* Header */}
            <div className="relative z-10 flex justify-end items-center px-6 pt-12 pb-2 gap-5">
              <button className="relative transition-transform active:scale-95">
                <Bell className="w-6 h-6 text-black" strokeWidth={2} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-[#f9f8f6]" />
              </button>
              <button onClick={() => navigate('/settings')} className="transition-transform active:scale-95">
                <Settings className="w-6 h-6 text-black" strokeWidth={2} />
              </button>
            </div>

            {/* Profile Identity Block */}
            <div className="relative z-10 px-6 mt-2 flex items-center gap-5">
              <div className="relative shrink-0">
                 <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#e6c875] to-[#c8922c] shadow-lg">
                   <div className="w-full h-full rounded-full bg-white overflow-hidden">
                     <img src={profile?.avatar_url || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                 </div>
                 {/* Camera Badge */}
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
                 >
                   {loading ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <Camera className="w-4 h-4 text-black" />}
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h1 className="text-2xl font-extrabold text-black tracking-tight truncate">{profile?.full_name || "Admin"}</h1>
                  <CheckCircle className="w-5 h-5 text-orange-500 fill-orange-500/20 shrink-0" />
                </div>
                <p className="text-[13px] font-medium text-gray-500 mb-2 truncate">
                  @{profile?.username || "user"} <span className="mx-1 text-gray-300">|</span> {user.email}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-[#1a1a1c] px-3 py-1.5 rounded-full shadow-md">
                  <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-yellow-400 tracking-wider">CB MEMBER</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="relative z-10 px-4 mt-8">
              <div className="bg-white rounded-[20px] py-4 flex items-center justify-between shadow-sm border border-gray-100">
                
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 justify-center border-r border-gray-100 last:border-0 px-2 text-center sm:text-left">
                   <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                     <MapPin className="w-4 h-4" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-[13px] sm:text-[14px] font-extrabold text-black truncate">{profile?.hostel_block || "NC1"}</p>
                     <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Location</p>
                   </div>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 justify-center border-r border-gray-100 last:border-0 px-2 text-center sm:text-left">
                   <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                     <Phone className="w-4 h-4" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-[13px] sm:text-[14px] font-extrabold text-black truncate">{profile?.phone_number || "9466166750"}</p>
                     <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                   </div>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 justify-center px-2 text-center sm:text-left">
                   <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                     <DoorClosed className="w-4 h-4" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-[13px] sm:text-[14px] font-extrabold text-black truncate">Room: {profile?.room_number || "223"}</p>
                     <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Room No.</p>
                   </div>
                </div>

              </div>
            </div>

            {/* CB Member Banner */}
            <div className="relative z-10 px-4 mt-5">
              <div className="bg-[#1a1a1c] rounded-[24px] p-5 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-[14px] sm:text-[15px] flex items-center gap-1.5">You're a CB Member! 🎉</h3>
                  <p className="text-gray-400 text-[10px] sm:text-[11px] leading-snug mt-0.5">Enjoy exclusive benefits and special perks.</p>
                </div>
                <button onClick={() => setIsPlansOpen(true)} className="bg-white text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold shadow-md hover:scale-105 transition-transform active:scale-95 shrink-0">
                  View Benefits
                </button>
              </div>
            </div>

            {/* My Orders Card */}
            <div className="relative z-10 px-4 mt-6">
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[16px] sm:text-[17px] font-extrabold text-black tracking-tight">My Orders</h2>
                  <button onClick={() => navigate('/orders')} className="text-orange-500 text-[12px] sm:text-[13px] font-bold">View All</button>
                </div>
                
                <div className="flex justify-between items-center px-1">
                   <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2 relative group cursor-pointer">
                     <div className="relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 transition-transform group-hover:scale-105">
                         <Package className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                       </div>
                       <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#f6c07a] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-[2px] border-white">2</span>
                     </div>
                     <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">Pending</span>
                   </div>
                   
                   <div className="w-px h-8 bg-gray-100" />
                   
                   <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2 relative group cursor-pointer">
                     <div className="relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 transition-transform group-hover:scale-105">
                         <Box className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                       </div>
                       <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#f6c07a] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-[2px] border-white">3</span>
                     </div>
                     <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">Confirmed</span>
                   </div>

                   <div className="w-px h-8 bg-gray-100" />
                   
                   <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2 relative group cursor-pointer">
                     <div className="relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 transition-transform group-hover:scale-105">
                         <Truck className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                       </div>
                       <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#f6c07a] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-[2px] border-white">1</span>
                     </div>
                     <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">Shipped</span>
                   </div>

                   <div className="w-px h-8 bg-gray-100" />

                   <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2 relative group cursor-pointer">
                     <div className="relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 transition-transform group-hover:scale-105">
                         <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                       </div>
                       <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#f6c07a] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-[2px] border-white">8</span>
                     </div>
                     <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">Delivered</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="relative z-10 px-4 mt-6">
              <div className="bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
                <MenuItem icon={<Box className="w-5 h-5 text-gray-700"/>} title="My Listings" subtitle="Manage your products" onClick={() => openView('listings')} />
                <MenuItem icon={<Crown className="w-5 h-5 text-gray-700"/>} title="Membership Plans" subtitle="Explore and manage plans" onClick={() => setIsPlansOpen(true)} />
                <MenuItem icon={<WalletIcon className="w-5 h-5 text-gray-700"/>} title="Wallet" subtitle="Manage balance & transactions" onClick={() => navigate("/wallet")} />
                <MenuItem icon={<MapPin className="w-5 h-5 text-gray-700"/>} title="Addresses" subtitle="Saved delivery addresses" onClick={() => navigate("/settings")} />
                <MenuItem icon={<Headphones className="w-5 h-5 text-gray-700"/>} title="Help & Support" subtitle="Get help and support" onClick={() => navigate("/help")} hideBorder />
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="relative z-10 px-4 mt-6">
              <div className="bg-[#fcf7ed] rounded-[24px] p-5 flex items-center gap-4 border border-[#f3e3c1]">
                <div className="w-12 h-12 rounded-full bg-[#f6eccf] flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-[#c8922c]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#c8922c] font-bold text-[13px] sm:text-[14px]">Unlock Free Deliveries</h3>
                  <p className="text-gray-600 text-[10px] sm:text-[11px] leading-tight mt-0.5 font-medium">Get CB Membership for exclusive perks and free deliveries.</p>
                </div>
                <button onClick={() => setIsPlansOpen(true)} className="bg-[#c8922c] text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-[12px] text-[10px] sm:text-[11px] font-bold shadow-md hover:bg-[#b07f25] transition-colors whitespace-nowrap shrink-0">
                  Explore Plans
                </button>
              </div>
            </div>

            {/* Logout button - hidden but accessible for debugging */}
            <div className="mt-8 flex justify-center pb-8 relative z-10">
               <button onClick={async () => { await signOut(); navigate('/login'); }} className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors px-6 py-2">
                 Sign Out
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="min-h-screen bg-[#1c1c1e] text-white pb-32"
          >
            <div className="p-4 flex items-center gap-4 bg-[#1c1c1e] sticky top-0 z-50 border-b border-white/5">
               <button onClick={closeView} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h2 className="text-lg font-bold">
                 {activeView === 'listings' && 'My Listings'}
                 {activeView === 'saved' && 'Saved Items'}
               </h2>
            </div>
            
            <div className="p-4">
              {activeView === 'listings' && (
                <div className="space-y-4">
                  {loadingListings ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-[#8E8E93]" />
                    </div>
                  ) : myProducts.length === 0 ? (
                    <div className="py-20 text-center bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 border-dashed shadow-sm">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Package className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-[18px] font-bold text-white tracking-tight">
                        No active listings
                      </h3>
                      <p className="text-[14px] text-gray-400 mt-1 mb-8 font-medium">
                        Ready to turn your stuff into cash?
                      </p>
                      <button
                        onClick={() => navigate("/list")}
                        className="px-6 py-3 rounded-full bg-white text-black text-[15px] font-bold shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all"
                      >
                        Start Selling
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myProducts.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-[#2c2c2e] p-4 rounded-3xl border border-white/5 shadow-xl flex items-center gap-4"
                        >
                          <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden bg-black flex-shrink-0">
                            <img
                              src={item.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-white truncate mb-1 tracking-tight">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[17px] font-black tracking-tight text-white">
                                ₹{item.price}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                  item.status === "sold"
                                    ? "bg-black/5 text-[#8E8E93]"
                                    : "bg-[#34C759]/10 text-[#34C759]"
                                }`}
                              >
                                {item.status === "sold" ? "Sold" : "Active"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {item.status !== "sold" && (
                              <button
                                onClick={() => handleMarkSold(item.id)}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteListing(item.id)}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MembershipPlansModal
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
      />
    </div>
  );
}

const MenuItem = ({ icon, title, subtitle, onClick, hideBorder = false }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 sm:gap-4 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-2xl ${!hideBorder && 'border-b border-gray-50'}`}>
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
      {icon}
    </div>
    <div className="flex-1 text-left min-w-0">
      <h4 className="text-[14px] sm:text-[15px] font-extrabold text-gray-900 truncate">{title}</h4>
      <p className="text-[11px] sm:text-[12px] text-gray-500 font-semibold truncate">{subtitle}</p>
    </div>
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 shrink-0" />
  </button>
)
