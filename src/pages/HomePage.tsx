import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { Flame, Sun, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'available')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const trendingProducts = products.filter(p => p.is_trending);
    const summerSaleProducts = products.filter(p => !p.is_trending).slice(0, 4); // Example selection

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">

            {/* Search & Hero Bar */}
            <div className="mb-12 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl -z-10 rounded-full h-32 top-1/2 -translate-y-1/2 w-3/4" />
                <div className="relative w-full max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40" size={24} />
                    <input
                        type="text"
                        placeholder="Search for books, electronics, hostel essentials..."
                        className="w-full bg-background/80 backdrop-blur-md border border-border shadow-xl rounded-full px-16 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                        Search
                    </button>
                </div>
            </div>

            {/* Summer Sale Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full glass-card bg-gradient-to-r from-orange-400 to-yellow-400 p-8 sm:p-12 mb-16 relative overflow-hidden text-white"
            >
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-2xl" />
                <h2 className="text-4xl sm:text-5xl font-black mb-4 flex items-center gap-3">
                    <Sun className="text-white fill-current" size={40} />
                    Summer Sale is Here!
                </h2>
                <p className="text-xl font-medium max-w-xl text-white/90">
                    Beat the heat with essential summer items at huge discounts. Exclusive for university students.
                </p>

                {summerSaleProducts.length > 0 && (
                    <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x">
                        {summerSaleProducts.map(product => (
                            <div key={product.id} className="min-w-[200px] snap-center bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
                                <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                                    <img src={product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold truncate">{product.title}</h3>
                                <p className="font-black text-xl">₹{product.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <>
                    {/* Trending Section */}
                    {trendingProducts.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <Flame size={28} className="text-primary" />
                                <h2 className="text-3xl font-black tracking-tight">Trending Now</h2>
                            </div>

                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            >
                                {trendingProducts.map(product => (
                                    <motion.div variants={item} key={product.id}>
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* Browse All Section */}
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-8">Browse Market</h2>
                        {products.length === 0 ? (
                            <div className="text-center py-12 glass-card text-foreground/60">
                                <p className="font-bold text-xl mb-2">Marketplace is empty!</p>
                                <p>Be the first to list an item on campus.</p>
                            </div>
                        ) : (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            >
                                {products.map((product) => (
                                    <motion.div variants={item} key={product.id}>
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
