import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Maximize, RotateCcw, Box } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPremiumImage } from "@/data/foodData";

interface ARPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemCategory: string;
}

export default function ARPreviewModal({ isOpen, onClose, itemName, itemCategory }: ARPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isPlacing, setIsPlacing] = useState(true);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      // Fallback: stay in "simulation mode" without live feed or show error
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
      const timer = setTimeout(() => setIsPlacing(false), 2500);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const foodImage = getPremiumImage(itemName, itemCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black overflow-hidden flex flex-col"
        >
          {/* CAMERA FEED */}
          <div className="absolute inset-0 z-0 bg-zinc-900">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Camera className="w-12 h-12" />
                <p className="text-sm font-bold uppercase tracking-widest">Activating AR Camera...</p>
              </div>
            )}
            {/* AR Grid Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(rgba(0,255,150,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,150,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          {/* AR CONTENT */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
            <AnimatePresence>
              {isPlacing ? (
                <motion.div 
                  key="placing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex flex-col items-center gap-6"
                >
                   <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-48 h-32 border-2 border-dashed border-emerald-500/50 rounded-full"
                      />
                      <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-emerald-400" />
                   </div>
                   <p className="text-emerald-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Detecting Surface...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="food"
                  initial={{ opacity: 0, y: 100, scale: 0.5, rotateX: 45 }}
                  animate={{ opacity: 1, y: 0, scale: 1.2, rotateX: 15 }}
                  className="relative group cursor-grab active:cursor-grabbing"
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                  style={{ perspective: "1000px" }}
                >
                  {/* Holographic Platform */}
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/20 blur-[40px] rounded-full"
                  />
                  
                  {/* Food Asset */}
                  <div className="relative w-80 h-80">
                    <img 
                      src={foodImage} 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter brightness-110 contrast-110"
                      alt={itemName}
                    />
                    {/* Futuristic AR Scanlines */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                       <motion.div 
                         animate={{ y: ['0%', '100%', '0%'] }}
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="w-full h-1 bg-emerald-400/30 blur-[2px] shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                       />
                    </div>
                  </div>

                  {/* UI Label */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 px-6 py-2 rounded-2xl flex flex-col items-center">
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Scale: 1:1 Actual Size</span>
                     <h2 className="text-white font-black text-lg whitespace-nowrap">{itemName}</h2>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CONTROLS */}
          <div className="relative z-10 p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-8">
            <div className="flex items-center justify-around">
               <ControlBtn icon={RotateCcw} label="Reset" />
               <button 
                  onClick={onClose}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-emerald-500/20"
               >
                  <X className="w-8 h-8 text-black" />
               </button>
               <ControlBtn icon={Maximize} label="Capture" />
            </div>
            
            <div className="px-4 text-center">
               <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Tip: Point camera at a flat surface and move slowly to calibrate portion scale.
               </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlBtn({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
       <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-active:scale-90 transition-all text-zinc-400 group-hover:text-white">
          <Icon className="w-6 h-6" />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">{label}</span>
    </button>
  );
}
