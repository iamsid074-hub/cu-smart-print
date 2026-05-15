import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Search,
  Loader2,
  Heart,
  ArrowRight,
  Zap,
  ShieldCheck,
  RefreshCcw,
  Clock,
  SlidersHorizontal,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groceryItems, type GroceryItem } from "@/config/groceryItems";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GroceryProductCard from "@/components/GroceryProductCard";

// --- MOBILE COMPONENTS ---
const MobileGroceryCard = ({ item, onAdd }: { item: GroceryItem, onAdd: (item: GroceryItem) => void }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="min-w-[140px] w-[140px] bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col relative snap-start">
      {item.isFresh && (
        <span className="absolute top-2 left-2 bg-green-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
          Fresh
        </span>
      )}
      <Heart className="absolute top-2 right-2 w-4 h-4 text-gray-300 z-10" />
      <div className="w-full h-[100px] flex items-center justify-center p-2 mb-2">
        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
      </div>
      <h3 className="text-[12px] font-bold text-gray-800 leading-tight line-clamp-2 min-h-[34px]">{item.name}</h3>
      <p className="text-[10px] text-gray-400 font-medium mt-1 mb-3">{item.quantity || "500 ml"}</p>
      
      <div className="mt-auto">
        <button 
          onClick={handleAdd}
          disabled={isAdded}
          className={`w-full h-9 rounded-full flex items-center transition-all duration-300 font-bold text-[13px] shadow-sm overflow-hidden border ${isAdded ? 'bg-[#109c41] text-white justify-center border-[#109c41]' : 'bg-gray-50 border-gray-200 text-[#109c41] justify-between pl-3 pr-1 hover:bg-green-50 hover:border-green-200'}`}
        >
          {isAdded ? (
            <span className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
              Added <Check className="w-4 h-4" strokeWidth={3} />
            </span>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-gray-900 font-black">₹{item.price}</span>
              <span className="w-7 h-7 rounded-full bg-[#109c41] text-white flex items-center justify-center shadow-md">
                <Plus className="w-4 h-4" strokeWidth={3} />
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

const MOBILE_CATEGORIES = [
  { name: "Dairy", icon: "🥛", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Beverages", icon: "🥤", color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Snacks", icon: "🥨", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Bakery", icon: "🥖", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Fruits & Veg", icon: "🍎", color: "bg-red-50 text-red-600 border-red-100" },
  { name: "More", icon: "🥑", color: "bg-gray-50 text-gray-600 border-gray-200" },
];

const fontH: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
};

export default function Grocery() {
  const navigate = useNavigate();
  const { addItem, totalItems } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  const filteredItems = groceryItems
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });

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
    // Use a clean, non-intrusive sound/visual if possible, but keep toast for now
  };

  return (
    <>
      {/* ── DESKTOP VIEW (Unchanged) ── */}
      <div className="hidden md:block min-h-screen bg-transparent pb-32 overflow-x-hidden text-white">
        {/* ── Sticky Premium Header ── */}
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 pt-20 pb-6 px-4">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase" style={fontH}>
                  Blinkit / Zwigato
                </h1>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  Fresh Groceries Delivered in min.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search milk, bread, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#1c1c1e] text-[13px] font-medium text-white placeholder:text-gray-500 focus:outline-none border border-white/5 focus:border-orange-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-8">
          {/* Sections only show when not searching */}
          {!searchQuery ? (
            <div className="space-y-12">
              {/* Quick Essentials Section */}
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                    <h2 className="text-[17px] font-black text-white uppercase tracking-tight" style={fontH}>
                      Fresh Milk
                    </h2>
                  </div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    Daily Fresh
                  </span>
                </div>
                <div className="flex overflow-x-auto gap-4 -mx-4 px-4 pb-8 scrollbar-hide">
                  {groceryItems
                    .filter((i) => i.category === "Milk")
                    .sort((a, b) => {
                      if (sortBy === "price_asc") return a.price - b.price;
                      if (sortBy === "price_desc") return b.price - a.price;
                      return 0;
                    })
                    .map((item, idx) => (
                      <GroceryProductCard
                        key={item.id}
                        item={item}
                        idx={idx}
                        bgFrom="#F2F7FF"
                        bgTo="#E1EFFF"
                        btnColor="#007AFF"
                        onAdd={handleAddToCart}
                      />
                    ))}
                </div>
              </section>

              {/* Cold Drinks Section */}
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                    <h2 className="text-[17px] font-black text-white uppercase tracking-tight" style={fontH}>
                      Cold Drinks
                    </h2>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-4 -mx-4 px-4 pb-8 scrollbar-hide">
                  {groceryItems
                    .filter((item) => item.category === "Cold Drinks")
                    .sort((a, b) => {
                      if (sortBy === "price_asc") return a.price - b.price;
                      if (sortBy === "price_desc") return b.price - a.price;
                      return 0;
                    })
                    .map((item, idx) => (
                      <GroceryProductCard
                        key={item.id}
                        item={item}
                        idx={idx}
                        bgFrom="#F2FFF4"
                        bgTo="#E5FFE9"
                        btnColor="#34C759"
                        onAdd={handleAddToCart}
                      />
                    ))}
                </div>
              </section>

              {/* Snacks Section */}
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                    <h2 className="text-[17px] font-black text-white uppercase tracking-tight" style={fontH}>
                      Snacks & Quick Bites
                    </h2>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-4 -mx-4 px-4 pb-8 scrollbar-hide">
                  {groceryItems
                    .filter((item) => ["Instant Food", "Snacks", "Bakery Snack"].includes(item.category))
                    .sort((a, b) => {
                      if (sortBy === "price_asc") return a.price - b.price;
                      if (sortBy === "price_desc") return b.price - a.price;
                      return 0;
                    })
                    .map((item, idx) => (
                      <GroceryProductCard
                        key={item.id}
                        item={item}
                        idx={idx}
                        bgFrom="#FFF9F2"
                        bgTo="#FFF2E5"
                        btnColor="#FF9500"
                        onAdd={handleAddToCart}
                      />
                    ))}
                </div>
              </section>

              {/* All Products Grid Section */}
              <section className="pb-10">
                <div className="flex items-center justify-between mb-8 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-white/20 rounded-full" />
                    <h2 className="text-[17px] font-black text-white uppercase tracking-tight" style={fontH}>
                      Explore All
                    </h2>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {groceryItems.length} Products
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...groceryItems]
                    .sort((a, b) => {
                      if (sortBy === "price_asc") return a.price - b.price;
                      if (sortBy === "price_desc") return b.price - a.price;
                      return 0;
                    })
                    .map((item, idx) => (
                    <GroceryProductCard
                      key={item.id}
                      item={item}
                      idx={idx}
                      bgFrom="#1c1c1e"
                      bgTo="#0a0a0a"
                      btnColor="#fb923c"
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* Search Results Grid */
            <div className="pb-10">
              <div className="flex items-center gap-2 mb-8 px-1">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                <h2 className="text-[17px] font-black text-white uppercase tracking-tight" style={fontH}>
                  Found {filteredItems.length} items
                </h2>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredItems.map((item, idx) => (
                    <GroceryProductCard
                      key={item.id}
                      item={item}
                      idx={idx}
                      bgFrom="#1c1c1e"
                      bgTo="#0a0a0a"
                      btnColor="#fb923c"
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 bg-[#1c1c1e] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-black text-white">No items match</h3>
                  <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">
                    Try another item name or category
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE VIEW (Reference Image Layout) ── */}
      <div className="block md:hidden min-h-screen bg-[#fcfcfc] pb-32 overflow-x-hidden font-sans">
        {/* Header */}
        <div className="px-4 pt-20 pb-4 bg-white sticky top-0 z-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[24px] font-black text-black tracking-tight leading-tight">
                Blinkit / <span className="text-[#109c41]">Zwigato</span>
              </h1>
              <p className="text-[12px] font-bold text-gray-600 flex items-center gap-1 mt-0.5">
                Fresh groceries in minutes <span className="text-[#109c41] text-sm">🌱</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/home')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 relative active:scale-95 transition-transform">
                <ArrowLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button onClick={() => navigate('/cart')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 relative active:scale-95 transition-transform">
                <ShoppingBag className="w-5 h-5 text-gray-800" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-[#109c41] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-[2px] border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#109c41] transition-colors" />
              <input
                type="text"
                placeholder="Search milk, bread, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#1c1c1e] text-[13px] font-medium text-white placeholder:text-gray-400 focus:outline-none shadow-sm"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`w-12 h-12 rounded-2xl ${showFilters || sortBy !== 'default' ? 'bg-[#3b571e]' : 'bg-[#527d2c]'} text-white flex items-center justify-center shrink-0 active:scale-95 transition-colors shadow-md relative`}>
              <SlidersHorizontal className="w-5 h-5" />
              {sortBy !== 'default' && <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full" />}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort By</p>
                    <button 
                      onClick={() => { setSortBy("default"); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl ${sortBy === "default" ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Recommended
                    </button>
                    <button 
                      onClick={() => { setSortBy("price_asc"); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl ${sortBy === "price_asc" ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Price: Low to High
                    </button>
                    <button 
                      onClick={() => { setSortBy("price_desc"); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl ${sortBy === "price_desc" ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Price: High to Low
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        {!searchQuery ? (
          <div>
            {/* Banner */}
            <div className="px-4 mt-2 mb-6">
              <div className="bg-[#0b2818] rounded-[24px] p-5 relative overflow-hidden flex items-center shadow-md min-h-[160px]">
                {/* Background Image with Gradient Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0b2818] via-[#0b2818]/80 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover object-left" alt="Vegetables" />
                </div>

                <div className="relative z-20 w-[75%]">
                  <div className="inline-flex items-center gap-1 bg-[#1a3824] text-[#a0c1a8] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
                    <Zap className="w-3 h-3 fill-current" /> 10 MIN DELIVERY
                  </div>
                  <h2 className="text-white text-[24px] font-black leading-[1.1] mb-1.5 tracking-tight">
                    Groceries<br/>
                    <span className="text-[#84d632]">delivered fresh 🌱</span>
                  </h2>
                  <p className="text-gray-400 text-[11px] font-medium mb-4">Quick. Fresh. Reliable.</p>
                  <button className="bg-white text-black text-[12px] font-bold pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform w-fit shadow-md">
                    Shop Now <div className="bg-[#4d862f] rounded-full p-1"><ArrowRight className="w-3 h-3 text-white" strokeWidth={3} /></div>
                  </button>
                </div>
                
                {/* 10-15 Min Badge */}
                <div className="absolute bottom-2 right-2 bg-white w-[75px] h-[75px] rounded-full flex flex-col items-center justify-center text-center shadow-xl z-30">
                  <span className="text-black font-black text-[16px] leading-none mt-1">10-15</span>
                  <span className="text-[#3b571e] font-black text-[10px] leading-none mt-0.5">MIN</span>
                  <span className="text-gray-500 text-[8px] font-bold leading-none mt-0.5 mb-1">Delivery</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto px-4 pb-6 scrollbar-hide snap-x">
              {MOBILE_CATEGORIES.map(c => (
                <div key={c.name} className="flex flex-col items-center gap-2 snap-start">
                  <div className={`w-[60px] h-[60px] sm:w-16 sm:h-16 rounded-2xl ${c.color} flex items-center justify-center text-2xl shadow-sm border`}>
                    {c.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">{c.name}</span>
                </div>
              ))}
            </div>

            {/* Sections */}
            <div className="space-y-8 px-4">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-black text-gray-900">Daily Essentials</h2>
                  <button className="text-[12px] font-bold text-[#109c41] flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
                  {groceryItems.filter(i => i.category === 'Milk').sort((a,b) => sortBy === 'price_asc' ? a.price - b.price : sortBy === 'price_desc' ? b.price - a.price : 0).map(item => (
                    <MobileGroceryCard key={item.id} item={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-black text-gray-900">Beverages</h2>
                  <button className="text-[12px] font-bold text-[#109c41] flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
                  {groceryItems.filter(i => i.category === 'Cold Drinks').sort((a,b) => sortBy === 'price_asc' ? a.price - b.price : sortBy === 'price_desc' ? b.price - a.price : 0).map(item => (
                    <MobileGroceryCard key={item.id} item={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-black text-gray-900">Snacks & Quick Bites</h2>
                  <button className="text-[12px] font-bold text-[#109c41] flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
                  {groceryItems.filter(i => ["Instant Food", "Snacks", "Bakery Snack"].includes(i.category)).sort((a,b) => sortBy === 'price_asc' ? a.price - b.price : sortBy === 'price_desc' ? b.price - a.price : 0).map(item => (
                    <MobileGroceryCard key={item.id} item={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="px-4 mt-6">
            <h2 className="text-[15px] font-black text-gray-900 mb-4">Found {filteredItems.length} items</h2>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="w-full">
                    <MobileGroceryCard item={item} onAdd={handleAddToCart} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-[16px] font-black text-gray-900">No items match</h3>
                <p className="text-[12px] text-gray-500 font-medium mt-1">Try another item name or category</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Trust Badges (Matches reference image bottom bar) */}
        <div className="bg-[#1c1c1e] p-5 flex flex-wrap sm:flex-nowrap justify-between gap-4 mt-12 pb-32">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#109c41]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">10-15 Min</p>
              <p className="text-[9px] text-gray-400 font-medium">Fast Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#109c41]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">Best Quality</p>
              <p className="text-[9px] text-gray-400 font-medium">Fresh & Safe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0">
              <RefreshCcw className="w-4 h-4 text-[#109c41]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">Easy Returns</p>
              <p className="text-[9px] text-gray-400 font-medium">Quick & Hassle Free</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
