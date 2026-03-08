import { Link } from "react-router-dom";
import { ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function PromoBanner() {
    return (
        <div className="w-full relative overflow-hidden group">
            {/* ═══════════ DESKTOP BANNER ═══════════ */}
            <Link to="/food" className="hidden sm:block relative w-full h-[300px] md:h-[400px] lg:h-[480px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: "url(/banners/india_victory_desktop.png)" }}
                />
                <div className="absolute inset-0 bg-[#0D0907]/70 sm:bg-gradient-to-r sm:from-[#0D0907]/90 sm:via-[#0D0907]/70 sm:to-[#0D0907]/90" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-5 py-2 rounded-full backdrop-blur-md border mb-5"
                        style={{ background: "rgba(255,153,51,0.15)", borderColor: "rgba(255,255,255,0.2)" }}
                    >
                        <span className="text-xl">🇮🇳</span>
                        <span className="text-xs font-black text-white tracking-widest uppercase">INDIA WON THE T20 WORLD CUP 2026</span>
                        <span className="text-xl">🏆</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 }}
                        className="text-white text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] text-center mb-3"
                        style={fontH}
                    >
                        Celebration Offer<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
                            Only ₹12 Delivery
                        </span>
                    </motion.h2>

                    <p className="text-white/80 text-sm md:text-base font-medium mb-2">
                        Celebrate the victory with CU Bazzar!
                    </p>
                    <p className="text-white/50 text-xs mb-5">
                        Order your snacks and celebrate the win!
                    </p>

                    {/* Promo Code */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
                    >
                        <span className="text-xs text-white/70 font-medium">Use Code</span>
                        <span className="text-lg font-black text-[#FF9933] tracking-widest" style={fontH}>INDWIN12</span>
                        <span className="text-xs text-white/70 font-medium">for ₹12 delivery</span>
                    </motion.div>

                    {/* CTA */}
                    <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-base hover:scale-105 active:scale-95 transition-all"
                        style={{ background: "linear-gradient(135deg, #138808 0%, #0d5f05 100%)", boxShadow: "0 6px 25px rgba(19,136,8,0.4)" }}
                    >
                        <Zap className="w-5 h-5 fill-current" />
                        Order Food Now
                    </button>
                </div>
            </Link>

            {/* ═══════════ MOBILE BANNER ═══════════ */}
            <Link to="/food" className="sm:hidden block relative w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-xl">
                <div
                    className="absolute inset-0 bg-cover bg-top"
                    style={{ backgroundImage: "url(/banners/india_victory_desktop.png)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />

                <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6 z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 mb-3 self-center">
                        <span className="text-sm">🇮🇳</span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">India Won T20 World Cup 2026</span>
                        <span className="text-sm">🏆</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight text-center mb-1" style={fontH}>
                        Celebration Offer
                    </h2>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808] text-2xl font-black text-center mb-1" style={fontH}>
                        Only ₹12 Delivery
                    </p>
                    <p className="text-white/60 text-[11px] font-medium text-center mb-4">
                        Celebrate the victory with CU Bazzar!
                    </p>

                    {/* Promo Code */}
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-5 self-center">
                        <span className="text-[10px] text-white/60 font-medium">Use Code</span>
                        <span className="text-base font-black text-[#FF9933] tracking-widest" style={fontH}>INDWIN12</span>
                    </div>

                    {/* CTA */}
                    <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm active:scale-[0.97] transition-all"
                        style={{ background: "linear-gradient(135deg, #138808 0%, #0d5f05 100%)", boxShadow: "0 4px 20px rgba(19,136,8,0.4)" }}
                    >
                        Claim Offer Now
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </Link>
        </div>
    );
}
