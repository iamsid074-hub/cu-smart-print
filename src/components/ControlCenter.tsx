import React, { useState, useEffect } from "react";
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, Wallet, ShoppingBag, Settings, Gamepad2, 
  Search, Grid, Bell, Package 
} from "lucide-react";

export default function ControlCenter() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use a large negative number initially, will update to window.innerHeight on mount
  const y = useMotionValue(-2000); 
  const controls = useAnimation();
  const navigate = useNavigate();

  useEffect(() => {
    // Set exactly off-screen once mounted
    y.set(-window.innerHeight);
    
    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closePanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Visual transforms based on y position
  const backdropOpacity = useTransform(y, [-window.innerHeight, 0], [0, 1]);
  // Smoothly scale down slightly as it goes off screen
  const panelScale = useTransform(y, [-window.innerHeight, 0], [0.95, 1]);

  const springConfig = { type: "spring", damping: 26, stiffness: 170 };

  const openPanel = () => {
    setIsOpen(true);
    controls.start({ y: 0, transition: springConfig });
    document.body.style.overflow = "hidden"; // lock scroll
  };

  const closePanel = () => {
    setIsOpen(false);
    controls.start({ y: -window.innerHeight, transition: springConfig });
    document.body.style.overflow = ""; // unlock scroll
  };

  // Dragging from the top edge to open
  const handleHitAreaPan = (e: Event, info: PanInfo) => {
    if (isOpen) return;
    
    let newY = -window.innerHeight + info.offset.y;
    // Don't let it drag further down than 0 (fully open)
    if (newY > 0) newY = newY * 0.1; 
    y.set(newY);
  };

  // Dragging the panel itself to close
  const handlePanelPan = (e: Event, info: PanInfo) => {
    if (!isOpen) return;
    
    let newY = info.offset.y;
    // Don't let it drag further down than 0, add resistance
    if (newY > 0) newY = newY * 0.1;
    y.set(newY);
  };

  const handleDragEnd = (e: Event, info: PanInfo) => {
    if (isOpen) {
      // Swipe up to close
      if (info.velocity.y < -300 || info.offset.y < -100) {
        closePanel();
      } else {
        openPanel(); // snap back open
      }
    } else {
      // Swipe down to open
      if (info.velocity.y > 300 || info.offset.y > 80) {
        openPanel();
      } else {
        closePanel(); // snap back closed
      }
    }
  };

  return (
    <>
      {/* 50px Top Edge Hit Area (Only active when closed) */}
      {!isOpen && (
        <motion.div
          className="fixed top-0 inset-x-0 h-[50px] z-[100000] touch-none"
          onPan={handleHitAreaPan}
          onPanEnd={handleDragEnd}
        />
      )}

      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[99998] pointer-events-none"
        style={{ opacity: backdropOpacity }}
      >
        <div 
          className={`absolute inset-0 bg-black/30 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
          onClick={closePanel}
        />
      </motion.div>

      {/* Control Center Panel */}
      <motion.div
        onPan={handlePanelPan}
        onPanEnd={handleDragEnd}
        animate={controls}
        initial={{ y: -2000 }} // fallback
        style={{ y, scale: panelScale }}
        className={`fixed inset-x-0 top-0 bottom-0 z-[99999] px-4 pt-[60px] pb-8 touch-none ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className="w-full h-full max-w-sm mx-auto flex flex-col gap-4">
          
          {/* Top Row: Two 2x2 Squares */}
          <div className="flex gap-4 h-[160px]">
            {/* Nav Block 1 (Square) */}
            <div className="flex-1 bg-white/10 backdrop-blur-3xl rounded-[28px] p-3 grid grid-cols-2 grid-rows-2 gap-2 shadow-2xl border border-white/20">
              <NavIcon icon={User} color="bg-[#0A84FF]" onClick={() => {navigate('/profile'); closePanel()}} />
              <NavIcon icon={Wallet} color="bg-[#30D158]" onClick={() => {navigate('/wallet'); closePanel()}} />
              <NavIcon icon={ShoppingBag} color="bg-[#FF9F0A]" onClick={() => {navigate('/transactions'); closePanel()}} />
              <NavIcon icon={Settings} color="bg-[#8E8E93]" onClick={() => {navigate('/settings'); closePanel()}} />
            </div>

            {/* Nav Block 2 (Square) */}
            <div 
              className="flex-1 bg-white/10 backdrop-blur-3xl rounded-[28px] p-4 flex flex-col justify-between shadow-2xl border border-white/20 cursor-pointer active:scale-95 transition-transform"
              onClick={() => {navigate('/sections'); closePanel()}}
            >
              <div className="flex justify-end">
                 <div className="w-10 h-10 rounded-full bg-[#BF5AF2]/20 flex items-center justify-center">
                   <Grid className="w-5 h-5 text-[#BF5AF2]" />
                 </div>
              </div>
              <div>
                <p className="text-white font-semibold text-xl leading-tight">Sections</p>
                <p className="text-white/60 text-sm">All Categories</p>
              </div>
            </div>
          </div>

          {/* Middle Row: Pills */}
          <div className="flex gap-4 h-[80px]">
            <div 
              className="flex-[2] bg-white/10 backdrop-blur-3xl rounded-[24px] p-4 flex items-center gap-4 shadow-2xl border border-white/20 cursor-pointer active:scale-95 transition-transform"
              onClick={() => {navigate('/search'); closePanel()}}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-white/80" />
              </div>
              <span className="text-white font-medium text-lg">Search Items</span>
            </div>
            
            <div 
              className="flex-1 bg-white/10 backdrop-blur-3xl rounded-[24px] flex items-center justify-center shadow-2xl border border-white/20 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF453A]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#FF453A]" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Tall Rectangles */}
          <div className="flex gap-4 h-[160px]">
             <div 
               className="flex-1 bg-white/10 backdrop-blur-3xl rounded-[28px] p-4 flex flex-col items-center justify-center gap-3 shadow-2xl border border-white/20 cursor-pointer active:scale-95 transition-transform"
               onClick={() => {navigate('/games'); closePanel()}}
             >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF453A] to-[#FF9F0A] flex items-center justify-center shadow-lg">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Games</p>
                  <p className="text-white/50 text-xs">Play & Win</p>
                </div>
             </div>

             <div 
               className="flex-1 bg-white/10 backdrop-blur-3xl rounded-[28px] p-4 flex flex-col items-center justify-center gap-3 shadow-2xl border border-white/20 cursor-pointer active:scale-95 transition-transform"
               onClick={() => {navigate('/grocery'); closePanel()}}
             >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#30D158] to-[#32ADE6] flex items-center justify-center shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Grocery</p>
                  <p className="text-white/50 text-xs">Essentials</p>
                </div>
             </div>
          </div>

          {/* Grab indicator line */}
          <div className="mt-8 mx-auto w-12 h-1.5 bg-white/30 rounded-full" />
        </div>
      </motion.div>
    </>
  );
}

function NavIcon({ icon: Icon, color, onClick }: { icon: any, color: string, onClick: () => void }) {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full h-full"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} active:scale-90 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
