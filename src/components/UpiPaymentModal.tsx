import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";

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

type Step = "qr" | "verifying" | "success";

export default function UpiPaymentModal({
  isOpen,
  onClose,
  amount,
  onPaymentVerify,
}: UpiPaymentModalProps) {
  const [step, setStep] = useState<Step>("qr");

  useEffect(() => {
    if (isOpen) {
      setStep("qr");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleDone = async () => {
    try {
      setStep("verifying");
      // Add a brief deliberate delay to show verification UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock UTR since manual verification is used by admin
      const mockUtr = "UPI_" + Date.now().toString().slice(-8);
      await onPaymentVerify(mockUtr);

      setStep("success");
      toast.success("Payment Confirmed! Order placed 🎉");
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setStep("qr");
      toast.error(err.message || "Failed to confirm payment");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center"
          style={{ isolation: "isolate" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-sm mx-4 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.1)] p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {step === "qr" && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center pt-2"
                >
                  <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                    <QrCode className="w-7 h-7 text-brand" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">
                    Pay ₹{amount.toLocaleString()}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
                    Scan the QR code below using any UPI app (GPay, PhonePe,
                    Paytm) to complete your payment.
                  </p>

                  <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm mb-6 w-full max-w-[220px] mx-auto overflow-hidden">
                    <img
                      src="/payment-qr.webp"
                      alt="Payment QR Code"
                      className="w-full h-auto rounded-xl block"
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </div>

                  <button
                    onClick={handleDone}
                    className="w-full py-4 rounded-xl text-white font-bold text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md bg-brand hover:bg-brand flex items-center justify-center gap-2 tracking-wide"
                  >
                    I have paid ₹{amount.toLocaleString()}
                  </button>
                </motion.div>
              )}

              {step === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 space-y-4"
                >
                  <Loader2 className="w-16 h-16 text-brand animate-spin" />
                  <p className="text-lg font-bold text-slate-900">
                    Confirming Payment...
                  </p>
                  <p className="text-xs text-slate-500">
                    Please do not close this window
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center justify-center py-16 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                  >
                    <CheckCircle className="w-20 h-20 text-brand" />
                  </motion.div>
                  <p className="text-2xl font-black text-slate-900">
                    Confirmed! 🎉
                  </p>
                  <p className="text-sm text-brand font-bold bg-brand-50 px-4 py-2 rounded-full">
                    Order placed — redirecting...
                  </p>
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
