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
  Star,
  Copy,
  PlusCircle,
  Plus,
  ArrowDownCircle,
  Send
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { VirtualCard } from "@/components/VirtualCard";
import { VirtualCardUnboxing } from "@/components/VirtualCardUnboxing";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useSound } from "@/hooks/useSound";

const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    navigator.vibrate?.(10);
  }
};

// Wallet section lock — SEPARATE from card payment passcode (cu_card_passcode)
const getWalletLockKey = (uid: string) => `wallet_section_passcode_${uid}`;
const getBalanceLockKey = (uid: string) => `wallet_balance_reveal_passcode_${uid}`;
const getUnboxedKey = (uid: string) => `bazzar_card_unboxed_${uid}`;

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
  const { play } = useSound();

  // Use useCallback so tap fn is never re-created on every render
  const tap = React.useCallback((k: string) => {
    if (k === "⌫") { 
      play('tick');
      triggerHaptic(ImpactStyle.Heavy);
      onChange(""); 
      return; 
    }
    if (k === "") return;
    play('tick');
    triggerHaptic(ImpactStyle.Heavy);
    onChange((prev: string) => {
      if (prev.length >= 4) return prev;
      const next = prev + k;
      // Auto-submit immediately when 4th digit is entered (no delay)
      if (next.length === 4) {
        setTimeout(() => onSubmit(), 80);
      }
      return next;
    });
  }, [onChange, onSubmit, play]);

  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 z-[9999] bg-black/85 flex flex-col items-center justify-center px-6"
    >
      <div
        className="w-full max-w-[280px] bg-[#1c1c1e] rounded-[2rem] p-5 border border-white/10 shadow-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-black text-white text-lg">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onPointerDown={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN dots — pure CSS, no framer re-renders */}
        <div className="flex gap-4 justify-center mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid",
                transition: "background 0.1s, border-color 0.1s, transform 0.1s",
                transform: value.length > i ? "scale(1.2)" : "scale(1)",
                backgroundColor: value.length > i ? "#d4af37" : "transparent",
                borderColor: value.length > i ? "#d4af37" : "rgba(255,255,255,0.3)",
                boxShadow: value.length > i ? "0 0 10px rgba(212,175,55,0.6)" : "none",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {keys.map((k, i) => (
            <button
              key={i}
              onPointerDown={(e) => {
                e.preventDefault(); // prevent any default browser delay
                tap(k);
              }}
              disabled={k === ""}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={`h-12 rounded-2xl text-[18px] font-bold select-none ${
                k === ""
                  ? "opacity-0 pointer-events-none"
                  : k === "⌫"
                  ? "bg-white/5 border border-white/10 text-gray-400 active:bg-white/20 active:scale-90"
                  : "bg-white/10 border border-white/10 text-white active:bg-white/25 active:scale-90"
              }`}
            >
              {k === "⌫" ? <Delete className="w-5 h-5 mx-auto" /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
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
      className="fixed top-0 right-0 bottom-0 left-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-end"
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
  const { play } = useSound();
  const [walletBalance, setWalletBalance] = useState(0);
  const [winningsBalance, setWinningsBalance] = useState(0);
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isUnboxed, setIsUnboxed] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState<string | null>(null);
  
  // ── Setup/Unlock Modal flags ──
  const [showSetPassModal, setShowSetPassModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // ── Verify payment on return from Cashfree redirect ──
  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const urlStatus = params.get("status");
    const pendingOrderId = localStorage.getItem(`pending_order_${user.id}`);

    // Run verification if we have a pending order (either from redirect OR leftover from previous session)
    if (pendingOrderId) {
      // Clean the URL so the status param doesn't trigger again
      if (urlStatus) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setIsVerifying(true);

      supabase.functions.invoke("verify-payment", {
        body: { orderId: pendingOrderId, userId: user.id },
      }).then(({ data, error }) => {
        if (!error && data?.success) {
          // ✅ Only remove from localStorage AFTER successful verification
          localStorage.removeItem(`pending_order_${user.id}`);
          if (!data.alreadyProcessed) {
            alert(`✅ ₹${data.amount} added to your wallet!`);
          }
          // Wait a moment for DB writes to propagate, then refresh
          setTimeout(() => fetchWalletData(), 800);
        } else if (error) {
          console.error("Payment verification failed:", error);
          // Don't remove the pendingOrderId — let the user retry by refreshing
        } else if (data && !data.success) {
          // Payment not yet successful on Cashfree's side, try again in 3 seconds
          console.log("Payment not yet successful, retrying in 3s...");
          setTimeout(() => {
            supabase.functions.invoke("verify-payment", {
              body: { orderId: pendingOrderId, userId: user.id },
            }).then(({ data: retryData, error: retryError }) => {
              if (!retryError && retryData?.success) {
                localStorage.removeItem(`pending_order_${user.id}`);
                if (!retryData.alreadyProcessed) {
                  alert(`✅ ₹${retryData.amount} added to your wallet!`);
                }
                setTimeout(() => fetchWalletData(), 800);
              } else {
                // Still not verified — keep the orderId so next refresh retries
                console.warn("Payment still not verified after retry. Will retry on next page load.");
              }
            });
          }, 3000);
        }
        setIsVerifying(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const savedUnboxed = localStorage.getItem(getUnboxedKey(user.id)) === "true";
      const savedPass = localStorage.getItem(getWalletLockKey(user.id));

      setIsUnboxed(savedUnboxed);
      setPasscode(savedPass);
      setShowSetPassModal(!savedPass);
      setShowUnlockModal(!!savedPass && !isUnlocked);
      fetchWalletData();
    }
  }, [user]);

  const balanceLocked = !!passcode;

  // ── Setup flow state ──
  const [setupStep, setSetupStep] = useState<"set" | "confirm">("set");
  const [setupFirstPass, setSetupFirstPass] = useState("");
  const [setupInput, setSetupInput] = useState("");
  const [setupMismatch, setSetupMismatch] = useState(false);

  // ── Unlock flow state ──
  const [unlockInput, setUnlockInput] = useState("");

  // ── Modal flags ──
  const [showTxSheet, setShowTxSheet] = useState(false);



  // ── Cashfree Payment State ──
  const [cashfree, setCashfree] = useState<any>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Withdrawal State ──
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUPI, setWithdrawUPI] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const initCashfree = async () => {
      try {
        const cf = await load({ mode: "production" }); // Switched to production
        setCashfree(cf);
      } catch (err) {
        console.error("Failed to load Cashfree SDK:", err);
      }
    };
    initCashfree();
  }, []);

  const handlePay = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    if (!user) return;

    setIsPaying(true);
    try {
      // 1. Call our Edge Function to create order
      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: { 
          amount: addAmount, 
          userId: user.id,
          customerPhone: user.phone || "9999999999"
        },
      });

      if (error) throw error;

      // 2. Save orderId so we can verify on return
      if (data.order_id) {
        localStorage.setItem(`pending_order_${user.id}`, data.order_id);
      }

      // 3. Start Checkout
      if (cashfree && data.payment_session_id) {
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self",
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setIsPaying(false);
      setShowAddMoneyModal(false);
      setAddAmount("");
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) return;
    if (amountNum > winningsBalance) {
      alert("Only winning amount can be withdrawn!");
      return;
    }
    if (!withdrawUPI || !withdrawUPI.includes('@')) {
      alert("Please enter a valid UPI ID");
      return;
    }
    if (!user) return;

    setIsWithdrawing(true);
    try {
      const { error } = await supabase.rpc('request_payout', {
        payout_amount: amountNum,
        upi_id: withdrawUPI
      });

      if (error) throw error;

      alert("Withdrawal request submitted! It will be processed within 24 hours.");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawUPI("");
      fetchWalletData();
    } catch (err) {
      console.error("Withdrawal error:", err);
      alert("Failed to submit withdrawal request.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fetchWalletData = async () => {
    if (!user) return;

    const { data: profileList } = await supabase
      .from("profiles")
      .select("wallet_balance, winnings_balance, full_name")
      .eq("id", user.id);
      
    const profile = profileList?.[0];
    if (profile) {
      setWalletBalance(profile.wallet_balance || 0);
      setWinningsBalance(profile.winnings_balance || 0);
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
      localStorage.setItem(getWalletLockKey(user!.id), setupInput);
      setPasscode(setupInput);
      window.dispatchEvent(new Event("wallet_lock_setup"));
      setTimeout(() => {
        setIsUnlocked(true);
        setShowSetPassModal(false);
        setSetupInput("");
        setSetupFirstPass("");
        setSetupStep("set");
      }, 200);
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
        setIsUnlocked(true);
        setShowUnlockModal(false);
        setUnlockInput("");
      }, 200);
    } else {
      play('error');
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
        localStorage.setItem(getWalletLockKey(user!.id), passInput);
        setPasscode(passInput);
        window.dispatchEvent(new Event("wallet_lock_setup"));
        setTimeout(() => {
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
            className="fixed top-0 right-0 bottom-0 left-0 z-[9999] bg-black/95 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 100, rotate: 5, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, rotate: -2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="w-full max-w-[280px] bg-[#1c1c1e] rounded-[2rem] p-5 border border-white/10 shadow-2xl"
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

              {/* PIN dots — pure CSS */}
              <div className="flex gap-4 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 16, height: 16, borderRadius: "50%", border: "2px solid",
                      transition: "background 0.1s, border-color 0.1s, transform 0.1s",
                      transform: setupInput.length > i ? "scale(1.2)" : "scale(1)",
                      backgroundColor: setupInput.length > i ? "#d4af37" : "transparent",
                      borderColor: setupInput.length > i ? "#d4af37" : setupMismatch ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.3)",
                      boxShadow: setupInput.length > i ? "0 0 10px rgba(212,175,55,0.6)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                  <button
                    key={i}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (k === "⌫") { play('tick'); setSetupInput(prev => prev.slice(0, -1)); return; }
                      if (k === "" || setupInput.length >= 4) return;
                      play('tick');
                      const next = setupInput + k;
                      setSetupInput(next);
                      if (next.length === 4) {
                        if (setupStep === "set") {
                          setSetupFirstPass(next);
                          setSetupInput("");
                          setSetupStep("confirm");
                          setSetupMismatch(false);
                        } else {
                          setSetupInput("");
                          setSetupFirstPass(prev => {
                            if (next === prev) {
                              localStorage.setItem(getWalletLockKey(user!.id), next);
                              setPasscode(next);
                              setTimeout(() => {
                                setIsUnlocked(true);
                                setShowSetPassModal(false);
                                setSetupFirstPass("");
                                setSetupStep("set");
                              }, 200);
                              setTimeout(() => { window.dispatchEvent(new Event("wallet_lock_setup")); }, 1000);
                            } else {
                              play('error');
                              setSetupMismatch(true);
                              setSetupFirstPass("");
                              setSetupStep("set");
                              setTimeout(() => setSetupMismatch(false), 1500);
                            }
                            return "";
                          });
                        }
                      }
                    }}
                    disabled={k === ""}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={`h-12 rounded-2xl text-[18px] font-bold select-none ${
                      k === "" ? "opacity-0 pointer-events-none"
                      : k === "⌫" ? "bg-white/5 border border-white/10 text-gray-400 active:bg-white/20 active:scale-90"
                      : "bg-white/10 border border-white/10 text-white active:bg-white/25 active:scale-90"
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
            className="fixed top-0 right-0 bottom-0 left-0 z-[9999] bg-black/95 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 100, rotate: 5, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, rotate: -2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="w-full max-w-[280px] bg-[#1c1c1e] rounded-[2rem] p-5 border border-white/10 shadow-2xl"
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

              {/* PIN dots — pure CSS */}
              <div className="flex gap-4 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 16, height: 16, borderRadius: "50%", border: "2px solid",
                      transition: "background 0.1s, border-color 0.1s, transform 0.1s",
                      transform: unlockInput.length > i ? "scale(1.2)" : "scale(1)",
                      backgroundColor: unlockInput.length > i ? "#d4af37" : "transparent",
                      borderColor: unlockInput.length > i ? "#d4af37" : "rgba(255,255,255,0.3)",
                      boxShadow: unlockInput.length > i ? "0 0 10px rgba(212,175,55,0.6)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                  <button
                    key={i}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (k === "⌫") { play('tick'); setUnlockInput(prev => prev.slice(0, -1)); return; }
                      if (k === "" || unlockInput.length >= 4) return;
                      play('tick');
                      const next = unlockInput + k;
                      setUnlockInput(next);
                      if (next.length === 4) {
                        const savedPass = localStorage.getItem(getWalletLockKey(user!.id));
                        if (next === savedPass) {
                          setTimeout(() => {
                            setIsUnlocked(true);
                            setShowUnlockModal(false);
                            setUnlockInput("");
                          }, 200);
                          setTimeout(() => { window.dispatchEvent(new Event("wallet_unlock_success")); }, 1000);
                        } else {
                          play('error');
                          setUnlockInput("");
                          window.dispatchEvent(new Event("cu_card_wrong_pass"));
                        }
                      }
                    }}
                    disabled={k === ""}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={`h-12 rounded-2xl text-[18px] font-bold select-none ${
                      k === "" ? "opacity-0 pointer-events-none"
                      : k === "⌫" ? "bg-white/5 border border-white/10 text-gray-400 active:bg-white/20 active:scale-90"
                      : "bg-white/10 border border-white/10 text-white active:bg-white/25 active:scale-90"
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

      {/* Background ambience (optimized for 60fps mobile) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full translate-x-1/4 -translate-y-1/4" style={{ background: "radial-gradient(circle, rgba(0,122,255,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-[20%] left-0 w-[100vw] h-[100vw] max-w-[800px] max-h-[800px] rounded-full -translate-x-1/4" style={{ background: "radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%)" }} />
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

          <AnimatePresence>
            {isVerifying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 left-0 right-0 z-50 flex justify-center"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                  <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Verifying Payment...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                localStorage.setItem(getUnboxedKey(user!.id), "true");
              }}
            />
          </div>
        ) : (
          <motion.div 
            initial={{ x: 100, y: 150, rotate: 15, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.1 }}
            className="mb-8 flex flex-col items-center"
          >
            {/* Card */}
            <div className="w-full max-w-[450px] mb-4">
              <VirtualCard
                name={profileName || "CU USER"}
                balance={walletBalance}
                winningsBalance={winningsBalance}
              />
            </div>

            {/* ── Horizontal Primary Actions ── */}
            <div className="w-full max-w-[450px] grid grid-cols-2 gap-3 mt-2 mb-4">
              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="bg-[#1c1c1e] rounded-[24px] py-4 px-5 flex flex-col items-start border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg"
              >
                <div className="text-left w-full">
                  <span className="font-black text-[15px] text-white block mb-0.5">Add Money</span>
                  <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest block leading-tight">Instant Deposit</span>
                </div>
              </button>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-[#1c1c1e] rounded-[24px] py-4 px-5 flex flex-col items-start border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg"
              >
                <div className="text-left w-full">
                  <span className="font-black text-[15px] text-white block mb-0.5">Withdraw</span>
                  <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block leading-tight">Bank Payout</span>
                </div>
              </button>
            </div>

            {/* ── Secondary Action Rows (iOS Style) ── */}
            <div className="w-full max-w-[450px] bg-[#1c1c1e] rounded-[24px] overflow-hidden mb-6 border border-white/5 shadow-lg">
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
          </motion.div>
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

      {/* ── Add Money Modal ── */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMoneyModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#111] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white">Add Money</h3>
                  <button 
                    onClick={() => setShowAddMoneyModal(false)}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3 block">
                      Enter Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20">₹</span>
                      <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:border-green-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {["100", "200", "500"].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAddAmount(amt)}
                        className="py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black hover:bg-white/10 transition-colors"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={isPaying || !addAmount || parseFloat(addAmount) <= 0}
                    className="w-full py-5 rounded-2xl bg-green-500 text-black font-black text-[16px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isPaying ? (
                      <RotateCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Proceed to Pay
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Secured by Cashfree Payments
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Withdraw Modal ── */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#111] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white">Withdraw Funds</h3>
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3 block">
                      Amount to Withdraw (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20">₹</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-bold px-1">
                      Withdrawable (Winnings): <span className="text-white">₹{winningsBalance}</span>
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3 block">
                      Your UPI ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={withdrawUPI}
                        onChange={(e) => setWithdrawUPI(e.target.value)}
                        placeholder="username@bank"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount || !withdrawUPI || parseFloat(withdrawAmount) <= 0}
                    className="w-full py-5 rounded-2xl bg-orange-500 text-black font-black text-[16px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isWithdrawing ? (
                      <RotateCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Request Withdrawal
                      </>
                    )}
                  </button>

                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                    <p className="text-[9px] text-orange-400 font-bold leading-relaxed text-center">
                      Withdrawals are processed manually by the Admin team. You will receive a UPI payment within 24 hours of your request.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
