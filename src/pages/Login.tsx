import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ShoppingBag, Users, Zap } from "lucide-react";
import { toast } from "sonner";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const fontB: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

import { Capacitor } from "@capacitor/core";

export default function Login() {
    const [showIntro, setShowIntro] = useState(Capacitor.isNativePlatform());
    const [introPhase, setIntroPhase] = useState(1);
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Phase 1: 0 - 1.8s
        const t1 = setTimeout(() => setIntroPhase(2), 1800);
        // Phase 2: 1.8s - 3.6s
        const t2 = setTimeout(() => setIntroPhase(3), 3600);
        // End Intro: 6.5s
        const t3 = setTimeout(() => setShowIntro(false), 6500);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { toast.error("Enter your email first."); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setResetSent(true);
            toast.success("Reset link sent! Check your inbox 📧");
        } catch (err: any) {
            toast.error(err.message || "Could not send reset link. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLogin && !acceptedTerms) {
            toast.error("Please accept the Terms and Conditions to create an account.");
            return;
        }
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    toast.error(error.message.includes("Invalid login")
                        ? "Hmm, that doesn't look right. Check your email or password?"
                        : error.message);
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
                    toast.error(error.message.includes("already registered")
                        ? "Looks like you already have an account! Try signing in."
                        : error.message);
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

    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/home`,
                }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || `Could not sign in with ${provider}.`);
        }
    };

    const features = [
        { icon: ShoppingBag, text: "Buy & sell with fellow students", color: "#FF6B6B" },
        { icon: Users, text: "Trusted campus community", color: "#4DB8AC" },
        { icon: Zap, text: "Instant delivery to your hostel", color: "#F0C040" },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden" style={{ backgroundColor: "#140F0D" }}>
            {/* ─── Intro Splash ─── */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "#332C27" }}
                    >
                        {/* Animated Background Orbs */}
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.5 }} transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full blur-[100px] pointer-events-none" style={{ background: "#FF6B6B" }} />

                        <AnimatePresence mode="wait">
                            {/* PHASE 1 */}
                            {introPhase === 1 && (
                                <motion.div
                                    key="phase1"
                                    initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -30, filter: "blur(5px)" }}
                                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                                    className="absolute inset-0 flex items-center justify-center flex-col z-10"
                                >
                                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tight text-white mb-2" style={fontH}>
                                        YOUR TRUST.
                                    </h2>
                                </motion.div>
                            )}

                            {/* PHASE 2 */}
                            {introPhase === 2 && (
                                <motion.div
                                    key="phase2"
                                    initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -30, filter: "blur(5px)" }}
                                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                                    className="absolute inset-0 flex items-center justify-center flex-col z-10"
                                >
                                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tight" style={{ ...fontH, color: "#FF6B6B" }}>
                                        OUR RESPONSIBILITY.
                                    </h2>
                                </motion.div>
                            )}

                            {/* PHASE 3 */}
                            {introPhase === 3 && (
                                <motion.div
                                    key="phase3"
                                    className="absolute inset-0 flex items-center justify-center flex-col z-10"
                                >
                                    {/* Logo scaling up */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        transition={{ type: "spring", damping: 14, stiffness: 100, delay: 0.2 }}
                                        className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl flex items-center justify-center p-1.5 mb-8"
                                        style={{ backgroundColor: "#3F3832", border: `2px solid #544B43` }}
                                    >
                                        <img src="/logo.png" alt="CU BAZZAR" className="w-full h-full object-cover rounded-full relative z-10" />
                                        {/* Outer pulsing ring */}
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.8 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                                            className="absolute inset-0 rounded-full border-2"
                                            style={{ borderColor: "#FF6B6B" }}
                                        />
                                    </motion.div>

                                    {/* Welcome Text */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.6 }}
                                        className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-4 text-center"
                                        style={{ color: "#AEA397", ...fontB }}
                                    >
                                        We Welcome You To
                                    </motion.div>

                                    {/* Crazy Character Animation */}
                                    <div className="flex overflow-visible relative z-10 perspective-1000">
                                        {["C", "U", "\u00A0", "B", "A", "Z", "Z", "A", "R"].map((char, index) => (
                                            <motion.span
                                                key={index}
                                                initial={{ y: 80, opacity: 0, rotateX: -90, filter: "blur(10px)" }}
                                                animate={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
                                                transition={{
                                                    duration: 0.8,
                                                    ease: [0.34, 1.56, 0.64, 1], // bouncy spring-like ease
                                                    delay: 0.8 + index * 0.05,
                                                }}
                                                className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter origin-bottom inline-block"
                                                style={{
                                                    ...fontH,
                                                    color: char === "C" || char === "U" ? "#EDE6DE" : "#FF6B6B",
                                                    textShadow: `0 10px 30px ${char === "C" || char === "U" ? 'rgba(255,255,255,0.1)' : 'rgba(255,107,107,0.2)'}`
                                                }}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Progress Bar */}
                        <motion.div
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[3px] rounded-full overflow-hidden"
                            style={{ backgroundColor: "#3F3832" }}
                        >
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 6, ease: "easeInOut" }}
                                className="h-full"
                                style={{ backgroundColor: "#FF6B6B" }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Left — Branding & Visual ─── */}
            <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center p-12 overflow-hidden" style={{ backgroundColor: "#1A1412" }}>
                {/* Soft gradient orbs */}
                <div className="absolute top-[-8%] left-[-5%] w-[450px] h-[450px] rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ background: "rgba(255,107,107,0.08)", animationDuration: "7s" }} />
                <div className="absolute bottom-[-12%] right-[-8%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ background: "rgba(77,184,172,0.06)", animationDuration: "9s" }} />

                {/* Subtle dot texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,222,212,0.8) 0.5px, transparent 0)",
                    backgroundSize: "28px 28px"
                }} />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 max-w-lg"
                >
                    {/* Logo */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-7">
                            <img src="/logo.png" alt="CU Bazzar Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }} />
                            <span className="text-2xl font-bold tracking-tight" style={{ ...fontH, color: "#E8DED4" }}>CU Bazzar</span>
                        </div>

                        <h1 className="text-[2.8rem] leading-[1.12] font-bold tracking-tight mb-5" style={{ ...fontH, color: "#E8DED4" }}>
                            Your campus,
                            <br />
                            <span style={{ color: "#FF6B6B" }}>your marketplace.</span>
                        </h1>

                        <p className="text-lg leading-relaxed max-w-sm" style={{ color: "rgba(232,222,212,0.4)", letterSpacing: "-0.01em" }}>
                            The place where CU students trade, discover, and connect. No middlemen, just us.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl"
                                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                                </div>
                                <span className="text-sm font-medium" style={{ color: "rgba(232,222,212,0.5)" }}>{f.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 flex items-center gap-3"
                    >
                        <div className="flex -space-x-2.5">
                            {["#FF6B6B", "#4DB8AC", "#9B59B6", "#F0C040"].map((bg, i) => (
                                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg, border: "2px solid #140F0D" }}>
                                    <span className="text-[10px] font-bold text-white">{["S", "A", "R", "P"][i]}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs" style={{ color: "rgba(232,222,212,0.3)" }}>
                            <span className="font-semibold" style={{ color: "rgba(232,222,212,0.5)" }}>200+ students</span> already trading
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* ─── Right — Login Form ─── */}
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-14 relative min-h-screen lg:min-h-0">
                {/* Mobile glow */}
                <div className="lg:hidden absolute top-0 right-0 w-52 h-52 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(255,107,107,0.07)" }} />
                <div className="lg:hidden absolute bottom-0 left-0 w-52 h-52 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(77,184,172,0.05)" }} />

                {/* Subtle divider on desktop */}
                <div className="hidden lg:block absolute left-0 top-[12%] bottom-[12%] w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)" }} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="w-full max-w-[400px] relative z-10"
                >
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <img src="/logo.png" alt="CU Bazzar Logo" className="w-10 h-10 rounded-xl object-cover shadow-md" />
                        <span className="text-lg font-bold" style={{ ...fontH, color: "#E8DED4" }}>CU Bazzar</span>
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
                                <p className="text-sm mb-1.5 font-medium" style={{ color: "rgba(232,222,212,0.35)" }}>
                                    {isLogin ? "Good to see you again 👋" : "Let's get you started ✨"}
                                </p>
                                <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight" style={{ ...fontH, color: "#E8DED4" }}>
                                    {isLogin ? "Welcome back" : "Create your account"}
                                </h2>
                                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "rgba(232,222,212,0.3)" }}>
                                    {isLogin ? "Sign in to continue your campus journey." : "Join hundreds of students on CU Bazzar."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── FORGOT PASSWORD FLOW ── */}
                    <AnimatePresence mode="wait">
                        {forgotPassword ? (
                            <motion.div key="forgot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                                {resetSent ? (
                                    <div className="py-6 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(77,184,172,0.12)', border: '1px solid rgba(77,184,172,0.2)' }}>
                                            <Mail className="w-5 h-5" style={{ color: '#4DB8AC' }} />
                                        </div>
                                        <p className="font-semibold" style={{ color: '#E8DED4' }}>Check your inbox!</p>
                                        <p className="text-sm" style={{ color: 'rgba(232,222,212,0.4)' }}>We sent a password reset link to <strong style={{ color: 'rgba(232,222,212,0.7)' }}>{email}</strong>.</p>
                                        <button type="button" onClick={() => { setForgotPassword(false); setResetSent(false); }} className="text-sm font-semibold mt-2" style={{ color: '#FF6B6B' }}>← Back to login</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div>
                                            <p className="text-sm mb-1" style={{ color: 'rgba(232,222,212,0.35)' }}>Enter your email address and we'll send a reset link.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1.5 font-medium" style={{ color: 'rgba(232,222,212,0.4)' }}>Email Address</label>
                                            <div className="relative rounded-xl transition-all duration-300" style={{ boxShadow: focusedField === 'reset-email' ? '0 0 0 2px rgba(255,107,107,0.35)' : '0 0 0 1px rgba(61,52,44,0.6)' }}>
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4" style={{ color: focusedField === 'reset-email' ? '#FF6B6B' : 'rgba(232,222,212,0.2)' }} />
                                                </div>
                                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedField('reset-email')} onBlur={() => setFocusedField(null)}
                                                    className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#E8DED4' }}
                                                    placeholder="you@example.com" />
                                            </div>
                                        </div>
                                        <motion.button type="submit" disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                                            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 h-[52px] disabled:opacity-50"
                                            style={{ ...fontH, background: '#FF6B6B', boxShadow: '0 4px 20px rgba(255,107,107,0.25)' }}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
                                        </motion.button>
                                        <button type="button" onClick={() => setForgotPassword(false)} className="w-full text-sm" style={{ color: 'rgba(232,222,212,0.3)' }}>← Back to login</button>
                                    </form>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="main" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm mb-1.5 font-medium" style={{ color: "rgba(232,222,212,0.4)" }}>Email Address</label>
                                        <div className="relative rounded-xl transition-all duration-300" style={{
                                            boxShadow: focusedField === "email"
                                                ? "0 0 0 2px rgba(255,107,107,0.35), 0 0 16px rgba(255,107,107,0.08)"
                                                : "0 0 0 1px rgba(61,52,44,0.6)"
                                        }}>
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "email" ? "#FF6B6B" : "rgba(232,222,212,0.2)" }} />
                                            </div>
                                            <input
                                                type="email" required value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedField("email")}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#E8DED4" }}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm mb-1.5 font-medium" style={{ color: "rgba(232,222,212,0.4)" }}>Password</label>
                                        <div className="relative rounded-xl transition-all duration-300" style={{
                                            boxShadow: focusedField === "password"
                                                ? "0 0 0 2px rgba(255,107,107,0.35), 0 0 16px rgba(255,107,107,0.08)"
                                                : "0 0 0 1px rgba(61,52,44,0.6)"
                                        }}>
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "password" ? "#FF6B6B" : "rgba(232,222,212,0.2)" }} />
                                            </div>
                                            <input
                                                type="password" required value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocusedField("password")}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#E8DED4" }}
                                                placeholder="something secret..."
                                                minLength={6}
                                            />
                                        </div>
                                        {!isLogin && <p className="text-[11px] mt-1 ml-0.5" style={{ color: "rgba(232,222,212,0.2)" }}>At least 6 characters — make it count!</p>}
                                    </div>

                                    {/* T&C Accept Checkbox — signup only */}
                                    {!isLogin && (
                                        <div className="flex items-start gap-3 px-1">
                                            <button
                                                type="button"
                                                onClick={() => setAcceptedTerms(!acceptedTerms)}
                                                className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all border"
                                                style={{
                                                    backgroundColor: acceptedTerms ? '#FF6B6B' : 'rgba(255,255,255,0.04)',
                                                    borderColor: acceptedTerms ? '#FF6B6B' : 'rgba(255,255,255,0.15)',
                                                }}
                                                aria-checked={acceptedTerms}
                                                role="checkbox"
                                            >
                                                {acceptedTerms && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                        <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </button>
                                            <p className="text-xs leading-relaxed" style={{ color: "rgba(232,222,212,0.4)" }}>
                                                I have read and agree to the{" "}
                                                <Link to="/terms" target="_blank" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#FF6B6B" }}>
                                                    Terms and Conditions
                                                </Link>
                                                {" "}of CU Bazzar. I understand it is an intermediary platform and I am responsible for my own transactions.
                                            </p>
                                        </div>
                                    )}

                                    {/* Forgot password link — login only */}
                                    {isLogin && (
                                        <div className="flex justify-end -mt-1">
                                            <button type="button" onClick={() => { setForgotPassword(true); setResetSent(false); }}
                                                className="text-xs transition-opacity hover:opacity-80"
                                                style={{ color: 'rgba(232,222,212,0.3)' }}
                                            >Forgot password?</button>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <motion.button
                                        type="submit" disabled={loading || (!isLogin && !acceptedTerms)}
                                        whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                                        className="w-full relative group py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-[52px]"
                                        style={{ ...fontH, background: "#FF6B6B", boxShadow: "0 4px 20px rgba(255,107,107,0.25)" }}
                                    >
                                        {/* Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <>{isLogin ? "Let's get you in" : "Create my account"}<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                                            )}
                                        </span>
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06))" }} />
                        <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "rgba(232,222,212,0.15)" }}>or</span>
                        <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.06))" }} />
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <motion.button
                            type="button"
                            onClick={() => handleOAuthLogin('google')}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.985 }}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-semibold text-white h-[52px]"
                            style={{ ...fontB }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={() => handleOAuthLogin('facebook')}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.985 }}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 transition-colors text-sm font-semibold text-white h-[52px]"
                            style={{ ...fontB }}
                        >
                            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Continue with Facebook
                        </motion.button>
                    </div>

                    {/* Toggle */}
                    <p className="text-sm" style={{ color: "rgba(232,222,212,0.3)" }}>
                        {isLogin ? "New around here?" : "Already one of us?"}{" "}
                        <button type="button" onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold transition-colors duration-200 hover:opacity-80" style={{ color: "#FF6B6B" }}
                        >
                            {isLogin ? "Join the crew" : "Sign in instead"}
                        </button>
                    </p>

                    <p className="text-[11px] mt-6 leading-relaxed" style={{ color: "rgba(232,222,212,0.12)" }}>
                        By continuing, you agree to our{" "}
                        <Link to="/terms" className="underline underline-offset-2 hover:opacity-60 transition-opacity" style={{ color: "rgba(232,222,212,0.25)" }}>Terms &amp; Conditions</Link>
                        {" "}and to be a good campus citizen. 🤝
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
