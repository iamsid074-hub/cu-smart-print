import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import type { Database } from '../types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

export default function ProductCard({ product }: { product: ProductRow }) {
    // Use a fallback image if none provided
    const imgUrl = product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80';

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card overflow-hidden group relative flex flex-col cursor-pointer h-full"
        >
            <div className="relative aspect-square overflow-hidden bg-background">
                <img
                    src={imgUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 p-2 rounded-full glass-card hover:bg-primary/20 text-foreground/50 hover:text-primary transition-colors z-10">
                    <Heart size={18} />
                </div>

                {product.is_trending && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                        <Sparkles size={12} /> Trending
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                <div>
                    <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-secondary/10 text-secondary mb-1">
                        Free Delivery Eligible
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        ₹{product.price}
                    </span>
                    <button className="px-4 py-2 rounded-xl bg-foreground text-background font-bold text-sm shadow-md hover:bg-primary hover:text-white transition-all">
                        Buy Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
