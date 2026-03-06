import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ShoppingBag, SlidersHorizontal, Package, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

const categories = [
    { id: "All", emoji: "✨", label: "All" },
    { id: "Electronics", emoji: "⚡", label: "Electronics" },
    { id: "Books", emoji: "📚", label: "Books" },
    { id: "Fashion", emoji: "👕", label: "Fashion" },
    { id: "Sports", emoji: "⚽", label: "Sports" },
    { id: "Audio", emoji: "🎧", label: "Audio" },
    { id: "Camera", emoji: "📷", label: "Camera" },
    { id: "Furniture", emoji: "🪑", label: "Furniture" },
    { id: "Kitchen", emoji: "🍳", label: "Kitchen" },
];

export default function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

    // Client-side search filter
    const filtered = searchQuery.trim()
        ? products.filter(p =>
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : products;

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6" style={{ backgroundColor: '#0A0505' }}>
            <div className="max-w-7xl mx-auto">

                {/* ── Hero Header ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div>
                            <div style={{ height: "1.5rem" }} />
                            <p className="text-sm mt-1" style={{ color: '#8F8175' }}>
                                {filtered.length} {filtered.length === 1 ? 'item' : 'items'} available from CU students
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full sm:w-80">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8F8175' }} />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-xl pl-10 pr-4 h-[44px] text-sm focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                        color: '#E8DED4',
                                        border: '1px solid #3D342C',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Category Pills ────────────────────────────────── */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all duration-300 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap"
                                    style={isActive ? {
                                        background: '#FF6B6B',
                                        color: '#fff',
                                        boxShadow: '0 0 20px rgba(255,107,107,0.3)',
                                    } : {
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                        border: '1px solid #3D342C',
                                        color: '#8F8175',
                                    }}
                                >
                                    <span>{cat.emoji}</span>
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Content ──────────────────────────────────────────── */}
                {
                    loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#FF6B6B' }} />
                            <p className="text-sm font-medium" style={{ color: '#8F8175' }}>Loading products...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border flex flex-col items-center"
                            style={{ backgroundColor: '#120805', borderColor: '#3D342C' }}
                        >
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)' }}>
                                <Package className="w-10 h-10" style={{ color: '#FF6B6B', opacity: 0.6 }} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                                {searchQuery ? "No matches found" : "No items yet"}
                            </h3>
                            <p className="text-sm max-w-sm mb-6" style={{ color: '#8F8175' }}>
                                {searchQuery
                                    ? `No products match "${searchQuery}". Try a different search or category.`
                                    : `No products listed in ${activeCategory === "All" ? "any category" : activeCategory} right now. Check back soon!`}
                            </p>
                            <div className="flex gap-3 flex-wrap justify-center">
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                                        style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.2)' }}
                                    >
                                        Clear Search
                                    </button>
                                )}
                                {activeCategory !== "All" && (
                                    <button
                                        onClick={() => handleCategoryClick("All")}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#E8DED4', border: '1px solid #3D342C' }}
                                    >
                                        View All Items
                                    </button>
                                )}
                                <Link
                                    to="/list"
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#E8DED4', border: '1px solid #3D342C' }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> Sell Something
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory + searchQuery}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
                            >
                                {filtered.map((p, i) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        image={p.image_url || ''}
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
                        </AnimatePresence>
                    )
                }
            </div >
        </div >
    );
}
