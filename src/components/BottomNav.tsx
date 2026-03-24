import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ to, icon: Icon, label, isActive, asAvatar = false, user = null }: any) => {
    return (
        <Link to={to} className="flex-1 relative z-10 flex flex-col items-center justify-center py-1 outline-none user-select-none">
            <motion.div
                className="flex flex-col items-center justify-center gap-1 w-full relative"
                whileTap={{ scale: 0.85, y: 2 }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                <motion.div 
                   animate={isActive ? { y: -4, scale: 1.15 } : { y: 0, scale: 1 }} 
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {asAvatar ? (
                        <div className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors duration-300 ${isActive ? 'border-slate-800 bg-slate-100 shadow-md' : 'border-transparent bg-slate-200'}`}>
                            {user ? (
                                <Icon strokeWidth={2.5} className="w-4 h-4 text-slate-800" fill="currentColor" />
                            ) : (
                                <Icon strokeWidth={2.5} className="w-4 h-4 text-slate-500" />
                            )}
                        </div>
                    ) : (
                        <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${isActive ? 'text-slate-900 drop-shadow-md' : 'text-slate-500'}`} fill={isActive ? 'currentColor' : 'none'} />
                    )}
                </motion.div>
                
                <motion.span 
                    animate={isActive ? { opacity: 1 } : { opacity: 0.6 }}
                    className={`text-[9px] sm:text-[10px] font-semibold transition-colors duration-300 pointer-events-none select-none ${isActive ? 'text-slate-900' : 'text-slate-500'}`}
                >
                    {label}
                </motion.span>
                
                {/* Active Indicator Glow/Dot */}
                {isActive && (
                    <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.8)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
            </motion.div>
        </Link>
    );
};

export default function BottomNav() {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();
    const { user } = useAuth();

    // Hide on certain pages if needed, e.g., login
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reset-password' || location.pathname.startsWith('/admin')) {
        return null;
    }

    const isCartActive = location.pathname === '/cart';

    return (
        <motion.div
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 z-50 w-[94vw] sm:w-[92vw] max-w-[380px]"
        >
            {/* Global Liquid Blur Behind Entire Bar */}
            <div className="absolute inset-x-4 -inset-y-2 bg-[#1e293b]/40 rounded-full blur-2xl pointer-events-none" />

            <div
                className="flex items-center justify-between px-2 sm:px-3 py-2 relative border border-white/50"
                style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(40px) saturate(200%)",
                    WebkitBackdropFilter: "blur(40px) saturate(200%)",
                    borderRadius: 50,
                    boxShadow: "0 20px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)",
                }}
            >
                <NavItem to="/home" icon={Home} label="Home" isActive={location.pathname === '/home'} />
                <NavItem to="/browse" icon={Compass} label="Explore" isActive={location.pathname.startsWith('/browse')} />
                <NavItem to="/grocery" icon={ShoppingBag} label="Grocery" isActive={location.pathname.startsWith('/grocery')} />

                {/* Cart (Center elevated style wrapper) */}
                <div className="flex-shrink-0 relative -top-4 w-[60px] sm:w-[68px] h-[60px] sm:h-[68px] mx-1 sm:mx-2 flex justify-center items-center z-20">
                    {/* Liquid Blur Drop Shadow - Animates on Active */}
                    <motion.div 
                        animate={isCartActive ? { scale: 1.15, opacity: 0.6 } : { scale: 0.9, opacity: 0.3 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-slate-900/60 rounded-full blur-[14px] transform translate-y-3 mix-blend-multiply pointer-events-none" 
                    />

                    {/* Actual Button */}
                    <Link to="/cart" className="relative flex items-center justify-center w-full h-full text-decoration-none focus:outline-none outline-none">
                        <motion.div 
                            className={`rounded-full w-full h-full flex items-center justify-center border-4 border-slate-50 text-white overflow-hidden ${isCartActive ? 'bg-slate-800 ring-2 ring-slate-200' : 'bg-[#111827]'}`}
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ y: -4, scale: 1.05 }}
                            animate={isCartActive ? { y: -6, boxShadow: "0 15px 35px -5px rgba(17,24,39,0.8), inset 0 2px 8px rgba(255,255,255,0.2)" } : { y: 0, boxShadow: "0 8px 20px rgba(17,24,39,0.4)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                            <ShoppingCart strokeWidth={2.5} className="w-5 h-5 sm:w-[24px] sm:h-[24px] relative z-10" />
                            
                            {/* Inner glow effect when active */}
                            <AnimatePresence>
                                {isCartActive && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        exit={{ opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 20 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                        className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[9px] sm:text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center z-20 shadow-lg ring-[2.5px] ring-[#111827]"
                                    >
                                        {/* Pulsing Badge Halo */}
                                        <motion.span 
                                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} 
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                            className="absolute inset-0 bg-red-500 rounded-full -z-10 blur-[2px]"
                                        />
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </Link>
                </div>

                <NavItem to="/food" icon={Utensils} label="Food" isActive={location.pathname.startsWith('/food')} />
                <NavItem to="/list" icon={PlusCircle} label="Sell" isActive={location.pathname.startsWith('/list')} />
                <NavItem to="/profile" icon={User} label="Profile" isActive={location.pathname.startsWith('/profile')} asAvatar={true} user={user} />
            </div>
        </motion.div>
    );
}
