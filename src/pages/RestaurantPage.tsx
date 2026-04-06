import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Share2, MoreVertical, Star, MapPin, Clock, CheckCircle2, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { getAllFoodItems } from "@/data/foodData";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const shopName = decodeURIComponent(id || "");
  const allFoods = useMemo(() => getAllFoodItems(), []);
  
  // Find items belonging to this shop
  const shopItems = useMemo(() => {
     return allFoods.filter(item => item.shopName === shopName);
  }, [shopName, allFoods]);

  // Group items by category
  const groupedItems = useMemo(() => {
     const groups: Record<string, typeof allFoods> = {};
     shopItems.forEach(item => {
        const cat = item.category || "Recommended";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
     });
     return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [shopItems]);

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() => {
     const state: Record<string, boolean> = {};
     groupedItems.forEach(g => state[g.category] = true);
     return state;
  });

  const toggleCat = (cat: string) => {
     setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const shopRating = shopItems.length > 0 ? shopItems[0].rating : "4.0"; // Get rating from first item as proxy

  if (shopItems.length === 0) {
      return (
         <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="text-center">
               <h2 className="text-xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
               <button onClick={() => navigate(-1)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold">Go Back</button>
            </div>
         </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* HEADER Nav */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-800 active:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
         </button>
         <div className="flex items-center gap-1">
            <button className="p-2 text-gray-800 active:bg-gray-100 rounded-full">
               <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-800 active:bg-gray-100 rounded-full">
               <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-800 active:bg-gray-100 rounded-full">
               <MoreVertical className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="bg-white px-4 pt-5 pb-6 shadow-sm mb-2 rounded-b-3xl">
         {/* Title area */}
         <div className="flex items-start justify-between mb-4">
            <div>
               <h1 className="text-[24px] font-black tracking-tight text-gray-900 mb-1">{shopName}</h1>
               <div className="flex flex-col gap-1 text-gray-500 text-[13px] font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 2.4 km • Sector 62, Mohali</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 45-50 mins • Schedule for later <ChevronDown className="w-3 h-3" /></span>
               </div>
            </div>
            
            <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
               <div className="flex items-center gap-1 text-emerald-700 font-black text-[15px]">
                  <Star className="w-4 h-4 fill-current" /> {shopRating}
               </div>
               <div className="w-[80%] h-[1px] bg-gray-200 my-1 border-b border-dashed border-gray-400" />
               <span className="text-[10px] text-gray-500 font-bold uppercase">10K+ ratings</span>
            </div>
         </div>

         {/* Packaging chip */}
         <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[13px] font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 fill-green-100 text-green-600" />
            No packaging charges
         </div>
      </div>

      {/* Menu Categories */}
      <div className="px-4 py-2">
         {groupedItems.map((group, gIdx) => (
            <div key={group.category} className="bg-white rounded-3xl mb-4 overflow-hidden border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
               <button 
                 onClick={() => toggleCat(group.category)}
                 className="flex items-center justify-between w-full p-5 bg-white"
               >
                  <h3 className="text-[18px] font-black text-gray-900">Best in {group.category}</h3>
                  {expandedCats[group.category] ? (
                     <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                     <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
               </button>
               
               <AnimatePresence>
                  {expandedCats[group.category] && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="flex flex-col gap-0 px-5 pb-5">
                           {group.items.map((item, index) => (
                              <div key={item.id} className={`py-6 flex gap-4 ${index !== group.items.length - 1 ? 'border-b border-dashed border-gray-200' : ''}`}>
                                 
                                 {/* Info Left Side */}
                                 <div className="flex-1 pr-2 flex flex-col justify-between">
                                    <div>
                                       {/* Veg/Non-veg box icon */}
                                       <div className="w-[14px] h-[14px] rounded-[3px] border border-emerald-600 flex items-center justify-center bg-white mb-2 shadow-sm"><div className="w-[6px] h-[6px] rounded-full bg-emerald-600"/></div>
                                       
                                       <h4 className="font-extrabold text-[16px] text-[#3d4152] leading-tight mb-1">{item.name}</h4>
                                       <span className="font-semibold text-[15px] text-[#3d4152] mb-3 block">₹{item.price}</span>
                                       
                                       {item.desc && (
                                          <p className="text-[13px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                                             {item.desc}
                                          </p>
                                       )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-4">
                                       <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
                                          <Bookmark className="w-4 h-4" />
                                       </button>
                                       <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
                                          <Share2 className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                                 
                                 {/* Image Right Side */}
                                 <div className="w-[156px] flex flex-col items-center">
                                    <div className="w-full h-[144px] rounded-[18px] overflow-hidden bg-gray-50 shadow-md relative group">
                                       <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                       
                                       {/* Swiggy Bottom Center ADD Button overlaid on image */}
                                       <button
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            addItem(item);
                                            toast.success("Item added successfully");
                                         }}
                                         className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70%] py-2.5 bg-white text-emerald-600 font-black text-[15px] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex justify-center uppercase border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                                       >
                                          ADD
                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-light text-xl leading-none">+</span>
                                       </button>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-bold mt-4 tracking-wide">Customisable</span>
                                 </div>

                              </div>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         ))}
      </div>
    </div>
  );
}
