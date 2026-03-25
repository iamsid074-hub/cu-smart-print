import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Clock, Gift, Award, ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Wallet() {
    const { user } = useAuth();
    const [walletBalance, setWalletBalance] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
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
        <div className="relative min-h-screen pb-32 overflow-hidden selection:bg-slate-200" style={{ backgroundColor: "#F7F7F8" }}>
            {/* Background & Studio Ambience Layer */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Desk/Wall gradient base */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#e8eaef] to-[#f4f5f8]" />
                
                {/* Soft Spotlight from Top-Right */}
                <div 
                    className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-60"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)" }}
                />
                
                {/* Deep Ambient Shadow at the bottom representing the "desk" gap */}
                <div className="absolute bottom-0 w-full h-[40vh] bg-gradient-to-t from-slate-300/30 to-transparent blur-3xl opacity-50" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 container max-w-lg mx-auto px-4 pt-12">
                
                {/* Header: Title + Profile Access */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] leading-tight font-black tracking-tighter text-slate-800">
                            Your <span className="text-slate-400 font-medium">Wallet</span>
                        </h1>
                    </div>
                    
                    {/* Tiny Profile Hook */}
                    <Link to="/profile">
                        <motion.div 
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center overflow-hidden"
                        >
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'bazzar'}&backgroundColor=f1f5f9`} 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </Link>
                </div>

                {/* Centerpiece iPad UI Glassmorphism Wallet Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full rounded-[32px] overflow-hidden p-[1px] mb-8"
                >
                    {/* Rotating Premium Gradient Border Wrapper */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/10 to-slate-400/30 pointer-events-none" />
                    
                    {/* The iPad Screen */}
                    <div className="relative rounded-[31px] bg-white/[0.6] backdrop-blur-[40px] px-8 py-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60">
                        {/* Light Sweep Animation */}
                        <motion.div 
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", repeatDelay: 2 }}
                            className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] opacity-70"
                        />
                        
                        <div className="relative z-10">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">Available Balance</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-400">₹</span>
                                <motion.span 
                                    className="text-[64px] leading-none font-black tracking-tighter text-slate-800"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                                >
                                    {walletBalance}
                                </motion.span>
                            </div>
                            
                            <p className="mt-4 text-[13px] font-medium text-slate-500 leading-relaxed max-w-[200px]">
                                This balance is strictly rewarded by CU Bazzar. Use it directly at checkout!
                            </p>
                        </div>
                    </div>
                    {/* Deep shadow below glass */}
                    <div className="absolute -bottom-8 left-10 right-10 h-8 bg-black/10 blur-xl rounded-full" />
                </motion.div>

                {/* Rewards Progress Section */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                    className="bg-white rounded-[24px] p-6 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.03)] border border-slate-100 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0" />
                    
                    <div className="relative z-10 flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-[15px]">Unlock ₹20 Reward</h3>
                                <p className="text-[12px] font-medium text-slate-500">Complete 3 orders to earn.</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 px-1">
                            <span>0</span>
                            <span className={totalOrders % 3 >= 1 ? "text-slate-800" : ""}>1</span>
                            <span className={totalOrders % 3 >= 2 ? "text-slate-800" : ""}>2</span>
                            <span className="text-[#ef4444] bg-[#ef4444]/10 px-2 rounded-full py-0.5 relative -top-0.5">₹20!</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((totalOrders % 3) / 3) * 100}%` }}
                                transition={{ duration: 1, type: "spring" }}
                                className="absolute top-0 left-0 h-full bg-slate-900 rounded-full"
                            />
                        </div>
                        <p className="mt-3 text-center text-[12px] font-medium text-slate-500">
                            You have completed <strong className="text-slate-800">{totalOrders}</strong> total order{totalOrders !== 1 && 's'}.
                        </p>
                    </div>
                </motion.div>

                {/* Minimalist Transaction History */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                >
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Recent Activity</h3>
                    
                    <div className="bg-white rounded-[24px] p-2 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.03)] border border-slate-100">
                        {transactions.length > 0 ? (
                            <div className="flex flex-col">
                                {transactions.map((tx: any, idx: number) => (
                                    <div key={tx.id} className={`flex items-center justify-between p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-slate-100 text-slate-600'}`}>
                                                {tx.amount > 0 ? <Award className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-[14px]">{tx.description}</p>
                                                <p className="text-[11px] font-medium text-slate-400">
                                                    {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-black tracking-tight ${tx.amount > 0 ? 'text-[#10b981]' : 'text-slate-800'}`}>
                                            {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center opacity-50">
                                <Clock className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="text-[13px] font-medium text-slate-500">No recent activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
