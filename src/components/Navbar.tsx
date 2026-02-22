import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, ShoppingBag, MessageCircle, ShoppingCart, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const [isDark, setIsDark] = useState(true); // Default to dark for Gen-Z vibe
    const { user, signOut } = useAuth();

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="fixed top-0 left-0 right-0 h-20 z-50 px-6 sm:px-12 flex items-center justify-between glass-card border-b-0 rounded-none bg-background/50"
        >
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                    <ShoppingBag size={20} className="drop-shadow-sm" />
                </div>
                <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    CU Bazzar
                </span>
            </Link>

            <div className="flex items-center gap-6">
                <Link to="/home" className="hidden sm:block font-medium hover:text-primary transition-colors">
                    Browse
                </Link>
                <Link to="/help" className="hidden sm:block font-medium hover:text-primary transition-colors">
                    Help
                </Link>
                <Link to="/messages" className="hidden sm:block p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-foreground">
                    <MessageCircle size={20} />
                </Link>
                <Link to="/checkout" className="hidden sm:block p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-foreground">
                    <ShoppingCart size={20} />
                </Link>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                    {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold overflow-hidden border border-primary/50 hover:scale-105 transition-transform">
                            {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || <User size={18} />}
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 rounded-full bg-foreground text-background font-bold shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Sign In
                        </motion.button>
                    </Link>
                )}
            </div>
        </motion.nav>
    );
}
