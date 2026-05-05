import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Shield,
  CreditCard,
  MapPin,
  Phone,
  Package,
  ShoppingCart,
  Heart,
  Crown,
  Camera,
  LogOut,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  Loader2,
  Mail,
  Globe,
  Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import DesktopWindow from "./DesktopWindow";
import { useMembership } from "@/hooks/useMembership";
import MembershipPlansModal from "@/components/MembershipPlansModal";

interface Props {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
}

type TabType = "account" | "membership" | "listings" | "orders" | "saved";

export default function DesktopWindowProfile({ onClose, onMinimize, onMaximize, isMinimized, isMaximized }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const membership = useMembership();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setHostelBlock(prof.hostel_block || "");
        setRoomNumber(prof.room_number || "");
        setPhoneNumber(prof.phone_number || "");
        setUsername(prof.username || "");
      }

      const { data: listings } = await supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
      setMyProducts(listings || []);

      const { data: orders } = await supabase.from("orders").select("*, products(title, price)").eq("seller_id", user.id).order("created_at", { ascending: false });
      setIncomingOrders(orders || []);
    }
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        hostel_block: hostelBlock,
        room_number: roomNumber,
        phone_number: phoneNumber,
        username: username.toLowerCase().trim(),
      });
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !user) return;
    setLoading(true);
    try {
      const file = event.target.files[0];
      const filePath = `avatars/${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;
      
      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesktopWindow
      title="Profile Settings"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      size="xl"
    >
      <div className="flex h-full bg-[#F9FAFB]">
        {/* Sidebar */}
        <div className="w-[260px] border-r border-gray-200 bg-white flex flex-col p-6 shrink-0">
          {/* User Brief */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{fullName || "CU User"}</h3>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">{isAdmin ? "Admin" : "Student"}</p>
            </div>
          </div>

          <nav className="space-y-8 flex-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">General</p>
              <div className="space-y-1">
                <SidebarItem 
                  icon={<User size={18} />} 
                  label="Account" 
                  active={activeTab === "account"} 
                  onClick={() => setActiveTab("account")} 
                />
                <SidebarItem 
                  icon={<Crown size={18} />} 
                  label="Membership" 
                  active={activeTab === "membership"} 
                  onClick={() => setActiveTab("membership")} 
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Your Activity</p>
              <div className="space-y-1">
                <SidebarItem 
                  icon={<Package size={18} />} 
                  label="My Listings" 
                  active={activeTab === "listings"} 
                  onClick={() => setActiveTab("listings")} 
                  badge={myProducts.length}
                />
                <SidebarItem 
                  icon={<ShoppingCart size={18} />} 
                  label="Incoming Orders" 
                  active={activeTab === "orders"} 
                  onClick={() => setActiveTab("orders")} 
                  badge={incomingOrders.filter(o => o.status === 'pending').length}
                />
                <SidebarItem 
                  icon={<Heart size={18} />} 
                  label="Saved Items" 
                  active={activeTab === "saved"} 
                  onClick={() => setActiveTab("saved")} 
                />
              </div>
            </div>
          </nav>

          <button 
            onClick={async () => { await signOut(); onClose(); }}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl space-y-10"
              >
                {/* Header with Avatar */}
                <div className="flex items-center gap-8 mb-12">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white ring-1 ring-gray-100">
                         {profile?.avatar_url ? (
                           <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-50">
                             <User className="w-10 h-10 text-gray-300" />
                           </div>
                         )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg border-2 border-white hover:bg-indigo-700 transition-all transform active:scale-90"
                      >
                        <Camera size={14} />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h2>
                      <p className="text-gray-500 font-medium">Update your profile and delivery information</p>
                   </div>
                </div>

                {/* Form Sections */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                   <div className="p-6 sm:p-8 space-y-8">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Contact Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <InputField label="Full Name" value={fullName} onChange={setFullName} placeholder="Arafat Ahmed" />
                           <InputField label="Username" value={username} onChange={setUsername} placeholder="arafat_07" />
                           <InputField label="Phone Number" value={phoneNumber} onChange={setPhoneNumber} placeholder="+91 94661 66750" type="tel" />
                           <div className="space-y-2">
                             <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1">Hostel Block</label>
                             <select 
                               value={hostelBlock} 
                               onChange={(e) => setHostelBlock(e.target.value)}
                               className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                             >
                               <option value="">Select Hostel</option>
                               <option value="NC1">NC1</option>
                               <option value="NC2">NC2</option>
                               <option value="NC3">NC3</option>
                               <option value="NC4">NC4</option>
                               <option value="NC5">NC5</option>
                               <option value="Zakir A">Zakir A</option>
                               <option value="Zakir B">Zakir B</option>
                             </select>
                           </div>
                           <InputField label="Room Number" value={roomNumber} onChange={setRoomNumber} placeholder="223" />
                        </div>
                      </div>
                   </div>
                   <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                      >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Save Changes
                      </button>
                   </div>
                </div>

                {/* Account Overview Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Account Overview</h4>
                      <button className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full font-bold text-xs hover:bg-indigo-100 transition-all">
                        <Plus size={14} /> Add New Email
                      </button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                           <tr className="border-b border-gray-100">
                              <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Email</th>
                              <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                              <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Primary</th>
                              <th className="text-right py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           <tr>
                              <td className="py-4 font-bold text-gray-700 text-sm">{user?.email}</td>
                              <td className="py-4">
                                 <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">Verified</span>
                              </td>
                              <td className="py-4">
                                 <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                 </div>
                              </td>
                              <td className="py-4 text-right">
                                 <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors"><Settings size={16} /></button>
                              </td>
                           </tr>
                        </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs (simplified placeholders for now, matching the window aesthetic) */}
            {activeTab === "membership" && (
              <motion.div key="membership" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6">
                  <Crown size={40} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Bazzar Elite</h2>
                <p className="text-gray-500 mb-8 max-w-sm">Unlock free deliveries, priority support, and exclusive deals across campus.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                   <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left">
                      <CheckCircle className="text-emerald-500 mb-2" size={20} />
                      <p className="font-bold text-gray-900 text-sm">Free Delivery</p>
                      <p className="text-xs text-gray-500">On all orders above ₹49</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left">
                      <Zap size={20} className="text-blue-500 mb-2" />
                      <p className="font-bold text-gray-900 text-sm">Fast Track</p>
                      <p className="text-xs text-gray-500">Priority processing for orders</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsPlansOpen(true)}
                  className="mt-10 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  View Membership Plans
                </button>
              </motion.div>
            )}

            {activeTab === "listings" && (
              <motion.div key="listings" className="space-y-4">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Store</h2>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-indigo-700">Add Item</button>
                 </div>
                 {myProducts.length === 0 ? (
                   <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="font-bold text-gray-500">No active listings yet</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myProducts.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
                           <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{p.title}</p>
                              <p className="text-indigo-600 font-black text-sm">₹{p.price}</p>
                           </div>
                           <div className="flex gap-2">
                              <button className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                              <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MembershipPlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />
    </DesktopWindow>
  );
}

function SidebarItem({ icon, label, active, onClick, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? "bg-indigo-50 text-indigo-600 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600 transition-colors"}>{icon}</span>
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">{badge}</span>
      )}
      {active && <ChevronRight size={14} className="text-indigo-400" />}
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 px-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300 placeholder:font-medium"
      />
    </div>
  );
}

function Zap({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
