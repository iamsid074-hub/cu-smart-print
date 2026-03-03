import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface UpiPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    orderIdText: string;
    onPaymentVerify: (utrNumber: string) => Promise<void>;
}

export default function UpiPaymentModal({ isOpen, onClose, amount, orderIdText, onPaymentVerify }: UpiPaymentModalProps) {
    const [utrNumber, setUtrNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const upiId = import.meta.env.VITE_MERCHANT_UPI_ID || "anshu@sbi";
    const merchantName = "CU BAZZAR";
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&tr=${orderIdText}&am=${amount}&cu=INR`;

    useEffect(() => {
        if (!isOpen) {
            setUtrNumber("");
            setIsSubmitting(false);
        }
        // Lock body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        toast.success("UPI ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (utrNumber.length < 12) {
            toast.error("Please enter a valid 12-digit UTR number");
            return;
        }
        setIsSubmitting(true);
        try {
            await onPaymentVerify(utrNumber);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use createPortal to render at document.body level — avoids parent overflow/z-index issues
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ isolation: 'isolate' }}>
                    {/* Full-screen backdrop */}
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

                        <div className="p-6 space-y-6">
                            {/* Amount */}
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Amount to Pay</p>
                                <p className="text-4xl font-black text-neon-fire">₹{amount.toLocaleString()}</p>
                            </div>

                            {/* Mobile Deep Link */}
                            <a
                                href={upiUri}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all block"
                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Open UPI App
                            </a>
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wide -mt-4">GPay • PhonePe • Paytm</p>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-medium uppercase">Or Scan QR</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-2xl w-fit mx-auto border-4 border-white/5 shadow-xl">
                                <QRCode value={upiUri} size={160} level="H" />
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <p className="text-sm font-medium text-white">{upiId}</p>
                                <button onClick={handleCopyUpi} className="text-neon-cyan hover:text-neon-blue transition-colors p-1" title="Copy UPI ID">
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Verification Form */}
                            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <p className="text-xs font-bold text-white mb-3">Paid? Enter UTR / Ref Number <span className="text-red-400">*</span></p>
                                <input
                                    type="text"
                                    required
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                                    placeholder="e.g. 312345678901"
                                    maxLength={12}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-fire focus:ring-1 focus:ring-neon-fire transition-all mb-3 text-center tracking-widest font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={utrNumber.length < 12 || isSubmitting}
                                    className="w-full py-2.5 rounded-lg text-white font-bold text-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                                    style={{ background: utrNumber.length >= 12 ? '#FF6B6B' : 'rgba(255,255,255,0.1)' }}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Payment"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
