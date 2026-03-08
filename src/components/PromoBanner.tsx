import { Link } from "react-router-dom";
import { Copy, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function PromoBanner() {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

    // Dynamic offer import
    useEffect(() => {
        import("@/utils/offerTimer").then(({ OFFER_END_TIME, isOfferActive }) => {
            if (!isOfferActive()) return;

            const updateTimer = () => {
                const now = Date.now();
                const diff = OFFER_END_TIME - now;
                if (diff <= 0) {
                    setTimeLeft(null);
                    return;
                }
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        });
    }, []);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText("FINAL14");
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
                    style={{ backgroundImage: 'url(/banners/india_victory_desktop.png)' }}
                />
                {/* Dark Vignette Overlay for readability */}
                <div className="absolute inset-0 bg-[#0D0907]/60 sm:bg-gradient-to-r sm:from-[#0D0907]/90 sm:via-[#0D0907]/60 sm:to-[#0D0907]/90" />

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                    {/* Match Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-5 py-2 rounded-full backdrop-blur-md border mb-4 sm:mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        style={{ background: 'rgba(255,153,51,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        <span className="text-2xl leading-none">🇮🇳</span>
                        <span className="text-sm font-black text-white tracking-widest uppercase drop-shadow-md">INDIA WINS T20 WORLD CUP 2026</span>
                        <span className="text-2xl leading-none">🏆</span>
                    </motion.div>

                    {/* Main Typography */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-white text-5xl md:text-7xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] text-center" style={fontH}>
                            Only ₹12 Delivery <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">For 3 Days</span>
                        </h2>
                        <p className="text-white/95 text-sm md:text-lg lg:text-xl font-bold mt-4 md:mt-6 max-w-2xl bg-[#0D0907]/60 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                            Celebrate the victory with CU Bazzar!
                        </p>
                    </motion.div>

                    {/* Call to Action & Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-4"
                    >
                        <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
                            style={{ background: 'linear-gradient(135deg, #138808 0%, #0d5f05 100%)', boxShadow: '0 8px 30px rgba(19,136,8,0.4)' }}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Order Food Now
                        </button>

                        {timeLeft && (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md w-full sm:w-auto">
                                <div className="text-left">
                                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5">Offer Ends In</p>
                                    <div className="flex items-center gap-2 text-xl font-black text-white tracking-widest font-mono">
                                        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                                        <span className="text-white/50 animate-pulse">:</span>
                                        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                                        <span className="text-white/50 animate-pulse">:</span>
                                        <span className="text-[#FF9933]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </Link>

            {/* ─── MOBILE BANNER (shown only on phones) ─── */}
            <Link to="/food" className="sm:hidden block relative w-full aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl border border-white/10">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                    style={{ backgroundImage: 'url(/banners/india_victory_mobile.png)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0907]/90 via-[#0D0907]/40 to-[#0D0907]/95" />

                <div className="absolute inset-0 flex flex-col p-5 h-full">
                    {/* Top: Match Info */}
                    <div className="flex justify-center w-full mt-2">
                        <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                            <span className="text-lg">🇮🇳</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Victory Offer 🏆</span>
                        </div>
                    </div>

                    {/* Center Space to see the image */}
                    <div className="flex-grow" />

                    {/* Bottom: Offer & CTA */}
                    <div className="flex flex-col items-center text-center w-full pb-2">
                        <h2 className="text-white text-5xl font-black italic uppercase leading-[0.9] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-3" style={fontH}>
                            Only ₹12 <br />
                            <span className="text-[#FF9933] text-5xl">DELIVERY</span>
                        </h2>

                        {timeLeft && (
                            <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 mb-4 inline-flex flex-col items-center shadow-lg">
                                <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mb-0.5">Offer Ends In</p>
                                <div className="flex items-center gap-1.5 text-lg font-black text-white font-mono">
                                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="text-white/50 animate-pulse">:</span>
                                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="text-white/50 animate-pulse">:</span>
                                    <span className="text-[#FF9933]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                </div>
                            </div>
                        )}

                        <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white text-[15px] active:scale-[0.98] transition-all relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #138808 0%, #0d5f05 100%)', boxShadow: '0 8px 25px rgba(19,136,8,0.4)' }}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] active:translate-y-0 transition-transform duration-200" />
                            Claim Offer Now
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
