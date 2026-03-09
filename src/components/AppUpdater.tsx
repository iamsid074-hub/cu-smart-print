import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface VersionData {
    versionCode: number;
    versionName: string;
    downloadUrl: string;
    releaseNotes: string;
}

export default function AppUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState<VersionData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            // Only check for updates if running on Android/iOS natively
            if (!Capacitor.isNativePlatform()) return;

            try {
                // 1. Get current app version from Capacitor
                const appInfo = await CapacitorApp.getInfo();
                const currentVersionCode = parseInt(appInfo.build || "0", 10);

                // 2. Fetch latest version from server
                // Add timestamp to prevent caching
                const response = await fetch(`https://cubazzar.shop/version.json?t=${Date.now()}`);
                if (!response.ok) return;

                const latestVersion: VersionData = await response.json();

                // 3. Compare versions
                if (latestVersion.versionCode > currentVersionCode) {
                    setUpdateAvailable(latestVersion);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        checkForUpdates();
    }, []);

    if (!updateAvailable) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md w-[85vw] rounded-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20">
                {/* Header Graphic */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6 text-center">
                    <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center z-10 mb-2"
                    >
                        <Zap className="w-8 h-8 text-purple-600 fill-purple-600" />
                    </motion.div>
                </div>

                <div className="p-6 relative">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-black text-center text-slate-800 tracking-tight">
                            Update Available!
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-500 font-medium">
                            Version {updateAvailable.versionName} is ready for you.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Release Notes */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 relative overflow-hidden">
                        <div className="flex items-start gap-3 relative z-10">
                            <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">What's New</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {updateAvailable.releaseNotes || "Performance improvements and bug fixes to make your experience smoother."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col gap-3 sm:flex-col items-stretch">
                        <a
                            href={updateAvailable.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <button
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border-2 border-transparent transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] active:scale-95 text-white text-base"
                                style={{
                                    background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                                }}
                                onClick={() => setIsOpen(false)}
                            >
                                <Download className="w-5 h-5" />
                                Download Update Now
                            </button>
                        </a>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
