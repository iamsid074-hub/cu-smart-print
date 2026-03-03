import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, BadgeCheck, ShoppingCart } from "lucide-react";
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
  New: "bg-gradient-ocean text-white",
  "Like New": "bg-gradient-fire text-white",
  Good: "text-neon-yellow border border-yellow-500/30 bg-yellow-500/10",
  Fair: "text-muted-foreground border border-white/10 bg-white/5",
};

export default function ProductCard({
  id,
  image,
  title,
  price,
  originalPrice,
  condition,
  category,
  rating = 4.5,
  seller = "Student",
  badge,
  delay = 0,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Use product category for a smart fallback (never shows a camera image for a calculator)
  const fallbackSrc = (category && CATEGORY_FALLBACKS[category]) ?? DEFAULT_FALLBACK;
  const displaySrc = imgError ? fallbackSrc : (image || fallbackSrc);
  return (
    <Link to={`/product/${id}`} className="block flex-shrink-0 w-56 sm:w-64">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative glass rounded-2xl overflow-hidden group cursor-pointer h-full"
        style={{ boxShadow: "0 4px 24px hsl(240 20% 2% / 0.5)" }}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-fire text-white shadow-neon-fire">
            {badge}
          </div>
        )}

        {/* Wishlist */}
        <button className="premium-glass-button absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-neon-pink shadow-lg z-10 transition-transform">
          <Heart className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative overflow-hidden h-44 bg-white/5">
          {/* Skeleton shimmer while loading */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%' }} />
          )}
          <img
            src={displaySrc}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
          {/* Glow on hover */}
          <div className="absolute inset-0 bg-gradient-fire opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between h-[calc(100%-11rem)]">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{title}</h3>
            </div>

            {/* Condition */}
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${conditionColors[condition]}`}>
              {condition}
            </span>

            {/* Rating + Seller */}
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 text-neon-yellow fill-current" />
              <span className="text-xs text-muted-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground ml-1">• {seller}</span>
              <BadgeCheck className="w-3.5 h-3.5 text-neon-cyan ml-0.5" />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg text-neon-fire">₹{price.toLocaleString()}</span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through ml-2">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({ id, title, price, image, category: condition });
                toast({ title: `${title} added! 🛒` });
              }}
              whileTap={{ scale: 0.9 }}
              className="premium-glass-button px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg shadow-glass transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
