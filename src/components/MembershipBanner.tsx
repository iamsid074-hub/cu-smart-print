import { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Crown } from 'lucide-react';
import { useMembership } from '@/hooks/useMembership';
import MembershipPlansModal from './MembershipPlansModal';

export default function MembershipBanner() {
    const { isLoaded, isActive, plan } = useMembership();
    const [isPlansOpen, setIsPlansOpen] = useState(false);

    if (!isLoaded || isActive) return null; // Don't show upsell banner if they already have an active plan

    return (
        <>
            <div className="mx-4 lg:mx-8 mt-2 mb-6">
                <div 
                    onClick={() => setIsPlansOpen(true)}
                    className="relative w-full rounded-3xl overflow-hidden p-[1px] cursor-pointer group transform transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-900/5"
                >
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative w-full h-full bg-[#0B0D11] rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Shimmer effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 animate-shimmer pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 tracking-tight">
                                    CB Membership
                                </h3>
                            </div>
                            <p className="text-sm sm:text-[15px] font-medium text-slate-400 tracking-wide">
                                Get up to <span className="text-white font-bold">25 FREE deliveries</span> every week.
                            </p>
                            
                            <div className="flex gap-2 mt-4 sm:hidden">
                                <span className="text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-md">Starts at ₹49/wk</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4 w-full sm:w-auto">
                            <div className="hidden sm:flex items-center">
                                <span className="text-sm font-bold text-slate-300 mr-4">Plans from ₹49/wk</span>
                            </div>
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black font-black text-sm px-6 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(255,255,255,0.25)] hover:bg-slate-200 transition-colors">
                                Explore Plans
                                <ArrowRight className="w-4 h-4" strokeWidth={3} />
                            </button>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-600/20 blur-[40px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/20 blur-[40px] rounded-full pointer-events-none" />
                    </div>
                </div>
            </div>

            <MembershipPlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />
        </>
    );
}
