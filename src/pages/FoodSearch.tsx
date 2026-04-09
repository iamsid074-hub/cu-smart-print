import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Plus, CheckCircle2, ChevronDown, ChevronUp,
  Leaf, Star, Clock,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { shops } from "@/config/shopMenus";
import { getPremiumImage } from "@/data/foodData";

// ── Per-shop accent colors ─────────────────────────────────────────────────
const SHOP_ACCENTS: Record<string, { from: string; to: string; light: string; dot: string }> = {
  "chatori-chai-kulcha": { from: "#f97316", to: "#ef4444", light: "#fff7ed", dot: "#f97316" },
  "insta-food":          { from: "#6366f1", to: "#8b5cf6", light: "#f5f3ff", dot: "#6366f1" },
  "parantha-house":      { from: "#10b981", to: "#059669", light: "#f0fdf4", dot: "#10b981" },
  "punjabi-rasoi":       { from: "#ec4899", to: "#db2777", light: "#fdf2f8", dot: "#ec4899" },
  "flavour-factory":     { from: "#f59e0b", to: "#d97706", light: "#fffbeb", dot: "#f59e0b" },
  "catch-up-cafe":       { from: "#14b8a6", to: "#0d9488", light: "#f0fdfa", dot: "#14b8a6" },
};

const getAccent = (id: string) =>
  SHOP_ACCENTS[id] ?? { from: "#64748b", to: "#475569", light: "#f8fafc", dot: "#64748b" };

// ── Simple text search ─────────────────────────────────────────────────────
function matchesQuery(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

// ── MenuItem Row ──────────────────────────────────────────────────────────
const MenuItemRow = ({
  item, shopId, shopName, category, addedIds, onAdd,
}: {
  item: any; shopId: string; shopName: string; category: string;
  addedIds: Set<string>; onAdd: (item: any) => void;
}) => {
  const id      = `${shopId}-${item.name}`;
  const isAdded = addedIds.has(id);
  const img     = item.image ?? getPremiumImage(item.name, category);
  const accent  = getAccent(shopId);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-black/[0.04] last:border-0">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <img src={img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#1D1D1F] leading-tight truncate">{item.name}</p>
        <p className="text-[11px] text-[#8E8E93] mt-0.5">{category}</p>
        <p className="text-[15px] font-black text-[#1D1D1F] mt-1">₹{item.price}</p>
      </div>

      {/* Add button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAdd({ ...item, id, shopName, category })}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: isAdded
            ? "#34C759"
            : `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          boxShadow: isAdded
            ? "0 4px 12px rgba(52,199,89,0.3)"
            : `0 4px 12px ${accent.from}40`,
        }}
      >
        {isAdded
          ? <CheckCircle2 className="w-4 h-4 text-white" />
          : <Plus className="w-4 h-4 text-white stroke-[2.5]" />
        }
      </button>
    </div>
  );
};

// ── Shop Card ──────────────────────────────────────────────────────────────
const ShopCard = ({
  shop, searchQuery, addedIds, onAdd,
}: {
  shop: any; searchQuery: string; addedIds: Set<string>; onAdd: (item: any) => void;
}) => {
  const [expanded, setExpanded] = useState(!searchQuery);
  const accent = getAccent(shop.id);

  // Flatten items with search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return shop.categories;
    return shop.categories
      .map((cat: any) => ({
        ...cat,
        items: cat.items.filter((item: any) =>
          matchesQuery(item.name, searchQuery) ||
          matchesQuery(cat.category, searchQuery)
        ),
      }))
      .filter((cat: any) => cat.items.length > 0);
  }, [shop.categories, searchQuery]);

  const totalItems = filteredCategories.reduce(
    (acc: number, c: any) => acc + c.items.length, 0
  );

  // Auto-expand when searching
  useEffect(() => {
    if (searchQuery) setExpanded(true);
    else setExpanded(false);
  }, [searchQuery]);

  if (searchQuery && totalItems === 0) return null;

  // Hero image — take first item with an image or use generic
  const heroImg =
    shop.categories.flatMap((c: any) => c.items).find((i: any) => i.image)?.image ??
    getPremiumImage(shop.name, "all");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-3xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-black/[0.04]"
    >
      {/* ── Shop Header (always visible) ── */}
      <button
        className="w-full text-left"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Hero banner */}
        <div className="relative h-[100px] overflow-hidden">
          <img
            src={heroImg}
            alt={shop.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${accent.from}dd 0%, ${accent.to}99 60%, transparent 100%)`,
            }}
          />
          {/* Shop name on banner */}
          <div className="absolute inset-0 flex items-center px-5 gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {shop.veg && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider">
                    <Leaf className="w-2.5 h-2.5" /> Pure Veg
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-black text-white leading-tight drop-shadow-sm">
                {shop.name}
              </h2>
              <p className="text-[11px] text-white/80 mt-0.5">{shop.tag}</p>
            </div>

            {/* Expand toggle */}
            <div
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
            >
              {expanded
                ? <ChevronUp className="w-4 h-4 text-white" />
                : <ChevronDown className="w-4 h-4 text-white" />
              }
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-black/[0.05]">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[12px] font-bold text-[#1D1D1F]">4.{Math.floor(3 + (shop.id.length % 6))}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span className="text-[12px] font-medium text-[#8E8E93]">15–25 min</span>
          </div>
          <div className="ml-auto">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: accent.light, color: accent.from }}
            >
              {totalItems} items
            </span>
          </div>
        </div>
      </button>

      {/* ── Menu Sections (collapsible) ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {filteredCategories.map((cat: any) => (
              <div key={cat.category} className="px-4 pt-3 pb-0">
                {/* Category label */}
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: accent.dot }}
                  />
                  <span
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: accent.from }}
                  >
                    {cat.category}
                  </span>
                </div>

                {/* Items */}
                {cat.items.map((item: any) => (
                  <MenuItemRow
                    key={item.name}
                    item={item}
                    shopId={shop.id}
                    shopName={shop.name}
                    category={cat.category}
                    addedIds={addedIds}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            ))}
            <div className="h-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export default function FoodSearch() {
  const navigate  = useNavigate();
  const { addItem, items } = useCart();
  const [searchQuery, setSearchQuery]   = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const addedIds = useMemo(
    () => new Set(items.map((i) => String(i.id))),
    [items]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 220);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleAdd = useCallback((item: any) => {
    if (!addedIds.has(String(item.id))) {
      addItem({
        id: String(item.id),
        title: item.name,
        price: item.price,
        image: item.image ?? getPremiumImage(item.name, item.category),
        category: "food",
      });
      toast.success(`${item.name} added!`);
    } else {
      navigate("/cart");
    }
  }, [addedIds, addItem, navigate]);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F5F5F7" }}>
      {/* ── Sticky Search Header ── */}
      <div className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/5 pt-14 pb-3 px-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F2F2F7] flex items-center justify-center flex-shrink-0"
          >
            <span className="text-[#1D1D1F] text-lg leading-none mb-0.5">‹</span>
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any dish or shop…"
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-[#F2F2F7] text-[14px] font-medium text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
            />
            {searchQuery && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8E8E93] flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-line */}
        <div className="max-w-xl mx-auto mt-2 px-1">
          <p className="text-[12px] text-[#8E8E93] font-medium">
            {debouncedQuery
              ? `Searching across all campus shops…`
              : `${shops.length} hostel shops · Tap a shop to browse menu`}
          </p>
        </div>
      </div>

      {/* ── Shop Cards ── */}
      <div className="max-w-xl mx-auto px-4 pt-4 flex flex-col gap-4">
        {shops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            searchQuery={debouncedQuery}
            addedIds={addedIds}
            onAdd={handleAdd}
          />
        ))}
      </div>
    </div>
  );
}
