import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, ShoppingBag, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groceryItems, type GroceryItem } from "@/config/groceryItems";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GroceryProductCard from "@/components/GroceryProductCard";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

export default function Grocery() {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredItems = groceryItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddToCart = (item: GroceryItem) => {
        if (!user) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }
        addItem({
            id: item.id,
            title: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
        });
        toast.success(`${item.name} added to cart!`);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">


            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20">
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for milk, bread, eggs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white shadow-sm text-sm transition-all"
                    />
                </div>

                {/* Milk / Quick Essentials */}
                {!searchQuery && (
                    <section className="mb-4">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1.5 h-6 bg-brand rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Fresh Milk</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-10 hide-scroll" style={{ overflowY: 'visible' }}>
                            {groceryItems.slice(0, 3).map((item, idx) => (
                                <GroceryProductCard
                                    key={item.id}
                                    item={item}
                                    idx={idx}
                                    bgFrom="#F0F9FF"
                                    bgTo="#E0F2FE"
                                    btnColor="#6366F1"
                                    onAdd={handleAddToCart}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Cold Drinks */}
                {!searchQuery && (
                    <section className="mb-4">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Cold Drinks</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-10 hide-scroll" style={{ overflowY: 'visible' }}>
                            {groceryItems.filter(item => item.category === 'Cold Drinks').map((item, idx) => (
                                <GroceryProductCard
                                    key={item.id}
                                    item={item}
                                    idx={idx}
                                    bgFrom="#EFF6FF"
                                    bgTo="#DBEAFE"
                                    btnColor="#3B82F6"
                                    onAdd={handleAddToCart}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Instant Food / Snacks */}
                {!searchQuery && (
                    <section className="mb-4">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Snacks & Instant</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-10 hide-scroll" style={{ overflowY: 'visible' }}>
                            {groceryItems.filter(item => item.category === 'Instant Food' || item.category === 'Snacks' || item.category === 'Bakery Snack').map((item, idx) => (
                                <GroceryProductCard
                                    key={item.id}
                                    item={item}
                                    idx={idx}
                                    bgFrom="#FFF7ED"
                                    bgTo="#FFEDD5"
                                    btnColor="#F97316"
                                    onAdd={handleAddToCart}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>
                            {searchQuery ? `Search Results (${filteredItems.length})` : "All Items"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="relative h-32 sm:h-40 bg-slate-50 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    {item.category === 'Milk' && (
                                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest">Fresh</span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{item.category}</p>
                                    <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{item.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mb-3">{item.quantity}</p>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-lg font-black text-slate-900">â‚¹{item.price}</span>
                                        <button 
                                            onClick={() => handleAddToCart(item)}
                                            className="h-10 px-4 rounded-xl bg-brand text-white text-xs font-black shadow-lg shadow-brand/20 hover:bg-brand-dark active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No items found</h3>
                            <p className="text-sm text-slate-500 mt-1">Try searching for something else or browse categories.</p>
                        </div>
                    )}
                </section>
            </div>
            

        </div>
    );
}
