import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, ShoppingBag, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groceryItems, type GroceryItem } from "@/config/groceryItems";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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


            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-20">
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

                {/* Quick Items Area (Milks mostly) */}
                {!searchQuery && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-brand rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Quick Essentials</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {groceryItems.slice(0, 3).map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-brand/30 transition-all"
                                >
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.quantity}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-base font-black text-brand">{"\u20B9"}{item.price}</span>
                                            <button 
                                                onClick={() => handleAddToCart(item)}
                                                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Soft Drinks Section */}
                {!searchQuery && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Cold Drinks</h2>
                        </div>
                        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-4 snap-x snap-mandatory hide-scroll">
                            {groceryItems.filter(item => item.category === 'Cold Drinks').map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="min-w-[170px] sm:min-w-0 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col snap-start"
                                >
                                    <div className="relative h-28 sm:h-32 bg-slate-50 overflow-hidden p-4 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-blue-500/5" />
                                        <img src={item.image} alt={item.name} className="h-full w-auto object-contain mix-blend-multiply drop-shadow-md z-10 hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mb-3">{item.quantity}</p>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                                            <button 
                                                onClick={() => handleAddToCart(item)}
                                                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Instant Food Section */}
                {!searchQuery && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight" style={fontH}>Instant Food</h2>
                        </div>
                        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-4 snap-x snap-mandatory hide-scroll">
                            {groceryItems.filter(item => item.category === 'Instant Food').map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="min-w-[170px] sm:min-w-0 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col snap-start"
                                >
                                    <div className="relative h-28 sm:h-32 bg-slate-50 overflow-hidden p-4 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-red-500/5" />
                                        <img src={item.image} alt={item.name} className="h-full w-auto object-contain mix-blend-multiply drop-shadow-md z-10 hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mb-3">{item.quantity}</p>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                                            <button 
                                                onClick={() => handleAddToCart(item)}
                                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
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
                                        <span className="text-lg font-black text-slate-900">₹{item.price}</span>
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
