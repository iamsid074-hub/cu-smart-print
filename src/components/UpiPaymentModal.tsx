import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Smartphone, Monitor, CheckCircle, ShieldAlert } from "lucide-react";
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

type Step = "qr" | "placing" | "success";

export default function UpiPaymentModal({ isOpen, onClose, amount, orderIdText, onPaymentVerify }: UpiPaymentModalProps) {
    const [step, setStep] = useState<Step>("qr");
    const isMobile = useIsMobile();

    const upiId = import.meta.env.VITE_MERCHANT_UPI_ID || "9466166750@fam";
    const merchantName = "CUBazzar";
    const formattedAmount = Number(amount).toFixed(2);

    // Generate UPI URI ONCE when modal opens
    const [sessionUri, setSessionUri] = useState("");
    const [sessionTrRef, setSessionTrRef] = useState("");

    useEffect(() => {
        if (isOpen) {
            const tr = `${Date.now()}`;
            const uri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`CUBazzar ${orderIdText}`)}&tr=${tr}`;
            setSessionTrRef(tr);
            setSessionUri(uri);
            setStep("qr");
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // User taps "Done" → place order directly
    const handlePlaceOrder = async () => {
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
                            {/* ───────── QR CODE + DONE BUTTON ───────── */}
                            {step === "qr" && (
                                <motion.div
                                    key="qr"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Header — ✕ closes/cancels the modal entirely */}
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-white/8">
                                        <h3 className="font-bold text-lg text-white">Pay ₹{amount.toLocaleString()}</h3>
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
                                            title="Cancel"
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
                                            <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-white/5">
                                                <QRCode value={sessionUri} size={200} level="H" />
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
                                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all block"
                                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                            >
                                                <Smartphone className="w-5 h-5" />
                                                Open UPI App to Pay
                                            </a>
                                        )}

                                        {/* Divider */}
                                        <div className="relative flex items-center">
                                            <div className="flex-grow border-t border-white/10"></div>
                                            <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-medium uppercase">After Payment</span>
                                            <div className="flex-grow border-t border-white/10"></div>
                                        </div>

                                        {/* Done — Place Order */}
                                        <button
                                            onClick={handlePlaceOrder}
                                            className="w-full py-4 rounded-xl text-white font-bold text-base flex justify-center items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4444)', boxShadow: '0 4px 20px rgba(255,107,107,0.3)' }}
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Done — Place My Order
                                        </button>

                                        {/* Fraud Warning */}
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                                            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-red-300/70 leading-relaxed">
                                                <strong className="text-red-400">Warning:</strong> Every payment is verified by admin. Fake orders without payment = <strong>permanent ban</strong>.
                                            </p>
                                        </div>
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
