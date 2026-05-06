import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Building2, DoorOpen, X, Loader2, CheckCircle } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { toast } from "sonner";

const HOSTEL_GROUPS = [
  { name: "NC Series", options: ["NC1", "NC2", "NC3", "NC4", "NC5", "NC6"] },
  {
    name: "Zakir Series",
    options: ["Zakir A", "Zakir B", "Zakir C", "Zakir D"],
  },
];

export default function FloatingLocationWidget() {
  const { data, saveLocation, isLoaded } = useUserLocation();
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        // Only collapse if it's not the window itself (which has its own backdrop)
        // Actually, since it's centered now, we'll use a standard backdrop
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
      toast.error("Please select a hostel and enter a room number");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      saveLocation({ hostel, room, phone: data?.phone || "" });
      setIsSaving(false);
      setIsExpanded(false);
      toast.success("Location updated!");
    }, 600);
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* Desktop Shortcut Style (Like Windows) */}
      <div className="fixed left-8 top-12 z-[100] hidden xl:block">
        <div ref={widgetRef} className="relative flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors w-28 active:scale-95"
          >
            {/* The "Icon" part */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:bg-blue-400 transition-all relative">
              <MapPin className="w-9 h-9 text-white" />
              
              {/* Shortcut Arrow (Windows style) */}
              <div className="absolute bottom-0.5 left-0.5 bg-white w-5 h-5 rounded-sm flex items-center justify-center border border-black/10 shadow-sm">
                 <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-blue-600 rotate-[-135deg] translate-x-[0.5px] translate-y-[0.5px]" />
              </div>
            </div>

            {/* The "Label" part */}
            <span 
              className="text-[11px] font-bold text-white text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1 w-full"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,1)" }}
            >
              Set Delivery Location
            </span>
          </button>

          {/* Expanded Widget (Floating Window Style) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden border border-white/40 z-[1001]"
                style={{ 
                  background: "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(50px) saturate(200%)",
                  WebkitBackdropFilter: "blur(50px) saturate(200%)",
                  boxShadow: "0 8px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                }}
              >
                {/* Header / Title Bar */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Set Delivery</h3>
                  <button 
                    onClick={() => setIsExpanded(false)} 
                    className="p-2.5 hover:bg-black/5 rounded-full text-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-8 pb-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {/* Hostel Selection */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-blue-600/80 uppercase tracking-[0.2em] pl-1">
                      Hostel Block
                    </label>
                    <div className="space-y-6">
                      {HOSTEL_GROUPS.map((group) => (
                        <div key={group.name} className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {group.name}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {group.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setHostel(opt)}
                                className={`py-3 px-2 rounded-2xl text-[13px] font-black transition-all border ${
                                  hostel === opt
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-[1.03]"
                                    : "bg-white/40 text-gray-700 border-white/60 hover:border-blue-500/40 hover:bg-white/60"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Number */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-blue-600/80 uppercase tracking-[0.2em] pl-1">
                      Room Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 402"
                        className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl pl-12 pr-6 text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white/70 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/30 group disabled:opacity-70"
                  >
                    {isSaving ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirm Delivery Location</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop for the "Window" */}
      <AnimatePresence>
        {isExpanded && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/20 backdrop-blur-md z-[1000] xl:block hidden"
             onClick={() => setIsExpanded(false)}
           />
        )}
      </AnimatePresence>
    </>
  );
}
