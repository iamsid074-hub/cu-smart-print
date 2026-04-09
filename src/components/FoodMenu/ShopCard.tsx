import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Leaf, Star, Clock, Plus, CheckCircle2,
} from "lucide-react";
import { getPremiumImage } from "@/data/foodData";
import { useCart } from "@/contexts/CartContext";

// ── Dedicated shop banner images (AI-generated, one per shop) ─────────────
const SHOP_IMAGES: Record<string, string> = {
  "chatori-chai-kulcha": "/shops/chatori-chai-kulcha.png",
  "insta-food":          "/shops/insta-food.png",
  "parantha-house":      "/shops/parantha-house.png",
  "punjabi-rasoi":       "/shops/punjabi-rasoi.png",
  "catch-up-cafe":       "/shops/catch-up-cafe.png",
  "flavour-factory":     "/shops/flavour-factory.png",
  "vasano-fast-food":    "/shops/vasano-fast-food.png",
  "chatori-chaat":       "/shops/chatori-chaat.png",
  "rock-in-roll":        "/shops/rock-in-roll.png",
  "food-castle":         "/shops/food-castle.png",
  "eat-and-smile":       "/shops/eat-and-smile.png",
  "zaika":               "/shops/zaika.png",
  "bakerz-hub":          "/shops/bakerz-hub.png",
  "food-junction":       "/shops/food-junction.png",
  "king-cafe":           "/shops/king-cafe.png",
  "handi-biryani":       "/shops/handi-biryani.png",
  "barkat-food":         "/shops/barkat-food.png",
};

// ── Per-shop accent palette ────────────────────────────────────────────────
const ACCENTS: Record<string, { grad: string; light: string; dot: string; text: string }> = {
  "chatori-chai-kulcha": { grad: "linear-gradient(135deg,#f97316,#ef4444)", light: "#fff7ed", dot: "#f97316", text: "#c2410c" },
  "insta-food":          { grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", light: "#f5f3ff", dot: "#6366f1", text: "#4338ca" },
  "parantha-house":      { grad: "linear-gradient(135deg,#10b981,#059669)", light: "#f0fdf4", dot: "#10b981", text: "#065f46" },
  "punjabi-rasoi":       { grad: "linear-gradient(135deg,#ec4899,#db2777)", light: "#fdf2f8", dot: "#ec4899", text: "#9d174d" },
  "flavour-factory":     { grad: "linear-gradient(135deg,#f59e0b,#d97706)", light: "#fffbeb", dot: "#f59e0b", text: "#92400e" },
  "catch-up-cafe":       { grad: "linear-gradient(135deg,#14b8a6,#0d9488)", light: "#f0fdfa", dot: "#14b8a6", text: "#134e4a" },
};
const getAccent = (id: string) =>
  ACCENTS[id] ?? { grad: "linear-gradient(135deg,#64748b,#475569)", light: "#f8fafc", dot: "#64748b", text: "#334155" };

interface ShopItem     { name: string; price: number; image?: string }
interface MenuCategory { category: string; items: ShopItem[] }
interface Shop         { id: string; name: string; tag: string; veg?: boolean; categories: MenuCategory[] }

interface Props {
  shop: Shop;
  isExpanded: boolean;
  onToggle: (id: string | null) => void;
  expandedMenuCat: string | null;
  onToggleCategory: (cat: string | null) => void;
  onAddItem: (item: any) => void;
}

export const ShopCard = memo(({
  shop, isExpanded, onToggle, expandedMenuCat, onToggleCategory, onAddItem,
}: Props) => {
  const accent   = getAccent(shop.id);
  const { items: cartItems } = useCart();
  const cartIds  = useMemo(() => new Set(cartItems.map((i) => String(i.id))), [cartItems]);

  // Use dedicated shop image, fallback to first item image or generic
  const heroImg = SHOP_IMAGES[shop.id]
    ?? shop.categories.flatMap((c) => c.items).find((i) => i.image)?.image
    ?? getPremiumImage(shop.name, "all");

  const totalItems = shop.categories.reduce((a, c) => a + c.items.length, 0);
  const rating     = (4.1 + (shop.id.length % 6) * 0.1).toFixed(1);

  return (
    <div
      className="rounded-3xl overflow-hidden bg-white border border-black/[0.05]"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      {/* ── Hero tap area ── */}
      <button
        className="w-full text-left focus:outline-none"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onToggle(isExpanded ? null : shop.id)}
      >
        {/* Banner */}
        <div className="relative h-[96px] overflow-hidden">
          <img src={heroImg} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />

          {/* Clean premium gradient — dark on left fading right, subtle top vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.10) 100%),
                linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%)
              `,
            }}
          />

          {/* Shop name */}
          <div className="absolute inset-0 flex items-center px-4 gap-3">
            <div className="flex-1 min-w-0">
              {shop.veg && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider mb-1">
                  <Leaf className="w-2.5 h-2.5" /> Pure Veg
                </span>
              )}
              <h3 className="text-[17px] font-black text-white leading-tight drop-shadow-sm truncate">
                {shop.name}
              </h3>
              <p className="text-[11px] text-white/75 mt-0.5">{shop.tag}</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {isExpanded
                ? <ChevronUp  className="w-4 h-4 text-white" />
                : <ChevronDown className="w-4 h-4 text-white" />}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-black/[0.05]">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[12px] font-bold text-[#1D1D1F]">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#8E8E93]" />
            <span className="text-[11px] text-[#8E8E93] font-medium">15–25 min</span>
          </div>
          <div className="ml-auto">
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: accent.light, color: accent.text }}
            >
              {totalItems} items
            </span>
          </div>
        </div>
      </button>

      {/* ── Expanded menu ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {/* Category pill scrollbar */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-3 pb-2">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onToggleCategory(null)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all"
                style={
                  !expandedMenuCat
                    ? { background: accent.dot, color: "#fff", borderColor: accent.dot }
                    : { background: "#f5f5f7", color: "#8E8E93", borderColor: "transparent" }
                }
              >
                All
              </button>
              {shop.categories.map((cat) => {
                const active = expandedMenuCat === cat.category;
                return (
                  <button
                    key={cat.category}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onToggleCategory(active ? null : cat.category)}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all"
                    style={
                      active
                        ? { background: accent.dot, color: "#fff", borderColor: accent.dot }
                        : { background: "#f5f5f7", color: "#8E8E93", borderColor: "transparent" }
                    }
                  >
                    {cat.category}
                  </button>
                );
              })}
            </div>

            {/* Items */}
            <div className="px-4 pb-4">
              {shop.categories
                .filter((cat) => !expandedMenuCat || cat.category === expandedMenuCat)
                .map((cat) => (
                  <div key={cat.category} className="mb-1 mt-2">
                    {/* Category label */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent.dot }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent.text }}>
                        {cat.category}
                      </span>
                    </div>

                    {cat.items.map((item, idx) => {
                      const id      = `${shop.id}-${cat.category}-${idx}`;
                      const isAdded = cartIds.has(id);
                      const img     = item.image ?? getPremiumImage(item.name, cat.category);

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 py-2.5 border-b border-black/[0.04] last:border-0"
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>

                          {/* Name + price */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1D1D1F] leading-tight truncate">{item.name}</p>
                            <p className="text-[14px] font-black text-[#1D1D1F] mt-0.5">₹{item.price}</p>
                          </div>

                          {/* Add btn */}
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              onAddItem({
                                id,
                                title: `${item.name} (${shop.name})`,
                                price: item.price,
                                image: img,
                                category: "shops",
                              })
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                            style={{
                              background: isAdded ? "#34C759" : accent.grad,
                              boxShadow: isAdded
                                ? "0 4px 10px rgba(52,199,89,0.3)"
                                : `0 4px 10px ${accent.dot}40`,
                            }}
                          >
                            {isAdded
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              : <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ShopCard.displayName = "ShopCard";
