import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Share2, MoreVertical, Star, 
  MapPin, Clock, Store, Search as SearchIcon, 
  Leaf, Utensils, ChevronLeft, Plus, X
} from "lucide-react";
import { shops } from "@/config/shopMenus";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";


export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // 1. Fetch data from central hub instead of inference
  const baseShop = useMemo(() => shops.find(s => s.id === id), [id]);
  const [liveIsOpen, setLiveIsOpen] = useState(baseShop?.isOpen ?? false);
  const [activeFilter, setActiveFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);



  // Sync with Supabase for real-time open/closed status
  useEffect(() => {
    if (!id) return;
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase.from("shops").select("is_open").eq("id", id).maybeSingle();
        if (error) {
          console.warn(`Shop status fetch for ${id} failed (maybe table missing):`, error.message);
          return;
        }
        if (data) setLiveIsOpen(data.is_open);
      } catch (err) {
        console.error("Shop live status fetch failed:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [id]);

  // Handle scroll for nav visibility
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (Math.abs(currentScrollY - lastScrollY) > 25) {
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
              setIsNavVisible(false);
            } else if (currentScrollY < lastScrollY - 10) {
              setIsNavVisible(true);
            }
            setLastScrollY(currentScrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Merge live status into base shop data
  const shop = useMemo(() => {
    if (!baseShop) return null;
    return { ...baseShop, isOpen: liveIsOpen };
  }, [baseShop, liveIsOpen]);

  // Filter items based on veg/non-veg toggle
  const filteredCategories = useMemo(() => {
    if (!shop) return [];
    return shop.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        if (activeFilter === "all") return true;
        
        const itemName = item.name.toLowerCase();
        const isVegItem = itemName.includes("veg") || 
                         itemName.includes("paneer") || 
                         itemName.includes("dal") || 
                         itemName.includes("shahi") || 
                         itemName.includes("aloo");
        
        if (activeFilter === "veg") return shop.veg || isVegItem;
        if (activeFilter === "non-veg") {
           const isNonVeg = itemName.includes("chicken") || 
                            itemName.includes("egg") || 
                            itemName.includes("mutton") || 
                            itemName.includes("fish");
           return !shop.veg && isNonVeg;
        }
        return true;
      })
    })).filter(cat => cat.items.length > 0);
  }, [shop, activeFilter]);

  const totalItems = useMemo(() => {
    return shop?.categories.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
  }, [shop]);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d0f]">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <X className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Shop Not Found</h2>
          <p className="text-zinc-500 mb-8 max-w-[200px] mx-auto text-sm font-medium">We couldn't find the place you're looking for.</p>
          <button 
            onClick={() => navigate("/home")} 
            className="px-8 py-3 bg-white text-black rounded-[1.2rem] font-bold shadow-xl active:scale-95 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-32 font-sans overflow-x-hidden">


      {/* ─── STICKY HEADER ─── */}
      <div className="sticky top-0 z-50 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 py-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white active:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex items-center gap-2 relative">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white active:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-6 h-6" />
          </motion.button>

          <AnimatePresence>
            {isMoreMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden py-2"
              >
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: shop.name,
                        text: `Check out ${shop.name} on CU Bazzar!`,
                        url: window.location.href
                      });
                    }
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/5 transition-colors font-bold text-sm"
                >
                  <Share2 className="w-5 h-5 text-zinc-500" />
                  Share Shop
                </button>
                <button 
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/5 transition-colors font-bold text-sm"
                >
                  <Search className="w-5 h-5 text-zinc-500" />
                  Search Menu
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── NATIVE-STYLE SHOP HEADER ─── */}
      <div className="px-5 pt-8 mb-8 flex gap-5 items-start">
        {/* Thumbnail */}
        <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 shrink-0">
          <img src={shop.heroImage} alt={shop.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 pt-1">
          <h1 className="text-[24px] sm:text-[32px] font-black leading-tight tracking-tight mb-3">
            {shop.name}
          </h1>
          
          <div className="flex flex-col gap-2.5">
            {/* Rating Badge */}
            <div className="inline-flex items-center self-start bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 gap-1.5">
              <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              <span className="text-emerald-500 font-black text-[14px]">{shop.rating}</span>
              <span className="text-emerald-500/60 font-bold text-[12px]">By {shop.reviews}</span>
            </div>
            
            <div className="flex items-center gap-4 text-zinc-400 font-bold text-[13px]">
              <div className="flex items-center gap-1.5 leading-none">
                <Clock className="w-4 h-4 text-zinc-600" />
                <span>{shop.deliveryTime.toLowerCase()} mins</span>
              </div>
              <div className="flex items-center gap-1.5 leading-none">
                <MapPin className="w-4 h-4 text-zinc-600" />
                <span>{shop.distance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATUS BANNER (CLOSED STATE) ─── */}
      {!shop.isOpen && (
        <div className="px-5 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/[0.03] border border-red-500/20 rounded-[2.5rem] p-8 text-center backdrop-blur-md"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-red-500/10 shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
              <Store className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-[24px] font-black text-white mb-2 leading-none tracking-tight">Currently Closed</h3>
            <p className="text-zinc-500 text-[15px] font-medium mb-10 leading-relaxed max-w-[280px] mx-auto">
              This outlet is temporarily closed. Please check back later or explore other campus favorites.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 py-4 rounded-full bg-[#1c1c1e] border border-white/5 text-white font-bold active:bg-zinc-800 transition-all text-[15px] shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/home")}
                className="flex items-center justify-center gap-2 py-4 rounded-full bg-[#FF3B30] text-white font-bold shadow-[0_12px_44px_rgba(255,59,48,0.25)] active:bg-[#D73229] transition-all text-[15px]"
              >
                <SearchIcon className="w-5 h-5" />
                Find Others
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── MENU SECTION ─── */}
      <div className="px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[20px] font-black uppercase tracking-widest text-zinc-500 leading-none">Menu</h2>
            <span className="text-[14px] font-bold text-zinc-700">({totalItems})</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#1c1c1e] p-1.5 rounded-full border border-white/5 w-fit">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2.5 rounded-full text-[13px] font-black tracking-wide transition-all ${
                activeFilter === "all" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter("veg")}
              className={`px-5 py-2.5 rounded-full text-[13px] font-black tracking-wide transition-all flex items-center gap-1.5 ${
                activeFilter === "veg" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${activeFilter === "veg" ? "text-emerald-500" : "text-zinc-600"}`} />
              Veg
            </button>
            <button 
              onClick={() => setActiveFilter("non-veg")}
              className={`px-5 py-2.5 rounded-full text-[13px] font-black tracking-wide transition-all flex items-center gap-1.5 ${
                activeFilter === "non-veg" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Utensils className={`w-3.5 h-3.5 ${activeFilter === "non-veg" ? "text-red-500" : "text-zinc-600"}`} />
              Non-Veg
            </button>
          </div>
        </div>

        {/* ─── MENU GRID (NATIVE MOBILE STYLE) ─── */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {filteredCategories.map((category) => (
              <div key={category.category} className="contents">
                <div id={`category-${category.category}`} className="col-span-full py-4 pt-8">
                   <h3 className="text-[18px] font-black text-white/40 uppercase tracking-[0.2em]">
                     {category.category}
                   </h3>
                </div>
                {category.items.map((item, idx) => {
                  const itemName = item.name.toLowerCase();
                  const isVeg = shop.veg || itemName.includes("veg") || 
                               itemName.includes("paneer") || 
                               itemName.includes("dal") || 
                               itemName.includes("shahi") || 
                               itemName.includes("aloo");
                  
                  return (
                    <motion.div 
                      key={item.name + idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col gap-2 sm:gap-4 p-3 sm:p-5 bg-[#1c1c1e]/50 border border-white/5 rounded-[1.2rem] sm:rounded-[2rem] hover:bg-[#1c1c1e] transition-all relative overflow-hidden"
                    >
                      {/* Veg/Non-veg Indicator */}
                      <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-10 w-3 h-3 sm:w-4 sm:h-4 rounded-sm border-2 flex items-center justify-center bg-[#0d0d0f] ${isVeg ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
                         <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>

                      {/* Item Image */}
                      <div className="w-full aspect-[4/3] rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden bg-[#2c2c2e] relative border border-white/5 shadow-inner">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop"} 
                          alt={item.name} 
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!shop.isOpen ? 'grayscale opacity-40' : ''}`}
                        />
                        {!shop.isOpen && (
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/10">
                            <Store className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/80">Closed</span>
                          </div>
                        )}
                      </div>

                      {/* Info & Action */}
                      <div className="flex flex-col gap-1 px-1">
                        <h4 className="text-[13px] sm:text-[16px] font-black text-white/90 leading-tight group-hover:text-white transition-colors line-clamp-2">
                          {item.name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto pt-2">
                          <span className="text-[14px] sm:text-[18px] font-black text-white">
                            ₹{item.price}
                          </span>
                          
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (!shop.isOpen) {
                                toast.error("Outlet is closed");
                                return;
                              }
                              addItem({
                                id: `${shop.id}-${item.name}`,
                                title: item.name,
                                name: item.name,
                                price: item.price,
                                image: item.image,
                                shopName: shop.name,
                                category: category.category
                              });
                              toast.success(`${item.name} added to cart!`);
                            }}
                            className={`px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-[14px] transition-all flex items-center justify-center gap-1 ${
                              shop.isOpen 
                                ? "bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/20 hover:bg-[#D73229]" 
                                : "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5 shadow-none"
                            }`}
                          >
                            ADD
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {filteredCategories.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-20 border border-white/10">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No items found</p>
          </div>
        )}
      </div>

      {/* ─── FLOATING MENU BUTTON ─── */}
      <motion.div 
        animate={{ bottom: isNavVisible ? 104 : 24 }}
        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
        className="fixed right-6 z-[60]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
          className="flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-full shadow-2xl text-white font-black tracking-widest uppercase text-[12px] active:scale-95 transition-all"
        >
          <Utensils className="w-5 h-5 text-red-500" />
          Menu
        </motion.button>

        {/* Category Selector Popup (iPhone UI Redesign) */}
        <AnimatePresence>
          {isCategoryMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-20 right-0 w-72 bg-[#1c1c1e]/90 border border-white/10 rounded-[2.5rem] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl"
            >
               <div className="p-7 max-h-[60vh] flex flex-col">
                  <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] mb-6 px-1">Jump To Category</h3>
                  
                  <div className="flex flex-col gap-2.5 overflow-y-auto scrollbar-hide pr-1">
                     {shop.categories.map((cat) => (
                        <button 
                           key={cat.category}
                           onClick={() => {
                              const el = document.getElementById(`category-${cat.category}`);
                              if (el) {
                                 const headerOffset = 100;
                                 const elementPosition = el.getBoundingClientRect().top;
                                 const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                 window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                              }
                              setIsCategoryMenuOpen(false);
                           }}
                           className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 text-left transition-all group active:scale-[0.98]"
                        >
                           <span className="text-[15px] font-bold text-white group-hover:text-red-400 transition-colors">{cat.category}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-[11px] font-black text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{cat.items.length}</span>
                           </div>
                        </button>
                     ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                    <button 
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="text-[11px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Close Menu
                    </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>



    </div>
  );
}
