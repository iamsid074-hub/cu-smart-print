import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Sparkles, X, TrendingUp, Store, Plus, History } from 'lucide-react';
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

export const CustomOrderForm = memo(({
  onAddToList,
  customItemList,
  onRemoveFromList,
  onPreview,
  estimatePrice,
  suggestions,
  isListening,
  onStartListening
}: CustomOrderFormProps) => {
  const [input, setInput] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAdd = () => {
    if (!input.trim()) return;
    const finalPrice = price ? parseInt(price) : estimatePrice(input);
    onAddToList({
      id: `CUSTOM-LIST-${Date.now()}`,
      name: input,
      price: finalPrice,
      quantity: qty,
      notes
    });
    setInput("");
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
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Custom Order</h2>
            <p className="text-sm text-slate-500 font-medium">Order anything, even if not listed!</p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within:text-brand transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="What's in your mind? (e.g. Chicken Biryani)"
                className="w-full h-16 pl-16 pr-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
              <button 
                onClick={onStartListening}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100 shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isListening ? "..." : <Mic className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {showSuggestions && (input.trim() || suggestions.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
                  >
                    {/* Suggestions list logic omitted for brevity, should be restored from original */}
                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-1">
                      {(input.trim() ? suggestions : POPULAR_FOODS).map((item: any, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInput(item.name);
                            setPrice(item.price.toString());
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-accent group-hover:border-brand-100 transition-colors shadow-sm">
                              {input.trim() ? <Search className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.name}</p>
                              <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                <Store className="w-2.5 h-2.5" />
                                {item.shop}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-brand bg-brand/5 px-3 py-1.5 rounded-full">{"\u20B9"}{item.price}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setInput(tag)}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-brand hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 h-14 items-center gap-2">
                <p className="px-4 text-xs font-black text-slate-400 uppercase tracking-tight">Qty</p>
                <div className="flex-1 flex items-center justify-between px-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><Plus className="w-4 h-4 rotate-45" /></button>
                  <span className="text-lg font-black text-slate-800">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Expected Price"
                className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..."
              className="w-full h-full p-5 rounded-2xl bg-slate-50 border border-slate-200 font-bold resize-none"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full h-16 rounded-2xl bg-brand text-white font-black text-lg shadow-xl"
          >
            Add to List
          </button>

          {customItemList.length > 0 && (
            <div className="space-y-2">
              {customItemList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-brand">{"\u20B9"}{item.price} x {item.quantity}</p>
                  </div>
                  <button onClick={() => onRemoveFromList(item.id)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
              ))}
              <button
                onClick={() => onPreview(customItemList)}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black"
              >
                Review & Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

CustomOrderForm.displayName = 'CustomOrderForm';
