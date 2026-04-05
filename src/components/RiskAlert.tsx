import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

interface RiskAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  level: "low" | "medium" | "high";
  reason: string;
  isBlocked: boolean;
}

export default function RiskAlert({
  isOpen,
  onClose,
  onConfirm,
  level,
  reason,
  isBlocked,
}: RiskAlertProps) {
  if (!isOpen) return null;

  const config = {
    high: {
      icon: ShieldAlert,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      button: "bg-danger hover:bg-danger/90",
      title: "Security Block",
    },
    medium: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      button: "bg-brand hover:shadow-brand/20",
      title: "Order Confirmation Required",
    },
    low: {
      icon: Info,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700",
      title: "Quick Review",
    },
  }[level];

  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div
          className={`${config.bg} p-6 flex flex-col items-center text-center`}
        >
          <div
            className={`w-16 h-16 rounded-2xl ${config.bg} border-2 ${config.border} flex items-center justify-center mb-4 shrink-0 shadow-sm`}
          >
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <h2 className={`text-xl font-black ${config.color} leading-tight`}>
            {config.title}
          </h2>
          <p className="text-slate-600 text-[13px] mt-2 leading-relaxed font-medium">
            {reason}
          </p>
        </div>

        <div className="p-6 space-y-3">
          {isBlocked ? (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
            >
              Understood
            </button>
          ) : (
            <>
              <button
                onClick={onConfirm}
                className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${config.button}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Proceed
                </span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Cancel Order
                </span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
