import { motion } from "framer-motion";
import { Wallet, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function DesktopWidgetSpace() {
  const { totalPrice, items } = useCart();

  return (
    <div className="fixed right-8 top-24 z-[40] flex flex-col gap-6 w-72">

      {/* Cart Peek Widget */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 shadow-2xl relative group"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Cart</span>
            <span className="text-[10px] font-bold text-blue-400">{items.length} Items</span>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex -space-x-3">
              {items.slice(0, 3).map((item, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] overflow-hidden bg-white">
                  <img src={item.image_url} className="w-full h-full object-cover" />
                </div>
              ))}
              {items.length > 3 && (
                <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">
                  +{items.length - 3}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-white/60 mb-1">Total Value</p>
              <p className="text-2xl font-black text-white tracking-tighter">₹{totalPrice}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs font-bold text-white/30 italic">Your cart is empty</p>
          </div>
        )}

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("open-window", { detail: "Cart" }))}
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-[11px] font-black tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20"
        >
          Open Cart
        </button>
      </motion.div>
    </div>
  );
}
