import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ShoppingBag, Users, Zap } from "lucide-react";
import { toast } from "sonner";

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
                    } else {
                        toast.error(error.message);
                    }
                    return;
                }
                toast.success("Welcome back! 🎉");
                navigate("/home");
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0],
                        }
                    }
                });
                if (error) {
                    if (error.message.includes("already registered")) {
                        toast.error("Looks like you already have an account! Try signing in instead.");
                    } else {
                        toast.error(error.message);
                    }
                    return;
                }

                if (data.user) {
                    await supabase.from("profiles").upsert({
                        id: data.user.id,
                        full_name: email.split('@')[0],
                    });
                }

                toast.success("You're in! Welcome to the campus crew 🚀");
                navigate("/home");
            }
        } catch (err: any) {
            toast.error("Something went sideways. Give it another shot?");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: ShoppingBag, text: "Buy & sell with fellow students", color: "text-amber-400" },
        { icon: Users, text: "Trusted campus community", color: "text-emerald-400" },
        { icon: Zap, text: "Instant delivery to your hostel", color: "text-cyan-400" },
    ];

    return (
        <div className="min-h-screen bg-[#08080c] flex flex-col lg:flex-row overflow-hidden">

            {/* ─── Left Panel — Visual / Branding ─── */}
            <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center p-12 overflow-hidden">
                {/* Layered organic gradient blobs */}
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-violet-600/25 to-fuchsia-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "6s" }} />
                <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-cyan-500/20 to-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-[80px]" />

                {/* Subtle grid texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px"
                }} />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 max-w-lg"
                >
                    {/* Logo / Brand */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20" style={{ borderRadius: "13px" }}>
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">CU Bazzar</span>
                        </div>

                        <h1 className="text-[2.8rem] leading-[1.15] font-bold text-white mb-5 tracking-tight">
                            Your campus,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                                your marketplace.
                            </span>
                        </h1>

                        <p className="text-white/50 text-lg leading-relaxed max-w-sm" style={{ letterSpacing: "-0.01em" }}>
                            The place where CU students trade, discover, and connect. No middlemen, just us.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-3.5">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <f.icon className={`w-4.5 h-4.5 ${f.color}`} />
                                </div>
                                <span className="text-white/60 text-sm font-medium">{f.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Social proof nudge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 flex items-center gap-3"
                    >
                        <div className="flex -space-x-2.5">
                            {[
                                "bg-gradient-to-br from-violet-500 to-fuchsia-500",
                                "bg-gradient-to-br from-cyan-500 to-blue-500",
                                "bg-gradient-to-br from-amber-500 to-orange-500",
                                "bg-gradient-to-br from-emerald-500 to-teal-500",
                            ].map((bg, i) => (
                                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#08080c] flex items-center justify-center`}>
                                    <span className="text-[10px] font-bold text-white">{["S", "A", "R", "P"][i]}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/35 text-xs">
                            <span className="text-white/60 font-semibold">200+ students</span> already trading
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* ─── Right Panel — Login Form ─── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
                {/* Mobile-only ambient glow */}
                <div className="lg:hidden absolute top-[-15%] right-[-10%] w-72 h-72 bg-violet-500/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="lg:hidden absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Subtle vertical divider on desktop */}
                <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="w-full max-w-[400px] relative z-10"
                >
                    {/* Mobile brand */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center" style={{ borderRadius: "11px" }}>
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">CU Bazzar</span>
                        </div>
                    </div>

                    {/* Greeting */}
                    <div className="mb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login" : "signup"}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <p className="text-white/40 text-sm mb-1.5 font-medium">
                                    {isLogin ? "Good to see you again 👋" : "Let's get you started ✨"}
                                </p>
                                <h2 className="text-[1.75rem] font-bold text-white tracking-tight leading-tight">
                                    {isLogin ? "Welcome back" : "Create your account"}
                                </h2>
                                <p className="text-white/35 text-sm mt-2 leading-relaxed">
                                    {isLogin
                                        ? "Sign in to continue your campus marketplace journey."
                                        : "Join hundreds of students already using CU Bazzar."
                                    }
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-white/50 mb-2 ml-0.5 font-medium">
                                University email
                            </label>
                            <div className={`relative rounded-[14px] transition-all duration-300 ${focusedField === "email"
                                ? "shadow-[0_0_0_2px_rgba(139,92,246,0.35),0_0_20px_rgba(139,92,246,0.08)]"
                                : "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                }`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className={`h-[18px] w-[18px] transition-colors duration-300 ${focusedField === "email" ? "text-violet-400" : "text-white/20"}`} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-white/[0.03] rounded-[14px] pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition-colors placeholder:text-white/15"
                                    placeholder="you@cuchd.in"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-white/50 mb-2 ml-0.5 font-medium">
                                Password
                            </label>
                            <div className={`relative rounded-[14px] transition-all duration-300 ${focusedField === "password"
                                ? "shadow-[0_0_0_2px_rgba(139,92,246,0.35),0_0_20px_rgba(139,92,246,0.08)]"
                                : "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                }`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className={`h-[18px] w-[18px] transition-colors duration-300 ${focusedField === "password" ? "text-violet-400" : "text-white/20"}`} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-white/[0.03] rounded-[14px] pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition-colors placeholder:text-white/15"
                                    placeholder="something secret..."
                                    minLength={6}
                                />
                            </div>
                            {!isLogin && (
                                <p className="text-[11px] text-white/25 mt-1.5 ml-1">At least 6 characters — make it count!</p>
                            )}
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.985 }}
                            className="w-full relative group mt-2 py-3.5 px-6 rounded-[14px] bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold text-sm overflow-hidden shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.35)] transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "Let's get you in" : "Create my account"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-7">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.06]" />
                        <span className="text-[11px] text-white/20 font-medium uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.06]" />
                    </div>

                    {/* Toggle */}
                    <p className="text-center text-sm text-white/35">
                        {isLogin ? "New around here?" : "Already one of us?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200"
                        >
                            {isLogin ? "Join the crew" : "Sign in instead"}
                        </button>
                    </p>

                    {/* Footer note */}
                    <p className="text-center text-[11px] text-white/15 mt-8 leading-relaxed">
                        By continuing, you agree to keep things cool<br />and be a good campus citizen. 🤝
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
