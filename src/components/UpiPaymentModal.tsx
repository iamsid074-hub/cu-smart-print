import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Smartphone, Monitor, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface UpiPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    orderIdText: string;
    onPaymentVerify: (utrNumber: string) => Promise<void>;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const ua = navigator.userAgent || "";
        setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua));
    }, []);
    return isMobile;
}

type Step = "qr" | "placing" | "success";

export default function UpiPaymentModal({ isOpen, onClose, amount, orderIdText, onPaymentVerify }: UpiPaymentModalProps) {
    const [step, setStep] = useState<Step>("qr");
    const [userLeftForUpi, setUserLeftForUpi] = useState(false);
    const hasAutoSubmittedRef = useRef(false);
    const isMobile = useIsMobile();

    const upiId = import.meta.env.VITE_MERCHANT_UPI_ID || "9466166750@fam";
    const merchantName = "CUBazzar";
    const formattedAmount = Number(amount).toFixed(2);

    const [sessionUri, setSessionUri] = useState("");
    const [sessionTrRef, setSessionTrRef] = useState("");

    useEffect(() => {
        if (isOpen) {
            const tr = `${Date.now()}`;
            const uri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`CUBazzar ${orderIdText}`)}&tr=${tr}`;
            setSessionTrRef(tr);
            setSessionUri(uri);
            setStep("qr");
            setUserLeftForUpi(false);
            hasAutoSubmittedRef.current = false;
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const placeOrder = useCallback(async () => {
        if (step !== "qr") return;
        setStep("placing");
        try {
            await onPaymentVerify(sessionTrRef);
            setStep("success");
            toast.success("Order placed successfully! 🎉");
            setTimeout(() => onClose(), 1500);
        } catch (err: any) {
            toast.error(err?.message || "Order failed. Please try again.");
            setStep("qr");
        }
    }, [step, sessionTrRef, onPaymentVerify, onClose]);

    // Track when user taps "Open UPI App" and leaves browser
    const handleUpiAppClick = () => {
        setUserLeftForUpi(true);
    };

    // AUTO-DETECT: When user returns from UPI app → auto-place order
    useEffect(() => {
        if (!isOpen || !userLeftForUpi) return;

        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "visible" &&
                userLeftForUpi &&
                !hasAutoSubmittedRef.current &&
                step === "qr"
            ) {
                hasAutoSubmittedRef.current = true;
                setTimeout(() => placeOrder(), 800);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isOpen, userLeftForUpi, step, placeOrder]);

    return createPortal(
        <AnimatePresence>
            {isOpen && sessionUri && (
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
                        className="relative w-full max-w-sm mx-4 rounded-[24px] overflow-y-auto max-h-[90vh]"
                        style={{
                            background: '#0D0606',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {/* ───────── CLEAN QR SCREEN ───────── */}
                            {step === "qr" && (
                                <motion.div
                                    key="qr"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-white/8">
                                        <h3 className="font-bold text-lg text-white">Pay ₹{amount.toLocaleString()}</h3>
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Amount */}
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Scan & Pay</p>
                                            <p className="text-4xl font-black text-neon-fire">₹{amount.toLocaleString()}</p>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-white/5">
                                                <img src="/payment-qr.jpg" alt="UPI QR Code" className="w-[200px] h-[200px] object-contain rounded-lg" />
                                            </div>

                                            {!isMobile && (
                                                <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                                    <Monitor className="w-3.5 h-3.5 text-blue-400" />
                                                    <p className="text-[11px] text-blue-400 font-medium">Scan with GPay • PhonePe • Paytm</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* UPI App deep link — mobile only */}
                                        {isMobile && (
                                            <a
                                                href={sessionUri}
                                                onClick={handleUpiAppClick}
                                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all block"
                                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                            >
                                                <Smartphone className="w-5 h-5" />
                                                Open UPI App to Pay
                                            </a>
                                        )}

                                        {/* Auto-detect hint — shows only after user opened UPI app */}
                                        {isMobile && userLeftForUpi && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                                            >
                                                <Loader2 className="w-4 h-4 text-green-400 animate-spin flex-shrink-0" />
                                                <p className="text-[11px] text-green-400 font-medium">
                                                    Complete payment in UPI app — order will be placed automatically ✨
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ───────── PLACING ORDER ───────── */}
                            {step === "placing" && (
                                <motion.div
                                    key="placing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-16 px-6 space-y-4"
                                >
                                    <Loader2 className="w-14 h-14 text-green-400 animate-spin" />
                                    <p className="text-lg font-bold text-white">Placing your order...</p>
                                    <p className="text-xs text-muted-foreground">Please wait</p>
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
                                        <CheckCircle className="w-20 h-20 text-green-400" />
                                    </motion.div>
                                    <p className="text-xl font-black text-white">Order Placed! 🎉</p>
                                    <p className="text-sm text-green-400 font-medium">Redirecting to tracking...</p>
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
