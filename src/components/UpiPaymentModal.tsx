import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowLeft, Smartphone, Monitor, CheckCircle, ShieldAlert } from "lucide-react";
import QRCode from "react-qr-code";
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

type PaymentPhase = "waiting" | "verifying" | "success" | "error";

export default function UpiPaymentModal({ isOpen, onClose, amount, orderIdText, onPaymentVerify }: UpiPaymentModalProps) {
    const [phase, setPhase] = useState<PaymentPhase>("waiting");
    const [userLeftForUpi, setUserLeftForUpi] = useState(false);
    const isMobile = useIsMobile();
    const hasAutoSubmittedRef = useRef(false);

    const upiId = import.meta.env.VITE_MERCHANT_UPI_ID || "9466166750@fam";
    const merchantName = "CUBazzar";
    const formattedAmount = Number(amount).toFixed(2);

    // Generate UPI URI ONCE when modal opens — keeps QR code stable
    const [sessionUri, setSessionUri] = useState("");
    const [sessionTrRef, setSessionTrRef] = useState("");

    useEffect(() => {
        if (isOpen) {
            const tr = `${Date.now()}`;
            const uri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`CUBazzar ${orderIdText}`)}&tr=${tr}`;
            setSessionTrRef(tr);
            setSessionUri(uri);
            setPhase("waiting");
            setUserLeftForUpi(false);
            hasAutoSubmittedRef.current = false;
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Submit order — used by both auto-detect and manual fallback
    const submitOrder = useCallback(async () => {
        if (phase === "verifying" || phase === "success") return;
        setPhase("verifying");
        try {
            await onPaymentVerify(sessionTrRef);
            setPhase("success");
            toast.success("Payment received! Order placed 🎉");
            // Auto-close after brief success animation
            setTimeout(() => onClose(), 1800);
        } catch (err: any) {
            setPhase("error");
            toast.error(err?.message || "Order failed. Please try again.");
            // Reset back to waiting after error so user can retry
            setTimeout(() => setPhase("waiting"), 2000);
        }
    }, [phase, sessionTrRef, onPaymentVerify, onClose]);

    // Track when user taps "Pay via UPI App" and leaves the browser
    const handleUpiAppClick = () => {
        setUserLeftForUpi(true);
    };

    // AUTO-DETECT: Page Visibility API — when user returns from UPI app, auto-place order
    useEffect(() => {
        if (!isOpen || !userLeftForUpi) return;

        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "visible" &&
                userLeftForUpi &&
                !hasAutoSubmittedRef.current &&
                phase === "waiting"
            ) {
                hasAutoSubmittedRef.current = true;
                // Small delay to let the browser settle after returning
                setTimeout(() => submitOrder(), 800);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isOpen, userLeftForUpi, phase, submitOrder]);

    // Render content based on phase
    const renderPhaseContent = () => {
        if (phase === "verifying") {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-green-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-green-400/20"></div>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-white">Verifying payment...</p>
                    <p className="text-xs text-muted-foreground">Placing your order automatically</p>
                </motion.div>
            );
        }

        if (phase === "success") {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                    >
                        <CheckCircle className="w-20 h-20 text-green-400" />
                    </motion.div>
                    <p className="text-xl font-black text-white">Payment Received! 🎉</p>
                    <p className="text-sm text-green-400 font-medium">Order placed successfully</p>
                </motion.div>
            );
        }

        // Default: "waiting" phase — show QR + pay button
        return (
            <>
                {/* Amount */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Amount to Pay</p>
                    <p className="text-4xl font-black text-neon-fire">₹{amount.toLocaleString()}</p>
                </div>

                {/* Static QR Code — generated once per session */}
                <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-white/5">
                        <QRCode value={sessionUri} size={180} level="H" />
                    </div>

                    {/* Desktop hint */}
                    {!isMobile && (
                        <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                            <p className="text-[11px] text-blue-400 font-medium">Scan this QR from your phone · Amount: ₹{amount}</p>
                        </div>
                    )}
                </div>

                {/* Pay via UPI App Button — on tap, we track that user left */}
                {isMobile ? (
                    <a
                        href={sessionUri}
                        onClick={handleUpiAppClick}
                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all block"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                    >
                        <Smartphone className="w-5 h-5" />
                        Pay ₹{amount} via UPI App
                    </a>
                ) : (
                    <div className="text-center">
                        <a
                            href={sessionUri}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 transition-all block opacity-80"
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                        >
                            <Smartphone className="w-5 h-5" />
                            Open UPI App
                        </a>
                        <p className="text-[10px] text-muted-foreground mt-2">Works best on mobile · GPay • PhonePe • Paytm</p>
                    </div>
                )}

                {/* Auto-detect hint for mobile */}
                {isMobile && userLeftForUpi && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                    >
                        <Loader2 className="w-4 h-4 text-green-400 animate-spin flex-shrink-0" />
                        <p className="text-[11px] text-green-400 font-medium">
                            Waiting for you to return after payment... Order will be placed automatically ✨
                        </p>
                    </motion.div>
                )}

                {/* Divider + Fallback for QR/desktop users */}
                {!isMobile && (
                    <>
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-medium uppercase">Paid via QR?</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                        <button
                            onClick={submitOrder}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4444)', boxShadow: '0 4px 20px rgba(255,107,107,0.3)' }}
                        >
                            <CheckCircle className="w-4 h-4" />
                            I've Paid — Place My Order
                        </button>
                    </>
                )}

                {/* Fraud Warning */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-300/70 leading-relaxed">
                        <strong className="text-red-400">Warning:</strong> Every payment is verified by admin. Fake orders without payment will result in <strong>permanent account ban</strong>.
                    </p>
                </div>
            </>
        );
    };

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
                        onClick={phase === "waiting" ? onClose : undefined}
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
                        {/* Header — only show close in waiting phase */}
                        <div className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-white/8" style={{ background: '#0D0606' }}>
                            <div className="flex items-center gap-3">
                                {phase === "waiting" && (
                                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <h3 className="font-bold text-lg text-white">
                                    {phase === "waiting" ? "Pay via UPI" : phase === "verifying" ? "Processing..." : "Done!"}
                                </h3>
                            </div>
                            {phase === "waiting" && (
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-5">
                            {renderPhaseContent()}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

