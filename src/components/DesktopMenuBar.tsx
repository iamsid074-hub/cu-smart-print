import { useEffect, useState } from "react";
import { Search, Wifi, Battery, BatteryMedium } from "lucide-react";

export default function DesktopMenuBar() {
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
    <div className="fixed top-0 left-0 right-0 h-[30px] bg-[#535353]/40 backdrop-blur-[50px] flex items-center justify-between px-5 text-[14px] text-white/95 z-50">
      <div className="flex items-center gap-5">
        {/* Apple-like CU Logo or Bazzar text */}
        <div className="flex items-center justify-center font-bold text-[16px] tracking-tighter">
          CU
        </div>
        <span className="font-bold text-white cursor-default">Bazzar</span>
        <span className="cursor-default hover:text-white transition-colors">File</span>
        <span className="cursor-default hover:text-white transition-colors">Edit</span>
        <span className="cursor-default hover:text-white transition-colors">View</span>
        <span className="cursor-default hover:text-white transition-colors">Go</span>
        <span className="cursor-default hover:text-white transition-colors">Window</span>
        <span className="cursor-default hover:text-white transition-colors">Help</span>
      </div>

      <div className="flex items-center gap-4">
        <Wifi className="w-[14px] h-[14px]" />
        <BatteryMedium className="w-[16px] h-[16px]" />
        <Search className="w-[14px] h-[14px]" />
        <div className="font-medium">{timeStr}</div>
      </div>
    </div>
  );
}
