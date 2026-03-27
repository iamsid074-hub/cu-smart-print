import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ShoppingBag, Users, Zap, Phone } from "lucide-react";
import { toast } from "sonner";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };
const fontB: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

export default function Login() {
    const { signInWithGoogle, signIn, signUp } = useAuth();
    const [showIntro, setShowIntro] = useState(Capacitor.isNativePlatform());
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // SNAPPY 2.0s TOTAL DURATION
        const timeout = setTimeout(() => setShowIntro(false), 2000);
        return () => clearTimeout(timeout);
    }, []);

    // Clear error when user interacts
    useEffect(() => {
        setFormError(null);
    }, [email, password, acceptedTerms, isLogin]);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            setFormError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        setFormError(null);
        try {
            const { error }: any = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setResetSent(true);
            toast.success("Password reset link sent! Check your inbox.");
        } catch (err: any) {
            setFormError(err.message || "Failed to send reset link. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email.trim() || !password.trim()) {
            setFormError("Looks like you missed a spot.");
            return;
        }

        if (password.length < 6) {
            setFormError("Password needs to be at least 6 characters.");
            return;
        }

        if (!isLogin && !acceptedTerms) {
            setFormError("Please accept the Terms and Conditions to create an account.");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const { error }: any = await signIn(email, password);
                if (error) {
                    setFormError(error.message === "Invalid login credentials"
                        ? "Wait, that doesn't look right. Double-check your details?"
                        : error.message);
                    setLoading(false);
                    return;
                }
                toast.success("Welcome back! 🚀");
            } else {
                const { error }: any = await signUp(email, password);
                if (error) {
                    setFormError(error.message);
                    setLoading(false);
                    return;
                }
                const parts = email.split('@');
                const usernameBase = parts[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                const fallbackUsername = `${usernameBase}${randomNum}`;

                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session?.user) {
                    await supabase.from("profiles").upsert({
                        id: sessionData.session.user.id,
                        username: fallbackUsername,
                        full_name: parts[0]
                    });
                }
                toast.success("Account created successfully! ✨");
            }
            navigate("/home");
        } catch (err: any) {
            setFormError("Something went sideways. Give it another shot?");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: ShoppingBag, text: "Buy & sell with fellow students", color: "#F8FAFC" },
        { icon: Users, text: "Trusted campus community", color: "#4DB8AC" },
        { icon: Zap, text: "Instant delivery to your hostel", color: "#F0C040" },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
            {/* ─── Intro Splash ─── */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "#0F172A" }}
                    >
                        {/* Dynamic Background Ripples */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 2, opacity: [0, 0.1, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute w-[80vw] h-[80vw] rounded-full border border-white/10"
                            />
                        ))}

                        {/* Logo Pulse Container */}
                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -15, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ 
                                    type: "spring", 
                                    damping: 20, 
                                    stiffness: 250,
                                    delay: 0.2 
                                }}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] overflow-hidden bg-white p-1.5 shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-8"
                            >
                                <img src="/logo.webp" alt="CU BAZZAR" className="w-full h-full object-cover rounded-[1.8rem]" />
                                
                                {/* Magnetic Ripple */}
                                <motion.div
                                    animate={{ 
                                        boxShadow: ["0 0 0 0px rgba(255,255,255,0.4)", "0 0 0 30px rgba(255,255,255,0)"]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-[2rem]"
                                />
                            </motion.div>

                            {/* Brand Name: Blur-to-Focus Reveal */}
                            <motion.div
                                initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                                className="flex items-center space-x-2"
                            >
                                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl" style={fontH}>
                                    CU BAZZAR
                                </h2>
                            </motion.div>
                            
                            {/* Fast Progress Indicator */}
                            <div className="mt-12 w-24 h-1 rounded-full overflow-hidden bg-white/10">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Left — Branding & Visual ─── */}
            <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center p-12 overflow-hidden" style={{ backgroundColor: "#231942" }}>
                {/* Soft gradient orbs */}
                <div className="absolute top-[-8%] left-[-5%] w-[450px] h-[450px] rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", animationDuration: "7s" }} />
                <div className="absolute bottom-[-12%] right-[-8%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ background: "rgba(255,255,255,0.03)", animationDuration: "9s" }} />

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
                            <img src="/logo.webp" alt="CU Bazzar Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }} />
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
                <div className="lg:hidden absolute top-0 right-0 w-52 h-52 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(35,25,66,0.06)" }} />
                <div className="lg:hidden absolute bottom-0 left-0 w-52 h-52 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(77,184,172,0.05)" }} />

                {/* Subtle divider on desktop */}
                <div className="hidden lg:block absolute left-0 top-[12%] bottom-[12%] w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(15,23,42,0.06), transparent)" }} />

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="w-full max-w-[400px] relative z-10"
                >
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <img src="/logo.webp" alt="CU Bazzar Logo" className="w-10 h-10 rounded-xl object-cover shadow-md" />
                        <span className="text-lg font-bold" style={{ ...fontH, color: "#0F172A" }}>CU Bazzar</span>
                    </div>

                    {/* Greeting */}
                    <div className="mb-6">
                        <AnimatePresence mode="wait">
                            {forgotPassword ? (
                                <motion.div
                                    key="forgot-password"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="text-sm mb-1.5 font-medium flex items-center gap-2" style={{ color: "#64748B" }}>
                                        <Lock className="w-3.5 h-3.5" /> Secure Recovery
                                    </p>
                                    <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight" style={{ ...fontH, color: "#0F172A" }}>
                                        Reset your password
                                    </h2>
                                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#64748B" }}>
                                        Don't worry, we'll help you get back into your account.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={isLogin ? "login" : "signup"}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="text-sm mb-1.5 font-medium" style={{ color: "#64748B" }}>
                                        {isLogin ? "Good to see you again 👋" : "Let's get you started ✨"}
                                    </p>
                                    <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight" style={{ ...fontH, color: "#0F172A" }}>
                                        {isLogin ? "Welcome back" : "Create your account"}
                                    </h2 >
                                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#64748B" }}>
                                        {isLogin ? "Sign in to continue your campus journey." : "Join hundreds of students on CU Bazzar."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── FLOW CONTROL ── */}
                    <AnimatePresence mode="wait">
                        {forgotPassword ? (
                            <motion.div key="forgot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                                {resetSent ? (
                                    <div className="py-6 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(77,184,172,0.12)', border: '1px solid rgba(77,184,172,0.2)' }}>
                                            <Mail className="w-5 h-5" style={{ color: '#4DB8AC' }} />
                                        </div>
                                        <p className="font-semibold" style={{ color: '#0F172A' }}>Check your inbox!</p>
                                        <p className="text-sm" style={{ color: '#64748B' }}>We sent a password reset link to <strong style={{ color: '#0F172A' }}>{email}</strong>.</p>
                                        <button type="button" onClick={() => { setForgotPassword(false); setResetSent(false); }} className="text-sm font-semibold mt-2" style={{ color: '#231942' }}>← Back to login</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div>
                                            <p className="text-sm mb-1" style={{ color: '#64748B' }}>Enter your email address and we'll send a reset link.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1.5 font-medium" style={{ color: '#64748B' }}>Email Address</label>
                                            <div className="relative rounded-xl transition-all duration-300" style={{ boxShadow: focusedField === 'reset-email' ? '0 0 0 2px rgba(35,25,66,0.35)' : '0 0 0 1px rgba(15,23,42,0.1)' }}>
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4" style={{ color: focusedField === 'reset-email' ? '#231942' : 'rgba(15,23,42,0.3)' }} />
                                                </div>
                                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedField('reset-email')} onBlur={() => setFocusedField(null)}
                                                    className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                    style={{ backgroundColor: 'rgba(15,23,42,0.03)', color: '#0F172A' }}
                                                    placeholder="you@example.com" />
                                            </div>
                                        </div>
                                        <motion.button type="submit" disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                                            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 h-[52px] disabled:opacity-50"
                                            style={{ ...fontH, background: '#231942', boxShadow: '0 4px 20px rgba(35,25,66,0.25)' }}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
                                        </motion.button>
                                        <button type="button" onClick={() => setForgotPassword(false)} className="w-full text-sm" style={{ color: '#64748B' }}>← Back to login</button>
                                    </form>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="main" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                                
                                {/* ── Google OAuth Button ── */}
                                <motion.button
                                    type="button"
                                    onClick={signInWithGoogle}
                                    whileHover={{ y: -1, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}
                                    whileTap={{ scale: 0.985 }}
                                    className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl border border-slate-200 bg-white transition-all duration-300 mb-6 hover:border-slate-300"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    <span className="text-sm font-semibold text-slate-700" style={fontH}>
                                        Continue with Google
                                    </span>
                                </motion.button>

                                {/* ── Separator ── */}
                                <div className="relative flex items-center justify-center mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
                                        or use email
                                    </span>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm mb-1.5 font-medium" style={{ color: "#64748B" }}>Email Address</label>
                                        <div className="relative rounded-xl transition-all duration-300" style={{
                                            boxShadow: focusedField === "email"
                                                ? "0 0 0 2px rgba(35,25,66,0.35), 0 0 16px rgba(35,25,66,0.08)"
                                                : "0 0 0 1px rgba(15,23,42,0.1)"
                                        }}>
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "email" ? "#231942" : "rgba(15,23,42,0.3)" }} />
                                            </div>
                                            <input
                                                type="email" required value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedField("email")}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                style={{ backgroundColor: "rgba(15,23,42,0.03)", color: "#0F172A" }}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm mb-1.5 font-medium" style={{ color: "#64748B" }}>Password</label>
                                        <div className="relative rounded-xl transition-all duration-300" style={{
                                            boxShadow: focusedField === "password"
                                                ? "0 0 0 2px rgba(35,25,66,0.35), 0 0 16px rgba(35,25,66,0.08)"
                                                : "0 0 0 1px rgba(15,23,42,0.1)"
                                        }}>
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 transition-colors duration-200" style={{ color: focusedField === "password" ? "#231942" : "rgba(15,23,42,0.3)" }} />
                                            </div>
                                            <input
                                                type="password" required value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocusedField("password")}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full rounded-xl pl-10 pr-4 h-[52px] text-sm focus:outline-none transition-colors"
                                                style={{ backgroundColor: "rgba(15,23,42,0.03)", color: "#0F172A" }}
                                                placeholder="something secret..."
                                                minLength={6}
                                            />
                                        </div>
                                        {!isLogin && <p className="text-[11px] mt-1 ml-0.5" style={{ color: "#64748B" }}>At least 6 characters — make it count!</p>}
                                    </div>

                                    {/* T&C Accept Checkbox — signup only */}
                                    {!isLogin && (
                                        <div className="flex items-start gap-3 px-1">
                                            <button
                                                type="button"
                                                onClick={() => setAcceptedTerms(!acceptedTerms)}
                                                className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all border"
                                                style={{
                                                    backgroundColor: acceptedTerms ? '#231942' : 'rgba(15,23,42,0.04)',
                                                    borderColor: acceptedTerms ? '#231942' : 'rgba(15,23,42,0.15)',
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
                                            <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                                                I have read and agree to the{" "}
                                                <Link to="/terms" target="_blank" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#231942" }}>
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
                                                style={{ color: '#64748B' }}
                                            >Forgot password?</button>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    <AnimatePresence mode="wait">
                                        {formError && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2.5 overflow-hidden shadow-sm shadow-red-500/5 mt-2"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                                                <p className="text-[13px] font-medium text-red-600 leading-tight">
                                                    {formError}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit */}
                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
                                        className="w-full relative group py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-[52px] mt-2"
                                        style={{ ...fontH, background: "#231942", boxShadow: "0 4px 20px rgba(35,25,66,0.25)" }}
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

                    {/* Toggle */}
                    {!forgotPassword && (
                        <p className="text-sm mt-6" style={{ color: "#64748B" }}>
                            {isLogin ? "New around here?" : "Already one of us?"}{" "}
                            <button type="button" onClick={() => { setIsLogin(!isLogin); setFormError(null); }}
                                className="font-semibold transition-colors duration-200 hover:opacity-80" style={{ color: "#231942" }}
                            >
                                {isLogin ? "Join the crew" : "Sign in instead"}
                            </button>
                        </p>
                    )}

                    <p className={`text-[11px] leading-relaxed ${forgotPassword ? 'mt-8' : 'mt-6'}`} style={{ color: "#94A3B8" }}>

                        By continuing, you agree to our{" "}
                        <Link to="/terms" className="underline underline-offset-2 hover:opacity-60 transition-opacity" style={{ color: "#231942" }}>Terms &amp; Conditions</Link>
                        {" "}and to be a good campus citizen. 🤝
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
