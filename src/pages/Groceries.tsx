import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ShoppingCart, Search, Plus } from "lucide-react";
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

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 pt-14 pb-4 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold flex-1 text-center">Daily Needs</h1>
                    <Link to="/cart" className="p-2 -mr-2 relative hover:bg-white/10 rounded-full transition-colors text-neon-cyan">
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-neon-fire text-[10px] font-bold flex items-center justify-center text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="max-w-7xl mx-auto mt-4 px-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search groceries, snacks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
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
                                    ? "bg-neon-cyan text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
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
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No items found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or category.</p>
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
                                    className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col"
                                >
                                    <Link to={`/product/${item.id}`} className="absolute inset-0 z-10" />

                                    {/* Image */}
                                    <div className="aspect-square bg-black/50 p-4 flex items-center justify-center relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-300" />
                                        {item.badge && (
                                            <div className="absolute top-2 left-2 bg-gradient-fire text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-neon-fire z-20">
                                                {item.badge}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-3 flex flex-col flex-1 border-t border-white/5 relative z-20 bg-background/50 backdrop-blur-md">
                                        <span className="text-[10px] uppercase tracking-wider text-neon-cyan/70 font-bold mb-1 truncate">{item.category}</span>
                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight mb-auto">{item.title}</h3>

                                        <div className="flex items-end justify-between mt-3">
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-0.5">{item.variants || "Standard"}</span>
                                                <span className="text-base font-black text-neon-cyan">₹{item.price}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, item)}
                                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-neon-cyan hover:text-black border border-white/10 flex items-center justify-center transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
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
