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

  // ─── Ambient Audio Logic ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio("/loginsound.mp3");
    audio.loop = true;
    audio.volume = 0;

    const fadeIn = () => {
      let vol = 0;
      const interval = setInterval(() => {
        if (vol < 0.45) {
          vol += 0.015;
          audio.volume = Math.min(vol, 1);
        } else {
          clearInterval(interval);
        }
      }, 150);
    };

    const startAudio = async () => {
      try {
        await audio.play();
        fadeIn();
      } catch {
        const handleFirstInteraction = () => {
          audio.play();
          fadeIn();
          window.removeEventListener("mousedown", handleFirstInteraction);
          window.removeEventListener("keydown", handleFirstInteraction);
        };
        window.addEventListener("mousedown", handleFirstInteraction);
        window.addEventListener("keydown", handleFirstInteraction);
      }
    };

    startAudio();

    return () => {
      // Fade out on unmount
      let vol = audio.volume;
      const fadeOutInterval = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          audio.volume = Math.max(vol, 0);
        } else {
          audio.pause();
          clearInterval(fadeOutInterval);
        }
      }, 50);
    };
  }, []);

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
    background: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: focused ? "1.5px solid rgba(124,58,237,0.6)" : "1.5px solid rgba(255,255,255,0.1)",
    boxShadow: focused ? "0 0 0 4px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
    borderRadius: "1rem",
    color: "#FFFFFF",
    transition: "border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  });

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex flex-col md:flex-row overflow-hidden">
      <style>{orbCSS}</style>

      {/* ─── LEFT PANE: LIVE VIDEO / PLANET (Hidden on mobile) ─── */}
      <div className="relative hidden md:flex md:w-[55%] lg:w-[60%] flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        
        {/* Background Media */}
        <div className="absolute inset-0 z-0 bg-[#05030A]">
          {/* Media removed as requested */}
          
          {/* Vignette & Gradients to blend into the form pane */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1E] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0A1E]/40 via-transparent to-[#0F0A1E] opacity-100" />
          <div className="absolute inset-0 bg-[#7C3AED]/5 mix-blend-color" />
        </div>

        {/* Top Left Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex items-center gap-3"
        >
          <img src="/logo.webp" alt="CU Bazzar" className="w-12 h-12 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.3)] object-cover" />
          <div>
            <p className="text-white font-black tracking-tighter text-xl leading-none" style={fontDisplay}>CU BAZZAR</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B4FE] mt-0.5">EOS v3</p>
          </div>
        </motion.div>
        
        {/* Bottom Left Hero Text */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 max-w-lg mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#D8B4FE]">Live OS Access</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.95]" style={fontDisplay}>
            Your campus.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#E9D5FF] via-[#C084FC] to-[#7C3AED]">
              Reimagined.
            </span>
          </h1>
          <p className="text-[#E9D5FF]/70 text-lg font-medium leading-relaxed" style={fontBody}>
            Step into EOS v3. The most immersive, fluid, and powerful student ecosystem ever built.
          </p>
        </motion.div>
      </div>

      {/* ─── RIGHT PANE: LOGIN FORM ─── */}
      <div className="relative w-full md:w-[45%] lg:w-[40%] flex items-center justify-center p-6 sm:p-12 bg-[#0F0A1E] z-10">
        
        {/* Ambient background orbs for the form pane */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: "absolute", width: 600, height: 600, top: "-10%", right: "-30%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(124,58,237,0.12), transparent 70%)", filter: "blur(60px)", animation: "loginOrbA 12s infinite" }} />
          <div style={{ position: "absolute", width: 400, height: 400, bottom: "-10%", left: "-20%", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(255,107,53,0.08), transparent 70%)", filter: "blur(60px)", animation: "loginOrbB 15s infinite" }} />
        </div>

        {/* Main Card container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px] z-10"
        >
          {/* Mobile-only Logo */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-10">
            <img src="/logo.webp" alt="CU Bazzar" className="w-12 h-12 rounded-xl object-cover shadow-[0_0_30px_rgba(124,58,237,0.3)]" />
            <div>
              <p className="text-white font-black tracking-tighter text-xl leading-none" style={fontDisplay}>CU BAZZAR</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B4FE] mt-0.5">EOS v3</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={forgotPassword ? "forgot" : isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight" style={fontDisplay}>
                {forgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[#E9D5FF]/60 text-[15px]" style={fontBody}>
                {forgotPassword ? "We'll send a secure link to your email." : isLogin ? "Sign in to access your Eclipsed OS." : "Join the next generation of CU Bazzar."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google button */}
          {!forgotPassword && (
            <motion.button
              type="button"
              onClick={signInWithGoogle}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-2xl mb-6 font-semibold text-sm text-white"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)", transition: "background 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Continue with Google
            </motion.button>
          )}

          {!forgotPassword && (
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} /></div>
              <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 bg-[#0F0A1E]">or email</span>
            </div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {forgotPassword ? (
              <motion.div key="forgot-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                {resetSent ? (
                  <div className="text-center py-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
                      <Mail className="w-6 h-6 text-[#C084FC]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white" style={fontDisplay}>Check your inbox</p>
                      <p className="text-sm text-white/60 mt-1">Link sent to <strong className="text-white">{email}</strong></p>
                    </div>
                    <button onClick={() => { setForgotPassword(false); setResetSent(false); }} className="text-sm font-bold mt-2 text-[#C084FC] hover:text-[#D8B4FE] transition-colors">
                      ← Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative" style={glassInput(focusedField === "reset-email")}>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "reset-email" ? "#C084FC" : "rgba(255,255,255,0.4)" }} />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("reset-email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" className="w-full pl-11 pr-4 h-[52px] text-[15px] bg-transparent focus:outline-none text-white placeholder-white/30" />
                    </div>
                    {formError && <p className="text-[13px] text-red-400 font-medium px-1">{formError}</p>}
                    <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full h-[52px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-60 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] shadow-[0_4px_20px_rgba(124,58,237,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)] transition-shadow">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
                    </motion.button>
                    <button type="button" onClick={() => setForgotPassword(false)} className="w-full text-sm font-semibold text-white/40 hover:text-white/80 transition-colors py-2">
                      ← Cancel
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form key="main-form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                
                {/* Email */}
                <div className="relative" style={glassInput(focusedField === "email")}>
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "email" ? "#C084FC" : "rgba(255,255,255,0.4)" }} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" className="w-full pl-11 pr-4 h-[52px] text-[15px] bg-transparent focus:outline-none text-white placeholder-white/30" />
                </div>

                {/* Password */}
                <div className="relative" style={glassInput(focusedField === "password")}>
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focusedField === "password" ? "#C084FC" : "rgba(255,255,255,0.4)" }} />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="password" minLength={6} className="w-full pl-11 pr-12 h-[52px] text-[15px] bg-transparent focus:outline-none text-white placeholder-white/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* T&C */}
                {!isLogin && (
                  <div className="flex items-start gap-3 px-1 mt-2">
                    <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ background: acceptedTerms ? "#7C3AED" : "rgba(255,255,255,0.05)", border: `1.5px solid ${acceptedTerms ? "#7C3AED" : "rgba(255,255,255,0.2)"}`, transition: "all 0.2s ease" }}>
                      {acceptedTerms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <p className="text-xs leading-relaxed text-white/50">
                      I agree to the <Link to="/terms" target="_blank" className="font-semibold text-[#D8B4FE] hover:text-white transition-colors">Terms & Conditions</Link>.
                    </p>
                  </div>
                )}

                {/* Forgot password */}
                {isLogin && (
                  <div className="flex justify-end px-1 mt-1">
                    <button type="button" onClick={() => { setForgotPassword(true); setResetSent(false); }} className="text-[13px] font-semibold text-[#C084FC] hover:text-[#E9D5FF] transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 16 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 animate-pulse" />
                        <p className="text-[13px] font-medium text-red-200">{formError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-[52px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-4 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] shadow-[0_4px_20px_rgba(124,58,237,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.5)] transition-shadow"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? "Enter Bazzar" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle */}
          {!forgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-[14px] text-white/50">
                {isLogin ? "New to the campus? " : "Already have access? "}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setFormError(null); }} className="font-bold text-white hover:text-[#E9D5FF] transition-colors">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          )}

          {/* Back to landing */}
          <div className="text-center mt-8">
            <Link to="/" className="text-[13px] font-semibold text-white/30 hover:text-white/60 transition-colors">
              ← Return to Surface
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
