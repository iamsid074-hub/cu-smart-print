import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Mic } from "lucide-react";
import { getAllFoodItems } from "@/data/foodData";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Flatten everything
  const allFoods = useMemo(() => getAllFoodItems(), []);

  useEffect(() => {
    // Auto focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    navigate(`/search/results?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleShopSelect = (shopName: string) => {
    // Generate a slug or pass the exact shop name
    navigate(`/shop/${encodeURIComponent(shopName)}`);
  };

  // Swiggy Search Autocomplete Logic
  const autocompleteSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    const term = query.toLowerCase();
    
    // Find matching categories or exact items
    const matchingItemsSet = new Set<string>();
    const matchingItemsObj: any[] = [];
    
    // Find matching shops
    const matchingShopsSet = new Set<string>();
    
    allFoods.forEach(item => {
      // Direct item match
      if (item.name.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term)) {
         if (!matchingItemsSet.has(item.name)) {
           matchingItemsSet.add(item.name);
           matchingItemsObj.push({ type: 'dish', title: item.name, image: item.image, isExact: item.name.toLowerCase() === term });
         }
      }
      // Direct shop match
      if (item.shopName?.toLowerCase().includes(term)) {
         if (!matchingShopsSet.has(item.shopName)) {
           matchingShopsSet.add(item.shopName);
         }
      }
    });

    const suggestions = [];

    // Prioritize the exact type match: "[Term] -> See all restaurants"
    suggestions.push({
      type: 'query',
      title: query,
      subtitle: 'See all restaurants'
    });

    // Add dishes
    matchingItemsObj.slice(0, 5).forEach(dish => {
      suggestions.push({
        type: 'dish',
        title: dish.title,
        subtitle: 'Dish',
        image: dish.image
      });
    });

    // Add Shops
    Array.from(matchingShopsSet).slice(0, 5).forEach(shopName => {
      suggestions.push({
        type: 'shop',
        title: shopName,
        subtitle: 'Restaurant',
        image: allFoods.find(f => f.shopName === shopName)?.image || "" // Find an image representing the shop
      });
    });

    return suggestions;
  }, [query, allFoods]);

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 shadow-sm relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-700 active:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex items-center bg-gray-50 border border-black/5 rounded-[12px] p-1 px-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
            placeholder="Search for restaurants, items, more"
            className="flex-1 bg-transparent py-2.5 text-[15px] font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {query ? (
            <button 
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="p-1 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-1 text-emerald-600">
              <Mic className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto bg-white">
        {!query.trim() ? (
           <div className="p-4 pt-6">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                 Recent Searches
              </h3>
              <div className="flex items-center gap-3 mb-4 active:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer" onClick={() => handleSearchSubmit("Burger")}>
                 <Search className="w-5 h-5 text-gray-400" />
                 <span className="text-[15px] font-semibold text-gray-700">Burger</span>
              </div>
              <div className="flex items-center gap-3 mb-4 active:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer" onClick={() => handleSearchSubmit("Pizza")}>
                 <Search className="w-5 h-5 text-gray-400" />
                 <span className="text-[15px] font-semibold text-gray-700">Pizza</span>
              </div>
           </div>
        ) : (
           <div className="flex flex-col py-2">
             <AnimatePresence>
                {autocompleteSuggestions.map((item, index) => (
                   <motion.button
                     key={item.title + item.type + index}
                     layout
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => {
                        if (item.type === 'shop') handleShopSelect(item.title);
                        else handleSearchSubmit(item.title);
                     }}
                     className="flex items-center gap-4 px-4 py-3 active:bg-gray-50 transition-colors w-full text-left"
                   >
                      <div className="w-12 h-12 rounded-full bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                         {item.type === 'query' ? (
                            <Search className="w-6 h-6 text-gray-400" />
                         ) : (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         )}
                      </div>
                      
                      <div className="flex flex-col border-b border-gray-100 flex-1 pb-3 pt-1">
                         <span className="text-[15.5px] font-bold text-gray-900 leading-tight">
                            {item.title}
                         </span>
                         <span className={`text-[13px] font-semibold ${item.type === 'query' ? 'text-emerald-600' : 'text-gray-500'} mt-0.5`}>
                            {item.subtitle}
                         </span>
                      </div>
                   </motion.button>
                ))}
             </AnimatePresence>
           </div>
        )}
      </div>
    </div>
  );
}
