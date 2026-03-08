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
        navigator.clipboard.writeText("INDWIN12");
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
                            Victory Special Offer <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">Only For 3 Days</span>
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
            <Link to="/food" className="sm:hidden block relative w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-xl">
                {/* Background image — the celebratory poster */}
                <div
                    className="absolute inset-0 bg-cover bg-top"
                    style={{ backgroundImage: 'url(/banners/india_victory_desktop.png)' }}
                />
                {/* Strong bottom gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/90" />

                {/* Content pinned to bottom */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6 z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 mb-3 self-center">
                        <span className="text-sm">🇮🇳</span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">India Wins T20 World Cup</span>
                        <span className="text-sm">🏆</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight text-center mb-1" style={fontH}>
                        Victory Celebration Offer
                    </h2>
                    <p className="text-white/70 text-xs font-medium text-center mb-4">
                        Celebrate with CU Bazzar — special offer for 3 days!
                    </p>

                    {/* Countdown Timer */}
                    {timeLeft && (
                        <div className="flex items-center justify-center gap-2.5 mb-5">
                            {[
                                { val: timeLeft.hours, label: 'HRS' },
                                { val: timeLeft.minutes, label: 'MIN' },
                                { val: timeLeft.seconds, label: 'SEC' },
                            ].map((t, i) => (
                                <div key={t.label} className="flex items-center gap-2.5">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center">
                                            <span className="text-xl font-black text-white font-mono">{String(t.val).padStart(2, '0')}</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-white/50 mt-1 tracking-widest">{t.label}</span>
                                    </div>
                                    {i < 2 && <span className="text-white/40 text-lg font-bold mb-4 animate-pulse">:</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Button */}
                    <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm active:scale-[0.97] transition-all"
                        style={{ background: 'linear-gradient(135deg, #138808 0%, #0d5f05 100%)', boxShadow: '0 4px 20px rgba(19,136,8,0.4)' }}
                    >
                        Claim Offer Now
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </Link>
        </div>
    );
}
