import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  ScanFace,
  Headphones,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WalletSecurity from "@/components/WalletSecurity";

export default function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView = searchParams.get("view") || "main";

  const [comboText, setComboText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);

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

  const handleResetFaceId = async () => {
    if (!user) return;
    const loadingToast = toast.loading("Preparing security setup...");
    try {
      const { error } = await supabase.from("profiles").update({
        biometric_enabled: false,
        face_embedding: null
      }).eq("id", user.id);
      
      if (error) throw error;
      toast.success("Ready for new Face ID", { id: loadingToast });
      setShowSecuritySetup(true);
    } catch (err: any) {
      toast.error("Failed to prepare Face ID setup", { id: loadingToast });
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

  const openView = (view: string) => setSearchParams({ view });
  const closeView = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans antialiased relative overflow-x-hidden">
      
      <AnimatePresence mode="wait">
        {activeView === "main" ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-32"
          >
            {/* Background SVG */}
            <svg className="absolute top-0 right-0 w-full h-[400px] pointer-events-none z-0" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 150 C 200 250, 250 50, 400 150 L 400 0 L 0 0 Z" fill="url(#goldGradient)" opacity="0.05"/>
              <path d="M0 160 C 200 260, 250 60, 400 160" stroke="url(#goldGradient)" strokeWidth="2" fill="none" opacity="0.3"/>
              <path d="M0 170 C 200 270, 250 70, 400 170" stroke="url(#goldGradient)" strokeWidth="6" fill="none" opacity="0.1" filter="blur(4px)"/>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e8b965" />
                  <stop offset="1" stopColor="#f4dfb6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Header */}
            <div className="relative z-10 px-6 pt-16 flex items-start justify-between">
              <div>
                <h1 className="text-[32px] font-extrabold text-[#1a1a1c] tracking-tight leading-tight">Settings</h1>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Manage your account and preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-transform active:scale-95">
                  <Search className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </button>
                <button onClick={() => navigate('/home')} className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-transform active:scale-95">
                  <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <SectionTitle title="ACCOUNT" />
              <div className="mx-4 bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
                <SettingItem icon={<User strokeWidth={1.5}/>} title="Profile" subtitle="Manage personal information" onClick={() => openView('profile')} theme="orange" />
                <SettingItem icon={<Wallet strokeWidth={1.5}/>} title="Wallet Limits" subtitle="View and manage your wallet limits" onClick={() => openView('wallet')} theme="orange" />
                <SettingItem icon={<Award strokeWidth={1.5}/>} title="Combo Suggestion" subtitle="Get personalized combo recommendations" onClick={() => openView('combo')} theme="orange" />
                <SettingItem icon={<Bike strokeWidth={1.5}/>} title="Delivery Partner" subtitle="Delivery partner and related settings" onClick={() => openView('delivery')} theme="orange" />
                <SettingItem icon={<Shield strokeWidth={1.5}/>} title="Security & Access" subtitle="Password, biometrics and security" onClick={() => openView('security')} theme="orange" hideBorder />
              </div>

              <SectionTitle title="ASSISTANCE & LEGAL" />
              <div className="mx-4 bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
                <SettingItem icon={<ReceiptText strokeWidth={1.5}/>} title="Transactions" subtitle="View your transaction history" onClick={() => navigate('/transactions')} theme="purple" />
                <SettingItem icon={<Headphones strokeWidth={1.5}/>} title="Support" subtitle="Get help and contact support" onClick={() => navigate('/help')} theme="purple" />
                <SettingItem icon={<Info strokeWidth={1.5}/>} title="About Us" subtitle="Learn more about CU Bazzar" onClick={() => navigate('/about-us')} theme="purple" />
                <SettingItem icon={<FileText strokeWidth={1.5}/>} title="Terms & Conditions" subtitle="Read our terms and conditions" onClick={() => navigate('/terms')} theme="purple" />
                <SettingItem icon={<Lock strokeWidth={1.5}/>} title="Privacy Policy" subtitle="Learn how we protect your data" onClick={() => navigate('/privacy-policy')} theme="purple" />
                <SettingItem icon={<Truck strokeWidth={1.5}/>} title="Shipping Policy" subtitle="Shipping and delivery information" onClick={() => navigate('/shipping-policy')} theme="purple" />
                <SettingItem icon={<HelpCircle strokeWidth={1.5}/>} title="CU Bazzar FAQ" subtitle="Find answers to common questions" onClick={() => navigate('/faq')} theme="purple" hideBorder />
              </div>

              {/* Promotional Banner */}
              <div className="px-4 mt-8 pb-10">
                <div className="bg-gradient-to-r from-[#fdf6ea] to-[#fcf1d8] rounded-[24px] p-5 flex items-center gap-4 border border-[#f5dfb8]">
                  <div className="w-12 h-12 rounded-full bg-[#fdfdfd] flex items-center justify-center shrink-0 shadow-sm border border-[#f5dfb8]">
                    <Headphones className="w-6 h-6 text-[#d48c26]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#3a2811] font-bold text-[15px]">Need Help?</h3>
                    <p className="text-[#a6742a] text-[11px] leading-tight mt-0.5 font-semibold">Our support team is here for you</p>
                  </div>
                  <button onClick={() => navigate('/help')} className="bg-[#cd8623] text-white px-4 py-2.5 rounded-full text-[12px] font-bold shadow-md hover:bg-[#b5761e] transition-colors shrink-0 flex items-center gap-1.5">
                    Contact Support <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="min-h-screen bg-[#fdfdfd] pb-32 relative z-50"
          >
            <div className="px-4 py-3 flex items-center gap-4 bg-[#fdfdfd] sticky top-0 z-50 border-b border-gray-100 shadow-sm">
               <button onClick={closeView} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-black transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h2 className="text-lg font-bold text-gray-900">
                 {activeView === 'profile' && 'Profile Details'}
                 {activeView === 'wallet' && 'Wallet Limits'}
                 {activeView === 'combo' && 'Combo Suggestion'}
                 {activeView === 'delivery' && 'Delivery Partner'}
                 {activeView === 'security' && 'Security & Access'}
               </h2>
            </div>
            
            <div className="p-6">
              {activeView === 'profile' && (
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
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{displayName}</h2>
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
                      <DetailRow label="Nationality" value="Indian" />
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

              {activeView === 'wallet' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">Increase Daily Wallet Limit</h2>
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

              {activeView === 'combo' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">Suggest Us a Combo</h2>
                    <p className="text-gray-500 font-medium">Have a great snack combination in mind? We'd love to hear it.</p>
                  </div>

                  <form onSubmit={handleSuggestCombo} className="space-y-4">
                    <textarea
                      value={comboText}
                      onChange={(e) => setComboText(e.target.value)}
                      placeholder="e.g. Burger + Fries + Drink"
                      className="w-full h-40 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl p-6 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                    />
                    <button type="submit" className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-600 active:scale-95 transition-all text-center shadow-lg shadow-amber-500/20">
                      Send Suggestion
                    </button>
                  </form>
                </div>
              )}

              {activeView === 'delivery' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">Be Our Delivery Partner</h2>
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

              {activeView === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">Security & Access</h2>
                    <p className="text-gray-500 font-medium">Manage your account security and authentication settings.</p>
                  </div>

                  <div className="space-y-3">
                    <SecurityAction icon={ScanFace} label="Change Face ID" sub="Set up a new face for authentication" onClick={handleResetFaceId} />
                    <SecurityAction icon={Lock} label="Appeal for Passcode Change" sub="Request admin to reset your wallet lock" onClick={() => navigate("/wallet-reset")} />
                    <SecurityAction icon={LogOut} label="Sign Out" sub="Log out of all sessions on this device" onClick={handleLogout} />
                    <SecurityAction icon={Trash2} label="Delete Account" sub="Permanently remove all your data" danger onClick={handleDeleteAccount} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSecuritySetup && (
        <WalletSecurity 
          onUnlock={() => setShowSecuritySetup(false)} 
          onClose={() => setShowSecuritySetup(false)} 
        />
      )}
    </div>
  );
}

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest px-8 mt-8 mb-3">{title}</h3>
);

const SettingItem = ({ icon, title, subtitle, onClick, hideBorder = false, theme = 'orange' }: any) => {
  const isOrange = theme === 'orange';
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-[16px] ${!hideBorder && 'border-b border-gray-50'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${isOrange ? 'bg-[#fff4eb] border-[#ffe8d6] text-[#ff8c00]' : 'bg-[#f8f5ff] border-[#f2ebff] text-[#9b51e0]'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-[14px] sm:text-[15px] font-bold text-gray-900 truncate">{title}</h4>
        <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 shrink-0" />
    </button>
  )
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
