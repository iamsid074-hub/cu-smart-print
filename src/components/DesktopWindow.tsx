import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  /** optional size override */
  size?: "md" | "lg" | "xl";
}

const sizeMap = {
  md: "w-[55%] max-w-[620px] h-[65%] max-h-[580px]",
  lg: "w-[70%] max-w-[850px] h-[72%] max-h-[680px]",
  xl: "w-[80%] max-w-[1000px] h-[75%] max-h-[720px]",
};

export default function DesktopWindow({
  title,
  onClose,
  onBack,
  children,
  size = "lg",
}: DesktopWindowProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ top: -300, left: -500, right: 500, bottom: 300 }}
      className={`fixed inset-0 m-auto ${sizeMap[size]} flex flex-col bg-white/70 backdrop-blur-3xl rounded-xl shadow-2xl border border-white/30 overflow-hidden z-[100]`}
      style={{ cursor: "default" }}
    >
      {/* macOS Title Bar — drag handle */}
      <div
        className="h-10 flex items-center px-4 bg-white/10 border-b border-black/5 select-none shrink-0"
        style={{ cursor: "grab" }}
      >
        {/* Traffic Lights */}
        <div className="flex gap-2 w-20">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 flex items-center justify-center group transition-all"
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#7a1200]" />
          </button>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-black/10 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>

        {/* Balance spacer */}
        <div className="w-20" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ cursor: "default" }}>
        {children}
      </div>
    </motion.div>
  );
}
