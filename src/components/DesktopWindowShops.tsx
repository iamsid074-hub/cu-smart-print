import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Star, Clock, MapPin, Search } from "lucide-react";
import { shops, Shop } from "@/config/shopMenus";

interface DesktopWindowShopsProps {
  onClose: () => void;
}

export default function DesktopWindowShops({ onClose }: DesktopWindowShopsProps) {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedShop = shops.find((s) => s.id === selectedShopId);

  const filteredShops = shops.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      className="fixed inset-0 m-auto w-[80%] h-[75%] max-w-[1000px] max-h-[700px] flex flex-col bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[100]"
    >
      {/* macOS Title Bar */}
      <div className="h-10 flex items-center px-4 bg-white/10 border-b border-white/10 select-none cursor-default">
        {/* Traffic Lights */}
        <div className="flex gap-2 w-20">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center group"
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Back Button if in Menu */}
        <div className="flex-1 flex justify-center items-center">
          {selectedShopId && (
            <button 
              onClick={() => setSelectedShopId(null)}
              className="mr-2 p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {selectedShop ? selectedShop.name : "Shops"}
          </span>
        </div>
        
        <div className="w-20" /> {/* Spacer for symmetry */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          {!selectedShopId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-white/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => (
                  <motion.div
                    key={shop.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedShopId(shop.id)}
                    className="p-4 rounded-xl bg-white/40 dark:bg-black/20 border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all group"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                      <img src={shop.heroImage} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {shop.rating}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{shop.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{shop.tag}</p>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {shop.deliveryTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shop.distance}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {selectedShop.categories.map((cat) => (
                <div key={cat.category} className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
                    {cat.category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.items.map((item) => (
                      <div 
                        key={item.name}
                        className="flex justify-between items-center p-3 rounded-lg bg-white/30 dark:bg-black/10 border border-white/5"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">&#8377;{item.price}</span>
                        </div>
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
