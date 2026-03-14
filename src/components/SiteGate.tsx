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
    Food:   6:00 PM – 12:30 AM

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
    // Always open — no closing hours
    return true;
}

function isFoodOpen(): boolean {
    // Always open — no closing hours
    return true;
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
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
                        <Sun className="w-20 h-20 mx-auto text-amber-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
                    ) : (
                        <Moon className="w-20 h-20 mx-auto text-brand-accent drop-shadow-[0_0_30px_rgba(94,84,142,0.3)]" />
                    )}
                </motion.div>

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <img src="/logo.png" alt="CU Bazaar" className="w-10 h-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-2xl font-black">
                        <span className="text-brand">CU</span>{" "}
                        <span className="text-slate-900">BAZZAR</span>
                    </span>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">We're Closed</h1>
                <p className="text-slate-500 mb-8">
                    Come back during business hours!
                </p>

                {/* Operating hours cards */}
                <div className="space-y-3 mb-8">
                    <div className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm ${itemsOpen ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-white ring-1 ring-slate-100"}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${itemsOpen ? "bg-emerald-100" : "bg-slate-100"}`}>
                            <ShoppingBag className={`w-6 h-6 ${itemsOpen ? "text-emerald-600" : "text-slate-400"}`} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-bold text-slate-900">Item Orders</p>
                            <p className="text-xs text-slate-500">6:00 AM – 10:00 PM</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${itemsOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                            {itemsOpen ? "OPEN" : "CLOSED"}
                        </span>
                    </div>

                    <div className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm ${foodOpen ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-white ring-1 ring-slate-100"}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${foodOpen ? "bg-emerald-100" : "bg-slate-100"}`}>
                            <UtensilsCrossed className={`w-6 h-6 ${foodOpen ? "text-emerald-600" : "text-slate-400"}`} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-bold text-slate-900">Food Orders</p>
                            <p className="text-xs text-slate-500">6:00 PM – 12:30 AM</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${foodOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                            {foodOpen ? "OPEN" : "CLOSED"}
                        </span>
                    </div>
                </div>

                {/* Current time + next open */}
                <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-100 shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">Current Time (IST)</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</p>
                    <p className="text-xs text-slate-500">
                        Opens at <span className="text-brand font-semibold">{getNextOpenTime()}</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Maintenance Screen ─────────────────────────────────────────────────────────
function MaintenanceScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
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
                    <Wrench className="w-20 h-20 mx-auto text-amber-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]" />
                </motion.div>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <img src="/logo.png" alt="CU Bazaar" className="w-10 h-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-2xl font-black">
                        <span className="text-brand">CU</span>{" "}
                        <span className="text-slate-900">BAZZAR</span>
                    </span>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Under Maintenance</h1>
                <p className="text-slate-500 mb-8">
                    We're making things better! Be back shortly.
                </p>

                <div className="rounded-2xl p-6 bg-amber-50 ring-1 ring-amber-200 shadow-sm">
                    <motion.div
                        className="flex justify-center gap-1.5 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full bg-amber-500"
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                            />
                        ))}
                    </motion.div>
                    <p className="text-sm text-amber-800">
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
