import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ShoppingBag,
  SlidersHorizontal,
  Package,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const categories = [
  { id: "All", label: "All" },
  { id: "Electronics", label: "Electronics" },
  { id: "Books", label: "Books" },
  { id: "Fashion", label: "Fashion" },
  { id: "Sports", label: "Sports" },
  { id: "Audio", label: "Audio" },
  { id: "Camera", label: "Camera" },
  { id: "Furniture", label: "Furniture" },
  { id: "Kitchen", label: "Kitchen" },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(`*, profiles(full_name)`)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (categoryParam && categoryParam !== "All") {
        query = query.eq("category", categoryParam);
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [categoryParam]);

  const handleCategoryClick = (cat: string) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const activeCategory = categoryParam || "All";

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 relative text-[#1D1D1F]">
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* â”€â”€ Hero Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Campus Market
              </h1>
              <p className="text-[15px] sm:text-base text-[#8E8E93] font-medium leading-relaxed">
                {products.length} {products.length === 1 ? "item" : "items"}{" "}
                available from CU students
              </p>
            </div>

            {/* Sell Button */}
            <div className="w-full sm:w-auto">
              <Link
                to="/list"
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-[15px] text-white transition-all ios-action-button hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell Something</span>
              </Link>
            </div>
          </div>

          {/* â”€â”€ Category Pills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div
            className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 flex-shrink-0 text-[14px] whitespace-nowrap shadow-sm border ${
                    isActive
                      ? "bg-[#1D1D1F] text-white border-[#1D1D1F] ios-shadow scale-105"
                      : "ios-glass text-[#8E8E93] border-white/40 hover:text-[#1D1D1F] hover:bg-white/80"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#8E8E93]">
              Finding Items...
            </p>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 ios-glass rounded-[2rem] text-center px-4"
          >
            <Package className="w-16 h-16 text-[#8E8E93] mb-4 opacity-50" />
            <h3 className="text-xl font-bold tracking-tight mb-2">
              No items found
            </h3>
            <p className="text-[#8E8E93] font-medium max-w-sm mb-6">
              There are currently no items available in this category. Try
              expanding your search or check back soon.
            </p>
            <button
              onClick={() => handleCategoryClick("All")}
              className="text-[13px] font-bold text-[#007AFF] uppercase tracking-widest px-6 py-2.5 bg-[#007AFF]/10 rounded-full hover:bg-[#007AFF]/20 transition-colors"
            >
              View All Items
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
          >
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                id={p.id}
                image={p.image_url || ""}
                title={p.title}
                price={p.price}
                originalPrice={p.original_price || undefined}
                condition={p.condition as any}
                category={p.category}
                rating={4.5}
                seller={p.profiles?.full_name || "Student"}
                delay={i * 0.04}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
