import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Utensils,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = memo(({ to, icon: Icon, label, isActive, isCart = false, cartCount = 0 }: any) => {
  return (
    <Link
      to={to}
      className={`relative flex items-center justify-center h-full px-4 rounded-full transition-all duration-300 ${
        isActive ? "text-white" : "text-[#8E8E93] hover:text-[#1D1D1F]"
      }`}
      style={{ flex: isActive ? "0 0 auto" : "1 1 0" }} // Active item takes its content width, others share remaining space
    >
      {isActive && (
        <motion.div
          layoutId="bottom-nav-active"
          className="absolute inset-0 bg-[#1D1D1F] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className="relative z-10 flex items-center gap-1.5 h-full">
        <Icon strokeWidth={isActive ? 2.5 : 2} className="w-[1.3rem] h-[1.3rem]" />
        
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ width: 0, opacity: 0, paddingLeft: 0 }}
              animate={{ width: "auto", opacity: 1, paddingLeft: 2 }}
              exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
              className="text-[13px] font-bold tracking-tight whitespace-nowrap overflow-hidden"
            >
              {label === "Grocery" ? "Gro" : label}
            </motion.span>
          )}
        </AnimatePresence>

        {isCart && cartCount > 0 && (
          <div className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-md">
            {cartCount > 9 ? "9+" : cartCount}
          </div>
        )}
      </div>
    </Link>
  );
});

NavItem.displayName = "NavItem";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems: cartCount } = useCart();

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/food", icon: Utensils, label: "Food" },
    { to: "/grocery", icon: ShoppingBag, label: "Grocery" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
  ];

  const activeIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.to)
  );

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[400px] pointer-events-none"
      style={{ willChange: "transform" }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="pointer-events-auto h-[56px] rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between px-2"
      >
        {navItems.map((item, index) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={index === activeIndex}
            cartCount={cartCount}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default memo(BottomNav);

