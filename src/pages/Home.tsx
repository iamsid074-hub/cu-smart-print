import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ChevronDown,
  Package,
  Shield,
  Ban,
  ShieldCheck,
  Headset,
  ExternalLink,
  Loader2,
  Compass,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import VendingMachine from "@/components/VendingMachine";
import { supabase } from "@/lib/supabase";
import MembershipBanner from "@/components/MembershipBanner";
import HomeSpecialSections from "@/components/HomeSpecialSections";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
import type { Database } from "@/types/supabase";

const categories = [
  { id: "All", label: "All" },
  { id: "Electronics", label: "Electronics" },
  { id: "Books", label: "Books" },
  { id: "Fashion", label: "Fashion" },
  { id: "Sports", label: "Sports" },
  { id: "Furniture", label: "Furniture" },
];

function DynamicIsland({ navigate }: { navigate: any }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto sm:min-w-[400px]">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1c1c1e]/80 backdrop-blur-3xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-full pl-6 pr-2.5 py-2 flex items-center justify-between gap-4"
      >
        <span className="text-[13px] sm:text-[14px] text-white font-black tracking-widest leading-none truncate">CU BAZZAR</span>
        
        <button 
          onClick={() => navigate('/search')}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5 shrink-0"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
      </motion.div>
    </div>
  );
}

function HeroSpotlight() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-[2.5rem] overflow-hidden mb-12 group cursor-pointer shadow-2xl" onClick={() => navigate('/browse')}>
      <motion.img 
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2681&auto=format&fit=crop" 
        alt="Spotlight" 
        animate={{ scale: [1.05, 1.15, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[#000000]" />
      
      <div className="absolute inset-x-6 bottom-12 z-10 flex flex-col items-center text-center">
        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Your Campus Marketplace</span>
        </motion.div>
        
        <motion.h1 initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.3}} className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-[0.95] text-center">
          CU<br/>Bazzar.
        </motion.h1>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodCat, setActiveFoodCat] = useState("all");
  const [homeMode, setHomeMode] = useState<"meal" | "vending">("meal");

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      let query = supabase
        .from("products")
        .select(`*, profiles(full_name)`)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      setProducts(data || []);
      setProductsLoading(false);
    }
    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="min-h-screen pb-32 relative bg-[#000000] text-white selection:bg-orange-500 selection:text-white">
      <DynamicIsland navigate={navigate} />

      {/* Main Content Padding for Island */}
      <div className="pt-24 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto">
          
          <HeroSpotlight />

          <div className="mb-0">
            <MembershipBanner />
          </div>

          {/* Luxury Mode Switcher */}
          <div className="flex items-center justify-center mb-10 -mt-2 relative z-20">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[1.2rem] flex items-center shadow-lg relative">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="absolute top-1.5 bottom-1.5 rounded-[0.9rem] bg-white shadow-md border border-white"
                style={{
                  left: homeMode === "meal" ? "6px" : "calc(50% + 3px)",
                  width: "calc(50% - 9px)",
                }}
              />
              <button
                onClick={() => setHomeMode("meal")}
                className={`relative z-10 px-5 sm:px-8 py-2 sm:py-2.5 rounded-[0.9rem] text-[12px] sm:text-[13px] font-bold transition-colors min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none ${
                  homeMode === "meal" ? "text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Hot Meals
              </button>
              <button
                onClick={() => setHomeMode("vending")}
                className={`relative z-10 px-5 sm:px-8 py-2 sm:py-2.5 rounded-[0.9rem] text-[12px] sm:text-[13px] font-bold transition-colors min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none ${
                  homeMode === "vending" ? "text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Campus Vending
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {homeMode === "meal" && (
              <motion.div
                key="meal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <HomeSpecialSections
                  activeCat={activeFoodCat}
                  onCatChange={setActiveFoodCat}
                />

                {/* Campus Market Grid below Food */}
                {activeFoodCat === "all" && (
                   <section className="mb-10 sm:mb-16 mt-16 pt-8 border-t border-white/10">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                       <div className="flex items-center gap-3">
                         <TrendingUp className="w-6 h-6 text-orange-500" />
                         <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                           Campus Market
                         </h2>
                       </div>
                       <Link
                         to="/browse"
                         className="flex items-center gap-1 text-[14px] text-gray-400 font-bold hover:text-white transition-colors"
                       >
                         View Market <ChevronRight className="w-4 h-4" />
                       </Link>
                     </div>
                     
                     <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1">
                       {categories.map((cat) => {
                         const isActive = activeCategory === cat.id;
                         return (
                           <button
                             key={cat.id}
                             onClick={() => setActiveCategory(cat.id)}
                             className={`px-5 py-2.5 rounded-full font-bold transition-all flex-shrink-0 text-[13px] shadow-sm border ${
                               isActive
                                 ? "bg-white text-black border-white"
                                 : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                             }`}
                           >
                             {cat.label}
                           </button>
                         );
                       })}
                     </div>

                     {productsLoading ? (
                       <div className="flex flex-col items-center justify-center py-20 gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                       </div>
                     ) : (
                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                         {products.slice(0, 5).map((p, i) => (
                           <div key={p.id} className="relative group rounded-3xl overflow-hidden bg-[#1c1c1e] border border-white/5 hover:border-white/20 transition-all duration-500">
                             <div className="aspect-square bg-[#0a0a0a] overflow-hidden">
                               <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title}/>
                             </div>
                             <div className="p-4">
                               <h3 className="font-bold text-[15px] truncate text-white">{p.title}</h3>
                               <p className="text-[14px] font-black mt-1 text-orange-400">₹{p.price}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </section>
                )}
              </motion.div>
            )}

            {homeMode === "vending" && (
              <motion.div
                key="vending"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="pt-6"
              >
                <VendingMachine />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
