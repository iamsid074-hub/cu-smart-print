import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { groceryItems } from "@/config/grocery";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Dairy & Breakfast", "Beverages", "Instant Foods", "Snacks", "Personal Care", "Household Essentials", "Extras"];

export default function Groceries() {
    const navigate = useNavigate();
    const { addItem, items: cartItems } = useCart();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter items based on active tab and search query
    const filteredItems = groceryItems.filter(item => {
        const matchesCategory = activeTab === "All" || item.category === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.variants && item.variants.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category
        });
        toast({ title: "Added to cart", description: `${item.title} has been added.` });
    };



    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 pt-[4.5rem] pb-4 px-4 shadow-sm">

                {/* Search Bar */}
                <div className="max-w-7xl mx-auto px-2">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#231942]/10 flex items-center justify-center transition-colors group-focus-within:bg-[#231942]">
                            <Search className="w-4 h-4 text-[#231942] group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search groceries, snacks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-3.5 pl-14 pr-5 text-sm font-medium focus:outline-none focus:border-[#231942] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,25,66,0.08)] transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="max-w-7xl mx-auto mt-4 -mb-4 overflow-x-auto hide-scrollbar flex gap-2 pb-4 px-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setActiveTab(cat); setSearchQuery(""); }}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === cat
                                ? "bg-brand-50 text-brand border border-brand-muted"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Product Grid */}
            <main className="max-w-7xl mx-auto px-4 pt-6">
                {filteredItems.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">No items found</h3>
                        <p className="text-slate-500">Try adjusting your search or category.</p>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="group relative bg-[#faf5f8] border-2 border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-[#e0b1cb] rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                >
                                    <Link to={`/product/${item.id}`} className="absolute inset-0 z-10" />

                                    {/* Image */}
                                    <div className="aspect-square bg-slate-100/80 p-4 flex items-center justify-center relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-300" />
                                        {item.badge && (
                                            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm z-20">
                                                {item.badge}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-3 flex flex-col flex-1 border-t border-slate-100 relative z-20 bg-white">
                                        <span className="text-[10px] uppercase tracking-wider text-brand-accent font-bold mb-1 truncate">{item.category}</span>
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-auto">{item.title}</h3>

                                        <div className="flex items-end justify-between mt-3 z-30 relative block">
                                            <div>
                                                <span className="text-xs text-slate-500 block mb-0.5">{item.variants || "Standard"}</span>
                                                <span className="text-base font-black text-brand">₹{item.price}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, item)}
                                                className="w-[36px] h-[36px] rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-colors shadow-sm relative z-40"
                                            >
                                                <Plus className="w-4 h-4 text-current transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
