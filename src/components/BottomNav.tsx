import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Utensils, ShoppingBag, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = memo(({ to, icon: Icon, label, isActive, isCart = false, cartCount = 0 }: any) => {
    const isGro = label === "GRO";
    const isWallet = label === "Wallet";
    
    return (
        <Link 
            to={to} 
            className="relative flex-1 flex items-center justify-center py-2.5 z-10 no-underline pointer-events-auto"
        >
            <div 
                className="absolute inset-y-1.5 z-0 pointer-events-none"
                style={{ 
                    left: isGro ? '-6%' : isWallet ? '-10%' : '2%',
                    width: isGro ? '112%' : isWallet ? '120%' : '96%'
                }}
            >
                {isActive && (
                    <motion.div
                        layoutId="nav-pill"
                        className="w-full h-full bg-[#1D1D1F] rounded-full shadow-sm"
                        transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 38,
                            mass: 0.8
                        }}
                        style={{ willChange: "transform" }}
                    />
                )}
            </div>

            <motion.div
                animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0
                }}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
            >
                <Icon 
                    strokeWidth={isActive ? 2.5 : 2.5} 
                    className="w-5 h-5 flex-shrink-0" 
                />
                
                <AnimatePresence mode="popLayout" initial={false}>
                    {isActive && (
                        <motion.span 
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            className="text-[11px] font-bold tracking-tight whitespace-nowrap pt-0.5"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {isCart && cartCount > 0 && (
                    <div 
                        className={`absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${isActive ? 'ring-2 ring-[#1D1D1F] scale-110' : 'ring-2 ring-transparent scale-100'}`}
                    >
                        {cartCount > 9 ? '9+' : cartCount}
                    </div>
                )}
            </motion.div>
        </Link>
    );
});

NavItem.displayName = 'NavItem';

const BottomNav = () => {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();

    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reset-password' || location.pathname.startsWith('/admin')) {
        return null;
    }

    const navItems = [
        { to: "/home", icon: Home, label: "Home" },
        { to: "/food", icon: Utensils, label: "Food" },
        { to: "/cart", icon: ShoppingCart, label: "Cart", isCart: true },
        { to: "/grocery", icon: ShoppingBag, label: "Grocery" },
        { to: "/wallet", icon: Wallet, label: "Wallet" }
    ];

    const activeIndex = navItems.findIndex(item => 
        item.to === "/cart" 
        ? location.pathname === "/cart" 
        : location.pathname.startsWith(item.to)
    );

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex flex-col items-center pointer-events-none px-4">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                className="w-full max-w-[420px] pointer-events-auto relative p-1.5 ios-glass-heavy ios-shadow"
                style={{ borderRadius: "32px" }}
            >
                <div className="flex items-center relative h-[48px]">
                    {navItems.map((item, index) => (
                        <NavItem 
                            key={item.to}
                            to={item.to} 
                            icon={item.icon} 
                            label={item.label === "Grocery" ? "GRO" : item.label} 
                            isActive={index === activeIndex}
                            isCart={item.isCart}
                            cartCount={cartCount}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default memo(BottomNav);
