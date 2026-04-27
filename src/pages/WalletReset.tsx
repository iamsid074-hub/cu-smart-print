import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldAlert, RotateCcw, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function WalletReset() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"confirm" | "done">("confirm");

  const handleReset = () => {
    if (user) {
      localStorage.removeItem(`wallet_section_passcode_${user.id}`);
      localStorage.removeItem(`wallet_balance_reveal_passcode_${user.id}`);
    }
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-[#000] text-white flex flex-col items-center justify-center px-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === "confirm" ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm"
          >
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-[28px] bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-center text-white mb-2">
              Reset Wallet Passcode
            </h1>
            <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
              This will remove your wallet section lock. You'll be asked to set a new passcode the next time you open the Wallet.
            </p>

            {/* Warning box */}
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 mb-8 flex gap-3">
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-300 leading-relaxed">
                Anyone with access to your device will be able to open the Wallet section until you set a new passcode.
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={handleReset}
              className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-400 active:scale-95 transition-all font-black text-white text-[15px] shadow-[0_4px_20px_rgba(239,68,68,0.4)] mb-3"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Passcode
              </span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all font-bold text-gray-400 text-[15px]"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 20 }}
              className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] mb-8"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>

            <h1 className="text-2xl font-black text-center text-white mb-2">
              Passcode Removed
            </h1>
            <p className="text-sm text-gray-400 text-center mb-10 leading-relaxed">
              Your wallet passcode has been reset. Set a new one when you open the Wallet.
            </p>

            <button
              onClick={() => navigate("/wallet")}
              className="w-full py-4 rounded-2xl bg-[#d4af37] hover:bg-[#c9a227] active:scale-95 transition-all font-black text-black text-[15px] shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
            >
              Open Wallet & Set New Passcode
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
