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
        <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-neon-pink transition-all duration-200 hover:scale-110">
          <Heart className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative overflow-hidden h-44">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
              whileTap={{ scale: 0.9 }}
              className="px-3 py-1.5 rounded-xl bg-gradient-fire text-white text-xs font-semibold shadow-neon-fire hover:shadow-lg transition-all duration-200"
            >
              Buy
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
