import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
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
  onMinimize,
  onMaximize,
  isMinimized = false,
  isMaximized = false,
  onBack,
  children,
  size = "lg",
}: DesktopWindowProps) {
  
  // Animation variants mimicking macOS Genie effect
  const variants = {
    initial: { 
      scale: 0.6, 
      opacity: 0, 
      y: "30vh", 
      filter: "blur(15px)" 
    },
    open: isMaximized 
      ? { 
          scale: 1, 
          scaleX: 1,
          opacity: 1, 
          y: 0, 
          width: "100vw", 
          height: "100vh", 
          maxWidth: "100vw", 
          maxHeight: "100vh", 
          borderRadius: "0px",
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 200, damping: 25 }
        } 
      : { 
          scale: 1, 
          scaleX: 1,
          opacity: 1, 
          y: 0, 
          borderRadius: "12px",
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 250, damping: 25 }
        },
    minimized: { 
      scale: 0.05, 
      scaleX: 0.01, // Compress extremely horizontally to simulate the "suck into dock" effect
      y: "45vh",    // Move to bottom dock
      opacity: 0, 
      filter: "blur(10px)", 
      transition: { 
        duration: 0.4, 
        ease: [0.32, 0.72, 0, 1] // Swooping ease mimicking Apple's curve
      } 
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      y: 40, 
      filter: "blur(5px)",
      transition: { duration: 0.2, ease: "easeOut" } 
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate={isMinimized ? "minimized" : "open"}
      exit="exit"
      drag={!isMaximized} // Disable dragging when maximized
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ top: -300, left: -500, right: 500, bottom: 300 }}
      className={`fixed inset-0 m-auto ${isMaximized ? "w-full h-full" : sizeMap[size]} flex flex-col bg-white/70 backdrop-blur-3xl shadow-2xl overflow-hidden z-[100] ${isMaximized ? "border-0" : "rounded-xl border border-white/30"} ${isMinimized ? "pointer-events-none" : ""}`}
      style={{ cursor: "default", transformOrigin: "bottom center" }}
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
          <button 
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-90 flex items-center justify-center group transition-all" 
          >
            <div className="w-1.5 h-[1.5px] bg-[#995700] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={onMaximize}
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-90 flex items-center justify-center group transition-all" 
          >
             <div className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center relative">
               <div className="w-[1px] h-[5px] bg-[#006500] absolute transform rotate-45" />
               <div className="w-[5px] h-[1px] bg-[#006500] absolute transform rotate-45" />
             </div>
          </button>
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
