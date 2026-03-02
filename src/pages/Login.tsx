import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

const C = {
    bg: "#B8A896",
    card: "#D9CFC1",
    border: "#A89885",
    text: "#2B2621",
    muted: "#8A7E73",
    input: "#F5F1E8",
    accent: "#FF6B6B",
};
const fontHeading: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const fontBody: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message.includes("Invalid login")) {
                        toast.error("Hmm, that doesn't look right. Check your email or password?");
                    } else { toast.error(error.message); }
                    setLoading(false); return;
                }
                toast.success("Welcome back! 🎉");
                navigate("/home");
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { full_name: email.split('@')[0] } }
                });
                if (error) {
                    if (error.message.includes("already registered")) {
                        toast.error("Looks like you already have an account! Try signing in.");
                    } else { toast.error(error.message); }
                    setLoading(false); return;
                }
                if (data.user) {
                    await supabase.from("profiles").upsert({ id: data.user.id, full_name: email.split('@')[0] });
                }
                toast.success("You're in! Welcome to the crew 🚀");
                navigate("/home");
            }
        } catch { toast.error("Something went sideways. Give it another shot?"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-hidden" style={{ ...fontBody, backgroundColor: C.bg }}>
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: `${C.accent}18` }} />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(78,205,196,0.08)" }} />

            {/* Subtle dots */}
            <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: `radial-gradient(circle at 1px 1px, ${C.text} 0.5px, transparent 0)`, backgroundSize: "20px 20px" }} />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[400px] relative z-10 rounded-2xl p-7 sm:p-8 shadow-xl"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
                {/* Brand */}
                <div className="flex items-center gap-2.5 mb-7">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.accent, borderRadius: "11px" }}>
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold" style={{ ...fontHeading, color: C.text }}>CU Bazzar</span>
                </div>

                {/* Greeting */}
                <div className="mb-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login" : "signup"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-sm mb-1 font-medium" style={{ color: C.muted }}>
                                {isLogin ? "Good to see you again 👋" : "Let's get you started ✨"}
                            </p>
                            <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight" style={{ ...fontHeading, color: C.text }}>
                                {isLogin ? "Welcome back" : "Create your account"}
                            </h2>
                            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: C.muted }}>
                                {isLogin ? "Sign in to continue your campus journey." : "Join hundreds of students on CU Bazzar."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1.5 font-medium" style={{ color: C.muted }}>University email</label>
                        <div className="relative rounded-xl transition-all duration-300" style={{
                            boxShadow: focusedField === "email"
                                ? `0 0 0 2px ${C.accent}55, 0 0 12px ${C.accent}15`
                                : `0 0 0 1px ${C.border}`,
                        }}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "email" ? C.accent : C.muted }} />
                            </div>
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                style={{ backgroundColor: C.input, color: C.text }}
                                placeholder="you@cuchd.in"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1.5 font-medium" style={{ color: C.muted }}>Password</label>
                        <div className="relative rounded-xl transition-all duration-300" style={{
                            boxShadow: focusedField === "password"
                                ? `0 0 0 2px ${C.accent}55, 0 0 12px ${C.accent}15`
                                : `0 0 0 1px ${C.border}`,
                        }}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "password" ? C.accent : C.muted }} />
                            </div>
                            <input
                                type="password" required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField(null)}
                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                style={{ backgroundColor: C.input, color: C.text }}
                                placeholder="something secret..."
                                minLength={6}
                            />
                        </div>
                        {!isLogin && <p className="text-[11px] mt-1 ml-0.5" style={{ color: C.muted }}>At least 6 characters</p>}
                    </div>

                    <motion.button
                        type="submit" disabled={loading}
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-[52px]"
                        style={{ ...fontHeading, backgroundColor: C.accent, boxShadow: `0 4px 20px ${C.accent}40` }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>{isLogin ? "Let's get you in" : "Create my account"}<ArrowRight className="w-4 h-4" /></>
                            )}
                        </span>
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.border})` }} />
                    <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: C.muted }}>or</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C.border})` }} />
                </div>

                {/* Toggle */}
                <p className="text-sm" style={{ color: C.muted }}>
                    {isLogin ? "New around here?" : "Already one of us?"}{" "}
                    <button type="button" onClick={() => setIsLogin(!isLogin)}
                        className="font-semibold transition-colors duration-200" style={{ color: C.accent }}
                    >
                        {isLogin ? "Join the crew" : "Sign in instead"}
                    </button>
                </p>

                <p className="text-[11px] mt-6 leading-relaxed" style={{ color: `${C.muted}88` }}>
                    By continuing, you agree to keep things cool and be a good campus citizen. 🤝
                </p>
            </motion.div>
        </div>
    );
}
