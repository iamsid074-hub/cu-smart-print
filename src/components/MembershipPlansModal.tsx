import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Sparkles, Crown, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "./UpiPaymentModal";

interface MembershipPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "plus",
    name: "CB PLUS",
    price: 49,
    deliveries: 5,
    color: "bg-[#1D1D1F]",
    iconColor: "text-[#8E8E93]",
    icon: Zap,
    popular: false,
    features: [],
  },
  {
    id: "prime",
    name: "CB PRIME",
    price: 149,
    deliveries: 15,
    color: "bg-[#3A3A3C]",
    iconColor: "text-white",
    icon: Sparkles,
    popular: true,
    features: ["Faster Delivery"],
  },
  {
    id: "prime_plus",
    name: "CB PRIME+",
    price: 249,
    deliveries: 25,
    color: "bg-black",
    iconColor: "text-[#D4AF37]", // Premium gold
    icon: Crown,
    popular: false,
    features: ["Faster Delivery", "Extreme fast delivery"], // Removed emoji
  },
];

export default function MembershipPlansModal({
  isOpen,
  onClose,
}: MembershipPlansModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(
    null
  );
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleSubscribeClick = (plan: (typeof PLANS)[0]) => {
    if (!user) {
      toast({ title: "Please login to subscribe", variant: "destructive" });
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };

  const handlePaymentVerify = async (paymentId: string) => {
    if (!user || !selectedPlan) return;

    const { error } = await supabase.from("orders").insert({
      product_id: null,
      buyer_id: user.id,
      seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c", // Admin system user
      base_price: selectedPlan.price,
      commission: 0,
      delivery_charge: 0,
      total_price: selectedPlan.price,
      delivery_location: `[SUBSCRIPTION] ${selectedPlan.name}`,
      delivery_room: `[PLAN_ID:${selectedPlan.id}]`,
      buyer_phone: "9999999999", // Placeholder
      status: "pending",
      payment_method: "cashfree",
      payment_status: "verifying",
      razorpay_payment_id: paymentId,
      seller_notified_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(
        "Failed to submit membership request. Please contact support."
      );
    }

    setIsPaymentOpen(false);
    setIsPendingApproval(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 transform-gpu"
            style={{ willChange: "opacity" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0F1115] sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl overflow-hidden pt-6 pb-8 mx-0 sm:mx-4 transform-gpu border border-white/10"
            style={{ willChange: "transform, opacity" }}
          >
            {isPendingApproval ? (
              <div className="px-6 mt-6 pb-6 text-center relative z-10 w-full">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 mx-auto flex items-center justify-center mb-5 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                  <Clock className="w-8 h-8 object-contain text-orange-400 drop-shadow-lg animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Verification Pending
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                  Your payment of{" "}
                  <span className="text-white font-bold">
                    ₹{selectedPlan?.price}
                  </span>{" "}
                  for{" "}
                  <span className="text-purple-400 font-bold">
                    {selectedPlan?.name}
                  </span>{" "}
                  has been received! Our admin will verify your payment details
                  and activate your membership shortly.
                </p>
                <button
                  onClick={() => {
                    setIsPendingApproval(false);
                    onClose();
                    window.location.reload();
                  }}
                  className="w-full py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/20 active:scale-[0.98]"
                >
                  Got it
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 pb-2 relative z-10 pt-4">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      CU Membership
                    </h2>
                    <p className="text-xs text-[#8E8E93] font-medium tracking-wide mt-1">
                      Unlock free deliveries & more
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-[#1D1D1F] hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 mt-6 space-y-4 max-h-[65vh] overflow-y-auto relative z-10 custom-scrollbar">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                          plan.popular
                            ? "bg-[#1D1D1F] border-[#3A3A3C]"
                            : "bg-[#0F1115] border-[#1D1D1F]"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-slate-200">
                            Most Popular
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl ${plan.color} flex items-center justify-center border border-white/5`}
                            >
                              <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                            </div>
                            <div>
                              <h3 className="text-[15px] font-black text-white tracking-tight">
                                {plan.name}
                              </h3>
                              <p className="text-xs text-[#8E8E93] font-medium">
                                Auto-renews weekly
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-white">
                              ₹{plan.price}
                            </span>
                            <span className="text-[#8E8E93] text-[10px] font-medium block">
                              / week
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-5">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-3.5 h-3.5 flex items-center justify-center">
                              <Check className="w-3 h-3 text-[#8E8E93]" />
                            </div>
                            <span className="font-medium">
                              <span className="text-white font-bold">
                                {plan.deliveries}
                              </span>{" "}
                              FREE Deliveries / week
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-3.5 h-3.5 flex items-center justify-center">
                              <Check className="w-3 h-3 text-[#8E8E93]" />
                            </div>
                            <span className="font-medium">
                              Priority Support
                            </span>
                          </div>
                          {plan.features.map((feature, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-xs"
                            >
                              <div className="w-3.5 h-3.5 flex items-center justify-center">
                                <Check className="w-3 h-3 text-[#8E8E93]" />
                              </div>
                              <span className="font-bold text-white tracking-wide">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleSubscribeClick(plan)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                            plan.id === "prime_plus"
                              ? "bg-[#D4AF37] text-black hover:bg-[#B4952D]"
                              : plan.popular
                              ? "bg-white text-black hover:bg-slate-200"
                              : "bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] border border-white/10"
                          }`}
                        >
                          Subscribe to {plan.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {selectedPlan && (
        <UpiPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          amount={selectedPlan.price}
          orderIdText={`CB_MEMBERSHIP_${selectedPlan.id.toUpperCase()}`}
          onPaymentVerify={handlePaymentVerify}
        />
      )}
    </AnimatePresence>
  );
}
