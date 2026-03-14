import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Info, Zap, X } from "lucide-react";
import { motion } from "framer-motion";

interface VersionData {
    versionCode: number;
    versionName: string;
    version: string;
    downloadUrl: string;
    releaseNotes: string;
}

// Session flag — persists only while the app is open
const SESSION_KEY = "cu_update_dismissed_version";

export default function AppUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState<VersionData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isForced, setIsForced] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            // Only check for updates if running on Android/iOS natively
            if (!Capacitor.isNativePlatform()) return;

            try {
                // 1. Get current app version from Capacitor
                const appInfo = await CapacitorApp.getInfo();
                const currentVersionCode = parseInt(appInfo.build || "0", 10);

                // 2. Fetch latest version from server (cache-busted)
                const response = await fetch(`https://cubazzar.shop/version.json?t=${Date.now()}`);
                if (!response.ok) return;

                const latestVersion: VersionData = await response.json();

                // 3. Compare versions
                if (latestVersion.versionCode > currentVersionCode) {
                    const versionGap = latestVersion.versionCode - currentVersionCode;

                    // Force update if more than 2 versions behind
                    const forced = versionGap >= 2;
                    setIsForced(forced);

                    // Check if user already dismissed THIS version in this session
                    const dismissed = sessionStorage.getItem(SESSION_KEY);
                    if (dismissed === String(latestVersion.versionCode) && !forced) {
                        return; // Not forcing, and user already dismissed this session
                    }

                    setUpdateAvailable(latestVersion);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        checkForUpdates();
    }, []);

    const handleDismiss = () => {
        if (isForced) return; // Cannot dismiss forced updates
        if (updateAvailable) {
            // Mark as dismissed in session storage
            sessionStorage.setItem(SESSION_KEY, String(updateAvailable.versionCode));
        }
        setIsOpen(false);
    };

    if (!updateAvailable) return null;

    return (
        <Dialog open={isOpen} onOpenChange={isForced ? undefined : setIsOpen}>
            <DialogContent
                className="sm:max-w-md w-[88vw] rounded-3xl p-0 overflow-hidden bg-white border-0 shadow-2xl"
                // Prevent closing by clicking outside if forced
                onPointerDownOutside={isForced ? (e) => e.preventDefault() : undefined}
                onEscapeKeyDown={isForced ? (e) => e.preventDefault() : undefined}
            >
                {/* Header Graphic */}
                <div className="relative h-36 bg-gradient-to-br from-brand via-purple-600 to-fuchsia-500 flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />

                    {/* Close button — only if not forced */}
                    {!isForced && (
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center z-10 mb-2"
                    >
                        <Zap className="w-8 h-8 text-purple-600 fill-purple-600" />
                    </motion.div>

                    {isForced && (
                        <span className="mt-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                            Required Update
                        </span>
                    )}
                </div>

                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-black text-center text-slate-800 tracking-tight">
                            {isForced ? "Update Required!" : "Update Available!"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-500 font-medium">
                            {isForced
                                ? "You must update to continue using CU Bazzar."
                                : `Version ${updateAvailable.versionName} is ready for you.`}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Release Notes */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">What's New</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {updateAvailable.releaseNotes || "Performance improvements and bug fixes."}
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
                                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <Download className="w-5 h-5" />
                                Update Now
                            </button>
                        </a>
                        {!isForced && (
                            <button
                                onClick={handleDismiss}
                                className="w-full py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm"
                            >
                                Remind Me Next Time
                            </button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
