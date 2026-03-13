import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, BadgeCheck, ShoppingCart, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

// Category-aware fallback images (so a calculator NEVER shows a camera placeholder)
const CATEGORY_FALLBACKS: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",  // circuit board
  Books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",  // books
  Fashion: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",  // clothes
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",  // sports
  Audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",  // headphones
  Camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",  // camera
  Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",  // sofa
  Kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",  // kitchen
  Stationery: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80",  // pens/notebooks
  Other: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",  // generic product
};
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: "New" | "Like New" | "Good" | "Fair";
  category?: string;   // e.g. "Electronics", "Books" — used for smart fallback image
  rating?: number;
  seller?: string;
  badge?: string;
  delay?: number;
}

const conditionColors: Record<string, string> = {
  New: "bg-emerald-100 text-emerald-700",
  "Like New": "bg-brand-50 text-brand",
  Good: "bg-amber-100 text-amber-700",
  Fair: "bg-slate-100 text-slate-600",
};

export default function ProductCard({
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
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Favourites (localStorage) ──
  const favKey = `cubazzar_fav_${id}`;
  const [isFav, setIsFav] = useState(() => localStorage.getItem(favKey) === '1');

  const handleFav = (e: React.MouseEvent) => {
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
  };

  // ── Share (Web Share API → clipboard fallback) ──
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${id}`;
    const text = `Check out "${title}" for ₹${price} on CU Bazzar!`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {/* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share it with friends.' });
    }
  };

  // Use product category for a smart fallback (never shows a camera image for a calculator)
  const fallbackSrc = (category && CATEGORY_FALLBACKS[category]) ?? DEFAULT_FALLBACK;
  const displaySrc = imgError ? fallbackSrc : (image || fallbackSrc);
  return (
    <Link to={`/product/${id}`} className="block w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative flex flex-col bg-[#faf5f8] rounded-2xl overflow-hidden group cursor-pointer h-full border-2 border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-[#e0b1cb] transition-all duration-300"
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#231942] text-white shadow-sm uppercase tracking-wider">
            {badge}
          </div>
        )}

        {/* Wishlist + Share */}
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          <motion.button
            onClick={handleFav}
            whileTap={{ scale: 0.75 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${isFav
              ? 'bg-pink-50 text-pink-500 shadow-pink-100'
              : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-pink-500 hover:bg-white'
              }`}
          >
            <Heart className={`w-4 h-4 transition-all ${isFav ? 'fill-current scale-110' : ''}`} />
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.75 }}
            className="bg-white/80 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-accent hover:bg-white shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden shrink-0 h-40 sm:h-48 bg-slate-100/80">
          {/* Skeleton shimmer while loading */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%' }} />
          )}
          <img
            src={displaySrc}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm text-slate-900 leading-tight line-clamp-2">{title}</h3>
            </div>

            {/* Condition */}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold mb-3 ${conditionColors[condition]}`}>
              {condition}
            </span>

            {/* Seller */}
            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs text-slate-500 font-medium">{seller}</span>
              <BadgeCheck className="w-3.5 h-3.5 text-brand-accent ml-0.5" />
              {rating && (
                <>
                  <Star className="w-3 h-3 text-amber-400 fill-current ml-1" />
                  <span className="text-xs text-slate-500 font-medium">{rating}</span>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-extrabold text-lg text-slate-900">₹{price.toLocaleString()}</span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through ml-2">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({ id, title, price, image, category: condition });
                toast({ title: `${title} added to cart` });
              }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-200 hover:border-emerald-500"
            >
              <ShoppingCart className="w-4 h-4 sm:hidden" />
              <div className="hidden sm:flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Cart</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
