import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, Crown, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UpiPaymentModal from './UpiPaymentModal';

interface MembershipPlansModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    {
        id: 'plus',
        name: 'CB PLUS',
        price: 49,
        deliveries: 5,
        color: 'from-blue-500 to-cyan-400',
        icon: Zap,
        popular: false,
        features: []
    },
    {
        id: 'prime',
        name: 'CB PRIME',
        price: 149,
        deliveries: 15,
        color: 'from-purple-600 to-indigo-500',
        icon: Sparkles,
        popular: true,
        features: ['Faster Delivery']
    },
    {
        id: 'prime_plus',
        name: 'CB PRIME+',
        price: 249,
        deliveries: 25,
        color: 'from-amber-500 to-orange-500',
        icon: Crown,
        popular: false,
        features: ['Faster Delivery', 'Extreme fast delivery ⚡']
    }
];

export default function MembershipPlansModal({ isOpen, onClose }: MembershipPlansModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isPendingApproval, setIsPendingApproval] = useState(false);

    const handleSubscribeClick = (plan: typeof PLANS[0]) => {
        if (!user) {
            toast({ title: "Please login to subscribe", variant: "destructive" });
            return;
        }
        setSelectedPlan(plan);
        setIsPaymentOpen(true);
    };

    const handlePaymentVerify = async (paymentId: string) => {
        if (!user || !selectedPlan) return;
        
        const { error } = await supabase
            .from('orders')
            .insert({
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
                status: 'pending',
                payment_method: 'cashfree',
                payment_status: 'verifying',
                razorpay_payment_id: paymentId,
                seller_notified_at: new Date().toISOString()
            });

        if (error) {
            throw new Error("Failed to submit membership request. Please contact support.");
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
                                <h3 className="text-lg font-black text-white mb-2">Verification Pending</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                                    Your payment of <span className="text-white font-bold">₹{selectedPlan?.price}</span> for <span className="text-purple-400 font-bold">{selectedPlan?.name}</span> has been received! Our admin will verify your payment details and activate your membership shortly.
                                </p>
                                <button 
                                    onClick={() => { setIsPendingApproval(false); onClose(); window.location.reload(); }} 
                                    className="w-full py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/20 active:scale-[0.98]"
                                >
                                    Got it
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none" />

                                <div className="flex items-center justify-between px-6 pb-2 relative z-10">
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">CU Membership</h2>
                                        <p className="text-xs text-slate-400 font-medium tracking-wide">Unlock free deliveries & more</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer backdrop-blur-md">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="px-6 mt-6 space-y-4 max-h-[65vh] overflow-y-auto relative z-10 custom-scrollbar">
                                    {PLANS.map((plan) => {
                                        const Icon = plan.icon;
                                        return (
                                            <div 
                                                key={plan.id}
                                                className={`relative rounded-2xl p-5 border transition-all duration-300 ${plan.popular ? 'bg-white/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                            >
                                                {plan.popular && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                                        Most Popular
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-inner`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[15px] font-black text-white tracking-tight">{plan.name}</h3>
                                                            <p className="text-xs text-slate-400 font-medium">Auto-renews weekly</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-white">₹{plan.price}</span>
                                                        <span className="text-slate-400 text-[10px] font-medium block">/ week</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-5">

                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                                </div>
                                                <span className="font-medium"><span className="text-white font-bold">{plan.deliveries}</span> FREE Deliveries / week</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                                </div>
                                                <span className="font-medium">Priority Support</span>
                                            </div>
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center outline outline-1 outline-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                                        <Check className="w-2.5 h-2.5 text-emerald-400 font-bold" />
                                                    </div>
                                                    <span className="font-bold text-white tracking-wide">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => handleSubscribeClick(plan)}
                                            className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${plan.popular ? 'bg-white text-black hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
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
