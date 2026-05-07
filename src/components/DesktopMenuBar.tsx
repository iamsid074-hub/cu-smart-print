import { Search, Wifi, Battery, BatteryMedium } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DesktopMenuBar({ notification }: { notification?: string | null }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Mon 31 May 05:30 (or standard system format)
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      setTimeStr(now.toLocaleDateString('en-US', options).replace(/,/g, ''));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="desktop-menu-bar" className="fixed top-0 left-0 right-0 h-[30px] bg-[#535353]/40 backdrop-blur-[50px] flex items-center justify-between px-5 text-[14px] text-white/95 z-50 select-none cursor-default">
      <div className="flex items-center gap-5">
      <div className="flex items-center gap-1.5 font-bold text-[16px] cursor-default select-none">
        <span className="tracking-tighter text-white">CU</span>
        <span className="text-white">Bazzar</span>
      </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <Wifi className="w-[14px] h-[14px]" />
        <BatteryMedium className="w-[16px] h-[16px]" />
        <div className="font-medium select-none cursor-default">{timeStr}</div>

        {/* Liquid Notification Box */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute top-[35px] right-0 bg-[#ff3b30]/10 backdrop-blur-2xl border border-[#ff3b30]/30 px-4 py-2 rounded-2xl shadow-2xl z-[100] min-w-[280px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse shadow-[0_0_8px_#ff3b30]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white leading-tight">
                  {notification}
                </span>
              </div>
              {/* Liquid nub pointing up to clock */}
              <div className="absolute -top-[5px] right-[40px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#ff3b30]/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
