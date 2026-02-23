import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ["All", "Electronics", "Books", "Fashion", "Sports", "Audio", "Camera", "Furniture", "Kitchen"];

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

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                        <div className="glass p-5 rounded-2xl border border-white/5">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <Filter className="w-4 h-4" /> Categories
                            </h3>
                            <div className="flex flex-col gap-2">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => handleCategoryClick(c)}
                                        className={`premium-glass-button text-left px-3 py-2 rounded-xl text-sm transition-all ${(categoryParam === c || (!categoryParam && c === "All"))
                                            ? "bg-gradient-fire text-white font-semibold"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-bold">
                                {categoryParam && categoryParam !== "All" ? `${categoryParam} Items` : "All Items"}
                            </h1>
                            <p className="text-sm text-muted-foreground">{products.length} results</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 glass rounded-3xl border border-white/5">
                                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
                                <p className="text-muted-foreground text-sm">We couldn't find any items in this category.</p>
                                <button
                                    onClick={() => handleCategoryClick("All")}
                                    className="premium-glass-button mt-6 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {products.map((p, i) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        image={p.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'}
                                        title={p.title}
                                        price={p.price}
                                        originalPrice={p.original_price || undefined}
                                        condition={p.condition as any}
                                        rating={4.5}
                                        seller={p.profiles?.full_name || "Student"}
                                        delay={i * 0.05}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
