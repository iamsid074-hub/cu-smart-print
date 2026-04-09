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
    <div className="min-h-screen bg-[#F8F9FA] pb-32 overflow-x-hidden">
      {/* ── Sticky Premium Header ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#1D1D1F]/5 pt-20 pb-6 px-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#1D1D1F] tracking-tight uppercase" style={fontH}>
                Quick Mart
              </h1>
              <p className="text-[11px] text-[#8E8E93] font-bold uppercase tracking-widest mt-0.5">
                Fresh Groceries Delivered in min.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#5856D6]/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#5856D6]" />
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] group-focus-within:text-[#1D1D1F] transition-colors" />
            <input
              type="text"
              placeholder="Search milk, bread, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#F2F2F7] text-[13px] font-medium text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/5 transition-all border-none"
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
                  <div className="w-1.5 h-6 bg-[#007AFF] rounded-full" />
                  <h2 className="text-[17px] font-black text-[#1D1D1F] uppercase tracking-tight" style={fontH}>
                    Fresh Milk
                  </h2>
                </div>
                <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest bg-[#007AFF]/10 px-3 py-1 rounded-full">
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
                  <div className="w-1.5 h-6 bg-[#32D74B] rounded-full" />
                  <h2 className="text-[17px] font-black text-[#1D1D1F] uppercase tracking-tight" style={fontH}>
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
                  <div className="w-1.5 h-6 bg-[#FF9500] rounded-full" />
                  <h2 className="text-[17px] font-black text-[#1D1D1F] uppercase tracking-tight" style={fontH}>
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
                  <div className="w-1.5 h-6 bg-[#1D1D1F]/20 rounded-full" />
                  <h2 className="text-[17px] font-black text-[#1D1D1F] uppercase tracking-tight" style={fontH}>
                    Explore All
                  </h2>
                </div>
                <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest bg-[#F2F2F7] px-3 py-1 rounded-full">
                  {groceryItems.length} Products
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {groceryItems.map((item, idx) => (
                  <GroceryProductCard
                    key={item.id}
                    item={item}
                    idx={idx}
                    bgFrom="#F8F9FA"
                    bgTo="#F2F2F7"
                    btnColor="#1D1D1F"
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
              <div className="w-1.5 h-6 bg-[#1D1D1F] rounded-full" />
              <h2 className="text-[17px] font-black text-[#1D1D1F] uppercase tracking-tight" style={fontH}>
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
                    bgFrom="#F8F9FA"
                    bgTo="#F2F2F7"
                    btnColor="#1D1D1F"
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
                <div className="w-20 h-20 bg-[#F2F2F7] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-[#8E8E93]" />
                </div>
                <h3 className="text-lg font-black text-[#1D1D1F]">No items match</h3>
                <p className="text-xs text-[#8E8E93] font-bold mt-2 uppercase tracking-widest">
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
