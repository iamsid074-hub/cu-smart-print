import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UsernameSetup({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Username validation regex: 3-20 chars, alphanumeric and underscores only
    const isValidFormat = (uname: string) => /^[a-zA-Z0-9_]{3,20}$/.test(uname);

    useEffect(() => {
        if (!username) {
            setStatus("idle");
            return;
        }

        if (!isValidFormat(username)) {
            setStatus("invalid");
            return;
        }

        const checkAvailability = async () => {
            setStatus("checking");
            // Query the database for this specific username (case-insensitive check could be handled via ilike but exact match is fine if we force lowercase)
            const formattedUsername = username.toLowerCase();

            const { data, error } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", formattedUsername)
                .maybeSingle();

            if (error && error.code !== "PGRST116") {
                console.error("Error checking username:", error);
                return;
            }

            if (data) {
                setStatus("taken");
            } else {
                setStatus("available");
            }
        };

        const timer = setTimeout(checkAvailability, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== "available" || !user) return;

        setIsSubmitting(true);
        const formattedUsername = username.toLowerCase();

        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    username: formattedUsername,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Student User",
                    avatar_url: user.user_metadata?.avatar_url || ""
                }, { onConflict: 'id' });

            if (error) {
                if (error.code === '23505') { // Unique violation Postgres error code
                    setStatus("taken");
                    throw new Error("This username was just taken. Please choose another.");
                }
                throw error;
            }

            toast.success("Welcome aboard, @" + formattedUsername + "!");
            onComplete(); // Dissolve the gate

        } catch (err: any) {
            toast.error(err.message || "Failed to set username");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md glass-heavy rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-pink/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Claim Your Handle 🎯</h2>
                    <p className="text-muted-foreground mb-8 text-sm">
                        Before diving into the marketplace, pick a unique username for others to find and chat with you.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                                    placeholder="student_hustler"
                                    className={`w-full bg-black/20 border-2 rounded-2xl py-3 pl-10 pr-12 text-foreground font-mono transition-colors outline-none
                    ${status === "invalid" || status === "taken" ? "border-red-500/50 focus:border-red-500" :
                                            status === "available" ? "border-neon-green/50 focus:border-neon-green" :
                                                "border-white/10 focus:border-neon-cyan/50"}`}
                                    spellCheck={false}
                                    autoComplete="off"
                                    maxLength={20}
                                    disabled={isSubmitting}
                                />

                                {/* Status Icons */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <AnimatePresence mode="wait">
                                        {status === "checking" && (
                                            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                            </motion.div>
                                        )}
                                        {status === "available" && (
                                            <motion.div key="available" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <CheckCircle2 className="w-5 h-5 text-neon-green" />
                                            </motion.div>
                                        )}
                                        {(status === "taken" || status === "invalid") && (
                                            <motion.div key="invalid" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Contextual helper text */}
                            <div className="h-5 ml-1">
                                <AnimatePresence mode="wait">
                                    {status === "invalid" && username.length > 0 && (
                                        <motion.p key="msg-invalid" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400">
                                            Must be 3-20 characters, no spaces or special symbols.
                                        </motion.p>
                                    )}
                                    {status === "taken" && (
                                        <motion.p key="msg-taken" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400">
                                            This username is already claimed.
                                        </motion.p>
                                    )}
                                    {status === "available" && (
                                        <motion.p key="msg-available" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-neon-green">
                                            Awesome! This handle is available.
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={status !== "available" || isSubmitting}
                            whileHover={status === "available" && !isSubmitting ? { scale: 1.02 } : {}}
                            whileTap={status === "available" && !isSubmitting ? { scale: 0.98 } : {}}
                            className="premium-glass-button w-full py-3.5 bg-gradient-fire text-white font-bold flex flex-row shadow-neon-fire disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Continue to App
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
                            className="premium-glass-button text-xs text-muted-foreground hover:text-white transition-colors px-4 py-2"
                            disabled={isSubmitting}
                        >
                            Cancel and sign out
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
