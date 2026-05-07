import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

type DockItemWithImg = { name: string; path: string; img: string; imgClass?: string };
type DockItemWithIcon = { name: string; path: string; icon: React.ElementType; color: string };
type DockItem = DockItemWithImg | DockItemWithIcon;

const dockItemsRaw: DockItem[] = [
  { name: "Home",     path: "/home",            img: "/dock-home.webp" },
  { name: "Shops",    path: "/sections/shops",  img: "/dock-shops.webp" },
  { name: "Combos",   path: "/sections/combos", img: "/dock-combos.webp" },
  { name: "Games",    path: "/games",            img: "/dock-games.webp" },
  { name: "Cart",     path: "/cart",             img: "/dock-cart.webp" },
  { name: "Profile",  path: "/profile",          img: "/dock-profile.webp", imgClass: "scale-[1.15]" },
  { name: "Settings", path: "/settings",         img: "/dock-settings-v2.webp" },
];

export const dockItems = dockItemsRaw;

export default function DesktopDock({ onOpenWindow }: { onOpenWindow?: (id: string) => void }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div id="desktop-dock" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] flex items-end">
      <div
        className="flex items-end gap-3 px-4 pb-[6px] rounded-2xl border border-white/20 h-[62px]"
        style={{
          background: "rgba(83, 83, 83, 0.25)",
          backdropFilter: "blur(13px)",
          WebkitBackdropFilter: "blur(13px)",
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {dockItemsRaw.map((item, index) => {
          let size = 44;
          if (hoverIndex !== null) {
            const dist = hoverIndex - index;
            if (dist === 0)                size = 64;
            else if (Math.abs(dist) === 1) size = 54;
            else if (Math.abs(dist) === 2) size = 48;
          }

          const isActive = location.pathname.startsWith(item.path);
          const hasImg   = "img" in item;

          return (
            <div
              key={item.name}
              id={`dock-app-${item.name}`}
              className="relative group cursor-pointer flex flex-col items-center justify-end"
              onMouseEnter={() => setHoverIndex(index)}
              onClick={() => {
                const windowItems = ["Shops", "Combos", "Games", "Cart", "Profile", "Settings"];
                if (windowItems.includes(item.name) && onOpenWindow) {
                  onOpenWindow(item.name);
                } else {
                  navigate(item.path);
                }
              }}
            >
              {/* Tooltip */}
              <div
                className="absolute -top-12 bg-black/50 text-white/90 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backdropFilter: "blur(13px)" }}
              >
                {item.name}
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black/50" />
              </div>

              {/* Icon */}
              <motion.div
                className={`rounded-[12px] overflow-hidden shadow-lg flex items-center justify-center border border-white/20 relative ${hasImg ? "" : `bg-gradient-to-br ${(item as DockItemWithIcon).color}`}`}
                animate={{ width: size, height: size }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {hasImg ? (
                  <img
                    src={(item as DockItemWithImg).img}
                    alt={item.name}
                    className={`w-full h-full object-cover ${(item as DockItemWithImg).imgClass || ""}`}
                  />
                ) : (
                  (() => {
                    const IconComp = (item as DockItemWithIcon).icon;
                    return <IconComp className="text-white drop-shadow-sm" style={{ width: size * 0.5, height: size * 0.5 }} />;
                  })()
                )}
              </motion.div>

              {/* Active dot */}
              <div className="h-[6px] w-full flex items-center justify-center pt-[2px]">
                {isActive && (
                  <div className="w-[4px] h-[4px] rounded-full bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
