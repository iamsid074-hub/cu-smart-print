import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Check, Zap, Sparkles, Crown, Clock, ArrowLeft, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMembership } from "@/hooks/useMembership";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";

const PLANS = [
  {
    id: "plus",
    name: "CB PLUS",
    price: 99,
    deliveries: 5,
    color: "from-slate-800 to-slate-950",
    glowColor: "rgba(142, 142, 147, 0.15)",
    iconColor: "text-slate-400",
    icon: Zap,
    popular: false,
    tagline: "Perfect for casual buyers",
    features: ["5 Free Deliveries / week", "Priority Support", "Standard Delivery"],
  },
  {
    id: "prime",
    name: "CB PRIME",
    price: 199,
    deliveries: 15,
    color: "from-indigo-900/90 to-purple-950/95",
    glowColor: "rgba(139, 92, 246, 0.25)",
    iconColor: "text-purple-300",
    icon: Sparkles,
    popular: true,
    tagline: "Best value for campus foodies",
    features: ["15 Free Deliveries / week", "Priority Support", "Ultra-fast VIP routing", "Exclusive Promo Codes"],
  },
  {
    id: "prime_plus",
    name: "CB PRIME+",
    price: 379,
    deliveries: 25,
    color: "from-amber-950/80 to-stone-950",
    glowColor: "rgba(212, 175, 55, 0.25)",
    iconColor: "text-[#D4AF37]",
    icon: Crown,
    popular: false,
    tagline: "The ultimate unlimited experience",
    features: ["25 Free Deliveries / week", "Instant VIP Dispatch Support", "Extreme priority delivery speed", "Zero peak-hour pricing", "Free entry to premium games"],
  },
];

export default function Membership() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plan: activePlan, isActive, isPendingApproval: hookPending } = useMembership();
  
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleSubscribeClick = (plan: typeof PLANS[0]) => {
    if (!user) {
      toast({ title: "Please login to subscribe", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (activePlan === plan.id) {
      toast({ title: "You are already subscribed to this plan!" });
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
      throw new Error("Failed to submit membership request. Please contact support.");
    }

    setIsPaymentOpen(false);
    setIsPendingApproval(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 relative text-white bg-[#0A0B10]">
      {/* Visual background lights */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
            <Crown className="w-3.5 h-3.5" /> Premium Club
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            CU Membership Club
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-medium">
            Unlock weekly free deliveries, immediate dispatch, VIP speeds and exclusive rewards. Choose a plan tailored for you.
          </p>
        </div>

        {/* Current Active Status */}
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-300 font-bold">Active Subscription</p>
                <h3 className="text-xl font-black text-white">{activePlan?.toUpperCase().replace("_", " ")} Plan</h3>
                <p className="text-xs text-slate-400 font-medium">Auto-renewing weekly. Enjoy free delivery on your orders!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> Active VIP Account
            </div>
          </motion.div>
        )}

        {(isPendingApproval || hookPending) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">Pending Activation</p>
                <h3 className="text-lg font-bold text-white">Payment Verification in Progress</h3>
                <p className="text-xs text-slate-400 font-medium">Our system is confirming your weekly pass. VIP services will start shortly!</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3 Tier Subscription Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isPlanActive = activePlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`relative flex flex-col justify-between rounded-[2.5rem] p-6 bg-gradient-to-b ${plan.color} border border-white/10 overflow-hidden shadow-xl`}
                style={{
                  boxShadow: `0 10px 30px -10px ${plan.glowColor}`,
                }}
              >
                {/* Background ambient lighting inside card */}
                <div 
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none" 
                  style={{ backgroundColor: plan.glowColor.replace("0.25", "0.4") }}
                />

                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-white text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white">
                    Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{plan.name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-black">₹{plan.price}</span>
                    <span className="text-slate-400 text-xs font-semibold"> / week</span>
                  </div>

                  <div className="w-full h-[1px] bg-white/10 mb-6" />

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribeClick(plan)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] ${
                    isPlanActive
                      ? "bg-emerald-500 text-white cursor-default"
                      : plan.id === "prime_plus"
                      ? "bg-[#D4AF37] text-black hover:bg-[#B4952D]"
                      : plan.popular
                      ? "bg-white text-black hover:bg-slate-200"
                      : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                  }`}
                >
                  {isPlanActive ? "Current Active Plan" : `Subscribe ${plan.name}`}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Trust Badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-amber-400 mb-3">
              <Crown className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm mb-1">Instant VIP Badge</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">Get a gold crown emblem on your profile and cart screen.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm mb-1">Weekly Free Passes</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">Delivery charges completely removed for subscription pass orders.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-purple-400 mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm mb-1">Cancel Anytime</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">Flexible subscriptions. Upgrade or turn off auto-renew directly.</p>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <UpiPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          amount={selectedPlan.price}
          orderIdText={`CB_MEMBERSHIP_${selectedPlan.id.toUpperCase()}`}
          onPaymentVerify={handlePaymentVerify}
        />
      )}
    </div>
  );
}
