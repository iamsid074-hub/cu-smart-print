import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Bookmark, User } from "lucide-react";
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
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[360px]"
        >
            <div
                className="flex items-center justify-between px-2 py-2"
                style={{
                    background: "rgba(248, 250, 252, 0.95)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    borderRadius: 50,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                }}
            >
                {/* Home */}
                <Link to="/home" className="flex flex-col items-center gap-1 text-decoration-none px-2 py-1 flex-1">
                    <Home strokeWidth={2.5} className={`w-[22px] h-[22px] ${location.pathname === '/home' ? 'text-slate-900' : 'text-slate-500'}`} fill={location.pathname === '/home' ? 'currentColor' : 'none'} />
                    <span className={`text-[10px] font-semibold ${location.pathname === '/home' ? 'text-slate-900' : 'text-slate-400'}`}>Home</span>
                </Link>

                {/* Explore */}
                <Link to="/browse" className="flex flex-col items-center gap-1 text-decoration-none px-2 py-1 flex-1">
                    <Compass strokeWidth={2.5} className={`w-[22px] h-[22px] ${location.pathname.startsWith('/browse') ? 'text-slate-900' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-semibold ${location.pathname.startsWith('/browse') ? 'text-slate-900' : 'text-slate-400'}`}>Explore</span>
                </Link>

                {/* Cart (Center elevated style) */}
                <Link to="/cart" className="flex flex-col items-center justify-center text-decoration-none px-1 flex-shrink-0">
                    <div className="relative bg-slate-50 rounded-full py-2.5 px-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100">
                        <ShoppingCart strokeWidth={2} className="w-[22px] h-[22px] text-slate-900" />
                        {cartCount > 0 && (
                            <div className="absolute top-1 right-3.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-slate-50">
                                {cartCount > 9 ? '9+' : cartCount}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Saved (Bookmarks/Tracking) */}
                <Link to="/tracking" className="flex flex-col items-center gap-1 text-decoration-none px-2 py-1 flex-1">
                    <Bookmark strokeWidth={2.5} className={`w-[22px] h-[22px] ${location.pathname.startsWith('/tracking') ? 'text-slate-900' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-semibold ${location.pathname.startsWith('/tracking') ? 'text-slate-900' : 'text-slate-400'}`}>Saved</span>
                </Link>

                {/* Profile */}
                <Link to="/profile" className="flex flex-col items-center gap-1 text-decoration-none px-2 py-1 flex-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {user ? (
                            <User strokeWidth={2} className="w-4 h-4 text-slate-600" fill="currentColor" />
                        ) : (
                            <User strokeWidth={2} className="w-4 h-4 text-slate-600" />
                        )}
                    </div>
                    <span className={`text-[10px] font-semibold ${location.pathname.startsWith('/profile') ? 'text-slate-900' : 'text-slate-400'}`}>Profile</span>
                </Link>
            </div>
        </motion.div>
    );
}
