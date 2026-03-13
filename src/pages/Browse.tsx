import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ShoppingBag, SlidersHorizontal, Package, Sparkles } from "lucide-react";
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
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 bg-slate-50">
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
                            <p className="text-sm mt-1 text-slate-500 font-medium">
                                {filtered.length} {filtered.length === 1 ? 'item' : 'items'} available from CU students
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full sm:w-80">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-2xl pl-10 pr-4 h-[44px] text-sm focus:outline-none transition-all bg-white text-slate-900 border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Category Pills ────────────────────────────────── */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-3xl font-bold transition-all duration-300 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap border ${isActive
                                        ? 'bg-brand text-white border-brand shadow-[0_4px_15px_rgba(35,25,66,0.3)]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-muted hover:bg-brand-50 shadow-sm'
                                        }`}
                                >
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
                            <Loader2 className="w-10 h-10 animate-spin text-brand" />
                            <p className="text-sm font-medium text-slate-500">Loading products...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center bg-white border border-slate-200 shadow-sm flex flex-col items-center"
                        >
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-brand-50 border border-brand-50">
                                <Package className="w-10 h-10 text-brand-accent" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                                {searchQuery ? "No matches found" : "No items yet"}
                            </h3>
                            <p className="text-sm max-w-sm mb-6 text-slate-500">
                                {searchQuery
                                    ? `No products match "${searchQuery}". Try a different search or category.`
                                    : `No products listed in ${activeCategory === "All" ? "any category" : activeCategory} right now. Check back soon!`}
                            </p>
                            <div className="flex gap-3 flex-wrap justify-center">
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all bg-brand shadow-[0_4px_12px_rgba(35,25,66,0.2)] hover:shadow-[0_6px_15px_rgba(35,25,66,0.3)] hover:scale-105"
                                    >
                                        Clear Search
                                    </button>
                                )}
                                {activeCategory !== "All" && (
                                    <button
                                        onClick={() => handleCategoryClick("All")}
                                        className="px-6 py-3 rounded-2xl text-sm font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:scale-105"
                                    >
                                        View All Items
                                    </button>
                                )}
                                <Link
                                    to="/list"
                                    className="px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:scale-105"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Sell Something
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
