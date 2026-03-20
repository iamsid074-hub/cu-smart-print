import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const TARGET_EMAILS = ["vedhantofficial@gmail.com", "iamsid074@gmail.com"];

export default function TargetedPromoModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    if (!TARGET_EMAILS.includes(user.email)) return;

    // Check if shown this session
    const hasSeenPromo = sessionStorage.getItem("chatoriPromoShown");
    if (!hasSeenPromo) {
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("chatoriPromoShown", "true");
  };

  const handleOrderNow = () => {
    handleClose();
    navigate("/food");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-br from-orange-400 to-amber-600 shadow-2xl shadow-orange-500/30 border border-white/20"
          >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-300/30 via-transparent to-transparent opacity-80" />
            </div>

            <div className="relative p-6 px-7 sm:p-8 flex flex-col items-center text-center">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                <Gift className="w-8 h-8 text-white" />
              </div>

              <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest uppercase text-white mb-2">
                 EXCLUSIVE FOR YOU
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">
                Chatori Chai <br/>& Kulcha Corner
              </h2>
              
              <p className="text-white/90 font-medium text-sm leading-relaxed mb-6">
                Order above <strong className="text-yellow-200">₹150</strong> and get <strong className="text-white">FREE Coca-Cola</strong>
              </p>

              <div className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative w-full bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-6 flex flex-col items-center">
                   <p className="text-yellow-200/80 text-[10px] uppercase font-bold tracking-widest mb-1">Use Promo Code</p>
                   <p className="text-2xl font-black text-white tracking-wider">CHATORI150</p>
                </div>
              </div>

              <button 
                onClick={handleOrderNow}
                className="w-full py-4 rounded-2xl bg-white text-orange-600 font-bold text-lg shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                Order Now →
              </button>

              <button 
                onClick={handleClose}
                className="mt-4 text-white/70 hover:text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
