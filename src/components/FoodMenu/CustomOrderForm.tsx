import React, { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mic,
  Sparkles,
  X,
  TrendingUp,
  Store,
  Plus,
  History,
} from "lucide-react";
import { QUICK_TAGS, POPULAR_FOODS } from "@/utils/foodUtils";

interface CustomOrderFormProps {
  onAddToList: (item: any) => void;
  customItemList: any[];
  onRemoveFromList: (id: string) => void;
  onPreview: (items: any[]) => void;
  estimatePrice: (input: string) => number;
  suggestions: any[];
  isListening: boolean;
  onStartListening: () => void;
}

export const CustomOrderForm = memo(
  ({
    onAddToList,
    customItemList,
    onRemoveFromList,
    onPreview,
    estimatePrice,
    isListening,
    onStartListening,
  }: Omit<CustomOrderFormProps, "suggestions">) => {
    const [input, setInput] = useState("");
    const [shopName, setShopName] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState("");
    const [notes, setNotes] = useState("");

    const handleAdd = () => {
      if (!input.trim()) return;
      const finalPrice = price ? parseInt(price) : estimatePrice(input);
      const displayShop = shopName.trim() || "Any Shop";
      onAddToList({
        id: `CUSTOM-LIST-${Date.now()}`,
        name: `${input.trim()} (Shop: ${displayShop})`,
        price: finalPrice,
        quantity: qty,
        notes: notes.trim(),
      });
      setInput("");
      setShopName("");
      setQty(1);
      setPrice("");
      setNotes("");
    };

    return (
      <motion.div
        key="custom-tab"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="ios-glass bg-white/40 rounded-[2rem] border border-white/60 p-6 sm:p-8 shadow-sm relative overflow-visible">
          <div className="flex flex-col gap-6 relative z-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#1D1D1F] tracking-tight">
                Custom Order
              </h2>
              <p className="text-[14px] text-[#8E8E93] font-medium">
                Order anything, from any campus shop!
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#8E8E93] group-focus-within:text-[#007AFF] transition-colors shadow-sm">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-16 pl-16 pr-14 rounded-2xl bg-[#F5F5F7] border-2 border-transparent focus:border-white/60 focus:bg-white focus:ring-4 focus:ring-black/5 transition-all text-[15px] font-bold text-[#1D1D1F] placeholder:text-[#8E8E93] placeholder:font-medium shadow-inner"
                />
                <button
                  onClick={onStartListening}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-[#FF3B30] text-white animate-pulse ring-4 ring-[#FF3B30]/20 shadow-lg shadow-[#FF3B30]/30"
                      : "bg-white text-[#8E8E93] hover:text-[#1D1D1F] shadow-sm"
                  }`}
                >
                  {isListening ? "..." : <Mic className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#8E8E93] group-focus-within:text-[#007AFF] transition-colors shadow-sm">
                  <Store className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Which shop/location?"
                  className="w-full h-16 pl-16 pr-6 rounded-2xl bg-[#F5F5F7] border-2 border-transparent focus:border-white/60 focus:bg-white focus:ring-4 focus:ring-black/5 transition-all text-[15px] font-bold text-[#1D1D1F] placeholder:text-[#8E8E93] placeholder:font-medium shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex bg-white/60 p-1.5 rounded-[1.2rem] border border-white/60 h-14 items-center gap-2 shadow-sm">
                  <p className="px-4 text-[11px] font-black text-[#8E8E93] uppercase tracking-wide">
                    Qty
                  </p>
                  <div className="flex-1 flex items-center justify-between px-2">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4 rotate-45 text-[#8E8E93]" />
                    </button>
                    <span className="text-lg font-black text-[#1D1D1F]">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-sm active:scale-95 transition-transform text-[#007AFF]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Expected Price (₹)"
                  className="w-full h-14 px-5 rounded-[1.2rem] bg-white/60 border border-white/60 font-bold text-[#1D1D1F] placeholder:text-[#8E8E93] shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                className="w-full h-full p-5 rounded-[1.2rem] bg-white/60 border border-white/60 font-bold text-[#1D1D1F] placeholder:text-[#8E8E93] resize-none shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all min-h-[120px] sm:min-h-0"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full h-16 rounded-full ios-action-button text-[16px] font-bold"
            >
              Add to List
            </button>

            {customItemList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-4 border-t border-black/5"
              >
                {customItemList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4.5 rounded-[1.2rem] bg-white border border-black/5 shadow-sm"
                  >
                    <div>
                      <p className="text-[15px] font-bold text-[#1D1D1F] tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[12px] font-bold text-[#007AFF] mt-0.5">
                        {"₹"}
                        {item.price} x {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveFromList(item.id)}
                      className="w-8 h-8 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center hover:bg-[#FF3B30] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onPreview(customItemList)}
                  className="w-full h-14 rounded-full bg-[#1D1D1F] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center mt-6"
                >
                  Review & Add to Cart
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

CustomOrderForm.displayName = "CustomOrderForm";
