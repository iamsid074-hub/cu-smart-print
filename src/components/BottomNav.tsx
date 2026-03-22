import { Link, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingCart, Utensils, User, ShoppingBag, PlusCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { to: "/home", icon: Home, label: "Home", match: (p: string) => p === "/home" },
    { to: "/browse", icon: Compass, label: "Explore", match: (p: string) => p.startsWith("/browse") },
    { to: "/grocery", icon: ShoppingBag, label: "Grocery", match: (p: string) => p.startsWith("/grocery") },
    null, // cart placeholder
    { to: "/food", icon: Utensils, label: "Food", match: (p: string) => p.startsWith("/food") },
    { to: "/list", icon: PlusCircle, label: "Sell", match: (p: string) => p.startsWith("/list") },
    { to: "/profile", icon: User, label: "Profile", match: (p: string) => p.startsWith("/profile") },
];

export default function BottomNav() {
    const location = useLocation();
    const { totalItems: cartCount } = useCart();
    const { user } = useAuth();

    if (
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/reset-password" ||
        location.pathname.startsWith("/admin")
    ) return null;

    return (
        <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-4 sm:bottom-5 left-1/2 z-50 w-[96vw] max-w-[420px]"
        >
            {/* Soft drop shadow glow */}
            <div className="absolute inset-x-6 bottom-0 h-8 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)' }} />

            <div
                className="relative flex items-center px-2 py-2"
                style={{
                    background: "linear-gradient(135deg, rgba(15,12,35,0.97) 0%, rgba(26,16,72,0.97) 100%)",
                    backdropFilter: "blur(30px) saturate(180%)",
                    WebkitBackdropFilter: "blur(30px) saturate(180%)",
                    borderRadius: 36,
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                {navItems.map((item, idx) => {
                    // Cart center button
                    if (item === null) {
                        const isCartActive = location.pathname === "/cart";
                        return (
                            <div key="cart" className="flex-shrink-0 relative flex justify-center items-center mx-1" style={{ width: 64, height: 64, marginTop: -18 }}>
                                {/* Outer glow ring */}
                                <div className="absolute inset-0 rounded-full opacity-60 blur-md"
                                    style={{ background: isCartActive ? 'radial-gradient(circle, rgba(99,102,241,0.8), transparent 70%)' : 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)' }} />

                                <Link
                                    to="/cart"
                                    className="relative flex items-center justify-center w-[58px] h-[58px] rounded-full text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                                    style={{
                                        background: isCartActive
                                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                            : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                                        boxShadow: isCartActive
                                            ? '0 0 0 3px rgba(99,102,241,0.4), 0 8px 24px rgba(99,102,241,0.5)'
                                            : '0 0 0 3px rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.4)',
                                        border: '2px solid rgba(255,255,255,0.12)',
                                    }}
                                >
                                    <ShoppingCart strokeWidth={2.2} className="w-6 h-6" />
                                    <AnimatePresence>
                                        {cartCount > 0 && (
                                            <motion.div
                                                key="badge"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black text-white px-1"
                                                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 2px 8px rgba(244,63,94,0.6)' }}
                                            >
                                                {cartCount > 9 ? "9+" : cartCount}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </div>
                        );
                    }

                    const isActive = item.match(location.pathname);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center justify-center gap-1 flex-1 py-1.5 relative group"
                        >
                            {/* Active indicator pill */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Icon wrapper */}
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
                                {isActive && (
                                    <div className="absolute inset-0 rounded-2xl blur-sm opacity-50"
                                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent)' }} />
                                )}
                                <item.icon
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={`w-[19px] h-[19px] relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}
                                    fill={isActive && (item.to === '/home') ? 'currentColor' : 'none'}
                                />
                            </div>

                            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${isActive ? 'text-white/90' : 'text-white/30 group-hover:text-white/50'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}
