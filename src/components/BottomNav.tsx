import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = memo(({ to, icon: Icon, label, isActive, isCart, cartCount, index, onClick }: any) => {
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className="relative flex-1 flex items-center justify-center py-2.5 z-10 no-underline"
        >
            <motion.div
                animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full relative transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
                <Icon 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="w-5 h-5 flex-shrink-0" 
                />
                
                <AnimatePresence mode="popLayout" initial={false}>
                    {isActive && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap pt-0.5"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {isCart && cartCount > 0 && (
                    <div 
                        className={`absolute -top-1 -right-1 bg-brand text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center ring-2 shadow-lg transition-all duration-300 ${isActive ? 'ring-slate-900 scale-110' : 'ring-white scale-100'}`}
                    >
                        {cartCount > 9 ? '9+' : cartCount}
                    </div>
                )}
            </motion.div>
        </Link>
    );
});

NavItem.displayName = 'NavItem';

export default function BottomNav() {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();
    const { user } = useAuth();

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
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-[440px] pointer-events-auto relative p-1.5 border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-white/70 backdrop-blur-[30px] saturate-[170%]"
                style={{ borderRadius: "40px" }}
            >
                {/* Fixed Grid Container */}
                <div className="flex items-center relative h-[48px]">
                    {/* Absolute GPU-Accelerated Indicator */}
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute top-0 bottom-0 bg-slate-900 rounded-full shadow-xl shadow-slate-900/30 z-0"
                        initial={false}
                        animate={{ 
                            left: `${(activeIndex * 20)}%`,
                            width: '20%'
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 380, 
                            damping: 32,
                            mass: 0.8
                        }}
                    >
                        <div className="w-[90%] h-[90%] m-auto rounded-full ring-4 ring-white/10" />
                    </motion.div>

                    {navItems.map((item, index) => (
                        <NavItem 
                            key={item.to}
                            to={item.to} 
                            icon={item.icon} 
                            label={item.label} 
                            isActive={index === activeIndex}
                            isCart={item.isCart}
                            cartCount={cartCount}
                            index={index}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
