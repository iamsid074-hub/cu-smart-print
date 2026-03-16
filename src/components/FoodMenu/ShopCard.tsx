import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ChevronDown, BadgeCheck, Plus } from 'lucide-react';

interface ShopItem {
  name: string;
  price: number;
}

interface MenuCategory {
  category: string;
  items: ShopItem[];
}

interface Shop {
  id: string;
  name: string;
  tag: string;
  veg?: boolean;
  categories: MenuCategory[];
}

interface ShopCardProps {
  shop: Shop;
  isExpanded: boolean;
  onToggle: (id: string | null) => void;
  expandedMenuCat: string | null;
  onToggleCategory: (cat: string | null) => void;
  onAddItem: (item: any) => void;
}

export const ShopCard = memo(({ 
  shop, 
  isExpanded, 
  onToggle, 
  expandedMenuCat, 
  onToggleCategory,
  onAddItem 
}: ShopCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 group"
    >
      <button
        onClick={() => onToggle(isExpanded ? null : shop.id)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
          <Store className="w-6 h-6 text-slate-400 group-hover:text-brand-accent transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{shop.name}</h3>
            {shop.veg && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight">VEG</span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">{shop.tag}</p>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-slate-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-slate-50"
          >
            <div className="px-5 pb-6 sm:px-6 sm:pb-8 space-y-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 -mx-1 px-1">
                {shop.categories.map((mc) => (
                  <button
                    key={mc.category}
                    onClick={() => onToggleCategory(expandedMenuCat === mc.category ? null : mc.category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                      expandedMenuCat === mc.category
                        ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {mc.category}
                  </button>
                ))}
              </div>

              {shop.categories
                .filter((mc) => !expandedMenuCat || mc.category === expandedMenuCat)
                .map((mc) => (
                  <div key={mc.category} className="mb-6">
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="h-[2px] w-4 bg-brand/20" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.1em]">{mc.category}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mc.items.map((item, idx) => (
                        <div
                          key={`${mc.category}-${idx}`}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all duration-300 group/item shadow-sm"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <span className="text-sm font-semibold text-slate-700 block truncate">{item.name}</span>
                            <span className="text-xs font-bold text-brand mt-0.5 block">{"\u20B9"}{item.price}</span>
                          </div>
                          <button
                            onClick={() => onAddItem({
                              id: `${shop.id}-${mc.category}-${idx}`,
                              title: `${item.name} (${shop.name})`,
                              price: item.price,
                              image: '',
                              category: 'shops',
                            })}
                            className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ShopCard.displayName = 'ShopCard';
