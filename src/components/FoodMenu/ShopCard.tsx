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
      className="rounded-[2rem] overflow-hidden ios-glass shadow-sm transition-all duration-500 group border border-white/60 mb-5"
    >
      <button
        onClick={() => onToggle(isExpanded ? null : shop.id)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
      >
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-300">
          <Store className="w-6 h-6 text-[#1D1D1F]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1D1D1F] tracking-tight truncate">{shop.name}</h3>
            {shop.veg && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 uppercase tracking-tight">VEG</span>
            )}
          </div>
          <p className="text-[13px] text-[#8E8E93] mt-0.5 font-medium">{shop.tag}</p>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5 text-[#8E8E93]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-black/5 bg-white/30 backdrop-blur-3xl"
          >
            <div className="px-5 pb-6 sm:px-6 sm:pb-8 space-y-4">
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-4 -mx-1 px-1">
                {shop.categories.map((mc) => (
                  <button
                    key={mc.category}
                    onClick={() => onToggleCategory(expandedMenuCat === mc.category ? null : mc.category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 border ${
                      expandedMenuCat === mc.category
                        ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] ios-shadow scale-[1.02]'
                        : 'bg-white/80 text-[#8E8E93] border-white/60 hover:bg-white hover:text-[#1D1D1F] shadow-sm'
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
                      <div className="h-[2px] w-4 bg-[#8E8E93]/30 rounded-full" />
                      <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-[0.1em]">{mc.category}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mc.items.map((item, idx) => (
                        <div
                          key={`${mc.category}-${idx}`}
                          className="flex items-center justify-between p-4 rounded-[1.2rem] bg-white border border-black/5 hover:border-black/10 transition-all duration-300 group/item shadow-sm hover:shadow-md"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <span className="text-[15px] font-bold text-[#1D1D1F] block truncate tracking-tight">{item.name}</span>
                            <span className="text-[13px] font-bold text-[#007AFF] mt-0.5 block">{"₹"}{item.price}</span>
                          </div>
                          <button
                            onClick={() => onAddItem({
                              id: `${shop.id}-${mc.category}-${idx}`,
                              title: `${item.name} (${shop.name})`,
                              price: item.price,
                              image: '',
                              category: 'shops',
                            })}
                            className="w-10 h-10 rounded-full ios-action-button flex items-center justify-center transition-all bg-[#007AFF]/10 hover:bg-[#007AFF] text-[#007AFF] hover:text-white"
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
