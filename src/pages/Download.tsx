import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download as DownloadIcon, Shield, Smartphone, CheckCircle, AlertCircle, ArrowLeft, Loader2, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface VersionData {
    version: string;
    versionCode: number;
    versionName: string;
    downloadUrl: string;
    releaseNotes: string;
}

const INSTALL_STEPS = [
    { icon: "1", title: "Download the APK", desc: "Tap the Download button below to get the latest APK file." },
    { icon: "2", title: "Allow Unknown Sources", desc: "Go to Settings → Security → Enable 'Install Unknown Apps' for your browser/files app." },
    { icon: "3", title: "Open the APK", desc: "Find the downloaded file in your notification bar or Files app and tap to install." },
    { icon: "4", title: "Install & Launch", desc: "Follow the Android install prompt. Once done, open CU Bazzar and log in!" },
];

export default function Download() {
    const [versionData, setVersionData] = useState<VersionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const res = await fetch(`/version.json?t=${Date.now()}`);
                if (res.ok) setVersionData(await res.json());
            } catch { /* fallback */ }
            setLoading(false);
        };
        fetchVersion();
    }, []);

    const handleDownload = () => {
        setDownloading(true);
        // Reset after 4 seconds
        setTimeout(() => setDownloading(false), 4000);
    };

    const apkUrl = versionData?.downloadUrl?.replace("/download", "/cubazzar.apk") || "/cubazzar.apk";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex items-center gap-4">
                <Link to="/" className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">CU Bazzar</p>
                    <h1 className="text-white font-black text-lg">Download App</h1>
                </div>
            </div>

            <div className="flex-1 px-4 pb-16 max-w-lg mx-auto w-full">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2.5rem] overflow-hidden mb-6 mt-4"
                >
                    {/* Gradient BG */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand via-purple-600 to-fuchsia-600" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

                    <div className="relative p-8 text-center text-white">
                        {/* App icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                            className="w-24 h-24 mx-auto mb-5 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                        >
                            <img src="/logo.png" alt="CU Bazzar" className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <Zap className="w-10 h-10 text-purple-600 hidden" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-1">CU Bazzar</h2>
                        <p className="text-white/70 font-medium text-sm mb-4">#1 Campus Marketplace</p>

                        {/* Version Badge */}
                        {loading ? (
                            <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/60" /></div>
                        ) : versionData ? (
                            <div className="flex items-center justify-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
                                    v{versionData.versionName}
                                </span>
                                <span className="text-white/60 text-xs">•</span>
                                <span className="text-white/60 text-xs font-bold">Build {versionData.versionCode}</span>
                            </div>
                        ) : null}

                        {/* Stars */}
                        <div className="flex justify-center gap-1 mt-4">
                            {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* What's New */}
                {versionData?.releaseNotes && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-5"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">What's New</p>
                        </div>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">{versionData.releaseNotes}</p>
                    </motion.div>
                )}

                {/* Download Button */}
                <motion.a
                    href={apkUrl}
                    download="cubazzar.apk"
                    rel="external"
                    onClick={handleDownload}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="block mb-4"
                >
                    <div
                        className={`w-full h-16 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all ${
                            downloading
                                ? "bg-emerald-500 text-white scale-95"
                                : "bg-white text-slate-900 hover:scale-[1.02] active:scale-95 shadow-[0_8px_30px_rgba(255,255,255,0.15)] cursor-pointer"
                        }`}
                    >
                        {downloading ? (
                            <><CheckCircle className="w-5 h-5" /> Download Started!</>
                        ) : (
                            <><DownloadIcon className="w-5 h-5" /> Download APK ({versionData ? `v${versionData.versionName}` : "Latest"})</>
                        )}
                    </div>
                </motion.a>

                {/* Security Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mb-8 text-white/40 text-xs font-medium"
                >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Safe & secure · Free to download · No Play Store required</span>
                </motion.div>

                {/* Install Guide */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Smartphone className="w-4 h-4 text-brand-light" />
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">How to Install</h3>
                    </div>

                    <div className="space-y-5">
                        {INSTALL_STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-8 h-8 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-black text-brand-light">{step.icon}</span>
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm mb-0.5">{step.title}</p>
                                    <p className="text-white/50 text-xs font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Alert */}
                    <div className="mt-6 pt-5 border-t border-white/10 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/50 text-xs font-medium leading-relaxed">
                            Android may show a warning saying this app is from an unknown source — this is normal for apps
                            not on the Play Store. Tap <strong className="text-white/70">Install Anyway</strong> to continue.
                        </p>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-white/30 text-xs font-medium">
                        © 2025 CU Bazzar · Chandigarh University
                    </p>
                    <Link to="/" className="text-brand-light text-xs font-bold mt-1 block hover:text-white transition-colors">
                        Back to Website →
                    </Link>
                </div>
            </div>
        </div>
    );
}
