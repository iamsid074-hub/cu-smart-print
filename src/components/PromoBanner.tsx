import { Link } from "react-router-dom";
import { Copy, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function PromoBanner() {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault(); // prevent link click if they just want to copy
        navigator.clipboard.writeText("CRICKET5");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full relative overflow-hidden group">
            {/* ─── DESKTOP BANNER (hidden on extreme mobile) ─── */}
            <Link to="/food" className="hidden sm:block relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: 'url(/cricket_bg_desktop.png)' }}
                />
                {/* Dark Vignette Overlay for readability */}
                <div className="absolute inset-0 bg-[#0D0907]/60 sm:bg-gradient-to-r sm:from-[#0D0907]/90 sm:via-[#0D0907]/60 sm:to-[#0D0907]/90" />

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                    {/* Match Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-4 py-1.5 rounded-full backdrop-blur-md border mb-4 sm:mb-6"
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl leading-none">🇮🇳</span>
                            <span className="text-sm font-bold text-white tracking-wide">IND</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 italic px-1">WON AGAINST</span>
                        <div className="flex items-center gap-2 opacity-50">
                            <span className="text-sm font-bold text-white tracking-wide">ENG</span>
                            <span className="text-xl leading-none">🇬🇧</span>
                        </div>
                        <div className="w-px h-4 bg-white/20 mx-1" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#F0C040] flex items-center gap-1.5">
                            INTO THE FINALS 🏆
                        </span>
                    </motion.div>

                    {/* Main Typography */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-white text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" style={fontH}>
                            ₹5 Delivery <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Only</span>
                        </h2>
                        <p className="text-white/80 text-lg md:text-xl lg:text-2xl font-bold mt-2 md:mt-4 max-w-2xl bg-[#0D0907]/40 px-6 py-2 rounded-full backdrop-blur-sm">
                            Celebrate India entering the Finals! 🇮🇳🥳
                        </p>
                    </motion.div>

                    {/* Call to Action & Code */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center gap-4"
                    >
                        <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #E11D48 100%)', boxShadow: '0 8px 30px rgba(225,29,72,0.4)' }}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Order Campus Food
                        </button>
                        <div
                            onClick={handleCopy}
                            className="group/code flex items-center gap-3 px-5 py-3.5 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-950/30 backdrop-blur-md cursor-pointer hover:bg-cyan-900/40 transition-all w-full sm:w-auto"
                        >
                            <div>
                                <p className="text-[10px] text-cyan-300/70 font-semibold uppercase tracking-wider mb-0.5">Use Code</p>
                                <p className="text-xl font-black text-cyan-400 tracking-widest font-mono">CRICKET5</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover/code:bg-cyan-500/30 transition-colors">
                                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-cyan-400" />}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Link>

            {/* ─── MOBILE BANNER (shown only on phones) ─── */}
            <Link to="/food" className="sm:hidden block relative w-full aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                    style={{ backgroundImage: 'url(/cricket_bg_mobile.png)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0907]/90 via-[#0D0907]/40 to-[#0D0907]/95" />

                <div className="absolute inset-0 flex flex-col p-5 h-full">
                    {/* Top: Match Info */}
                    <div className="flex items-center justify-between w-full mt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-emerald-500/30 bg-emerald-900/40">
                            <span className="text-sm">🇮🇳</span>
                            <span className="text-[11px] font-bold text-white tracking-wider">IND WON! 🏆</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                            FINALS BOUND
                        </div>
                    </div>

                    {/* Center Space to see the image */}
                    <div className="flex-grow" />

                    {/* Bottom: Offer & CTA */}
                    <div className="flex flex-col items-center text-center w-full pb-2">
                        <h2 className="text-white text-5xl font-black italic uppercase leading-[0.9] drop-shadow-2xl mb-3" style={fontH}>
                            ₹5 Delivery <br />
                            <span className="text-cyan-400 text-6xl">ONLY!</span>
                        </h2>
                        <p className="text-white/90 text-sm font-bold bg-[#0D0907]/60 px-4 py-1.5 rounded-full backdrop-blur-md mb-6 border border-white/5">
                            To celebrate India's win! 🇮🇳🥳
                        </p>

                        <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white text-[15px] active:scale-[0.98] transition-all"
                            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #E11D48 100%)', boxShadow: '0 8px 25px rgba(225,29,72,0.4)' }}
                        >
                            Order Food Now
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] text-white/40 mt-3 font-medium uppercase tracking-widest">Apply code CRICKET5 in cart</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
