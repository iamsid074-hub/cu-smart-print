import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = memo(({ to, icon: Icon, label, isActive, isCart = false, cartCount = 0 }: any) => {
    return (
        <Link 
            to={to} 
            className="relative flex-1 flex items-center justify-center py-2.5 z-10 no-underline pointer-events-auto"
        >
            <motion.div
                animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0
                }}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full relative transition-colors duration-200 ${
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
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap pt-0.5"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {isCart && cartCount > 0 && (
                    <div 
                        className={`absolute -top-1 -right-1 bg-brand text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center ring-2 shadow-lg transition-all duration-200 ${isActive ? 'ring-slate-900 scale-110' : 'ring-white scale-100'}`}
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

    // Dynamic width mapping based on label length
    // Home (20%), Food (20%), Cart (20%), Grocery (28%), Wallet (26%)
    const widthMap = ["20.5%", "20.5%", "20.5%", "28%", "25.5%"];
    const activeWidth = parseFloat(widthMap[activeIndex] || "20");
    
    // Center the wider pill in its 20% slot
    const pillCenterOffset = (activeWidth - 20) / 2;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex flex-col items-center pointer-events-none px-4">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-[460px] pointer-events-auto relative p-1.5 border border-white/40 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.1)] bg-white/70 backdrop-blur-[16px] saturate-[140%]"
                style={{ borderRadius: "40px", willChange: "transform" }}
            >
                {/* Fixed Grid Container (Zero Layout Shifting) */}
                <div className="flex items-center relative h-[48px]">
                    {/* GPU-Accelerated Dynamic Silk Pill Indicator (v5.2) */}
                    <motion.div
                        className="absolute top-0 bottom-0 bg-slate-900 rounded-full shadow-lg shadow-slate-900/40 z-0"
                        initial={false}
                        animate={{ 
                            left: `${(activeIndex * 20) - pillCenterOffset}%`,
                            width: `${activeWidth}%`
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 450, 
                            damping: 38,
                            mass: 0.9
                        }}
                    >
                        <div className="w-full h-full rounded-full ring-4 ring-white/10" />
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
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default memo(BottomNav);
