import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ to, icon: Icon, label, isActive, asAvatar = false, user = null }: any) => {
    return (
        <Link to={to} className="flex-1 relative z-10 flex flex-col items-center justify-center py-2 outline-none select-none">
            <motion.div
                className="flex flex-col items-center justify-center gap-1 w-full relative"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
                <div 
                   className={`transition-all duration-300 transform ${isActive ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100'}`}
                >
                    {asAvatar ? (
                        <div className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors duration-300 ${isActive ? 'border-slate-800 bg-slate-100' : 'border-slate-200/50 bg-slate-100'}`}>
                            {user ? (
                                <User strokeWidth={2.5} className={`w-4 h-4 transition-colors ${isActive ? 'text-slate-800' : 'text-slate-500'}`} />
                            ) : (
                                <User strokeWidth={2.5} className="w-4 h-4 text-slate-400" />
                            )}
                        </div>
                    ) : (
                        <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    )}
                </div>
                
                <span 
                    className={`text-[10px] sm:text-[11px] font-bold tracking-tight transition-all duration-300 pointer-events-none select-none transform ${isActive ? 'text-slate-900 opacity-100 -translate-y-0.5' : 'text-slate-400 opacity-70 translate-y-0'}`}
                >
                    {label}
                </span>
                
                {/* Micro Active Dot - CSS Animated */}
                <div 
                    className={`absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 transition-all duration-300 transform ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
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
            {/* Global Container */}
            <div
                className="flex items-center justify-between px-1 sm:px-2 py-1.5 relative border border-white/60"
                style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px) saturate(150%)",
                    WebkitBackdropFilter: "blur(20px) saturate(150%)",
                    borderRadius: 50,
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)", 
                }}
            >
                <NavItem to="/home" icon={Home} label="Home" isActive={location.pathname === '/home'} />
                <NavItem to="/browse" icon={Compass} label="Explore" isActive={location.pathname.startsWith('/browse')} />
                <NavItem to="/grocery" icon={ShoppingBag} label="Grocery" isActive={location.pathname.startsWith('/grocery')} />

                {/* Cart (Center elevated style wrapper) */}
                <div className="flex-shrink-0 relative -top-5 w-[56px] sm:w-[64px] h-[56px] sm:h-[64px] mx-1 flex justify-center items-center z-20">
                    <div 
                        className={`absolute inset-[-8px] bg-slate-900/10 rounded-full mix-blend-multiply pointer-events-none transition-all duration-300 transform ${isCartActive ? 'opacity-30 scale-110' : 'opacity-10 scale-90'}`}
                        style={{ filter: 'blur(8px)' }}
                    />

                    {/* Actual Button */}
                    <Link to="/cart" className="relative flex items-center justify-center w-full h-full text-decoration-none focus:outline-none outline-none">
                        <motion.div 
                            className={`rounded-full w-full h-full flex items-center justify-center border-4 relative transition-all duration-300 transform ${isCartActive ? 'bg-slate-900 border-white text-white -translate-y-1 z-10 shadow-[0_10px_25px_rgba(0,0,0,0.4)]' : 'bg-slate-900 border-slate-50 text-slate-100 translate-y-0 shadow-[0_5px_15px_rgba(0,0,0,0.2)]'}`}
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <ShoppingCart strokeWidth={2.5} className="w-5 h-5 sm:w-[22px] sm:h-[22px] relative z-10" />
                            
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -30 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 30 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                        className="absolute top-0 right-0 bg-[#ef4444] text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center z-20 ring-2 ring-slate-900"
                                    >
                                        <motion.span 
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }} 
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                            className="absolute inset-0 bg-[#ef4444] rounded-full -z-10"
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
