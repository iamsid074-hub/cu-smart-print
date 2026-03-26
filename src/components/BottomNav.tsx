import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ to, icon: Icon, label, isActive }: any) => {
    return (
        <Link 
            to={to} 
            className="relative flex items-center justify-center py-1 sm:py-1.5 transition-all duration-300 pointer-events-auto"
            style={{ flex: isActive ? '1.8' : '1' }}
        >
            {/* Ambient Aura Glow */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        layoutId="nav-aura"
                        className="absolute inset-0 bg-brand/5 blur-xl rounded-full -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            {/* Bubble Pill Container */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 relative overflow-hidden ${
                    isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
                <Icon 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-105' : 'scale-100'}`} 
                />
                
                <AnimatePresence mode="popLayout" initial={false}>
                    {isActive && (
                        <motion.span 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap pt-0.5"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
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

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full flex flex-col items-center pointer-events-none px-4 sm:px-6">
            {/* Decentralized Floating Liquid Cart Button */}
            <motion.div
                layout
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-3 pointer-events-auto"
            >
                <Link to="/cart" className="relative block">
                    <motion.div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] transition-all duration-300 ${
                            isCartActive 
                            ? 'bg-slate-900 border-white text-white scale-110 shadow-slate-900/40' 
                            : 'bg-white border-slate-50 text-slate-800'
                        }`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ShoppingCart 
                            strokeWidth={2.5} 
                            className="w-6 h-6" 
                        />
                        
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.div 
                                    initial={{ scale: 0, y: 5 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0, y: 5 }}
                                    className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-black min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg"
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Optimized Stellar Aura Dock */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
                className="w-full max-w-[400px] pointer-events-auto px-2 py-1.5 border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    borderRadius: "40px",
                }}
            >
                <motion.div layout className="flex items-center justify-between gap-1">
                    <NavItem to="/home" icon={Home} label="Home" isActive={location.pathname === '/home'} />
                    <NavItem to="/food" icon={Utensils} label="Food" isActive={location.pathname.startsWith('/food')} />
                    <NavItem to="/grocery" icon={ShoppingBag} label="Grocery" isActive={location.pathname.startsWith('/grocery')} />
                    <NavItem to="/wallet" icon={Wallet} label="Wallet" isActive={location.pathname.startsWith('/wallet')} />
                </motion.div>
            </motion.div>
        </div>
    );
}
