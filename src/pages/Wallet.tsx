import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, ArrowRight, Wallet as WalletIcon, CreditCard, Clock, RotateCcw, Copy, Award, ShoppingBag } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Wallet() {
    const { user } = useAuth();
    const [walletBalance, setWalletBalance] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [weeklyOrders, setWeeklyOrders] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        if (!user) return;
        
        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance, total_orders')
            .eq('id', user.id)
            .single();
            
        if (profile) {
            setWalletBalance(profile.wallet_balance || 0);
            setTotalOrders(profile.total_orders || 0);
        }

        try {
            // --- FETCH WEEKLY ORDERS (MONDAY 12 AM IST RESET) ---
            const now = new Date();
            // IST is UTC + 5:30. Calculate midnight IST in UTC.
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(now.getTime() + istOffset);
            istTime.setUTCHours(0, 0, 0, 0);
            const dayOfWeek = istTime.getUTCDay(); // 0 is Sunday
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            istTime.setUTCDate(istTime.getUTCDate() + diffToMonday);
            const startOfWeekIST = new Date(istTime.getTime() - istOffset).toISOString();

            const { count: weeklyCount, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('buyer_id', user.id)
                .eq('status', 'completed')
                .gte('created_at', startOfWeekIST);
            
            if (countError) throw countError;
            setWeeklyOrders(weeklyCount || 0);
        } catch (err) {
            console.error("Error fetching weekly orders:", err);
            // Fallback: stay at 0 or use a different metric
        }

        // Fetch transactions
        const { data: txList } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (txList) {
            setTransactions(txList);
        }
    };

    return (
        <div className="relative min-h-screen pb-32 overflow-hidden bg-[#F5F5F7] text-[#1D1D1F]">
            {/* Background & Studio Ambience Layer */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#007AFF]/5 rounded-full blur-[100px] opacity-80" />
                <div className="absolute top-[20%] left-1/4 w-[500px] h-[500px] bg-[#34C759]/5 rounded-full blur-[120px] opacity-80" />
                
                {/* Deep Ambient Shadow at the bottom representing the "desk" gap */}
                <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-black/5 to-transparent opacity-50" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 container max-w-lg mx-auto px-4 pt-24">
                
                {/* Header: Title + Profile Access */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] leading-tight font-black tracking-tighter text-[#1D1D1F] flex items-center gap-3">
                            Your <span className="text-[#8E8E93] font-medium font-serif italic lowercase tracking-tight">Wallet</span>
                            <motion.button 
                                whileTap={{ rotate: 180 }}
                                onClick={() => fetchWalletData()}
                                className="p-2 rounded-full ios-glass border border-white/60 text-[#8E8E93] hover:text-[#1D1D1F] transition-colors shadow-sm bg-white/60"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </motion.button>
                        </h1>
                    </div>
                    
                    {/* Tiny Profile Hook */}
                    <Link to="/profile">
                        <motion.div 
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center overflow-hidden"
                        >
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'bazzar'}&backgroundColor=f1f5f9`} 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </Link>
                </div>

                {/* Brand New Centered Modern Wallet Card */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="relative w-full ios-glass bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-8 pb-10 shadow-lg border border-white/60 flex flex-col items-center justify-center min-h-[300px] overflow-hidden group mb-8"
                >
                    {/* Beautiful background decorative mesh/gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[60px] opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#007AFF]/10 rounded-full blur-[80px] opacity-80 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    {/* Giant Balance Centerpiece */}
                    <div className="flex flex-col items-center justify-center z-10 mb-8 mx-auto w-full text-center mt-4">
                        <span className="text-[#8E8E93] text-[11px] font-bold uppercase tracking-[0.15em] mb-1">Available Balance</span>
                        <div className="flex items-start justify-center gap-0">
                            <span className="text-4xl font-bold text-[#8E8E93] mt-3">â‚¹</span>
                            <motion.span 
                                className="text-[90px] leading-[0.85] font-black tracking-tighter text-[#1D1D1F]"
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                {walletBalance}
                            </motion.span>
                        </div>
                    </div>

                    {/* Bottom subtle text */}
                    <div className="text-center z-10 max-w-[220px] mx-auto mt-2 bg-white/50 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/60 shadow-sm">
                        <p className="text-[12px] text-[#8E8E93] font-medium leading-tight">
                            Use this strictly at checkout for <span className="text-[#1D1D1F] font-bold">CU Bazzar</span> orders.
                        </p>
                    </div>
                </motion.div>

                {/* Rewards Progress Section */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                    className="ios-glass bg-white/40 backdrop-blur-3xl rounded-[2rem] p-6 shadow-sm border border-white/60 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/40 to-transparent rounded-bl-full -z-0 pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center shadow-lg">
                                <Gift className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1D1D1F] text-[16px] tracking-tight">Unlock â‚¹30 Reward</h3>
                                <p className="text-[12px] font-medium text-[#8E8E93]">Complete 3 orders in a week to get â‚¹30 in your wallet.</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative">
                        <div className="flex justify-between text-[11px] font-black text-[#8E8E93] mb-2 px-1">
                            {(() => {
                                const displayCount = Math.min(weeklyOrders, 3);
                                return (
                                    <>
                                        <span>0</span>
                                        <span className={displayCount >= 1 ? "text-[#1D1D1F]" : ""}>1</span>
                                        <span className={displayCount >= 2 ? "text-[#1D1D1F]" : ""}>2</span>
                                        <span className={`px-2 rounded-full py-0.5 relative -top-0.5 transition-all shadow-sm ${displayCount === 3 ? "text-white bg-[#FF3B30] scale-[1.15]" : "text-[#FF3B30] bg-[#FF3B30]/10"}`}>â‚¹30!</span>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden relative shadow-inner">
                            {(() => {
                                const displayCount = Math.min(weeklyOrders, 3);
                                return (
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(displayCount / 3) * 100}%` }}
                                        transition={{ duration: 1, type: "spring" }}
                                        className={`absolute top-0 left-0 h-full rounded-full transition-colors duration-500 ${displayCount === 3 ? 'bg-[#34C759]' : 'bg-[#1D1D1F]'}`}
                                    />
                                );
                            })()}
                        </div>
                        <p className="mt-4 text-center text-[13px] font-medium text-[#8E8E93]">
                            You have completed <strong className="text-[#1D1D1F] font-bold">{weeklyOrders}</strong> orders <span className="text-[#8E8E93] font-bold">THIS WEEK</span>.

                            {weeklyOrders < 3 && (
                                <span className="block text-[#8E8E93]/60 text-[10px] mt-1 italic font-bold">Goal resets Monday at 12 AM IST</span>
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Flavour Factory Offer */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
                    className="ios-glass relative overflow-hidden rounded-[2.5rem] p-6 mb-8 border border-white/60 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)' }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-xl rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start flex-col sm:flex-row gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-sm border border-white/30">
                            <span className="text-xl">ðŸ</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-[17px] leading-tight mb-1.5 flex items-center gap-2">
                                Flavour Factory Special <span className="px-2 py-0.5 bg-white/30 rounded-full text-[9px] uppercase tracking-widest font-black shadow-sm">Hot Offer</span>
                            </h3>
                            <p className="text-[13px] font-medium text-white/90 leading-relaxed mb-4">
                                Order worth <strong className="text-white text-[14px]">â‚¹499</strong> or more from Flavour Factory to get <strong className="text-white text-[14px]">â‚¹30</strong> instantly in your wallet!
                            </p>
                            <Link to="/food" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#FF3B30] text-[13px] font-black rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md">
                                Order Now <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Minimalist Transaction History */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                >
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#8E8E93] mb-4 px-3">Recent Activity</h3>
                    
                    <div className="ios-glass bg-white/50 backdrop-blur-3xl rounded-[2rem] p-3 shadow-sm border border-white/60">
                        {transactions.length > 0 ? (
                            <div className="flex flex-col">
                                {transactions.map((tx: any, idx: number) => (
                                    <div key={tx.id} className={`flex items-center justify-between p-3.5 ${idx !== transactions.length - 1 ? 'border-b border-black/5' : ''}`}>
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm ${tx.amount > 0 ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20' : 'bg-white text-[#8E8E93] border border-black/5'}`}>
                                                {tx.amount > 0 ? <Award className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1D1D1F] text-[15px]">{tx.description}</p>
                                                <p className="text-[11px] font-semibold text-[#8E8E93] mt-[1px]">
                                                    {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-black tracking-tight text-[16px] ${tx.amount > 0 ? 'text-[#34C759]' : 'text-[#1D1D1F]'}`}>
                                            {tx.amount > 0 ? '+' : ''}â‚¹{Math.abs(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center opacity-60">
                                <Clock className="w-10 h-10 text-[#8E8E93] mb-3" />
                                <p className="text-[13px] font-medium text-[#8E8E93]">No recent activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
