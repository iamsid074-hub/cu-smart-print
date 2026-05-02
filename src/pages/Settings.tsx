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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [comboText, setComboText] = useState("");

  // Try to get avatar url from user metadata
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";
  const email = user?.email || "";

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    const loadingToast = toast.loading("Deleting account...");
    setIsDeleteModalOpen(false);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user-account");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Account deleted successfully.", { id: loadingToast });
      
      // Clear all local storage data
      localStorage.clear();

      // Use window.location.href for a hard reset to ensure all auth state is purged
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err: any) {
      console.error("Deletion error:", err);
      toast.error(err.message || "Failed to delete account. Please contact support.", { id: loadingToast });
    }
  };

  const handleSuggestCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboText.trim()) return toast.error("Please enter a combo suggestion");
    
    setIsComboModalOpen(false);

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
      toast.success("Combo suggestion sent successfully! We will review it soon.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send suggestion");
    } finally {
      setComboText("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-[100px]">
      {/* HEADER - Adjusted for Dynamic Island clearance */}
      <div className="border-b border-white/5 px-4 pt-16 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[18px] font-black tracking-tight">Settings</h1>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto w-full">

        {/* PROFILE CARD */}
        <div
          onClick={() => navigate("/profile")}
          className="bg-[#1c1c1e] p-4 rounded-[1.5rem] border border-white/5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar: real photo → 3D character → initial */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-[#2c2c2e] relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/3d_backpack_v2.webp"
                  alt="3D Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-black text-[15px] truncate capitalize">
                {displayName}
              </h3>
              <p className="text-gray-500 font-medium text-[12px] truncate">
                {email}
              </p>
              <p className="text-indigo-400 font-bold text-[11px] mt-0.5">
                View Profile →
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
        </div>

        {/* SECTION 1: OFFERS & PROGRAMS */}
        <div>
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Offers & Programs
          </p>
          <div className="bg-[#1c1c1e] rounded-[1.5rem] overflow-hidden border border-white/5 divide-y divide-white/5">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="font-bold text-[13px] truncate text-left">
                  Increase Daily Wallet Limit
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={() => setIsComboModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-4 h-4 text-amber-400" />
                </div>
                <span className="font-bold text-[13px] truncate">Suggest Us a Combo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={() => setIsDeliveryModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Bike className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-bold text-[13px] truncate">Be Our Delivery Partner</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* SECTION 2: ASSISTANCE & LEGAL */}
        <div>
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Assistance & Legal
          </p>
          <div className="bg-[#1c1c1e] rounded-[1.5rem] overflow-hidden border border-white/5 divide-y divide-white/5">
            {[
              { to: "/transactions", icon: ReceiptText, label: "Transactions" },
              { to: "/help", icon: LifeBuoy, label: "Support" },
              { to: "/about-us", icon: Info, label: "About Us" },
              { to: "/terms", icon: FileText, label: "Terms and Conditions" },
              { to: "/privacy-policy", icon: Shield, label: "Privacy Policy" },
              { to: "/shipping-policy", icon: Truck, label: "Shipping Policy" },
              { to: "/faq", icon: HelpCircle, label: "CU Bazzar FAQ" },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="font-bold text-[13px] truncate">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 3: PASSCODE & SECURITY */}
        <div id="security">
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Security
          </p>
          <div className="bg-[#1c1c1e] rounded-[1.5rem] overflow-hidden border border-white/5 divide-y divide-white/5">
            <button
              onClick={() => navigate("/wallet-reset")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-bold text-[13px] truncate text-white">
                    Appeal for Passcode Change
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium truncate">Request admin to reset your wallet lock</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* SECTION 4: DANGER ZONE */}
        <div>
          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-[#FF3B30] mb-2">
            Danger Zone
          </p>
          <div className="bg-[#1c1c1e] rounded-[1.5rem] overflow-hidden border border-[#FF3B30]/15 divide-y divide-[#FF3B30]/10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FF3B30]/10 active:bg-[#FF3B30]/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-[#FF3B30]" />
              </div>
              <span className="font-bold text-[13px] truncate text-[#FF3B30]">
                Delete Account
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-4 h-4 text-gray-400" />
              </div>
              <span className="font-bold text-[13px] truncate text-gray-300">Log Out</span>
            </button>
          </div>
        </div>

        {/* Footer version stamp */}
        <p className="text-center text-[11px] text-gray-600 font-bold pb-2">
          CU Bazzar © 2026 · All rights reserved
        </p>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <ModalOverlay onClose={() => setIsWalletModalOpen(false)}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3 border border-indigo-500/20">
                <Wallet className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-[20px] font-black text-white text-center tracking-tight leading-tight">
                Increase Daily Wallet Limit
              </h2>
              <p className="text-gray-400 mt-2 font-medium text-[13px] text-center leading-relaxed">
                Purchase an offer to securely increase your standard daily wallet spending limit.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsWalletModalOpen(false);
                  navigate('/wallet-payment', { state: { pack: { name: '3 Offers Pack — ₹50 Daily Limit · 1 Week', price: 50 } } });
                }}
                className="w-full p-4 rounded-2xl bg-[#0d0d0f] border border-white/5 flex items-center justify-between hover:border-indigo-500/40 active:scale-95 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-black text-white text-[15px]">3 Offers Pack</p>
                  <p className="text-[12px] font-bold text-gray-500 mt-0.5">
                    ₹50 daily limit ·{" "}
                    <span className="text-indigo-400">Valid 1 Week</span>
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-black text-[14px]">
                  ₹50
                </div>
              </button>
              <button
                onClick={() => {
                  setIsWalletModalOpen(false);
                  navigate('/wallet-payment', { state: { pack: { name: 'Extended Pro — ₹50 Daily Limit · 2 Weeks', price: 200 } } });
                }}
                className="w-full p-4 rounded-2xl bg-[#0d0d0f] border border-white/5 flex items-center justify-between hover:border-indigo-500/40 active:scale-95 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-black text-white text-[15px]">Extended Pro</p>
                  <p className="text-[12px] font-bold text-gray-500 mt-0.5">
                    ₹50 daily limit ·{" "}
                    <span className="text-indigo-400">Valid 2 Weeks</span>
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-black text-[14px]">
                  ₹200
                </div>
              </button>
            </div>
          </ModalOverlay>
        )}

        {isComboModalOpen && (
          <ModalOverlay onClose={() => setIsComboModalOpen(false)}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-3 border border-amber-500/20">
                <Utensils className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-[20px] font-black text-white text-center tracking-tight leading-tight">
                Suggest Us a Combo
              </h2>
              <p className="text-gray-400 mt-2 font-medium text-[13px] text-center leading-relaxed">
                Have a great snack combination in mind? Suggest it and we might add it to the platform.
              </p>
            </div>
            <form onSubmit={handleSuggestCombo} className="space-y-3">
              <textarea
                value={comboText}
                onChange={(e) => setComboText(e.target.value)}
                placeholder="Write your combo suggestion here..."
                className="w-full h-28 bg-[#0d0d0f] border border-white/10 rounded-2xl p-4 text-[14px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
                required
              />
              <p className="text-[10px] font-black text-[#FF3B30] uppercase tracking-widest text-center leading-tight">
                No abusive language permitted.
              </p>
              <button
                type="submit"
                className="w-full bg-amber-500 text-black font-black text-[14px] py-3.5 rounded-2xl active:scale-95 transition-transform"
              >
                Submit Combo
              </button>
            </form>
          </ModalOverlay>
        )}

        {isDeliveryModalOpen && (
          <ModalOverlay onClose={() => setIsDeliveryModalOpen(false)}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 border border-emerald-500/20">
                <Bike className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-[20px] font-black text-white text-center tracking-tight leading-tight">
                Be Our Delivery Partner
              </h2>
              <p className="text-gray-400 mt-2 font-medium text-[13px] text-center leading-relaxed">
                Earn money by delivering orders to peers within your hostel block.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              <div className="p-3.5 rounded-2xl bg-[#0d0d0f] border border-white/5 flex gap-3 items-start">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] font-bold text-gray-300">
                  Active as a delivery partner for{" "}
                  <span className="text-emerald-400">7 continuous days</span>.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0d0d0f] border border-white/5 flex gap-3 items-start">
                <CreditCard className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] font-bold text-gray-300">
                  Earn{" "}
                  <span className="text-emerald-400 text-[16px] font-black">
                    60%
                  </span>{" "}
                  of the delivery charge from each fulfilled order.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                toast.success("Application submitted successfully!");
                setIsDeliveryModalOpen(false);
              }}
              className="w-full bg-emerald-500 text-black font-black text-[14px] py-3.5 rounded-2xl active:scale-95 transition-transform"
            >
              Apply to Partner Now
            </button>
          </ModalOverlay>
        )}

        {isDeleteModalOpen && (
          <ModalOverlay onClose={() => setIsDeleteModalOpen(false)}>
            <div className="flex flex-col items-center pt-2">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#FF3B30]/10 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-[#FF3B30]" />
              </div>
              <h2 className="text-[20px] font-black text-white text-center tracking-tight leading-tight">
                Delete Account
              </h2>
              <p className="text-gray-400 mt-2 font-medium text-[13px] text-center leading-relaxed">
                Are you absolutely sure you want to permanently delete your account? This action cannot be undone. All your data, including wallet balance and order history, will be lost forever.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold text-[14px] py-3.5 rounded-2xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-[#FF3B30] hover:bg-[#ff2015] text-white font-bold text-[14px] py-3.5 rounded-2xl active:scale-95 transition-transform"
              >
                Delete Forever
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
      
      {/* EOS v2 Branding */}
      <div className="mt-12 pb-10 text-center opacity-30">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
          Eclipsed Operating System v2.0
        </p>
        <p className="text-[8px] font-bold text-white/50 mt-1 uppercase tracking-widest">
          CU Bazzar Unified Interface
        </p>
      </div>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 right-0 bottom-0 left-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/85"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-sm bg-[#1c1c1e] rounded-[2rem] p-5 shadow-2xl relative border border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
