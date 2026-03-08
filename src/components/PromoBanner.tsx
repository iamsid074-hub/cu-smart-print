import { Link } from "react-router-dom";
import { ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function PromoBanner() {
    return (
        <div className="w-full relative overflow-hidden group">
            {/* ═══════════ DESKTOP BANNER ═══════════ */}
            <Link to="/food" className="hidden sm:block relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: "url(/banners/india_victory_desktop.png)" }}
                />
                <div className="absolute inset-0 bg-[#0D0907]/65 sm:bg-gradient-to-r sm:from-[#0D0907]/90 sm:via-[#0D0907]/60 sm:to-[#0D0907]/90" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-5 py-2 rounded-full backdrop-blur-md border mb-6 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        style={{ background: "rgba(255,153,51,0.2)", borderColor: "rgba(255,255,255,0.25)" }}
                    >
                        <span className="text-2xl leading-none">🇮🇳</span>
                        <span className="text-sm font-black text-white tracking-widest uppercase drop-shadow-md">INDIA WON THE T20 WORLD CUP 2026</span>
                        <span className="text-2xl leading-none">🏆</span>
                    </motion.div>

                    {/* Main Text */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] text-center" style={fontH}>
                            Special Celebration <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
                                Only ₹12 Delivery
                            </span>
                        </h2>
                        <p className="text-white/90 text-sm md:text-lg font-bold mt-5 max-w-xl bg-[#0D0907]/50 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                            Celebrate the victory with CU Bazzar!
                        </p>
                        <p className="text-white/50 text-xs md:text-sm mt-2.5">
                            Order your snacks and celebrate the win!
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg hover:scale-105 active:scale-95 transition-all"
                            style={{ background: "linear-gradient(135deg, #138808 0%, #0d5f05 100%)", boxShadow: "0 8px 30px rgba(19,136,8,0.4)" }}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Order Food Now
                        </button>
                    </motion.div>
                </div>
            </Link>

            {/* ═══════════ MOBILE BANNER ═══════════ */}
            <Link to="/food" className="sm:hidden block relative w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-xl">
                <div
                    className="absolute inset-0 bg-cover bg-top"
                    style={{ backgroundImage: "url(/banners/india_victory_desktop.png)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />

                <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6 z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 mb-4 self-center">
                        <span className="text-sm">🇮🇳</span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">India Won T20 World Cup 2026</span>
                        <span className="text-sm">🏆</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-lg font-black uppercase tracking-tight leading-tight text-center mb-1" style={fontH}>
                        Special Celebration Offer
                    </h2>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808] text-xl font-black text-center mb-1.5" style={fontH}>
                        Only ₹12 Delivery for 3 Days
                    </p>
                    <p className="text-white/60 text-[11px] font-medium text-center mb-5">
                        Order your snacks and celebrate the win!
                    </p>

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
