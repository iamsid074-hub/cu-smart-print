import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    // Check if user came from a custom direct email link with token_hash
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tokenHash = queryParams.get('token_hash');
        const type = queryParams.get('type') as any;

        if (tokenHash && type === 'recovery') {
            setLoading(true);
            supabase.auth.verifyOtp({ token_hash: tokenHash, type })
                .then(({ error }) => {
                    if (error) {
                        toast.error("Invalid or expired reset link. Try requesting a new one.");
                    } else {
                        // clear URL params so it doesn't re-verify on refresh
                        window.history.replaceState({}, document.title, window.location.pathname);
                        toast.success("Ready to set your new password!");
                    }
                })
                .finally(() => setLoading(false));
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                // User is in password recovery mode â€” form is shown
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
        if (password !== confirm) { toast.error("Passwords don't match."); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setDone(true);
            toast.success("Password updated! You're all set ðŸŽ‰");
            setTimeout(() => navigate("/login"), 2500);
        } catch (err: any) {
            toast.error(err.message || "Could not update password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#140F0D" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[380px]"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FF6B6B" }}>
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold" style={{ ...fontH, color: "#E8DED4" }}>Set new password</h1>
                    <p className="text-sm mt-1.5" style={{ color: "rgba(232,222,212,0.35)" }}>Choose something strong and memorable.</p>
                </div>

                {done ? (
                    <div className="text-center space-y-4">
                        <CheckCircle className="w-12 h-12 mx-auto" style={{ color: "#4DB8AC" }} />
                        <p className="font-semibold" style={{ color: "#E8DED4" }}>Password updated!</p>
                        <p className="text-sm" style={{ color: "rgba(232,222,212,0.4)" }}>Redirecting you to loginâ€¦</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New password */}
                        <div>
                            <label className="block text-sm mb-1.5 font-medium" style={{ color: "rgba(232,222,212,0.4)" }}>New password</label>
                            <div className="relative" style={{ boxShadow: "0 0 0 1px rgba(61,52,44,0.6)", borderRadius: "12px" }}>
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4" style={{ color: "rgba(232,222,212,0.2)" }} />
                                </div>
                                <input
                                    type="password" required value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none"
                                    style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#E8DED4" }}
                                    placeholder="At least 6 characters"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Confirm */}
                        <div>
                            <label className="block text-sm mb-1.5 font-medium" style={{ color: "rgba(232,222,212,0.4)" }}>Confirm password</label>
                            <div className="relative" style={{ boxShadow: "0 0 0 1px rgba(61,52,44,0.6)", borderRadius: "12px" }}>
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4" style={{ color: "rgba(232,222,212,0.2)" }} />
                                </div>
                                <input
                                    type="password" required value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none"
                                    style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#E8DED4" }}
                                    placeholder="Same as above"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit" disabled={loading}
                            whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 h-[52px] disabled:opacity-50"
                            style={{ ...fontH, background: "#FF6B6B", boxShadow: "0 4px 20px rgba(255,107,107,0.25)" }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                        </motion.button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
