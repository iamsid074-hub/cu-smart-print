import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Building2, DoorOpen, X } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { toast } from "sonner";

export default function FloatingLocationWidget() {
  const { data, saveLocation, isLoaded } = useUserLocation();
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && data) {
      setHostel(data.hostel || "");
      setRoom(data.room || "");
    }
  }, [isLoaded, data]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleSave = () => {
    if (!hostel || !room) {
      toast.error("Please fill in both hostel and room number");
      return;
    }
    saveLocation({ hostel, room, phone: data?.phone || "" });
    setIsExpanded(false);
    toast.success("Location updated!");
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* Desktop Shortcut Style (Like Windows) */}
      <div className="fixed left-8 top-12 z-[100] hidden xl:block">
        <div ref={widgetRef} className="relative flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors w-24 active:scale-95"
          >
            {/* The "Icon" part */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
              <MapPin className="w-9 h-9 text-white drop-shadow-md" />
              
              {/* Shortcut Arrow (Windows style) */}
              <div className="absolute bottom-1 left-3 bg-white w-4 h-4 rounded-sm flex items-center justify-center border border-gray-300">
                 <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-blue-600 rotate-[-135deg] translate-x-[1px] translate-y-[1px]" />
              </div>
            </div>

            {/* The "Label" part */}
            <span 
              className="text-[11px] font-bold text-white text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
            >
              Set Delivery Location
            </span>
          </button>

          {/* Expanded Widget (Floating near the shortcut) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className="absolute left-full ml-6 top-0 w-72 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.3)] overflow-hidden border border-white/40"
                style={{ 
                  background: "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(40px) saturate(190%)",
                  WebkitBackdropFilter: "blur(40px) saturate(190%)",
                  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="p-2 flex justify-end">
                  <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/20 rounded-full text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 pb-8 space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Set Delivery</h3>
                    <p className="text-[11px] font-bold text-gray-500/60 uppercase tracking-widest">Where are you today?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                        placeholder="Hostel Block"
                        className="w-full h-12 bg-white/40 border border-white/50 rounded-2xl pl-11 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/60 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Room Number"
                        className="w-full h-12 bg-white/40 border border-white/50 rounded-2xl pl-11 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/60 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full h-12 bg-blue-600 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 group"
                  >
                    <span>Confirm</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
