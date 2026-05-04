import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, MapPin, Search } from "lucide-react";
import { shops } from "@/config/shopMenus";
import DesktopWindow from "./DesktopWindow";

export default function DesktopWindowShops({ onClose }: { onClose: () => void }) {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedShop = shops.find((s) => s.id === selectedShopId);

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DesktopWindow
      title={selectedShop ? selectedShop.name : "Shops"}
      onClose={onClose}
      onBack={selectedShopId ? () => setSelectedShopId(null) : undefined}
      size="xl"
    >
      <div className="p-6">
        <AnimatePresence mode="wait">
          {!selectedShopId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-5"
            >
              {/* Search */}
              <div className="relative max-w-sm mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shops…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black/5 border border-black/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => (
                  <motion.div
                    key={shop.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedShopId(shop.id)}
                    className="rounded-xl bg-white/60 border border-black/5 hover:border-blue-400/50 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="relative h-28 rounded-t-xl overflow-hidden">
                      <img
                        src={shop.heroImage}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {shop.rating}
                      </div>
                      {!shop.isOpen && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Closed</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm">{shop.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{shop.tag}</p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shop.deliveryTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shop.distance}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-8"
            >
              {selectedShop!.categories.map((cat) => (
                <div key={cat.category} className="space-y-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-1 h-5 bg-orange-500 rounded-full" />
                    {cat.category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-black/5"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <span className="text-sm font-bold text-orange-600">&#8377;{item.price}</span>
                        </div>
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
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
    </DesktopWindow>
  );
}
