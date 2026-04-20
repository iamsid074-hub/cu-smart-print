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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

// Helper components for iOS Settings Layout
function ActionSheet({
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
      className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="w-full max-w-sm mx-auto bg-[#1c1c1e] rounded-t-[13px] px-4 pt-3 pb-8 relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="w-10 h-1.5 bg-[#48484a] rounded-full mx-auto mb-6" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center text-[#8e8e93] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

const SettingsLink = ({ icon: Icon, iconBg, label, to, isLast }: any) => (
  <Link
    to={to}
    className="flex items-center pl-4 active:bg-[#2c2c2e] transition-colors"
  >
    <div className={`w-[29px] h-[29px] rounded-[6px] ${iconBg} flex items-center justify-center flex-shrink-0 my-2`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className={`flex-1 flex items-center justify-between py-3 ml-3 pr-4 ${!isLast ? 'border-b border-[#38383a]' : ''}`}>
      <span className="text-[17px] font-normal text-white tracking-tight">{label}</span>
      <ChevronRight className="w-5 h-5 text-[#3c3c43] opacity-60 flex-shrink-0" />
    </div>
  </Link>
);

const SettingsButton = ({ icon: Icon, iconBg, iconColor, label, labelColor, onClick, isLast, hideArrow }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center pl-4 active:bg-[#2c2c2e] transition-colors text-left"
  >
    <div className={`w-[29px] h-[29px] rounded-[6px] ${iconBg} flex items-center justify-center flex-shrink-0 my-2`}>
      <Icon className={`w-5 h-5 ${iconColor || 'text-white'}`} />
    </div>
    <div className={`flex-1 flex items-center justify-between py-3 ml-3 pr-4 ${!isLast ? 'border-b border-[#38383a]' : ''}`}>
      <span className={`text-[17px] font-normal tracking-tight ${labelColor || 'text-white'}`}>{label}</span>
      {!hideArrow && <ChevronRight className="w-5 h-5 text-[#3c3c43] opacity-60 flex-shrink-0" />}
    </div>
  </button>
);


export default function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [comboText, setComboText] = useState("");

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

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you absolutely sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      toast.error(
        "Account deletion requires admin approval. Please contact support."
      );
    }
  };

  const handleSuggestCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboText.trim()) return toast.error("Please enter a combo suggestion");
    toast.success("Combo suggestion sent successfully! We will review it soon.");
    setComboText("");
    setIsComboModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-[100px]">
      {/* HEADER - iOS Large Title Style */}
      <div className="pt-16 pb-2 px-4 sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-3xl border-b border-[#38383a]">
         <div className="flex items-center justify-between">
           <h1 className="text-[34px] font-bold tracking-tight text-white mb-2">Settings</h1>
         </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto w-full">

        {/* PROFILE CARD - iOS Apple ID Style */}
        <div
          onClick={() => navigate("/profile")}
          className="bg-[#1c1c1e] p-4 rounded-[10px] flex items-center justify-between cursor-pointer active:bg-[#2c2c2e] transition-colors gap-4"
        >
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 bg-[#2c2c2e]">
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
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-[20px] font-normal tracking-tight truncate capitalize">
              {displayName}
            </h3>
            <p className="text-[13px] text-gray-400 font-normal truncate mt-0.5">
              Apple ID, iCloud+, Media & Purchases
            </p> 
          </div>
          <ChevronRight className="w-5 h-5 text-[#3c3c43] opacity-60 flex-shrink-0" />
        </div>

        {/* SECTION 1: OFFERS & PROGRAMS */}
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
             <SettingsButton
               onClick={() => setIsWalletModalOpen(true)}
               icon={Wallet}
               iconBg="bg-[#34C759]" // iOS Green
               label="Increase Daily Wallet Limit"
               isLast={false}
             />
             <SettingsButton
               onClick={() => setIsComboModalOpen(true)}
               icon={Utensils}
               iconBg="bg-[#FF9500]" // iOS Orange
               label="Suggest Us a Combo"
               isLast={false}
             />
             <SettingsButton
               onClick={() => setIsDeliveryModalOpen(true)}
               icon={Bike}
               iconBg="bg-[#007AFF]" // iOS System Blue
               label="Be Our Delivery Partner"
               isLast={true}
             />
        </div>

        {/* SECTION 2: ASSISTANCE & LEGAL */}
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
           <SettingsLink to="/transactions" icon={ReceiptText} iconBg="bg-[#5856D6]" label="Transactions" isLast={false} />
           <SettingsLink to="/help" icon={LifeBuoy} iconBg="bg-[#007AFF]" label="Support" isLast={false} />
           <SettingsLink to="/about-us" icon={Info} iconBg="bg-[#8E8E93]" label="About Us" isLast={false} />
           <SettingsLink to="/terms" icon={FileText} iconBg="bg-[#AF52DE]" label="Terms and Conditions" isLast={false} />
           <SettingsLink to="/privacy-policy" icon={Shield} iconBg="bg-[#FF3B30]" label="Privacy Policy" isLast={false} />
           <SettingsLink to="/shipping-policy" icon={Truck} iconBg="bg-[#FF9500]" label="Shipping Policy" isLast={false} />
           <SettingsLink to="/faq" icon={HelpCircle} iconBg="bg-[#FF2D55]" label="CU Bazzar FAQ" isLast={true} />
        </div>

        {/* SECTION 3: DANGER ZONE */}
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
           <SettingsButton
               onClick={handleDeleteAccount}
               icon={Trash2}
               iconBg="bg-transparent"
               iconColor="text-[#FF3B30]"
               labelColor="text-[#FF3B30]"
               label="Delete Account"
               isLast={false}
               hideArrow={true}
             />
            <SettingsButton
               onClick={handleLogout}
               icon={LogOut}
               iconBg="bg-transparent"
               iconColor="text-[#FF3B30]"
               labelColor="text-[#FF3B30]"
               label="Log Out"
               isLast={true}
               hideArrow={true}
             />
        </div>

        {/* Footer version stamp */}
        <p className="text-center text-[13px] text-[#8e8e93] font-normal pb-2 px-6 leading-tight pt-2">
          CU Bazzar App version 1.0.0
          <br />
          Data retrieved securely from Campus networks.
        </p>
      </div>

      {/* --- MODALS (ACTION SHEETS) --- */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <ActionSheet onClose={() => setIsWalletModalOpen(false)}>
            <div className="flex flex-col items-center mb-6 px-4">
              <div className="w-16 h-16 bg-[#34C759]/10 rounded-2xl flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-[#34C759]" />
              </div>
              <h2 className="text-[22px] font-bold text-white text-center tracking-tight leading-tight">
                Increase Daily Wallet Limit
              </h2>
              <p className="text-[#8e8e93] mt-2 font-normal text-[15px] text-center leading-normal">
                Purchase an offer to securely increase your standard daily wallet spending limit natively.
              </p>
            </div>
            <div className="space-y-3 px-2">
              <button
                onClick={() => {
                  setIsWalletModalOpen(false);
                  navigate('/wallet-payment', { state: { pack: { name: '3 Offers Pack — ₹50 Daily Limit · 1 Week', price: 50 } } });
                }}
                className="w-full p-4 rounded-[10px] bg-[#2c2c2e] flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-white text-[17px] tracking-tight">3 Offers Pack</p>
                  <p className="text-[13px] font-normal text-[#8e8e93] mt-0.5">
                    ₹50 daily limit ·{" "}
                    <span className="text-[#34C759]">Valid 1 Week</span>
                  </p>
                </div>
                <div className="px-5 py-2 rounded-full bg-[#34C759] text-white font-bold text-[15px]">
                  ₹50
                </div>
              </button>
              <button
                onClick={() => {
                  setIsWalletModalOpen(false);
                  navigate('/wallet-payment', { state: { pack: { name: 'Extended Pro — ₹50 Daily Limit · 2 Weeks', price: 200 } } });
                }}
                className="w-full p-4 rounded-[10px] bg-[#2c2c2e] flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-white text-[17px] tracking-tight">Extended Pro</p>
                  <p className="text-[13px] font-normal text-[#8e8e93] mt-0.5">
                    ₹50 daily limit ·{" "}
                    <span className="text-[#34C759]">Valid 2 Weeks</span>
                  </p>
                </div>
                <div className="px-5 py-2 rounded-full bg-[#34C759] text-white font-bold text-[15px]">
                  ₹200
                </div>
              </button>
            </div>
          </ActionSheet>
        )}

        {isComboModalOpen && (
          <ActionSheet onClose={() => setIsComboModalOpen(false)}>
            <div className="flex flex-col items-center mb-6 px-4">
              <div className="w-16 h-16 bg-[#FF9500]/10 rounded-2xl flex items-center justify-center mb-4">
                <Utensils className="w-8 h-8 text-[#FF9500]" />
              </div>
              <h2 className="text-[22px] font-bold text-white text-center tracking-tight leading-tight">
                Suggest Us a Combo
              </h2>
              <p className="text-[#8e8e93] mt-2 font-normal text-[15px] text-center leading-normal">
                Have a great snack combination in mind? Suggest it and we might add it to the platform.
              </p>
            </div>
            <form onSubmit={handleSuggestCombo} className="space-y-4 px-2">
              <textarea
                value={comboText}
                onChange={(e) => setComboText(e.target.value)}
                placeholder="Write your combo suggestion here..."
                className="w-full h-32 bg-[#2c2c2e] rounded-[10px] p-4 text-[17px] font-normal text-white placeholder:text-[#8e8e93] focus:outline-none resize-none transition-colors"
                required
              />
              <p className="text-[12px] font-normal text-[#8e8e93] text-center leading-tight">
                No abusive language permitted.
              </p>
              <button
                type="submit"
                className="w-full bg-[#007AFF] text-white font-semibold text-[17px] py-4 rounded-[10px] active:scale-[0.98] transition-transform tracking-tight mt-2"
              >
                Submit Combo
              </button>
            </form>
          </ActionSheet>
        )}

        {isDeliveryModalOpen && (
          <ActionSheet onClose={() => setIsDeliveryModalOpen(false)}>
            <div className="flex flex-col items-center mb-6 px-4">
              <div className="w-16 h-16 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center mb-4">
                <Bike className="w-8 h-8 text-[#007AFF]" />
              </div>
              <h2 className="text-[22px] font-bold text-white text-center tracking-tight leading-tight">
                Be Our Delivery Partner
              </h2>
              <p className="text-[#8e8e93] mt-2 font-normal text-[15px] text-center leading-normal">
                Earn money by delivering orders to peers within your hostel block.
              </p>
            </div>
            <div className="space-y-3 mb-6 px-2">
              <div className="p-4 rounded-[10px] bg-[#2c2c2e] flex gap-3 items-start">
                <Shield className="w-5 h-5 text-[#007AFF] flex-shrink-0" />
                <p className="text-[15px] font-normal text-[#8e8e93] leading-tight">
                  Active as a delivery partner for{" "}
                  <span className="text-white font-semibold">7 continuous days</span>.
                </p>
              </div>
              <div className="p-4 rounded-[10px] bg-[#2c2c2e] flex gap-3 items-center">
                <CreditCard className="w-5 h-5 text-[#007AFF] flex-shrink-0" />
                <p className="text-[15px] font-normal text-[#8e8e93] leading-tight">
                  Earn{" "}
                  <span className="text-[#34C759] text-[17px] font-semibold">
                    60%
                  </span>{" "}
                  of the delivery charge.
                </p>
              </div>
            </div>
            <div className="px-2">
               <button
                 onClick={() => {
                   toast.success("Application submitted successfully!");
                   setIsDeliveryModalOpen(false);
                 }}
                 className="w-full bg-[#007AFF] text-white font-semibold text-[17px] py-4 rounded-[10px] active:scale-[0.98] transition-transform tracking-tight"
               >
                 Apply to Partner Now
               </button>
            </div>
          </ActionSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
