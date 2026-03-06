import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { createCashfreeOrder, verifyCashfreePayment, loadCashfreeSDK } from "@/lib/cashfree";

interface UpiPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    orderIdText: string;
    onPaymentVerify: (paymentId: string) => Promise<void>;
    customerPhone?: string;
    customerName?: string;
    customerId?: string;
    customerEmail?: string;
}

type Step = "loading" | "error" | "verifying" | "success";

export default function UpiPaymentModal({
    isOpen,
    onClose,
    amount,
    orderIdText,
    onPaymentVerify,
    customerPhone = "9999999999",
    customerName = "CUBazaar Customer",
    customerId = "guest",
    customerEmail,
}: UpiPaymentModalProps) {
    const [step, setStep] = useState<Step>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setStep("loading");
        setErrorMsg("");
        document.body.style.overflow = "hidden";

        (async () => {
            try {
                // 1. Load Cashfree SDK
                const cashfree = await loadCashfreeSDK();
                if (cancelled) return;

                // 2. Create order on backend
                const order = await createCashfreeOrder({
                    amount,
                    customer_id: customerId,
                    customer_phone: customerPhone,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    order_note: `CUBazaar ${orderIdText}`,
                });
                if (cancelled) return;

                // 3. Open Cashfree checkout
                const result = await cashfree.checkout({
                    paymentSessionId: order.payment_session_id,
                    redirectTarget: "_modal",
                });

                if (cancelled) return;

                // 4. Checkout closed/returned — verify payment
                if (result.error) {
                    // User closed the checkout or payment failed on Cashfree's side
                    if (result.error.message?.includes('closed') || result.error.message?.includes('cancelled')) {
                        onClose();
                        return;
                    }
                    setErrorMsg(result.error.message || "Payment failed");
                    setStep("error");
                    return;
                }

                // 5. Payment may have succeeded — verify with backend
                setStep("verifying");
                const verification = await verifyCashfreePayment(order.order_id);

                if (verification.verified) {
                    // Payment confirmed! Place order in Supabase
                    await onPaymentVerify(order.order_id);
                    setStep("success");
                    toast.success("Payment successful! Order placed 🎉");
                    setTimeout(() => onClose(), 1500);
                } else {
                    setErrorMsg(`Payment status: ${verification.order_status}. Please try again.`);
                    setStep("error");
                }
            } catch (err: any) {
                if (cancelled) return;
                console.error("Cashfree error:", err);
                setErrorMsg(err?.message || "Something went wrong. Please try again.");
                setStep("error");
            }
        })();

        return () => {
            cancelled = true;
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleRetry = () => {
        // Close and re-trigger by toggling isOpen from parent
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ isolation: 'isolate' }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="relative w-full max-w-sm mx-4 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.1)]"
                    >
                        <AnimatePresence mode="wait">
                            {/* ───────── LOADING / OPENING CHECKOUT ───────── */}
                            {step === "loading" && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-16 px-6 space-y-4"
                                >
                                    <div className="relative">
                                        <Loader2 className="w-14 h-14 text-green-400 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-emerald-500/60" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">Opening Checkout...</p>
                                    <p className="text-xs text-slate-500 text-center">
                                        Preparing secure payment of ₹{amount.toLocaleString()}
                                    </p>
                                </motion.div>
                            )}

                            {/* ───────── VERIFYING ───────── */}
                            {step === "verifying" && (
                                <motion.div
                                    key="verifying"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-16 px-6 space-y-4"
                                >
                                    <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
                                    <p className="text-lg font-bold text-slate-900">Verifying Payment...</p>
                                    <p className="text-xs text-slate-500">Confirming with payment gateway</p>
                                </motion.div>
                            )}

                            {/* ───────── SUCCESS ───────── */}
                            {step === "success" && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="flex flex-col items-center justify-center py-16 px-6 space-y-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                                    >
                                        <CheckCircle className="w-20 h-20 text-emerald-500" />
                                    </motion.div>
                                    <p className="text-xl font-black text-slate-900">Payment Successful! 🎉</p>
                                    <p className="text-sm text-emerald-600 font-medium">Order placed — redirecting...</p>
                                </motion.div>
                            )}

                            {/* ───────── ERROR ───────── */}
                            {step === "error" && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-12 px-6 space-y-5"
                                >
                                    <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                                        <AlertCircle className="w-9 h-9 text-red-500" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-bold text-slate-900">Payment Failed</p>
                                        <p className="text-sm text-slate-500">{errorMsg}</p>
                                    </div>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3 rounded-xl text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRetry}
                                            className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm bg-violet-600 hover:bg-violet-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
