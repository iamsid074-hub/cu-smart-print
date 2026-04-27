import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  RotateCcw,
  Award,
  ShoppingBag,
  Clock,
  Eye,
  EyeOff,
  Lock,
  List,
  X,
  Delete,
  CreditCard,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { VirtualCard } from "@/components/VirtualCard";
import { VirtualCardUnboxing } from "@/components/VirtualCardUnboxing";

// Wallet section lock — SEPARATE from card payment passcode (cu_card_passcode)
const WALLET_LOCK_KEY = "wallet_section_passcode";

// ── Numpad Component ────────────────────────────────────────────────────────
function NumPad({
  value,
  onChange,
  onSubmit,
  onClose,
  title,
  subtitle,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
  subtitle?: string;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  const tap = (k: string) => {
    if (k === "⌫") { onChange(value.slice(0, -1)); return; }
    if (k === "") return;
    if (value.length >= 4) return;
    onChange(value + k);
  };

  useEffect(() => {
    if (value.length === 4) {
      const t = setTimeout(() => onSubmit(), 200);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-xs bg-[#1c1c1e] rounded-[2rem] p-6 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-black text-white text-lg">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4 justify-center mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: value.length > i ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                value.length > i
                  ? "bg-[#d4af37] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                  : "bg-transparent border-white/30"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map((k, i) => (
            <button
              key={i}
              onClick={() => tap(k)}
              disabled={k === ""}
              className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-90 ${
                k === ""
                  ? "opacity-0 pointer-events-none"
                  : k === "⌫"
                  ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  : "bg-white/10 border border-white/10 text-white hover:bg-white/20 shadow-sm"
              }`}
            >
              {k === "⌫" ? <Delete className="w-5 h-5 mx-auto" /> : k}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Transactions Bottom Sheet ───────────────────────────────────────────────
function TransactionsSheet({
  transactions,
  onClose,
}: {
  transactions: any[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-auto bg-[#111] rounded-t-[2rem] border-t border-white/10 shadow-2xl overflow-hidden"
        style={{ maxHeight: "80vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <p className="font-black text-white text-base">Card Transactions</p>
              <p className="text-[11px] text-gray-500">CU Card activity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 110px)" }}>
          {transactions.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center opacity-60">
              <Clock className="w-10 h-10 text-gray-500 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx: any) => {
                const isCredit = tx.amount > 0;
                const date = new Date(tx.created_at);
                const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                      isCredit
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-white/5 border border-white/10"
                    }`}>
                      {isCredit
                        ? <Award className="w-5 h-5 text-green-400" />
                        : <ShoppingBag className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{tx.description}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{dateStr} · {timeStr}</p>
                    </div>
                    <span className={`font-black text-base flex-shrink-0 ${isCredit ? "text-green-400" : "text-white"}`}>
                      {isCredit ? "+" : ""}₹{Math.abs(tx.amount)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Wallet Page ────────────────────────────────────────────────────────
export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isUnboxed, setIsUnboxed] = useState(() =>
    localStorage.getItem("bazzar_card_unboxed") === "true"
  );
  const [profileName, setProfileName] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // ── Wallet section passcode (different from card payment passcode) ──
  const [passcode, setPasscode] = useState<string | null>(() =>
    localStorage.getItem(WALLET_LOCK_KEY)
  );
  const [balanceVisible, setBalanceVisible] = useState<boolean>(false);
  const balanceLocked = !!passcode;

  // ── Setup flow state ──
  const [setupStep, setSetupStep] = useState<"set" | "confirm">("set");
  const [setupFirstPass, setSetupFirstPass] = useState("");
  const [setupInput, setSetupInput] = useState("");
  const [setupMismatch, setSetupMismatch] = useState(false);

  // ── Unlock flow state ──
  const [unlockInput, setUnlockInput] = useState("");

  // ── Modal flags ──
  const [showSetPassModal, setShowSetPassModal] = useState(!passcode);
  const [showUnlockModal, setShowUnlockModal] = useState(!!passcode && !isUnlocked);
  const [showTxSheet, setShowTxSheet] = useState(false);

  // Legacy - kept for Forgot Lock button
  const [passInput, setPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [setPassStep, setSetPassStep] = useState<"set" | "confirm">("set");

  useEffect(() => { if (user) fetchWalletData(); }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance, full_name")
      .eq("id", user.id)
      .single();
    if (profile) {
      setWalletBalance(profile.wallet_balance || 0);
      setProfileName(profile.full_name || user?.user_metadata?.full_name || "CU USER");
    }

    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      istTime.setUTCHours(0, 0, 0, 0);
      const dayOfWeek = istTime.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      istTime.setUTCDate(istTime.getUTCDate() + diffToMonday);
      const startOfWeek = new Date(istTime.getTime() - istOffset).toISOString();
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", user.id)
        .eq("status", "completed")
        .gte("created_at", startOfWeek);
      setWeeklyOrders(count || 0);
    } catch {}

    const { data: txList } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (txList) setTransactions(txList);
  };

  // ── Setup passcode: step 1 (enter) then step 2 (confirm) ──
  const handleSetupNext = () => {
    // Step 1: save first entry, move to confirm
    setSetupFirstPass(setupInput);
    setSetupInput("");
    setSetupStep("confirm");
    setSetupMismatch(false);
  };

  const handleSetupConfirm = () => {
    if (setupInput === setupFirstPass) {
      // Match — save and unlock
      localStorage.setItem(WALLET_LOCK_KEY, setupInput);
      setPasscode(setupInput);
      window.dispatchEvent(new Event("wallet_lock_setup"));
      setTimeout(() => {
        setBalanceVisible(true);
        setIsUnlocked(true);
        setShowSetPassModal(false);
        setSetupInput("");
        setSetupFirstPass("");
        setSetupStep("set");
      }, 400);
    } else {
      // Mismatch — restart from step 1
      setSetupMismatch(true);
      setSetupInput("");
      setSetupFirstPass("");
      setSetupStep("set");
      setTimeout(() => setSetupMismatch(false), 1500);
    }
  };

  // ── Unlock wallet ──
  const handleUnlockSubmit = () => {
    if (unlockInput === passcode) {
      window.dispatchEvent(new Event("wallet_unlock_success"));
      setTimeout(() => {
        setBalanceVisible(true);
        setIsUnlocked(true);
        setShowUnlockModal(false);
        setUnlockInput("");
      }, 400);
    } else {
      setUnlockInput("");
      window.dispatchEvent(new Event("cu_card_wrong_pass"));
    }
  };

  // Legacy handlers (used by Forgot Lock button in action rows)
  const handleSetPassSubmit = () => {
    if (setPassStep === "set") {
      setConfirmPassInput("");
      setSetPassStep("confirm");
    } else {
      if (passInput === confirmPassInput) {
        localStorage.setItem(WALLET_LOCK_KEY, passInput);
        setPasscode(passInput);
        window.dispatchEvent(new Event("wallet_lock_setup"));
        setTimeout(() => {
          setBalanceVisible(true);
          setIsUnlocked(true);
          setShowSetPassModal(false);
          setPassInput("");
          setConfirmPassInput("");
          setSetPassStep("set");
        }, 400);
      } else {
        setPassInput("");
        setConfirmPassInput("");
        setSetPassStep("set");
      }
    }
  };

  const handleForgotLockSubmit = () => handleSetPassSubmit();

  // ── Eye button ──
  const handleEyeClick = () => {
    if (balanceVisible) {
      setBalanceVisible(false);
    } else {
      setBalanceVisible(true);
    }
  };

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden bg-[#000] text-white">
      {/* ── Lock Overlays ── */}
      <AnimatePresence>
        {/* SETUP: First time - Enter then Confirm passcode */}
        {showSetPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-xs bg-[#1c1c1e] rounded-[2rem] p-6 border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-[18px] bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-[#d4af37]" />
                </div>
                <p className="font-black text-white text-xl">
                  {setupStep === "set" ? "Set Wallet Lock" : "Confirm Passcode"}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  {setupMismatch
                    ? "❌ Passcodes didn't match. Try again."
                    : setupStep === "set"
                    ? "Create a 4-digit passcode for your wallet"
                    : "Re-enter your passcode to confirm"}
                </p>
              </div>

              {/* PIN dots */}
              <div className="flex gap-4 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: setupInput.length > i ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      setupInput.length > i
                        ? "bg-[#d4af37] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                        : setupMismatch
                        ? "border-red-500/50"
                        : "bg-transparent border-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (k === "⌫") { setSetupInput(prev => prev.slice(0, -1)); return; }
                      if (k === "" || setupInput.length >= 4) return;
                      const next = setupInput + k;
                      setSetupInput(next);
                      if (next.length === 4) {
                        setTimeout(() => {
                          if (setupStep === "set") {
                            // Move to confirm step using `next` directly
                            setSetupFirstPass(next);
                            setSetupInput("");
                            setSetupStep("confirm");
                            setSetupMismatch(false);
                          } else {
                            // Confirm step — compare `next` against `setupFirstPass` from state
                            // We can’t read setupFirstPass here reliably so we pass it via ref approach
                            setSetupInput("");
                            // Use a functional check
                            setSetupFirstPass(prev => {
                              if (next === prev) {
                                // Match!
                                localStorage.setItem(WALLET_LOCK_KEY, next);
                                setPasscode(next);
                                setTimeout(() => {
                                  setBalanceVisible(true);
                                  setIsUnlocked(true);
                                  setShowSetPassModal(false);
                                  setSetupFirstPass("");
                                  setSetupStep("set");
                                }, 200);
                                setTimeout(() => {
                                  window.dispatchEvent(new Event("wallet_lock_setup"));
                                }, 1000);
                              } else {
                                // Mismatch
                                setSetupMismatch(true);
                                setSetupFirstPass("");
                                setSetupStep("set");
                                setTimeout(() => setSetupMismatch(false), 1500);
                              }
                              return "";
                            });
                          }
                        }, 200);
                      }
                    }}
                    disabled={k === ""}
                    className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-90 ${
                      k === "" ? "opacity-0 pointer-events-none"
                      : k === "⌫" ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      : "bg-white/10 border border-white/10 text-white hover:bg-white/20 shadow-sm"
                    }`}
                  >
                    {k === "⌫" ? <Delete className="w-5 h-5 mx-auto" /> : k}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* UNLOCK: passcode already set - enter once to unlock */}
        {(showUnlockModal && !isUnlocked) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-xs bg-[#1c1c1e] rounded-[2rem] p-6 border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-black text-white text-lg">Wallet Locked</p>
                  <p className="text-xs text-gray-500 mt-0.5">Enter your 4-digit passcode to unlock</p>
                </div>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PIN dots */}
              <div className="flex gap-4 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: unlockInput.length > i ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      unlockInput.length > i
                        ? "bg-[#d4af37] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                        : "bg-transparent border-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (k === "⌫") { setUnlockInput(prev => prev.slice(0, -1)); return; }
                      if (k === "" || unlockInput.length >= 4) return;
                      const next = unlockInput + k;
                      setUnlockInput(next);
                      if (next.length === 4) {
                        setTimeout(() => {
                          // Use `next` (local) and read passcode from localStorage directly
                          // to avoid stale closure bug
                          const savedPass = localStorage.getItem(WALLET_LOCK_KEY);
                          if (next === savedPass) {
                            setTimeout(() => {
                              setBalanceVisible(true);
                              setIsUnlocked(true);
                              setShowUnlockModal(false);
                              setUnlockInput("");
                            }, 200);
                            setTimeout(() => {
                              window.dispatchEvent(new Event("wallet_unlock_success"));
                            }, 1000);
                          } else {
                            setUnlockInput("");
                            window.dispatchEvent(new Event("cu_card_wrong_pass"));
                          }
                        }, 200);
                      }
                    }}
                    disabled={k === ""}
                    className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-90 ${
                      k === "" ? "opacity-0 pointer-events-none"
                      : k === "⌫" ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      : "bg-white/10 border border-white/10 text-white hover:bg-white/20 shadow-sm"
                    }`}
                  >
                    {k === "⌫" ? <Delete className="w-5 h-5 mx-auto" /> : k}
                  </button>
                ))}
              </div>

              {/* Forgot Pass */}
              <button
                onClick={() => navigate("/settings#security")}
                className="w-full mt-5 text-center text-[12px] text-gray-500 hover:text-[#d4af37] font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3 h-3" />
                Forgot Passcode?
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#007AFF]/10 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[20%] left-1/4 w-[500px] h-[500px] bg-[#FF9500]/5 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-black to-transparent opacity-80" />
      </div>

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] leading-tight font-black tracking-tighter text-white flex items-center gap-3">
            Your{" "}
            <span className="text-gray-500 font-medium font-serif italic lowercase tracking-tight">
              Wallet
            </span>
            <motion.button
              whileTap={{ rotate: 180 }}
              onClick={fetchWalletData}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </h1>
          <Link to="/profile">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center overflow-hidden"
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || "bazzar"}&backgroundColor=f1f5f9`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Link>
        </div>

        {/* Card area */}
        {!isUnboxed ? (
          <div className="mb-12">
            <VirtualCardUnboxing
              name={profileName || "CU USER"}
              balance={walletBalance}
              onComplete={() => {
                setIsUnboxed(true);
                localStorage.setItem("bazzar_card_unboxed", "true");
              }}
            />
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center">
            {/* Card */}
            <div className="w-full max-w-[450px] mb-4">
              <VirtualCard
                name={profileName || "CU USER"}
                balance={walletBalance}
                balanceHidden={!balanceVisible}
                onEyeClick={handleEyeClick}
              />
            </div>

            {/* ── Action Rows (iOS Style) ── */}
            <div className="w-full max-w-[450px] bg-[#1c1c1e] rounded-3xl overflow-hidden mt-2 border border-white/5 shadow-xl">
              <button
                onClick={() => setShowTxSheet(true)}
                className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors active:bg-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                  <List className="w-4 h-4 text-[#d4af37]" />
                </div>
                <span className="font-bold text-[15px] text-gray-300 flex-1 text-left">Transactions</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
              
              <button
                onClick={() => {
                  if (balanceLocked) {
                    navigate('/settings#security');
                  } else {
                    setPassInput("");
                    setConfirmPassInput("");
                    setSetPassStep("set");
                    setShowSetPassModal(true);
                  }
                }}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors active:bg-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                  <Lock className={`w-4 h-4 ${balanceLocked ? "text-[#d4af37]" : "text-gray-400"}`} />
                </div>
                <span className="font-bold text-[15px] text-gray-300 flex-1 text-left">
                  {balanceLocked ? "Forgot Lock" : "Set Lock"}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Weekly Reward */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="bg-[#1c1c1e] rounded-[2rem] p-6 shadow-2xl border border-white/5 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/40 to-transparent rounded-bl-full -z-0 pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-[16px] tracking-tight">Unlock ₹15 Reward</h3>
              <p className="text-[12px] font-medium text-gray-400">Complete 3 orders in a week to get ₹15 in your wallet.</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between text-[11px] font-black text-gray-500 mb-2 px-1">
              <span>0</span>
              {[1, 2].map((n) => (
                <span key={n} className={Math.min(weeklyOrders, 3) >= n ? "text-white" : ""}>{n}</span>
              ))}
              <span className={`px-2 rounded-full py-0.5 relative -top-0.5 transition-all ${Math.min(weeklyOrders, 3) === 3 ? "text-black bg-white scale-[1.15]" : "text-orange-400 bg-orange-500/10 border border-orange-500/30"}`}>
                ₹15!
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(weeklyOrders, 3) / 3) * 100}%` }}
                transition={{ duration: 1.2, type: "spring" }}
                className={`h-full rounded-full ${Math.min(weeklyOrders, 3) === 3 ? "bg-green-500" : "bg-white"}`}
              />
            </div>
            <p className="mt-4 text-center text-[13px] font-medium text-gray-400">
              You have completed <strong className="text-white font-black">{weeklyOrders}</strong> orders{" "}
              <span className="text-white font-black uppercase tracking-wider text-[10px]">this week</span>.
              {weeklyOrders < 3 && (
                <span className="block text-gray-500 text-[10px] mt-1 italic font-bold">Goal resets Monday at 12 AM IST</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Transactions sheet ── */}
      <AnimatePresence>
        {showTxSheet && (
          <TransactionsSheet transactions={transactions} onClose={() => setShowTxSheet(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}
