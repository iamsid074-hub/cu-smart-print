import { memo, useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Utensils, ShoppingBag, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const GLOBAL_ACTIVE_COLOR = "#6366f1";

const NAV_ITEMS = [
  { to: "/home",    icon: Home,        label: "Home" },
  { to: "/food",    icon: Utensils,    label: "Food" },
  { to: "/grocery", icon: ShoppingBag, label: "Grocery" },
  { to: "/wallet",  icon: Wallet,      label: "Wallet" },
];

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Increased threshold and added 'direction-lock' logic to prevent flickering
          if (Math.abs(currentScrollY - lastScrollY) > 25) {
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY - 10) {
              setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const activeIndex = useMemo(
    () => NAV_ITEMS.findIndex((i) => location.pathname.startsWith(i.to)),
    [location.pathname]
  );

  const isCart = location.pathname === "/cart";

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin")
  ) return null;

  return (
    <motion.div
      initial={false}
      animate={{ 
        y: isCart || !isVisible ? 110 : 0,
        opacity: isCart || !isVisible ? 0 : 1 
      }}
      transition={{ 
        type: "tween",        // Switched to 'tween' for predictable, linear performance on mobile
        duration: 0.25,      // Snappier duration reduces lag perception
        ease: "easeOut"
      }}
      className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center bg-[#0d0d0f] border-t border-white/[0.08] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] will-change-transform"
      style={{ 
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        WebkitTapHighlightColor: "transparent",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)"
      }}
    >
      <div
        className="w-full max-w-[600px] flex items-stretch h-[64px] relative"
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const Icon = item.icon;
          const showBadge = item.to === "/grocery" && totalItems > 0;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1 relative flex flex-col items-center justify-center gap-1 no-underline transition-all active:scale-95"
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Active Glow Aura */}
              {isActive && (
                <motion.div
                  layoutId="nav-aura"
                  className="absolute inset-x-2 inset-y-1.5 rounded-2xl bg-indigo-500/5 z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}

              {/* Icon Section */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}
                />
                
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] font-black min-w-[15px] h-[15px] flex items-center justify-center rounded-full border-2 border-[#0d0d0f]">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>

              {/* Label Section */}
              <span 
                className={`text-[10px] font-bold tracking-tight transition-colors duration-200 z-10 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-500 opacity-60'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="active-line"
                  className="absolute top-0 inset-x-8 h-[2px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)] rounded-b-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default memo(BottomNav);
