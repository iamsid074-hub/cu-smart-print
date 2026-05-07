import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Settings, 
  User, 
  ShoppingCart, 
  Utensils, 
  Zap 
} from "lucide-react";

interface DesktopStageManagerProps {
  activeWindows: string[];
  zStack: string[];
  onFocus: (id: any) => void;
}

const iconMap: Record<string, any> = {
  Shops: ShoppingBag,
  Settings: Settings,
  Profile: User,
  Cart: ShoppingCart,
  Combos: Utensils,
  Vending: Zap,
};

export default function DesktopStageManager({ activeWindows, zStack, onFocus }: DesktopStageManagerProps) {
  const focusedId = zStack[zStack.length - 1];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[50] flex flex-col gap-4">
      <AnimatePresence mode="popLayout">
        {activeWindows.map((winId) => {
          const Icon = iconMap[winId] || ShoppingBag;
          const isFocused = winId === focusedId;

          return (
            <motion.button
              key={winId}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: isFocused ? 1.1 : 1,
                filter: isFocused ? "blur(0px)" : "blur(1px)"
              }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              onClick={() => onFocus(winId)}
              className={`relative group w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isFocused 
                  ? "bg-white/40 shadow-[0_8px_32px_rgba(255,255,255,0.2)] border border-white/40" 
                  : "bg-black/10 hover:bg-white/20 border border-white/10"
              } backdrop-blur-xl`}
            >
              <Icon className={`w-6 h-6 transition-colors ${isFocused ? "text-white" : "text-white/60"}`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-white text-[11px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap tracking-wider shadow-xl border border-white/10">
                {winId.toUpperCase()}
              </div>

              {/* Liquid Active Indicator */}
              {isFocused && (
                <motion.div
                  layoutId="stage-active"
                  className="absolute -left-2 w-1 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
