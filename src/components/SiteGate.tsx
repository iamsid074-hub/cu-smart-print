import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Wrench, Clock, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

/*
  SiteGate — wraps the app to show:
  1. "Under Maintenance" screen when admin toggles maintenance ON
  2. "We're Closed" screen outside operating hours
  
  Operating hours (IST):
    Items:  6:00 AM – 10:00 PM
    Food:   6:00 PM – 12:00 AM

  Admins bypass both gates.
*/

// Helper: get current IST hour + minute
function getIST() {
    const now = new Date();
    // IST = UTC + 5:30
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    return { hours: ist.getHours(), minutes: ist.getMinutes() };
}

function isItemsOpen(): boolean {
    const { hours } = getIST();
    // 6:00 AM (6) to 10:00 PM (22) — open when hours >= 6 && hours < 22
    return hours >= 6 && hours < 22;
}

function isFoodOpen(): boolean {
    const { hours, minutes } = getIST();
    // 6:00 PM (18) to 12:00 AM (midnight)
    const totalMins = hours * 60 + minutes;
    return totalMins >= 18 * 60 && totalMins < 24 * 60;
}

function getNextOpenTime(): string {
    const { hours } = getIST();
    if (hours < 6) return "6:00 AM";
    if (hours >= 22) return "6:00 AM tomorrow";
    return "6:00 AM";
}

// ─── Closed Screen ─────────────────────────────────────────────────────────────
function ClosedScreen() {
    const itemsOpen = isItemsOpen();
    const foodOpen = isFoodOpen();
    const [time, setTime] = useState(getIST());

    useEffect(() => {
        const id = setInterval(() => setTime(getIST()), 60000);
        return () => clearInterval(id);
    }, []);

    const timeStr = `${time.hours % 12 || 12}:${time.minutes.toString().padStart(2, "0")} ${time.hours >= 12 ? "PM" : "AM"}`;

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0A0604 0%, #1A1410 50%, #0D0906 100%)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="max-w-md w-full text-center"
            >
                {/* Moon/Sun icon */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-6"
                >
                    {time.hours >= 6 && time.hours < 18 ? (
                        <Sun className="w-20 h-20 mx-auto text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]" />
                    ) : (
                        <Moon className="w-20 h-20 mx-auto text-indigo-300 drop-shadow-[0_0_30px_rgba(165,180,252,0.4)]" />
                    )}
                </motion.div>

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <img src="/logo.png" alt="CU Bazaar" className="w-10 h-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-2xl font-black">
                        <span style={{ color: "#FF6B6B" }}>CU</span>{" "}
                        <span className="text-white">BAZZAR</span>
                    </span>
                </div>

                <h1 className="text-3xl font-black text-white mb-2">We're Closed</h1>
                <p className="text-muted-foreground mb-8">
                    Come back during business hours!
                </p>

                {/* Operating hours cards */}
                <div className="space-y-3 mb-8">
                    <div className={`rounded-2xl p-4 border flex items-center gap-4 ${itemsOpen ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${itemsOpen ? "bg-green-500/15" : "bg-white/10"}`}>
                            <ShoppingBag className={`w-6 h-6 ${itemsOpen ? "text-green-400" : "text-muted-foreground"}`} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-bold text-white">Item Orders</p>
                            <p className="text-xs text-muted-foreground">6:00 AM – 10:00 PM</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${itemsOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {itemsOpen ? "OPEN" : "CLOSED"}
                        </span>
                    </div>

                    <div className={`rounded-2xl p-4 border flex items-center gap-4 ${foodOpen ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${foodOpen ? "bg-green-500/15" : "bg-white/10"}`}>
                            <UtensilsCrossed className={`w-6 h-6 ${foodOpen ? "text-green-400" : "text-muted-foreground"}`} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-bold text-white">Food Orders</p>
                            <p className="text-xs text-muted-foreground">6:00 PM – 12:00 AM</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${foodOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {foodOpen ? "OPEN" : "CLOSED"}
                        </span>
                    </div>
                </div>

                {/* Current time + next open */}
                <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Current Time (IST)</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</p>
                    <p className="text-xs text-muted-foreground">
                        Opens at <span className="text-white font-semibold">{getNextOpenTime()}</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Maintenance Screen ─────────────────────────────────────────────────────────
function MaintenanceScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0A0604 0%, #1A1410 50%, #0D0906 100%)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="max-w-md w-full text-center"
            >
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-6"
                >
                    <Wrench className="w-20 h-20 mx-auto text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
                </motion.div>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <img src="/logo.png" alt="CU Bazaar" className="w-10 h-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-2xl font-black">
                        <span style={{ color: "#FF6B6B" }}>CU</span>{" "}
                        <span className="text-white">BAZZAR</span>
                    </span>
                </div>

                <h1 className="text-3xl font-black text-white mb-2">Under Maintenance</h1>
                <p className="text-muted-foreground mb-8">
                    We're making things better! Be back shortly.
                </p>

                <div className="rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                    <motion.div
                        className="flex justify-center gap-1.5 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full bg-amber-400"
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                            />
                        ))}
                    </motion.div>
                    <p className="text-sm text-amber-200/80">
                        Our team is working on improvements.<br />
                        Please check back in a few minutes.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ─── SiteGate Hook ──────────────────────────────────────────────────────────────
export function useSiteGate() {
    const { isAdmin } = useAuth();
    const [maintenance, setMaintenance] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Check maintenance flag from Supabase
    useEffect(() => {
        const check = async () => {
            try {
                const { data } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "maintenance_mode")
                    .single();
                setMaintenance(data?.value === true || data?.value === "true");
            } catch {
                // Table might not exist yet — assume not in maintenance
                setMaintenance(false);
            }
            setLoaded(true);
        };
        check();

        // Poll every 30s
        const id = setInterval(check, 30000);
        return () => clearInterval(id);
    }, []);

    // Admins bypass everything
    if (isAdmin) return { gate: null, loaded: true };

    if (!loaded) return { gate: null, loaded: false };

    if (maintenance) return { gate: "maintenance" as const, loaded: true };

    const itemsOpen = isItemsOpen();
    const foodOpen = isFoodOpen();
    if (!itemsOpen && !foodOpen) return { gate: "closed" as const, loaded: true };

    return { gate: null, loaded: true };
}

export { ClosedScreen, MaintenanceScreen };
