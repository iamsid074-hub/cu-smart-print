import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight, ShoppingBag, Gamepad2, Utensils, Wallet, User, Settings, ShoppingCart, Boxes } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SpotlightResult {
  id: string;
  type: "page" | "product" | "shop";
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  path: string;
  image?: string;
}

const QUICK_LINKS: SpotlightResult[] = [
  { id: "shops",    type: "page", title: "Shops",    subtitle: "Browse all campus stores",     icon: ShoppingBag, iconColor: "#f97316", iconBg: "#3b1a0a", path: "/sections/shops" },
  { id: "combos",   type: "page", title: "Combos",   subtitle: "Curated meal combinations",    icon: Utensils,    iconColor: "#a855f7", iconBg: "#2a1040", path: "/sections/combos" },
  { id: "grocery",  type: "page", title: "Grocery",  subtitle: "Daily essentials delivered",   icon: ShoppingCart,iconColor: "#22c55e", iconBg: "#0d2a18", path: "/grocery" },
  { id: "wallet",   type: "page", title: "Wallet",   subtitle: "Check balance & transactions", icon: Wallet,      iconColor: "#eab308", iconBg: "#2a2008", path: "/wallet" },
  { id: "games",    type: "page", title: "Games",    subtitle: "Play & win rewards",           icon: Gamepad2,    iconColor: "#ef4444", iconBg: "#2a0a0a", path: "/games" },
  { id: "profile",  type: "page", title: "Profile",  subtitle: "Your account details",         icon: User,        iconColor: "#ec4899", iconBg: "#2a0a1a", path: "/profile" },
  { id: "settings", type: "page", title: "Settings", subtitle: "Preferences & security",       icon: Settings,    iconColor: "#94a3b8", iconBg: "#1a1f2a", path: "/settings" },
  { id: "sections", type: "page", title: "Sections", subtitle: "All categories",               icon: Boxes,       iconColor: "#38bdf8", iconBg: "#0a1a2a", path: "/sections" },
];

interface MobileSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSpotlight({ isOpen, onClose }: MobileSpotlightProps) {
  const navigate   = useNavigate();
  const inputRef   = useRef<HTMLInputElement>(null);
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<SpotlightResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Debounced product search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("id, title, price, image_url, shop_id")
          .ilike("title", `%${query}%`)
          .limit(5);
        const productResults: SpotlightResult[] = (data || []).map(p => ({
          id: p.id,
          type: "product" as const,
          title: p.title,
          subtitle: `₹${p.price}`,
          path: `/product/${p.id}`,
          image: p.image_url,
        }));
        setResults(productResults);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((path: string) => {
    onClose();
    setTimeout(() => navigate(path), 180);
  }, [navigate, onClose]);

  const displayList = query.trim()
    ? results
    : QUICK_LINKS.filter(l => l.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[20000]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="fixed left-3 right-3 z-[20001]"
            style={{ top: "calc(env(safe-area-inset-top, 20px) + 12px)" }}
          >
            {/* Search bar */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] mb-2 border border-white/12"
              style={{ background: "rgba(22,22,28,0.98)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}
            >
              <Search className="w-4.5 h-4.5 text-white/40 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-white text-[16px] font-medium placeholder:text-white/35 outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {query ? (
                <button onClick={() => setQuery("")} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-3 h-3 text-white/70" />
                </button>
              ) : (
                <button onClick={onClose} className="text-white/40 text-sm font-medium">Cancel</button>
              )}
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {(displayList.length > 0 || isSearching) && (
                <motion.div
                  key={query || "quick"}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-[20px] overflow-hidden border border-white/10"
                  style={{ background: "rgba(16,16,20,0.97)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}
                >
                  {/* Section label */}
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest px-4 pt-3 pb-1">
                    {query.trim() ? "Products" : "Quick Access"}
                  </p>

                  {isSearching ? (
                    <div className="px-4 py-6 flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full" />
                    </div>
                  ) : (
                    displayList.map((item, i) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/8 transition-colors"
                      >
                        {/* Icon / image */}
                        <div
                          className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                          style={{ background: item.iconBg || "rgba(255,255,255,0.08)" }}
                        >
                          {item.image
                            ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                            : item.icon
                              ? <item.icon className="w-5 h-5" style={{ color: item.iconColor || "#fff" }} />
                              : <ShoppingBag className="w-5 h-5 text-white/40" />}
                        </div>
                        {/* Text */}
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                          {item.subtitle && <p className="text-white/40 text-xs truncate">{item.subtitle}</p>}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/25 flex-shrink-0" />
                      </motion.button>
                    ))
                  )}

                  {!isSearching && query.trim() && displayList.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-white/30 text-sm">No results for "{query}"</p>
                    </div>
                  )}
                  <div className="h-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
