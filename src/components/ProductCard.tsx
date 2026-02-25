import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, BadgeCheck } from "lucide-react";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: "New" | "Like New" | "Good" | "Fair";
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
  rating = 4.5,
  seller = "Student",
  badge,
  delay = 0,
}: ProductCardProps) {
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
        <div className="relative overflow-hidden h-44">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'; }}
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/product/${id}`; }}
              className="premium-glass-button px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg shadow-glass transition-colors"
            >
              Buy
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
