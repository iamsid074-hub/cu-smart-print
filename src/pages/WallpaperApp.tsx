import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";
import { useWallpaper, useSetWallpaper } from "../contexts/WallpaperContext";

interface WallpaperOption {
  id: string;
  url: string;
  name: string;
  accent: string; // dominant color for thumbnail ring
}

const WALLPAPERS: WallpaperOption[] = [
  {
    id: "liquid-glass",
    url: "/1stwall.webp",
    name: "Liquid Glass",
    accent: "#a855f7",
  },
  {
    id: "golden-wave",
    url: "/wallpapers/wallpaper-1.webp",
    name: "Golden Wave",
    accent: "#d4af37",
  },
  {
    id: "silk-aurora",
    url: "/wallpapers/wallpaper-2.webp",
    name: "Silk Aurora",
    accent: "#c084fc",
  },
  {
    id: "luminance",
    url: "/wallpapers/wallpaper-3.webp",
    name: "Luminance",
    accent: "#818cf8",
  },
];

export default function WallpaperApp() {
  const navigate = useNavigate();
  const currentWallpaper = useWallpaper();
  const setWallpaper = useSetWallpaper();
  const [selected, setSelected] = useState<string>(currentWallpaper);
  const [applied, setApplied] = useState<string>(currentWallpaper);

  const handleSelect = (url: string) => {
    setSelected(url);
  };

  const handleApply = () => {
    setWallpaper(selected);
    setApplied(selected);

    // Brief flash feedback then go back
    setTimeout(() => navigate(-1), 500);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: "#0a0a0f",
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Wallpaper preview — full bleed behind content */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${selected})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35) saturate(1.4)",
        }}
      />

      {/* Frosted overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[58px] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-white font-semibold text-base tracking-wide">Wallpaper</h1>
        <div className="w-14" /> {/* spacer */}
      </div>

      {/* Removed Preview label for cleaner look */}

      {/* Wallpaper grid */}
      <div className="relative z-10 flex-1 px-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 pb-36">
          {WALLPAPERS.map((wp) => {
            const isActive = selected === wp.url;
            return (
              <motion.button
                key={wp.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(wp.url)}
                className="relative rounded-2xl overflow-hidden aspect-[9/16] w-full focus:outline-none"
                style={{
                  boxShadow: isActive
                    ? "0 12px 48px rgba(0,0,0,0.8)"
                    : "0 4px 20px rgba(0,0,0,0.5)",
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* Thumbnail */}
                <img
                  src={wp.url}
                  alt={wp.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />

                {/* Name overlay */}
                <div
                  className="absolute bottom-0 inset-x-0 px-3 py-2"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  }}
                >
                  <p className="text-white text-xs font-medium truncate">{wp.name}</p>
                </div>

                {/* Check badge */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: wp.accent }}
                    >
                      <Check size={13} strokeWidth={3} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Apply button — pinned to bottom */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 px-5 pb-10 pt-4"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 60%, transparent 100%)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleApply}
          disabled={selected === applied}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300"
          style={{
            background:
              selected !== applied
                ? "#FFFFFF"
                : "rgba(255,255,255,0.1)",
            color: selected !== applied ? "#000000" : "#FFFFFF",
            opacity: selected !== applied ? 1 : 0.5,
            boxShadow:
              selected !== applied
                ? "0 8px 32px rgba(255,255,255,0.2)"
                : "none",
          }}
        >
          {selected === applied ? "Applied ✓" : "Set as Wallpaper"}
        </motion.button>
      </div>
    </div>
  );
}
