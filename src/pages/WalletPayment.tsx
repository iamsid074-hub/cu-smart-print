import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, IndianRupee, ShieldCheck, Mail, Headset } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function WalletPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract pack details (fallback if none provided)
  const pack = location.state?.pack || { name: "Wallet Membership", price: 50 };
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isPaidDisabled, setIsPaidDisabled] = useState(true);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState(30);
  const [showStatus, setShowStatus] = useState(false);

  // 5-minute countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 30-second button unlock
  useEffect(() => {
    if (unlockTimeLeft <= 0) {
      setIsPaidDisabled(false);
      return;
    }
    const timer = setInterval(() => setUnlockTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [unlockTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaid = () => {
    toast({
      title: "Payment Received! 🎉",
      description: "Your membership will start soon, need any help navigate to support.",
    });
    setShowStatus(true);
    setTimeout(() => {
      navigate('/settings');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center">
      {/* HEADER IS NOW MANAGED BY TOPDYNAMICISLAND */}
      <div className="pt-24" />

      <div className="w-full max-w-md px-6 py-8 flex flex-col items-center">
        {/* TIMER FLOATER */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 mb-8"
        >
          <Clock className="w-4 h-4 text-red-500" />
          <span className="text-red-500 font-black tracking-widest text-[14px]">
            {formatTime(timeLeft)}
          </span>
        </motion.div>

        {/* PACK INFO */}
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-black tracking-tight mb-2">{pack.name}</h2>
          <div className="flex items-center justify-center gap-1 text-emerald-400">
            <IndianRupee className="w-5 h-5" />
            <span className="text-[32px] font-black">{pack.price}</span>
          </div>
          <p className="text-gray-500 font-bold text-[14px] mt-2 italic px-8 leading-snug">
            Scan the QR code below using any UPI app to securely increase your daily limit.
          </p>
        </div>

        {/* QR CODE CONTAINER */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.05)] mb-10 relative overflow-hidden"
        >
          <div className="w-[200px] h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
             <img src="/upi-qr.webp" alt="UPI QR" className="w-full h-full object-contain" />
          </div>
          
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          </div>
        </motion.div>

        {/* TRUST SIGNALS */}
        <div className="grid grid-cols-2 gap-4 w-full mb-12">
            <div className="bg-[#1c1c1e] p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest leading-none">Secure Payment</span>
            </div>
            <div className="bg-[#1c1c1e] p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <Headset className="w-6 h-6 text-indigo-400 mb-2" />
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest leading-none">24/7 Support</span>
            </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="w-full mt-4 flex flex-col items-center">
            <AnimatePresence>
                {showStatus ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center gap-3 w-full max-w-md"
                    >
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                        <p className="text-[13px] font-bold text-emerald-400">Verifying payment... Redirecting soon.</p>
                    </motion.div>
                ) : (
                    <div className="w-full max-w-md space-y-4">
                        {isPaidDisabled && (
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[12px] font-bold tracking-tight">Verifying connection... Wait {unlockTimeLeft}s</span>
                            </div>
                        )}
                        <motion.button
                            whileTap={!isPaidDisabled ? { scale: 0.95 } : {}}
                            disabled={isPaidDisabled}
                            onClick={handlePaid}
                            className={`w-full h-16 rounded-[20px] font-black tracking-tight text-[17px] shadow-2xl transition-all ${
                                isPaidDisabled 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                            }`}
                        >
                            I Have Paid
                        </motion.button>
                        <p className="text-[11px] text-gray-600 text-center px-4">
                            By clicking, you confirm that you have scanned the QR and completed the transaction.
                        </p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
