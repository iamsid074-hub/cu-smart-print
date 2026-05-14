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
  ChevronLeft,
  Check,
  Star,
  Copy,
  PlusCircle,
  Plus,
  ArrowDownCircle,
  ArrowUpRight,
  Send,
  Bell,
  MoreHorizontal,
  Wifi,
  Shield,
  Activity,
  HelpCircle,
  Home,
  User,
  Scan
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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    if (amountNum < 1000) {
      alert("Minimum withdrawal limit is ₹1000. Please enter a higher amount.");
      return;
    }

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

      alert(`Withdrawal request submitted! You'll get your ₹${amountNum} in 24 hours.`);
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

  if (!isMobile) {
    return (
      <div className="relative min-h-screen pb-32 overflow-hidden bg-transparent text-white">
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
                winningsBalance={winningsBalance}
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
                      setSetupInput("");
                      setSetupFirstPass("");
                      setSetupStep("set");
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

  // ── Mobile Redesign View ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-32 font-sans relative">
      <div className="h-12" /> {/* Top safe area spacing */}

      {/* Lock Overlays for Mobile */}
      <AnimatePresence>
        {showSetPassModal && (
          <NumPad
            title={setupStep === "set" ? "Set Wallet Lock" : "Confirm Passcode"}
            subtitle={setupMismatch ? "❌ Passcodes didn't match. Try again." : (setupStep === "set" ? "Create a 4-digit passcode" : "Re-enter to confirm")}
            value={setupInput}
            onChange={setSetupInput}
            onSubmit={setupStep === "set" ? handleSetupNext : handleSetupConfirm}
            onClose={() => setShowSetPassModal(false)}
          />
        )}
        {(showUnlockModal && !isUnlocked) && (
          <NumPad
            title="Wallet Locked"
            subtitle="Enter your 4-digit passcode"
            value={unlockInput}
            onChange={setUnlockInput}
            onSubmit={handleUnlockSubmit}
            onClose={() => navigate(-1)}
          />
        )}
      </AnimatePresence>

      <div className="px-6 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight">
              Your <span className="text-[#D99C4B]">Wallet</span>
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">Manage your balance and rewards</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-transform">
               <Bell className="w-5 h-5 text-slate-600" />
               <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#D99C4B] rounded-full border-2 border-white" />
            </button>
            <Link to="/profile">
               <div className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm overflow-hidden p-0.5 active:scale-95 transition-transform">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || "bazzar"}&backgroundColor=f1f5f9`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
               </div>
            </Link>
          </div>
        </div>

        {/* The CU Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 relative w-full aspect-[1.58/1] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-[#111]"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1a1a1a] to-black" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(217,156,75,0.08)_0%,transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <h3 className="text-[14px] font-black tracking-widest text-white/90">CU CARD</h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#D99C4B]/20 border border-[#D99C4B]/30">
                    <span className="text-[9px] font-bold text-[#D99C4B] uppercase tracking-widest">Eclipsed Rewards</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-white/40 rotate-90" />
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <Shield className="w-4 h-4 text-[#D99C4B]" />
                  </div>
               </div>
            </div>

            <div className="mt-4">
               <div className="w-12 h-9 bg-gradient-to-br from-[#f1d2a4] to-[#c7a46d] rounded-md relative overflow-hidden shadow-inner flex items-center justify-center">
                  <div className="w-full h-0.5 bg-black/10 absolute top-1/4" />
                  <div className="w-full h-0.5 bg-black/10 absolute top-1/2" />
                  <div className="w-full h-0.5 bg-black/10 absolute top-3/4" />
                  <div className="h-full w-0.5 bg-black/10 absolute left-1/4" />
                  <div className="h-full w-0.5 bg-black/10 absolute left-1/2" />
                  <div className="h-full w-0.5 bg-black/10 absolute left-3/4" />
               </div>
               <div className="mt-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total Balance</span>
                    <Eye className="w-3.5 h-3.5 text-white/30" />
                  </div>
                  <span className="text-[32px] font-black tracking-tight leading-none">
                    ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[14px] font-medium text-white/40 mt-3 tracking-[0.2em]">•••• •••• •••• 8834</p>
               </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
               <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Cardholder</p>
                  <p className="text-[13px] font-black uppercase tracking-tight">{profileName || "Admin"}</p>
               </div>
               <div className="text-right space-y-0.5">
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Valid Thru</p>
                  <p className="text-[13px] font-black tracking-tight">12/30</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-white rounded-[24px] p-2 flex items-center justify-around shadow-sm border border-slate-100">
           <button onClick={() => setShowAddMoneyModal(true)} className="flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-[#fcf8f2] rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#D99C4B]" />
              </div>
              <div className="text-center">
                 <p className="text-[11px] font-bold text-slate-900 leading-tight">Add Money</p>
                 <p className="text-[8px] font-medium text-slate-400 mt-0.5">Instant Deposit</p>
              </div>
           </button>
           <button onClick={() => setShowWithdrawModal(true)} className="flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-[#fcf8f2] rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-[#D99C4B]" />
              </div>
              <div className="text-center">
                 <p className="text-[11px] font-bold text-slate-900 leading-tight">Withdraw</p>
                 <p className="text-[8px] font-medium text-slate-400 mt-0.5">Bank Payout</p>
              </div>
           </button>
           <button className="flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-[#fcf8f2] rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#D99C4B]" />
              </div>
              <div className="text-center">
                 <p className="text-[11px] font-bold text-slate-900 leading-tight">Card Details</p>
                 <p className="text-[8px] font-medium text-slate-400 mt-0.5">View & Manage</p>
              </div>
           </button>
           <button className="flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-[#fcf8f2] rounded-full flex items-center justify-center">
                <MoreHorizontal className="w-6 h-6 text-[#D99C4B]" />
              </div>
              <div className="text-center">
                 <p className="text-[11px] font-bold text-slate-900 leading-tight">More</p>
                 <p className="text-[8px] font-medium text-slate-400 mt-0.5">Options</p>
              </div>
           </button>
        </div>

        {/* Balance Overview */}
        <div className="mt-8 bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
           <h3 className="text-[16px] font-bold text-slate-900 mb-6">Balance Overview</h3>
           
           <div className="flex gap-8">
              <div className="flex-1 space-y-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deposit</p>
                 <p className="text-[18px] font-black text-slate-900">₹{walletBalance.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex-1 space-y-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Winnings</p>
                 <p className="text-[18px] font-black text-slate-900">₹{winningsBalance.toLocaleString('en-IN')}</p>
              </div>
           </div>

           <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#D99C4B] rounded-full" style={{ width: '65%' }} />
           </div>

           {/* Reward Box */}
           <div className="mt-8 bg-[#fdfaf5] border border-[#f5ead5] rounded-[20px] p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#fcf3e3] flex items-center justify-center shrink-0">
                 <Gift className="w-5 h-5 text-[#D99C4B]" />
              </div>
              <div className="flex-1">
                 <h4 className="text-[13px] font-bold text-[#D99C4B]">Unlock ₹15 Reward</h4>
                 <p className="text-[10px] text-[#D99C4B]/70 font-medium leading-tight mt-0.5">Complete 3 orders in a week to get ₹15 in your wallet.</p>
              </div>
              <div className="text-right">
                 <p className="text-[13px] font-black text-[#D99C4B]">{weeklyOrders}/3</p>
                 <p className="text-[9px] font-bold text-[#D99C4B]/60 uppercase tracking-tight">Completed</p>
              </div>
           </div>
        </div>

        {/* Action List */}
        <div className="mt-8 bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50 mb-10">
           <button onClick={() => setShowTxSheet(true)} className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-active:scale-90 transition-transform">
                 <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                 <p className="text-[14px] font-bold text-slate-900">Transactions</p>
                 <p className="text-[11px] text-slate-400 font-medium">View all your wallet transactions</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>
           <button onClick={() => navigate('/settings#security')} className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-active:scale-90 transition-transform">
                 <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                 <p className="text-[14px] font-bold text-slate-900">Forgot Lock</p>
                 <p className="text-[11px] text-slate-400 font-medium">Reset your wallet lock</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>
           <button onClick={() => navigate('/help')} className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-active:scale-90 transition-transform">
                 <HelpCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                 <p className="text-[14px] font-bold text-slate-900">Help & Support</p>
                 <p className="text-[11px] text-slate-400 font-medium">Need help with your wallet?</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>
        </div>
      </div>

      {/* Transactions Sheet for Mobile */}
      <AnimatePresence>
        {showTxSheet && (
          <TransactionsSheet transactions={transactions} onClose={() => setShowTxSheet(false)} />
        )}
      </AnimatePresence>

      {/* Modal overlays for Mobile (Reuse desktop modals but styled better) */}
      {/* ... Add Money Modal ... */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMoneyModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Add Money</h3>
                  <button onClick={() => setShowAddMoneyModal(false)} className="p-2 rounded-full bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 block">Enter Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">₹</span>
                      <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-10 pr-4 text-2xl font-bold text-slate-900 focus:outline-none focus:border-[#D99C4B]/50 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["100", "200", "500"].map((amt) => (
                      <button key={amt} onClick={() => setAddAmount(amt)} className="py-3 rounded-xl bg-slate-50 border border-slate-100 text-[13px] font-bold text-slate-600 active:bg-[#fcf8f2] active:text-[#D99C4B] transition-colors">+₹{amt}</button>
                    ))}
                  </div>
                  <button onClick={handlePay} disabled={isPaying || !addAmount || parseFloat(addAmount) <= 0} className="w-full py-5 rounded-2xl bg-[#D99C4B] text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[#D99C4B]/20 active:scale-95 transition-all">
                    {isPaying ? <RotateCcw className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Proceed to Pay</>}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ... Withdraw Modal ... */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdrawModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 rounded-full bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 block">Amount to Withdraw (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">₹</span>
                      <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-10 pr-4 text-2xl font-bold text-slate-900 focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 block">Your UPI ID</label>
                    <input type="text" value={withdrawUPI} onChange={(e) => setWithdrawUPI(e.target.value)} placeholder="username@bank" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <button onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || !withdrawUPI || parseFloat(withdrawAmount) <= 0} className="w-full py-5 rounded-2xl bg-orange-500 text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-500/20">
                    {isWithdrawing ? <RotateCcw className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Request Withdrawal</>}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Dock Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9] to-transparent pointer-events-none">
         <div className="w-full bg-white rounded-[32px] h-20 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-between px-4 pointer-events-auto">
            <button onClick={() => navigate('/home')} className="flex flex-col items-center justify-center flex-1 gap-1 active:scale-90 transition-transform">
               <Home className="w-6 h-6 text-slate-400" />
               <span className="text-[10px] font-bold text-slate-400">Home</span>
            </button>
            <button onClick={() => navigate('/cart')} className="flex flex-col items-center justify-center flex-1 gap-1 active:scale-90 transition-transform">
               <ShoppingBag className="w-6 h-6 text-slate-400" />
               <span className="text-[10px] font-bold text-slate-400">Orders</span>
            </button>
            
            <div className="flex-1 flex justify-center -mt-10">
               <button className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                  <Scan className="w-8 h-8 text-white" strokeWidth={2.5} />
               </button>
            </div>

            <button onClick={() => navigate('/wallet')} className="flex flex-col items-center justify-center flex-1 gap-1 active:scale-90 transition-transform">
               <CreditCard className="w-6 h-6 text-[#D99C4B]" />
               <span className="text-[10px] font-bold text-[#D99C4B]">Wallet</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center flex-1 gap-1 active:scale-90 transition-transform">
               <User className="w-6 h-6 text-slate-400" />
               <span className="text-[10px] font-bold text-slate-400">Profile</span>
            </button>
         </div>
      </div>
    </div>
  );
}
