import { ReactNode, useRef, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
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
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        windowRef.current && 
        !windowRef.current.contains(event.target as Node) &&
        !isMinimized // Don't close if it's already minimized (to avoid conflicts with dock)
      ) {
        onClose();
      }
    };

    // Use a small timeout to avoid capturing the click that opened the window
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isMinimized]);
  
  // Animation variants mimicking macOS Genie effect (Wavy Bend)
  const variants = {
    initial: { 
      scale: 0.6, 
      opacity: 0, 
      x: "-50%",
      y: 200, 
      filter: "blur(15px)",
      rotateX: 0,
      skewX: 0
    },
    open: isMaximized 
      ? { 
          scale: 1, 
          opacity: 1, 
          x: 0,
          y: 0, 
          width: "100vw", 
          height: "100vh", 
          maxWidth: "100vw", 
          maxHeight: "100vh", 
          borderRadius: "0px",
          filter: "blur(0px)",
          rotateX: 0,
          skewX: 0,
          transition: { type: "spring", stiffness: 200, damping: 25 }
        } 
      : { 
          scale: 1, 
          opacity: 1, 
          x: "-50%",
          y: 0, 
          borderRadius: "12px",
          filter: "blur(0px)",
          rotateX: 0,
          skewX: 0,
          transition: { type: "spring", stiffness: 250, damping: 25 }
        },
    minimized: { 
      scale: 0.05, 
      x: 0,
      y: "48vh",    // Move to bottom dock
      rotateX: 60,  // Tilts back to create a funnel/trapezoid shape
      skewX: [0, -15, 5, 0], // Wavy bend back and forth
      opacity: [1, 0.8, 0], 
      filter: "blur(10px)", 
      transition: { 
        duration: 0.5, 
        ease: [0.32, 0.72, 0, 1], // Apple-like swoop ease
        skewX: { duration: 0.5, ease: "easeInOut" }
      } 
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      x: "-50%",
      y: 100, 
      filter: "blur(10px)",
      rotateX: 0,
      skewX: 0,
      transition: { duration: 0.2, ease: "easeOut" } 
    },
  };

  return (
    <motion.div
      ref={windowRef}
      variants={variants}
      initial="initial"
      animate={isMinimized ? "minimized" : "open"}
      exit="exit"
      drag={!isMaximized} // Disable dragging when maximized
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      className={`fixed ${isMaximized ? "inset-0 w-full h-full" : `top-[160px] left-1/2 ${sizeMap[size]}`} flex flex-col bg-white/70 backdrop-blur-3xl shadow-2xl overflow-hidden z-[100] ${isMaximized ? "border-0" : "rounded-xl border border-white/30"} ${isMinimized ? "pointer-events-none" : ""}`}
      onClick={(e) => e.stopPropagation()}
      style={{ 
        cursor: "default", 
        transformOrigin: "bottom center",
        perspective: "1000px" // Required for the 3D funnel effect to work
      }}
    >
      {/* macOS Title Bar — drag handle */}
      <div
        onPointerDown={(e) => {
          if (!isMaximized) dragControls.start(e);
        }}
        className="h-12 flex items-center px-5 bg-white/20 border-b border-black/5 select-none shrink-0 backdrop-blur-sm"
        style={{ cursor: isMaximized ? "default" : "grab", touchAction: "none" }}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-2.5">
          {/* Close */}
          <button
            title="Close"
            onClick={onClose}
            className="w-4 h-4 rounded-full bg-[#ff5f56] hover:bg-[#e0443c] flex items-center justify-center group transition-all shadow-sm active:scale-90"
          >
            <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#7a1200] stroke-[3]" />
          </button>
          {/* Minimize */}
          <button
            title="Minimize"
            onClick={onMinimize}
            className="w-4 h-4 rounded-full bg-[#ffbd2e] hover:bg-[#e0a826] flex items-center justify-center group transition-all shadow-sm active:scale-90"
          >
            <div className="w-2 h-[2px] rounded-full bg-[#995700] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {/* Maximize */}
          <button
            title={isMaximized ? "Restore" : "Maximize"}
            onClick={onMaximize}
            className="w-4 h-4 rounded-full bg-[#27c93f] hover:bg-[#1ea832] flex items-center justify-center group transition-all shadow-sm active:scale-90"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity relative w-2.5 h-2.5 flex items-center justify-center">
              {isMaximized ? (
                <div className="w-2 h-2 border-[1.5px] border-[#006500] rounded-[1px]" />
              ) : (
                <>
                  <div className="w-[1.5px] h-2.5 bg-[#006500] absolute" />
                  <div className="w-2.5 h-[1.5px] bg-[#006500] absolute" />
                </>
              )}
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
          <span className="text-sm font-semibold text-gray-700 tracking-tight">{title}</span>
        </div>

        {/* Balance spacer */}
        <div className="w-[88px]" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ cursor: "default" }}>
        {children}
      </div>
    </motion.div>
  );
}
