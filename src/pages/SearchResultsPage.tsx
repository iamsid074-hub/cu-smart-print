import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, Check, Bookmark, Star } from "lucide-react";
import { getAllFoodItems } from "@/data/foodData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get("q") || "";
  
  const { addItem } = useCart();
  const allFoods = useMemo(() => getAllFoodItems(), []);
  const [activeTab, setActiveTab] = useState(q);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
     setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  };

  // Derive relevant tabs based on the query (e.g. if q is Burger, tabs could be Veg, Aloo Tikki...)
  const subTabs = useMemo(() => {
     let base = [q];
     if (q.toLowerCase().includes("burger")) {
        base.push("Veg", "Aloo Tikki", "Paneer", "Combo");
     } else if (q.toLowerCase().includes("pizza")) {
        base.push("Farmhouse", "Margherita", "Non Veg", "Cheese");
     } else if (q.toLowerCase().includes("biryani")) {
        base.push("Chicken", "Mutton", "Veg", "Handi");
     } else {
        base.push("Top Rated", "Bestseller", "New");
     }
     return base;
  }, [q]);

  // Filter items based on activeTab (or query)
  const matchingItems = useMemo(() => {
     const target = activeTab === q ? q.toLowerCase() : `${q.toLowerCase()} ${activeTab.toLowerCase()}`;
     
     // Relaxed matching for demo purposes
     let matches = allFoods.filter(item => 
        item.name.toLowerCase().includes(activeTab.toLowerCase()) || 
        item.category?.toLowerCase().includes(activeTab.toLowerCase())
     );
     
     if (matches.length === 0) {
        matches = allFoods.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
     }
     return matches;
  }, [activeTab, q, allFoods]);

  const recommendedItems = matchingItems.slice(0, 3);
  const restaurantItems = matchingItems.slice(3, 10);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* HEADER */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
         <div className="px-4 py-3 flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-700 active:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div 
               onClick={() => navigate('/search')}
               className="flex-1 flex items-center bg-white border border-gray-200 shadow-sm rounded-xl p-2 px-3 gap-2"
            >
               <input
                 type="text"
                 value={q}
                 readOnly
                 className="flex-1 bg-transparent text-[15px] font-semibold text-gray-900 focus:outline-none"
               />
               <Search className="w-5 h-5 text-emerald-600" />
               <div className="w-[1px] h-4 bg-gray-200 mx-1" />
               <div className="w-5 h-5 flex items-center justify-center">
                  <MicIcon className="w-4 h-4 text-emerald-600" />
               </div>
            </div>
         </div>

         {/* SUB TABS */}
         <div className="flex overflow-x-auto no-scrollbar px-4 pt-2 pb-0 gap-6 border-b border-gray-100 shrink-0">
            {subTabs.map((tab) => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)}
                 className={`pb-3 whitespace-nowrap text-[14.5px] font-bold transition-colors relative ${activeTab === tab ? "text-gray-900" : "text-gray-500"}`}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-600 rounded-t-full"
                     />
                  )}
               </button>
            ))}
         </div>
         
         {/* FILTERS */}
         <div className="flex overflow-x-auto no-scrollbar px-4 py-3 gap-2 shrink-0">
             <FilterChip icon={<SlidersHorizontal className="w-3.5 h-3.5" />} label="Filters" hasDropdown />
             {["Under ₹150", "Schedule", "Pure Veg", "Rating 4.0+"].map(filter => (
                <FilterChip 
                   key={filter} 
                   label={filter}
                   isActive={activeFilters.includes(filter)}
                   onClick={() => toggleFilter(filter)}
                   hasDropdown={filter === "Schedule"}
                />
             ))}
         </div>
      </div>

      <div className="px-4 py-6 flex flex-col gap-8">
         {/* RECOMMENDED SECTION */}
         {recommendedItems.length > 0 && (
            <section>
               <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Recommended For You
               </h3>
               <div className="flex overflow-x-auto no-scrollbar gap-4 -mx-4 px-4 pb-4">
                  {recommendedItems.map(item => (
                     <div key={item.id} className="min-w-[150px] w-[150px] flex flex-col gap-2 shrink-0 relative cursor-pointer" onClick={() => navigate(`/shop/${encodeURIComponent(item.shopName)}`)}>
                        <div className="w-[150px] h-[140px] rounded-[18px] overflow-hidden relative shadow-sm">
                           <img src={item.image} className="w-full h-full object-cover" />
                           {/* Discount Badge */}
                           <div className="absolute top-0 left-0 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                              Buy 1 Get 1 FREE
                           </div>
                           {/* Rating overlay */}
                           <div className="absolute bottom-2 left-2 bg-green-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {item.rating || "4.1"}
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-[15px] text-gray-900 leading-tight line-clamp-1">{item.shopName}</span>
                           <span className="text-[13px] font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                              🕒 50-55 mins
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         )}

         {/* ALL RESTAURANTS (Big Cards with Items) */}
         <section>
             <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4">
               All Restaurants
            </h3>
            <div className="flex flex-col gap-6">
               {restaurantItems.map(item => (
                  <div key={item.id} onClick={() => navigate(`/shop/${encodeURIComponent(item.shopName)}`)} className="bg-white rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
                     {/* Giant Image Area */}
                     <div className="w-full aspect-[4/3] bg-gray-100 relative">
                        <img src={item.image} className="w-full h-full object-cover" />
                        
                        {/* Overlay gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                        {/* Top Info */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[13px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1">
                           {item.name} &middot; ₹{item.price}
                        </div>
                        
                        <button className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors" onClick={(e) => { e.stopPropagation(); toast.success("Saved to favorites!");}}>
                           <Bookmark className="w-5 h-5" />
                        </button>

                        {/* Bottom Shop Info inside the image */}
                        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-[16px] p-2 flex items-center justify-between shadow-lg">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.shopName}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-[15px] text-gray-900 leading-tight">{item.shopName}</span>
                                 <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-tight">
                                    View Menu <ArrowLeft className="w-3 h-3 rotate-180" />
                                 </span>
                              </div>
                           </div>
                           
                           {/* Add item directly */}
                           <button 
                             onClick={(e) => { e.stopPropagation(); addItem(item); toast.success("Added to cart!"); }}
                             className="px-4 py-2 bg-[#FF6B00]/10 text-[#FF6B00] font-black text-[12px] rounded-xl active:scale-95"
                           >
                              ADD +
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
               {restaurantItems.length === 0 && (
                 <div className="text-center py-10">
                    <p className="text-gray-500 font-medium">No other restaurants found.</p>
                 </div>
               )}
            </div>
         </section>
      </div>
    </div>
  );
}

function FilterChip({ label, icon, hasDropdown, isActive, onClick }: { label: string, icon?: React.ReactNode, hasDropdown?: boolean, isActive?: boolean, onClick?: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border transition-colors shrink-0 ${
            isActive ? "border-gray-800 bg-gray-50 text-gray-900" : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
         }`}
      >
         {icon && icon}
         <span className="text-[13px] font-bold">{label}</span>
         {hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
   );
}

function MicIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}
