import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function BottomNav() {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();
    const { user } = useAuth();

    // Hide on certain pages if needed, e.g., login
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reset-password' || location.pathname.startsWith('/admin')) {
        return null;
    }

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
                {/* Home */}
                <Link to="/home" className="flex flex-col items-center justify-center gap-1 text-decoration-none py-1 flex-1 relative z-10">
                    <Home strokeWidth={2.5} className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${location.pathname === '/home' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} fill={location.pathname === '/home' ? 'currentColor' : 'none'} />
                    <span className={`text-[9px] sm:text-[10px] font-semibold ${location.pathname === '/home' ? 'text-slate-900' : 'text-slate-400'}`}>Home</span>
                </Link>

                {/* Explore */}
                <Link to="/browse" className="flex flex-col items-center justify-center gap-1 text-decoration-none py-1 flex-1 relative z-10">
                    <Compass strokeWidth={2.5} className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${location.pathname.startsWith('/browse') ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} />
                    <span className={`text-[9px] sm:text-[10px] font-semibold ${location.pathname.startsWith('/browse') ? 'text-slate-900' : 'text-slate-400'}`}>Explore</span>
                </Link>

                {/* Cart (Center elevated style wrapper) */}
                <div className="flex-shrink-0 relative -top-4 w-[60px] sm:w-[68px] h-[60px] sm:h-[68px] mx-1 sm:mx-2 flex justify-center items-center z-20">
                    {/* Liquid Blur Drop Shadow */}
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full blur-md transform translate-y-2 scale-90 mix-blend-multiply" />

                    {/* Actual Button */}
                    <Link to="/cart" className="relative flex items-center justify-center w-full h-full text-decoration-none hover:scale-105 active:scale-95 transition-transform duration-200">
                        <div className="bg-[#111827] rounded-full w-full h-full flex items-center justify-center shadow-[0_8px_20px_rgba(17,24,39,0.5)] border-[4px] border-white text-white">
                            <ShoppingCart strokeWidth={2.5} className="w-5 h-5 sm:w-[24px] sm:h-[24px]" />
                            {cartCount > 0 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#111827]">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Food Section */}
                <Link to="/food" className="flex flex-col items-center justify-center gap-1 text-decoration-none py-1 flex-1">
                    <Utensils strokeWidth={2.5} className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${location.pathname.startsWith('/food') ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} />
                    <span className={`text-[9px] sm:text-[10px] font-semibold ${location.pathname.startsWith('/food') ? 'text-slate-900' : 'text-slate-400'}`}>Food</span>
                </Link>

                {/* Profile */}
                <Link to="/profile" className="flex flex-col items-center justify-center gap-1 text-decoration-none py-1 flex-1">
                    <div className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {user ? (
                            <User strokeWidth={2} className="w-4 h-4 text-slate-600" fill="currentColor" />
                        ) : (
                            <User strokeWidth={2} className="w-4 h-4 text-slate-600" />
                        )}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-semibold ${location.pathname.startsWith('/profile') ? 'text-slate-900' : 'text-slate-400'}`}>Profile</span>
                </Link>
            </div>
        </motion.div>
    );
}
