import { useState, useEffect, useRef } from "react";
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

const COOLDOWN_SECONDS = 30;

export default function UpiPaymentModal({ isOpen, onClose, amount, orderIdText, onPaymentVerify }: UpiPaymentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(COOLDOWN_SECONDS);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMobile = useIsMobile();

    const upiId = import.meta.env.VITE_MERCHANT_UPI_ID || "9466166750@fam";
    const merchantName = "CUBazzar";
    const formattedAmount = Number(amount).toFixed(2);
    const trRef = `${Date.now()}`;
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`CUBazzar ${orderIdText}`)}&tr=${trRef}`;

    // Countdown timer — starts when modal opens, resets when closed
    useEffect(() => {
        if (isOpen) {
            setCountdown(COOLDOWN_SECONDS);
            setIsSubmitting(false);
            document.body.style.overflow = "hidden";
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            document.body.style.overflow = "";
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            document.body.style.overflow = "";
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen]);

    const isButtonLocked = countdown > 0;

    const handleConfirmPayment = async () => {
        if (isButtonLocked) return;
        setIsSubmitting(true);
        try {
            await onPaymentVerify(trRef);
            onClose();
        } catch (err: any) {
            toast.error(err?.message || "Order failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                        onClick={onClose}
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
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-white/8" style={{ background: '#0D0606' }}>
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h3 className="font-bold text-lg text-white">Pay via UPI</h3>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Amount */}
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Amount to Pay</p>
                                <p className="text-4xl font-black text-neon-fire">₹{amount.toLocaleString()}</p>
                            </div>

                            {/* Dynamic QR Code */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-white/5">
                                    <QRCode value={upiUri} size={180} level="H" />
                                </div>

                                {/* Desktop hint */}
                                {!isMobile && (
                                    <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                        <Monitor className="w-3.5 h-3.5 text-blue-400" />
                                        <p className="text-[11px] text-blue-400 font-medium">Scan this QR from your phone · Amount: ₹{amount}</p>
                                    </div>
                                )}
                            </div>

                            {/* Pay via UPI App Button */}
                            {isMobile ? (
                                <a
                                    href={upiUri}
                                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all block"
                                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                >
                                    <Smartphone className="w-5 h-5" />
                                    Pay ₹{amount} via UPI App
                                </a>
                            ) : (
                                <div className="text-center">
                                    <a
                                        href={upiUri}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 transition-all block opacity-80"
                                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                    >
                                        <Smartphone className="w-5 h-5" />
                                        Open UPI App
                                    </a>
                                    <p className="text-[10px] text-muted-foreground mt-2">Works best on mobile · GPay • PhonePe • Paytm</p>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-medium uppercase">After Payment</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            {/* Confirm Payment Button — locked for 30s */}
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting || isButtonLocked}
                                className="w-full py-4 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: isButtonLocked
                                        ? 'rgba(255,255,255,0.08)'
                                        : 'linear-gradient(135deg, #FF6B6B, #FF4444)',
                                    boxShadow: isButtonLocked
                                        ? 'none'
                                        : '0 4px 20px rgba(255,107,107,0.3)'
                                }}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isButtonLocked ? (
                                    <>Complete payment first · {countdown}s</>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        I've Completed Payment ✅
                                    </>
                                )}
                            </button>

                            {/* Fraud Warning */}
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-300/70 leading-relaxed">
                                    <strong className="text-red-400">Warning:</strong> Every payment is verified by admin. Fake confirmations without actual payment will result in <strong>permanent account ban</strong>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

