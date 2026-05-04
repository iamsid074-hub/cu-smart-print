import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Store,
  Coffee,
  Package,
  Gamepad2,
  ShoppingCart,
  User,
  Settings,
} from "lucide-react";

export const dockItems = [
  { name: "Home", icon: Home, color: "from-blue-400 to-blue-600", path: "/home" },
  { name: "Shops", icon: Store, color: "from-orange-400 to-orange-600", path: "/sections/shops" },
  { name: "Vending", icon: Coffee, color: "from-emerald-400 to-emerald-600", path: "/sections/vending" },
  { name: "Combos", icon: Package, color: "from-pink-400 to-pink-600", path: "/sections/combos" },
  { name: "Games", icon: Gamepad2, color: "from-purple-400 to-purple-600", path: "/games" },
  { name: "Cart", icon: ShoppingCart, color: "from-yellow-400 to-yellow-600", path: "/cart" },
  { name: "Profile", icon: User, color: "from-gray-400 to-gray-600", path: "/profile" },
  { name: "Settings", icon: Settings, color: "from-slate-400 to-slate-600", path: "/settings" },
];

export default function DesktopDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end">
      <div 
        className="flex items-end gap-3 px-4 pb-[6px] rounded-2xl border border-white/20 h-[62px]"
        style={{
          background: "rgba(83, 83, 83, 0.25)",
          backdropFilter: "blur(13px)",
          WebkitBackdropFilter: "blur(13px)"
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {dockItems.map((item, index) => {
          let size = 44; // Base size (reduced)

          if (hoverIndex !== null) {
            const dist = hoverIndex - index;
            if (dist === 0) {
              size = 64; // ~1.5x
            } else if (Math.abs(dist) === 1) {
              size = 54; // ~1.2x
            } else if (Math.abs(dist) === 2) {
              size = 48; // ~1.1x
            }
          }

          const isActive = location.pathname.startsWith(item.path);

          return (
            <div
              key={item.name}
              className="relative group cursor-pointer flex flex-col items-center justify-end"
              onMouseEnter={() => setHoverIndex(index)}
              onClick={() => navigate(item.path)}
            >
              {/* Tooltip Name */}
              <div 
                className="absolute -top-12 bg-black/50 text-white/90 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backdropFilter: "blur(13px)" }}
              >
                {item.name}
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black/50"></div>
              </div>

              {/* Icon Container */}
              <motion.div 
                className={`rounded-[12px] bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center border border-white/20 relative`}
                animate={{ width: size, height: size }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon className="text-white drop-shadow-sm" style={{ width: size * 0.5, height: size * 0.5 }} />
              </motion.div>
              
              {/* Active Dot indicator below icon */}
              <div className="h-[6px] w-full flex items-center justify-center pt-[2px]">
                {isActive && (
                  <div className="w-[4px] h-[4px] rounded-full bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
