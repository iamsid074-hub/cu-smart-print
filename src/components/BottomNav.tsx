import { memo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Layers, Gamepad2 } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (Math.abs(currentScrollY - lastScrollY) > 25) {
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY - 10) {
              setIsVisible(true);
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

  const isCart = location.pathname === "/cart";

  // Only hide on entirely standalone pages. 
  // We want this nav to appear on home, and potentially sections
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/games") // hide on games themselves? Wait, if they click Games, they go to /games. Let's keep it visible so they can go back.
  ) return null;

  return (
    <motion.div
      initial={false}
      animate={{ 
        y: isCart || !isVisible ? 110 : 0,
        opacity: isCart || !isVisible ? 0 : 1 
      }}
      transition={{ 
        type: "tween",
        duration: 0.25,
        ease: "easeOut"
      }}
      className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none will-change-transform"
      style={{ 
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transform: "translateZ(0)"
      }}
    >
      <div className="w-full max-w-[600px] flex items-center gap-3">
        {/* Left Pill (Dark) */}
        <div className="flex-1 bg-[#151518] rounded-full p-1 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.6)] pointer-events-auto border border-white/10 backdrop-blur-xl">
          <Link
            to="/home"
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-full transition-all ${
              location.pathname === "/home" || location.pathname === "/"
                ? "bg-white/10 text-white shadow-inner"
                : "text-gray-500 hover:bg-white/5"
            }`}
          >
            <Home size={22} strokeWidth={location.pathname === "/home" ? 2.5 : 2} className="mb-1" />
            <span className="text-[11px] font-bold tracking-tight leading-none">Home</span>
          </Link>
          
          <div className="w-[1px] h-8 bg-white/10 mx-1" />
          
          <Link
            to="/sections"
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-full transition-all ${
              location.pathname.startsWith("/sections")
                ? "bg-white/10 text-white shadow-inner"
                : "text-gray-500 hover:bg-white/5"
            }`}
          >
            <Layers size={22} strokeWidth={location.pathname.startsWith("/sections") ? 2.5 : 2} className="mb-1" />
            <span className="text-[11px] font-bold tracking-tight leading-none">Sections</span>
          </Link>
        </div>

        {/* Right Pill (Purple) */}
        <Link
          to="/games"
          className="shrink-0 bg-[#6320EE] hover:bg-[#5210D8] active:scale-95 text-white rounded-full px-6 py-2.5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(99,32,238,0.5)] pointer-events-auto transition-all border border-[#7A3FFF]/30"
        >
          <Gamepad2 size={24} strokeWidth={2.5} className="mb-1" />
          <span className="text-[12px] font-black tracking-tight leading-none italic uppercase">Games ↗</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default memo(BottomNav);
