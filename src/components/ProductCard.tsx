import { useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, BadgeCheck, ShoppingCart, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_FALLBACKS: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
  Books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  Fashion: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
  Audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  Camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  Kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  Stationery: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80",
  Other: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
};
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: "New" | "Like New" | "Good" | "Fair";
  category?: string;
  rating?: number;
  seller?: string;
  badge?: string;
  delay?: number;
}

const conditionColors: Record<string, string> = {
  New: "bg-[#34C759]/10 text-[#34C759]",
  "Like New": "bg-[#007AFF]/10 text-[#007AFF]",
  Good: "bg-[#FF9500]/10 text-[#FF9500]",
  Fair: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

const ProductCard = memo(({
  id,
  image,
  title,
  price,
  originalPrice,
  condition,
  category,
  rating,
  seller = "Student",
  badge,
  delay = 0,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const favKey = `cubazzar_fav_${id}`;
  const [isFav, setIsFav] = useState(() => localStorage.getItem(favKey) === '1');

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFav;
    setIsFav(next);
    if (next) {
      localStorage.setItem(favKey, '1');
      toast({ title: `${title} saved to favourites` });
    } else {
      localStorage.removeItem(favKey);
      toast({ title: `Removed from favourites` });
    }
  }, [id, isFav, title, toast, favKey]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${id}`;
    const text = `Check out "${title}" for â‚¹${price} on CU Bazzar!`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {/* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share it with friends.' });
    }
  }, [id, title, price, toast]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, image: image || '', category: condition });
    toast({ title: `${title} added to cart` });
  }, [id, title, price, image, condition, addItem, toast]);

  const fallbackSrc = (category && CATEGORY_FALLBACKS[category]) ?? DEFAULT_FALLBACK;
  const displaySrc = imgError ? fallbackSrc : (image || fallbackSrc);

  return (
    <Link to={`/product/${id}`} className="block w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: Math.min(delay, 0.1), ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col ios-glass rounded-[24px] overflow-hidden group cursor-pointer h-full border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 card-hover bg-white/40"
      >
        {badge && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1D1D1F] text-white shadow-sm uppercase tracking-wider">
            {badge}
          </div>
        )}

        <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={handleFav}
            whileTap={{ scale: 0.75 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${isFav
              ? 'bg-[#FF3B30]/10 text-[#FF3B30] backdrop-blur-md border border-[#FF3B30]/20'
              : 'bg-white/70 backdrop-blur-xl border border-white/60 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-white'
              }`}
          >
            <Heart className={`w-4 h-4 transition-all ${isFav ? 'fill-current scale-110' : ''}`} />
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.75 }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/70 backdrop-blur-xl border border-white/60 text-[#8E8E93] hover:text-[#007AFF] hover:bg-white shadow-sm transition-colors duration-300"
          >
            <Share2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        <div className="relative overflow-hidden shrink-0 h-44 sm:h-52 bg-[#F5F5F7]">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-black/5 to-transparent bg-[length:200%_100%]" />
          )}
          <img
            src={displaySrc}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            loading="lazy"
            decoding="async"
          />
        </div>

          <div className="p-4 flex flex-col flex-1">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-[15px] text-[#1D1D1F] leading-snug tracking-tight line-clamp-2">{title}</h3>
            </div>
            
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold mb-3 border border-current/20 ${conditionColors[condition]}`}>
              {condition}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-bold text-xl tracking-tight text-[#1D1D1F] truncate pr-2">â‚¹{price.toLocaleString()}</span>
            
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-[#007AFF] text-white rounded-full flex shrink-0 items-center justify-center shadow-md hover:bg-[#0066CC] transition-colors"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

export default ProductCard;
