import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ to, icon: Icon, label, isActive, isCart = false, cartCount = 0 }: any) => {
    return (
        <Link 
            to={to} 
            className="relative flex items-center justify-center py-2 transition-all duration-300 pointer-events-auto"
            style={{ flex: isActive ? '1.8' : '1' }}
        >
            {/* Silk Morphing Background */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        layoutId="silk-pill"
                        className="absolute inset-x-1 inset-y-1.5 bg-slate-900 rounded-full shadow-2xl shadow-slate-900/40 z-0 ring-4 ring-white/10"
                        transition={{ 
                            type: "spring", 
                            stiffness: 380, 
                            damping: 30,
                            mass: 1
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Content Container */}
            <motion.div
                layout
                animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'
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
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap pt-0.5"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Integrated Cart Badge */}
                {isCart && cartCount > 0 && (
                    <AnimatePresence>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`absolute -top-1 -right-1 bg-brand text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center ring-2 shadow-lg ${isActive ? 'ring-slate-900' : 'ring-white'}`}
                        >
                            {cartCount > 9 ? '9+' : cartCount}
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </Link>
    );
};

export default function BottomNav() {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();
    const { user } = useAuth();

    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reset-password' || location.pathname.startsWith('/admin')) {
        return null;
    }

    const isCartActive = location.pathname === '/cart';

    const navItems = [
        { to: "/home", icon: Home, label: "Home" },
        { to: "/food", icon: Utensils, label: "Food" },
        { to: "/cart", icon: ShoppingCart, label: "Cart", isCart: true },
        { to: "/grocery", icon: ShoppingBag, label: "Grocery" },
        { to: "/wallet", icon: Wallet, label: "Wallet" }
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex flex-col items-center pointer-events-none px-4 sm:px-6">
            {/* Main Silk Morphing Dock */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                className="w-full max-w-[440px] pointer-events-auto p-1 border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] bg-white/75 backdrop-blur-[32px] saturate-[200%]"
                style={{ borderRadius: "40px" }}
            >
                <div className="flex items-center justify-between gap-0.5">
                    {navItems.map((item) => {
                        const isActive = item.to === "/cart" ? isCartActive : location.pathname.startsWith(item.to);
                        return (
                            <NavItem 
                                key={item.to}
                                to={item.to} 
                                icon={item.icon} 
                                label={item.label} 
                                isActive={isActive}
                                isCart={item.isCart}
                                cartCount={cartCount}
                            />
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
