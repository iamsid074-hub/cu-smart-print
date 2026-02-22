import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Watch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center px-6">
            <motion.div
                className="max-w-4xl mx-auto text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1.5 rounded-full glass-card border-primary/30 text-primary text-sm font-bold tracking-wide">
                    🚀 The Ultimate Campus Marketplace
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter"
                >
                    Buy, Sell, and Connect <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                        Instantly on Campus.
                    </span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                    CU Bazzar is exactly what you need. A safe, fast, and verified space for university students to exchange items. No outside scammers, no hidden fees, just easy campus life.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/home">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] transition-all flex items-center gap-2"
                        >
                            Start Exploring <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full glass-card font-bold text-lg hover:bg-foreground/5 transition-colors"
                        >
                            List an Item
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    variants={itemVariants}
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
                >
                    <div className="glass-card p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                        <p className="text-foreground/60 text-sm">In-app chat protects your phone number. Strict listing rules keep scammers out.</p>
                    </div>

                    <div className="glass-card p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Extra Fees</h3>
                        <p className="text-foreground/60 text-sm">Super low commission and FREE delivery for orders above 1000 Rs directly to your hostel.</p>
                    </div>

                    <div className="glass-card p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                            <Watch size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
                        <p className="text-foreground/60 text-sm">Know exactly when your item arrives with real-time delivery status tracking.</p>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
