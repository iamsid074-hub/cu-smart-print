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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 h-[60px] flex items-center justify-center z-50">
      <div 
        className="flex items-end h-full gap-3 px-4 pb-2 pt-2 rounded-2xl border border-white/20"
        style={{
          background: "rgba(83, 83, 83, 0.25)",
          backdropFilter: "blur(13px)",
          WebkitBackdropFilter: "blur(13px)"
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {dockItems.map((item, index) => {
          let scale = 1;
          let y = 0;

          if (hoverIndex !== null) {
            const dist = hoverIndex - index;
            if (dist === 0) {
              scale = 1.5;
              y = -10;
            } else if (Math.abs(dist) === 1) {
              scale = 1.2;
              y = -6;
            } else if (Math.abs(dist) === 2) {
              scale = 1.1;
              y = 0;
            }
          }

          const isActive = location.pathname.startsWith(item.path);

          return (
            <motion.div
              key={item.name}
              className="relative group cursor-pointer flex flex-col items-center justify-end"
              onMouseEnter={() => setHoverIndex(index)}
              onClick={() => navigate(item.path)}
              animate={{ scale, y }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ transformOrigin: "bottom center" }}
            >
              {/* Tooltip Name */}
              <div 
                className="absolute -top-12 bg-black/50 text-white/90 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backdropFilter: "blur(13px)" }}
              >
                {item.name}
                {/* Tooltip triangle */}
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black/50"></div>
              </div>

              {/* Icon Container */}
              <div 
                className={`w-[46px] h-[46px] rounded-[12px] bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center border border-white/20`}
              >
                <item.icon className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              
              {/* Active Dot indicator below icon */}
              {isActive && (
                <div className="absolute -bottom-[10px] w-[4px] h-[4px] rounded-full bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
