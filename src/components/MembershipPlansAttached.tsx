import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Sparkles, Crown, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import UpiPaymentModal from "./UpiPaymentModal";

const PLANS = [
  {
    id: "plus",
    name: "CB PLUS",
    price: 99,
    deliveries: 4,
    color: "bg-gray-100",
    iconColor: "text-gray-500",
    icon: Zap,
    popular: false,
    features: [],
  },
  {
    id: "prime",
    name: "CB PRIME",
    price: 199,
    deliveries: 9,
    color: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: Sparkles,
    popular: true,
    features: ["Faster Delivery"],
  },
  {
    id: "prime_plus",
    name: "CB PRIME+",
    price: 379,
    deliveries: 14,
    color: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: Crown,
    popular: false,
    features: ["Faster Delivery", "Extreme fast delivery"],
  },
];

export default function MembershipPlansAttached({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleSubscribeClick = (plan: (typeof PLANS)[0]) => {
    if (!user) {
      toast.error("Please login to subscribe");
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
      buyer_phone: "9999999999", 
      status: "pending",
      payment_method: "cashfree",
      payment_status: "verifying",
      razorpay_payment_id: paymentId,
      seller_notified_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to submit membership request");
      return;
    }

    setIsPaymentOpen(false);
    setIsPendingApproval(true);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">CU Membership</h2>
          <p className="text-xs text-gray-500 font-medium">Unlock free deliveries & more</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        {isPendingApproval ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Verification Pending</h3>
            <p className="text-sm text-gray-500 mb-8 px-4">Your payment for <span className="font-bold text-gray-900">{selectedPlan?.name}</span> is being verified. Your membership will activate shortly.</p>
            <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">Got it</button>
          </div>
        ) : (
          PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.id} className={`relative rounded-3xl p-5 border transition-all ${plan.popular ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">
                    Most Popular
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center border border-black/5`}>
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900 tracking-tight">{plan.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Weekly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-400 text-[10px] font-medium block">/ week</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <FeatureRow icon={<Check size={14} className="text-emerald-500" />} text={`${plan.deliveries} FREE Deliveries`} />
                  <FeatureRow icon={<Check size={14} className="text-emerald-500" />} text="Priority Support" />
                  {plan.features.map((f, i) => <FeatureRow key={i} icon={<Check size={14} className="text-emerald-500" />} text={f} />)}
                </div>

                <button
                  onClick={() => handleSubscribeClick(plan)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-sm ${
                    plan.id === 'prime_plus' ? 'bg-amber-500 text-black hover:bg-amber-600' :
                    plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' :
                    'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  Subscribe to {plan.name}
                </button>
              </div>
            )
          })
        )}
      </div>

      {selectedPlan && (
        <UpiPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          amount={selectedPlan.price}
          orderIdText={`CB_MEMBS_${selectedPlan.id.toUpperCase()}`}
          onPaymentVerify={handlePaymentVerify}
        />
      )}
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
      {icon}
      <span>{text}</span>
    </div>
  );
}
