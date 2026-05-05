import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  Utensils,
  Bike,
  LifeBuoy,
  ReceiptText,
  Info,
  FileText,
  Shield,
  Truck,
  HelpCircle,
  Trash2,
  LogOut,
  ChevronRight,
  ArrowLeft,
  X,
  CreditCard,
  User,
  Star,
  Lock,
  Search,
  Bell,
  Key,
  Keyboard,
  MoreHorizontal,
  Plus,
  LayoutGrid,
  Users,
  Tag,
  FolderKanban,
  FileCode,
  Zap,
  Puzzle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

type TabType = "profile" | "wallet" | "combo" | "delivery" | "security";

export default function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [comboText, setComboText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // User metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Student";
  const email = user?.email || "";

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you absolutely sure? This action is permanent.");
    if (!confirm) return;

    const loadingToast = toast.loading("Deleting account...");
    try {
      const { data, error } = await supabase.functions.invoke("delete-user-account");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Account deleted successfully.", { id: loadingToast });
      localStorage.clear();
      setTimeout(() => { window.location.href = "/login"; }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account.", { id: loadingToast });
    }
  };

  const handleSuggestCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboText.trim()) return toast.error("Please enter a combo suggestion");
    
    const loadingToast = toast.loading("Sending suggestion...");
    try {
      const { error } = await supabase.from("admin_notifications").insert({
        type: "combo_suggestion",
        is_read: false,
        payload: {
          suggestion: comboText.trim(),
          user_name: displayName,
        }
      });
      if (error) throw error;
      toast.success("Combo suggestion sent!", { id: loadingToast });
      setComboText("");
    } catch (err: any) {
      toast.error("Failed to send suggestion", { id: loadingToast });
    }
  };

  const SidebarItem = ({ 
    id, 
    icon: Icon, 
    label, 
    isActive, 
    onClick,
    to
  }: { 
    id?: TabType, 
    icon: any, 
    label: string, 
    isActive?: boolean, 
    onClick?: () => void,
    to?: string 
  }) => {
    const content = (
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-[#f3f4f6] text-[#1a1a1a]' : 'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#1a1a1a]'}`}>
        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1a1a1a]' : 'text-[#9ca3af] group-hover:text-[#1a1a1a]'}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );

    if (to) return <Link to={to} className="block">{content}</Link>;
    return <button onClick={onClick} className="w-full text-left block">{content}</button>;
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] md:p-8 flex items-center justify-center font-sans antialiased">
      {/* Main Window */}
      <div className="w-full max-w-6xl h-full md:h-[800px] bg-white md:rounded-[20px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#e5e7eb]">
        
        {/* Sidebar */}
        <div className="w-full md:w-[280px] bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col p-6 overflow-y-auto">
          {/* Header dots */}
          <div className="flex gap-2 mb-8 items-center">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <button onClick={() => navigate(-1)} className="ml-auto p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">My Account</p>
              <div className="space-y-1">
                <SidebarItem id="profile" icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                <SidebarItem id="wallet" icon={Wallet} label="Wallet Limits" isActive={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
                <SidebarItem id="combo" icon={Utensils} label="Combo Suggestion" isActive={activeTab === 'combo'} onClick={() => setActiveTab('combo')} />
                <SidebarItem id="delivery" icon={Bike} label="Delivery Partner" isActive={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')} />
                <SidebarItem id="security" icon={Shield} label="Security & Access" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
              </div>
            </div>

            <div>
              <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assistance & Legal</p>
              <div className="space-y-1">
                <SidebarItem icon={ReceiptText} label="Transactions" to="/transactions" />
                <SidebarItem icon={LifeBuoy} label="Support" to="/help" />
                <SidebarItem icon={Info} label="About Us" to="/about-us" />
                <SidebarItem icon={FileText} label="Terms & Conditions" to="/terms" />
                <SidebarItem icon={Shield} label="Privacy Policy" to="/privacy-policy" />
                <SidebarItem icon={Truck} label="Shipping Policy" to="/shipping-policy" />
                <SidebarItem icon={HelpCircle} label="CU Bazzar FAQ" to="/faq" />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 flex items-center gap-3 px-3">
             <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <img src="/3d_backpack_v2.webp" className="w-full h-full object-cover" />}
             </div>
             <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-[10px] text-gray-500 truncate">{email}</p>
             </div>
             <button onClick={handleLogout} className="ml-auto p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-y-auto relative p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto w-full"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-xl flex-shrink-0 relative">
                       {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <img src="/3d_backpack_v2.webp" className="w-full h-full object-cover" />}
                       <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Plus className="w-6 h-6 text-white" />
                       </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{displayName}</h2>
                        <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500" />
                      </div>
                      <p className="text-gray-500 font-medium">{email}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Personal details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      <DetailRow label="Full name" value={displayName} />
                      <DetailRow label="Email" value={email} />
                      <DetailRow label="Account Status" value="Active" />
                      <DetailRow label="Joined" value={new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
                      <DetailRow label="Role" value="Student" />
                      <DetailRow label="Nationality" value="American" />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Security Settings</h3>
                    <div className="space-y-4">
                       <button onClick={() => navigate("/wallet-reset")} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                <Lock className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                             </div>
                             <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm">Two-factor Authentication</p>
                                <p className="text-xs text-gray-500">Currently disabled for your security level</p>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Increase Daily Wallet Limit</h2>
                    <p className="text-gray-500 font-medium">Purchase an offer to securely increase your daily spending limit.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <WalletPack 
                      name="3 Offers Pack" 
                      limit="₹50 Daily" 
                      validity="1 Week" 
                      price="50" 
                      onClick={() => navigate('/wallet-payment', { state: { pack: { name: '3 Offers Pack — ₹50 Daily Limit · 1 Week', price: 50 } } })}
                    />
                    <WalletPack 
                      name="Extended Pro" 
                      limit="₹50 Daily" 
                      validity="2 Weeks" 
                      price="200" 
                      onClick={() => navigate('/wallet-payment', { state: { pack: { name: 'Extended Pro — ₹50 Daily Limit · 2 Weeks', price: 200 } } })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'combo' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Suggest Us a Combo</h2>
                    <p className="text-gray-500 font-medium">Have a great snack combination in mind? We'd love to hear it.</p>
                  </div>

                  <form onSubmit={handleSuggestCombo} className="space-y-4">
                    <textarea
                      value={comboText}
                      onChange={(e) => setComboText(e.target.value)}
                      placeholder="e.g. Burger + Fries + Drink"
                      className="w-full h-40 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl p-6 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                    />
                    <button type="submit" className="px-8 py-3.5 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-600 active:scale-95 transition-all">
                      Send Suggestion
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Be Our Delivery Partner</h2>
                    <p className="text-gray-500 font-medium">Earn money by delivering orders to peers within your hostel block.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">7-Day Continuity</p>
                        <p className="text-sm text-emerald-700/80 mt-1">Remain active as a delivery partner for 7 continuous days to unlock higher rewards.</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">60% Commission</p>
                        <p className="text-sm text-blue-700/80 mt-1">Earn 60% of the delivery charge from each fulfilled order directly into your wallet.</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast.success("Application submitted!")}
                    className="w-full bg-[#1a1a1a] text-white font-black py-4 rounded-2xl hover:bg-black active:scale-95 transition-all shadow-lg"
                  >
                    Apply to Partner Now
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Security & Access</h2>
                    <p className="text-gray-500 font-medium">Manage your account security and authentication settings.</p>
                  </div>

                  <div className="space-y-3">
                    <SecurityAction icon={Lock} label="Appeal for Passcode Change" sub="Request admin to reset your wallet lock" onClick={() => navigate("/wallet-reset")} />
                    <SecurityAction icon={LogOut} label="Sign Out" sub="Log out of all sessions on this device" onClick={handleLogout} />
                    <SecurityAction icon={Trash2} label="Delete Account" sub="Permanently remove all your data" danger onClick={handleDeleteAccount} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Branding */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none text-center w-full">
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-black">Eclipsed OS v3.0 Ethereal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function WalletPack({ name, limit, validity, price, onClick }: { name: string, limit: string, validity: string, price: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full p-5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.99] text-left">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p className="font-black text-gray-900 text-base">{name}</p>
          <p className="text-xs text-gray-500 font-medium">{limit} · <span className="text-blue-600 font-bold">{validity}</span></p>
        </div>
      </div>
      <div className="bg-gray-900 text-white px-4 py-2 rounded-xl font-black text-sm">
        ₹{price}
      </div>
    </button>
  );
}

function SecurityAction({ icon: Icon, label, sub, danger, onClick }: { icon: any, label: string, sub: string, danger?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.99] ${danger ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
        <div className="text-left">
          <p className={`font-bold text-sm ${danger ? 'text-red-900' : 'text-gray-900'}`}>{label}</p>
          <p className={`text-xs ${danger ? 'text-red-700/60' : 'text-gray-500'}`}>{sub}</p>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 ${danger ? 'text-red-300' : 'text-gray-300'}`} />
    </button>
  );
}
