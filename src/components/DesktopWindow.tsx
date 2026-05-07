import { ReactNode, useRef, useEffect, useState } from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  children: ReactNode;
  onFocus?: () => void;
  zIndex?: number;
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
  actions,
  children,
  onFocus,
  zIndex,
  size = "lg",
}: DesktopWindowProps) {
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  const [snapPreview, setSnapPreview] = useState<"left" | "right" | "top" | null>(null);
  const [snapState, setSnapState] = useState<"left" | "right" | "top" | null>(null);

  // Constants for snapping
  const SNAP_THRESHOLD = 40; // Pixels from edge to trigger snap preview
  const SNAP_WIDTH = "50vw";
  const SNAP_HEIGHT = "calc(100vh - 40px)"; // Subtract menu bar height if any

  // Close on click outside
  // Removed "Close on click outside" to allow multiple windows to be open simultaneously.
  // Users now explicitly close windows using the traffic light buttons.
  // Sound Effects
  const playSound = (type: "click" | "woosh") => {
    const audio = new Audio(type === "click" ? "/sounds/click.wav" : "/sounds/woosh.wav");
    audio.volume = 0.2;
    audio.play().catch(() => {}); // Ignore errors if user hasn't interacted yet
  };

  useEffect(() => {
    // Initial open sound
    playSound("click");
  }, []);
  
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
          y: 30, // Force spawn exactly below the grey stripe
          borderRadius: "20px",
          filter: "blur(0px)",
          rotateX: 0,
          skewX: 0,
          transition: { type: "spring", stiffness: 250, damping: 25 }
        },
    snap: {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      rotateX: 0,
      skewX: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
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
      animate={isMinimized ? "minimized" : (isMaximized || snapState) ? "snap" : "open"}
      exit="exit"
      drag={!isMaximized} // Disable dragging when maximized
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ top: 0 }} // Since we are forced at 30px offset already, 0 is the limit
      onDrag={(event, info) => {
        if (isMaximized) return;
        const x = info.point.x;
        const y = info.point.y;
        
        if (y < SNAP_THRESHOLD + 20) setSnapPreview("top");
        else if (x < SNAP_THRESHOLD + 10) setSnapPreview("left");
        else if (x > window.innerWidth - (SNAP_THRESHOLD + 10)) setSnapPreview("right");
        else setSnapPreview(null);
      }}
      onDragEnd={(event, info) => {
        if (isMaximized) return;
        const x = info.point.x;
        const y = info.point.y;

        if (y < SNAP_THRESHOLD + 20) setSnapState("top");
        else if (x < SNAP_THRESHOLD + 10) setSnapState("left");
        else if (x > window.innerWidth - (SNAP_THRESHOLD + 10)) setSnapState("right");
        else setSnapState(null);
        
        setSnapPreview(null);
      }}
      className={`fixed ${isMaximized || snapState === "top" ? "top-[30px] left-0 right-0 bottom-0 w-full h-[calc(100vh-30px)]" : 
        snapState === "left" ? "top-[30px] left-0 w-[50vw] h-[calc(100vh-30px)]" :
        snapState === "right" ? "top-[30px] right-0 left-auto w-[50vw] h-[calc(100vh-30px)]" :
        `top-[30px] left-1/2 -translate-x-1/2 ${sizeMap[size]}`} 
        flex flex-col bg-white/70 backdrop-blur-3xl shadow-2xl overflow-hidden z-[100] 
        ${isMaximized || snapState ? "border-0 rounded-none" : "rounded-[20px] border border-white/30"} 
        ${isMinimized ? "pointer-events-none" : ""} 
        transition-[width,height,top,left,right,border-radius] duration-300 ease-out`}
      onClick={(e) => e.stopPropagation()}
      style={{ 
        cursor: "default", 
        transformOrigin: "bottom center",
        perspective: "1000px", // Required for the 3D funnel effect to work
        zIndex: zIndex ?? 100
      }}
    >
      {/* macOS Title Bar — drag handle */}
      <div
        onPointerDown={(e) => {
          if (onFocus) {
            onFocus();
            playSound("click");
          }
          if (!isMaximized) dragControls.start(e);
        }}
        className="h-12 flex items-center px-5 bg-white/20 border-b border-black/5 select-none shrink-0 z-[10]"
        style={{ cursor: isMaximized ? "default" : "grab", touchAction: "none" }}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-2.5">
          {/* Close */}
          <button
            title="Close"
            onClick={() => {
              onClose();
              playSound("woosh");
            }}
            className="w-4 h-4 rounded-full bg-[#ff5f56] hover:bg-[#e0443c] flex items-center justify-center group transition-all shadow-sm active:scale-90"
          >
            <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#7a1200] stroke-[3]" />
          </button>
          {/* Minimize */}
          <button
            title="Minimize"
            onClick={() => {
              if (onMinimize) onMinimize();
              playSound("woosh");
            }}
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

        {/* Actions or Balance spacer */}
        <div className="w-[120px] flex justify-end pr-2">
          {actions}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide rounded-b-xl" style={{ cursor: "default" }}>
        {children}
      </div>

      {/* Snap Preview Overlay */}
      <AnimatePresence>
        {snapPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed pointer-events-none bg-blue-500/10 border-2 border-blue-500/30 backdrop-blur-md z-[200] ${
              snapPreview === "top" ? "top-[30px] left-0 right-0 bottom-0 h-[calc(100vh-30px)]" :
              snapPreview === "left" ? "top-[30px] left-0 w-[50vw] h-[calc(100vh-30px)]" :
              "top-[30px] right-0 w-[50vw] h-[calc(100vh-30px)]"
            }`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
