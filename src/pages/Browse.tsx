import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShoppingBag, SlidersHorizontal, Package, Sparkles, PlusCircle } from "lucide-react";
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
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">

                {/* ── Hero Header ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div>
                            <div style={{ height: "1.5rem" }} />
                            <p className="text-sm mt-1 text-slate-500 font-medium">
                                {products.length} {products.length === 1 ? 'item' : 'items'} available from CU students
                            </p>
                        </div>

                        {/* Sell Button */}
                        <div className="w-full sm:w-auto">
                            <Link to="/list" className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm text-white transition-all bg-brand shadow-[0_10px_25px_rgba(35,25,66,0.2)] hover:scale-105 active:scale-95 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                <PlusCircle className="w-4 h-4" />
                                <span>Sell Something</span>
                            </Link>
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
                                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-3xl font-bold transition-all duration-200 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap border ${isActive
                                        ? 'bg-brand text-white border-brand shadow-lg'
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
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
                        >
                            {products.map((p, i) => (
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
                                    delay={i * 0.03}
                                />
                            ))}
                        </motion.div>
                    )
                }
            </div >
        </div >
    );
}
