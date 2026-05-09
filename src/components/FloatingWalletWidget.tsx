import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import WalletSecurity from "./WalletSecurity";

export default function FloatingWalletWidget() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Fire stripe events when wallet modal opens/closes
  useEffect(() => {
    if (isExpanded && !isUnlocked) {
      // Wallet opened and locked — trigger the scanning stripe
      window.dispatchEvent(new CustomEvent("face_id_scan_start"));
    } else if (!isExpanded) {
      // Wallet closed — collapse stripe
      window.dispatchEvent(new CustomEvent("face_id_scan_end"));
    }
  }, [isExpanded, isUnlocked]);

  if (location.pathname !== "/home") return null;

  return (
    <>
      {/* Desktop Shortcut (Windows Style) */}
      <div className="fixed left-8 top-[272px] z-[100] hidden xl:block">
        <div ref={widgetRef} className="relative flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors w-28 active:scale-95"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md transition-all relative">
              <Wallet className="w-8 h-8 text-white" />
              <div className="absolute bottom-0.5 left-0.5 bg-white w-5 h-5 rounded-sm flex items-center justify-center border border-black/10 shadow-sm">
                 <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-amber-600 rotate-[-135deg] translate-x-[0.5px] translate-y-[0.5px]" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-white text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,1)] px-1 w-full" style={{ textShadow: "0 1px 4px rgba(0,0,0,1)" }}>
              CU Wallet
            </span>
          </button>
        </div>
      </div>

      {/* Placeholder Modal Window */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl h-auto min-h-[600px] rounded-[3.5rem] overflow-hidden border border-white/40 flex flex-col"
              style={{ 
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(60px) saturate(210%)",
                WebkitBackdropFilter: "blur(60px) saturate(210%)",
                boxShadow: "0 40px 120px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
              }}
            >
               {!isUnlocked ? (
                 <WalletSecurity 
                   onUnlock={() => {
                     setIsUnlocked(true);
                     // stripe collapses via wallet_unlock_success event from WalletSecurity itself
                   }} 
                   onClose={() => {
                     setIsExpanded(false);
                     window.dispatchEvent(new CustomEvent("face_id_scan_end"));
                   }} 
                 />
               ) : (
                 <>
                   <button 
                      onClick={() => {
                        setIsExpanded(false);
                        // Optional: Reset lock state when closed so it re-locks next time
                        setTimeout(() => setIsUnlocked(false), 500);
                      }}
                      className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full text-gray-800 transition-colors z-10"
                    >
                      <X className="w-6 h-6" />
                   </button>
                   <div className="p-12 flex flex-col items-center justify-center h-full flex-1">
                     <Wallet className="w-16 h-16 text-amber-600 mb-4" />
                     <h2 className="text-3xl font-black text-gray-900">Wallet</h2>
                     <p className="text-gray-700 mt-2">Ready for content...</p>
                   </div>
                 </>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
