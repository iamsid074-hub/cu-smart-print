import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

const fontDisplay: React.CSSProperties = { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.03em" };
const fontBody: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

// ─── CSS keyframe orbs — zero JS per frame ────────────────────────────────────
const orbCSS = `
@keyframes loginOrbA {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.65; }
  50% { transform: translate3d(0,-20px,0) scale(1.07); opacity: 0.85; }
}
@keyframes loginOrbB {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.5; }
  50% { transform: translate3d(10px,-14px,0) scale(1.05); opacity: 0.72; }
}
@keyframes loginOrbC {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.4; }
  50% { transform: translate3d(-8px,-10px,0) scale(1.04); opacity: 0.6; }
}
@keyframes loginPulse {
  0% { box-shadow: 0 0 0 0px rgba(124,58,237,0.35); }
  100% { box-shadow: 0 0 0 26px rgba(124,58,237,0); }
}
`;

export default function Login() {
  const { signInWithGoogle, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setFormError(null); }, [email, password, acceptedTerms, isLogin]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { setFormError("Enter a valid email."); return; }
    setLoading(true);
    try {
      const { error }: any = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setResetSent(true);
      toast.success("Reset link sent!");
    } catch (err: any) {
      setFormError(err.message || "Failed. Try again.");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password.trim()) { setFormError("Please fill in all fields."); return; }
    if (password.length < 6) { setFormError("Password needs at least 6 characters."); return; }
    if (!isLogin && !acceptedTerms) { setFormError("Accept the Terms to create an account."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { error }: any = await signIn(email, password);
        if (error) { setFormError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message); setLoading(false); return; }
        toast.success("Welcome back! 🚀");
      } else {
        const { error }: any = await signUp(email, password);
        if (error) { setFormError(error.message); setLoading(false); return; }
        const parts = email.split("@");
        const usernameBase = parts[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 15);
        const fallbackUsername = `${usernameBase}${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          await supabase.from("profiles").upsert({ id: sessionData.session.user.id, username: fallbackUsername, full_name: parts[0] });
        }
        toast.success("Account created! ✨");
      }
      navigate("/home");
    } catch { setFormError("Something went wrong. Try again."); } finally { setLoading(false); }
  };

  const glassInput = (focused: boolean): React.CSSProperties => ({
    background: focused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: focused ? "1.5px solid rgba(124,58,237,0.5)" : "1.5px solid rgba(255,255,255,0.8)",
    boxShadow: focused ? "0 0 0 4px rgba(124,58,237,0.1), 0 8px 30px rgba(0,0,0,0.06)" : "0 4px 20px rgba(0,0,0,0.04)",
    borderRadius: "1rem",
    transition: "border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-transparent">
      <style>{orbCSS}</style>

      {/* CSS Ambient orbs — no JS animation overhead */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", width: 500, height: 500, top: "-10%", left: "-10%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(124,58,237,0.22), transparent 70%)", filter: "blur(65px)", animation: "loginOrbA 10s ease-in-out infinite", willChange: "transform, opacity" }} />
        <div style={{ position: "absolute", width: 400, height: 400, top: "60%", left: "55%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(255,107,53,0.18), transparent 70%)", filter: "blur(65px)", animation: "loginOrbB 12s ease-in-out infinite 2s", willChange: "transform, opacity" }} />
        <div style={{ position: "absolute", width: 350, height: 350, top: "80%", left: "-5%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(5,150,105,0.13), transparent 70%)", filter: "blur(65px)", animation: "loginOrbC 14s ease-in-out infinite 4s", willChange: "transform, opacity" }} />
      </div>

      {/* ─── Main Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
        style={{ willChange: "transform, opacity" }}
      >
        <div
          className="p-8 sm:p-10 rounded-[2.5rem]"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 30px 80px rgba(124,58,237,0.11), 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.webp" alt="CU Bazzar" className="w-10 h-10 rounded-xl object-cover shadow-md" />
            <div>
              <p className="text-sm font-black tracking-tight" style={{ ...fontDisplay, color: "#0F0A1E" }}>CU BAZZAR</p>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#7C3AED" }}>EOS v3</p>
            </div>
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={forgotPassword ? "forgot" : isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mb-7"
              style={{ willChange: "transform, opacity" }}
            >
              <h1 className="text-3xl font-black tracking-tight mb-1.5" style={{ ...fontDisplay, color: "#0F0A1E" }}>
                {forgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-sm" style={{ ...fontBody, color: "rgba(15,10,30,0.45)" }}>
                {forgotPassword ? "We'll send a secure link to your email." : isLogin ? "Sign in to continue your campus journey." : "Join hundreds of students on CU Bazzar."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google button */}
          {!forgotPassword && (
            <motion.button
              type="button"
              onClick={signInWithGoogle}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-2xl mb-5 font-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", color: "#0F0A1E", willChange: "transform" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Continue with Google
            </motion.button>
          )}

          {!forgotPassword && (
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid rgba(15,10,30,0.08)" }} /></div>
              <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.7)", color: "rgba(15,10,30,0.35)" }}>or</span>
            </div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {forgotPassword ? (
              <motion.div key="forgot-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ willChange: "transform, opacity" }}>
                {resetSent ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(5,150,105,0.1)" }}>
                      <Mail className="w-6 h-6" style={{ color: "#059669" }} />
                    </div>
                    <p className="font-bold text-lg" style={{ ...fontDisplay, color: "#0F0A1E" }}>Check your inbox!</p>
                    <p className="text-sm" style={{ color: "rgba(15,10,30,0.5)" }}>Reset link sent to <strong>{email}</strong></p>
                    <button onClick={() => { setForgotPassword(false); setResetSent(false); }} className="text-sm font-bold mt-4" style={{ color: "#7C3AED" }}>← Back to sign in</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative" style={glassInput(focusedField === "reset-email")}>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "reset-email" ? "#7C3AED" : "rgba(15,10,30,0.3)" }} />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("reset-email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" className="w-full pl-11 pr-4 h-[52px] text-[15px] bg-transparent focus:outline-none" style={{ color: "#0F0A1E" }} />
                    </div>
                    {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}
                    <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full h-[52px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "#0F0A1E", boxShadow: "0 4px 20px rgba(15,10,30,0.18), inset 0 1px 0 rgba(255,255,255,0.08)", willChange: "transform" }}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
                    </motion.button>
                    <button type="button" onClick={() => setForgotPassword(false)} className="w-full text-sm font-semibold" style={{ color: "rgba(15,10,30,0.4)" }}>← Back</button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form key="main-form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ willChange: "transform, opacity" }}>
                {/* Email */}
                <div className="relative" style={glassInput(focusedField === "email")}>
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "email" ? "#7C3AED" : "rgba(15,10,30,0.3)" }} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" className="w-full pl-11 pr-4 h-[52px] text-[15px] bg-transparent focus:outline-none" style={{ color: "#0F0A1E" }} />
                </div>

                {/* Password */}
                <div className="relative" style={glassInput(focusedField === "password")}>
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "password" ? "#7C3AED" : "rgba(15,10,30,0.3)" }} />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="something secret..." minLength={6} className="w-full pl-11 pr-12 h-[52px] text-[15px] bg-transparent focus:outline-none" style={{ color: "#0F0A1E" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "rgba(15,10,30,0.3)" }} /> : <Eye className="w-4 h-4" style={{ color: "rgba(15,10,30,0.3)" }} />}
                  </button>
                </div>

                {/* T&C */}
                {!isLogin && (
                  <div className="flex items-start gap-3 px-1">
                    <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ background: acceptedTerms ? "#7C3AED" : "rgba(255,255,255,0.8)", border: `1.5px solid ${acceptedTerms ? "#7C3AED" : "rgba(15,10,30,0.15)"}`, transition: "background 0.2s ease, border 0.2s ease" }}>
                      {acceptedTerms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(15,10,30,0.5)" }}>
                      I agree to the <Link to="/terms" target="_blank" className="underline font-semibold" style={{ color: "#7C3AED" }}>Terms & Conditions</Link> of CU Bazzar.
                    </p>
                  </div>
                )}

                {/* Forgot password */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setForgotPassword(true); setResetSent(false); }} className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.4)" }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-2.5 p-3 rounded-xl overflow-hidden" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                      <p className="text-[13px] font-medium text-red-600">{formError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-[52px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                  style={{ background: "#0F0A1E", boxShadow: "0 4px 24px rgba(15,10,30,0.18), inset 0 1px 0 rgba(255,255,255,0.08)", willChange: "transform" }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle */}
          {!forgotPassword && (
            <p className="text-sm mt-6 text-center" style={{ color: "rgba(15,10,30,0.4)" }}>
              {isLogin ? "New here? " : "Already a member? "}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setFormError(null); }} className="font-bold" style={{ color: "#7C3AED" }}>
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          )}
        </div>

        {/* Back to landing */}
        <div className="text-center mt-5">
          <Link to="/" className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.35)" }}>← Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
