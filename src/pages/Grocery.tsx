import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groceryItems, type GroceryItem } from "@/config/groceryItems";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GroceryProductCard from "@/components/GroceryProductCard";

const fontH: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
};

export default function Grocery() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = groceryItems.filter(
    (item) =>
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
    // Use a clean, non-intrusive sound/visual if possible, but keep toast for now
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-32 overflow-x-hidden text-white">
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
                {groceryItems.map((item, idx) => (
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
  );
}
