import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Home, Building2, DoorOpen } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { toast } from "sonner";

export default function FloatingLocationWidget() {
  const { data, saveLocation, isLoaded } = useUserLocation();
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isLoaded && data) {
      setHostel(data.hostel || "");
      setRoom(data.room || "");
    }
  }, [isLoaded, data]);

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
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-[100] hidden xl:block">
      <motion.div
        layout
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="ios-glass p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col items-center"
        style={{ width: isExpanded ? 260 : 72 }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center transition-all duration-500 relative group overflow-hidden ${
            isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/40 text-gray-800'
          }`}
        >
          <motion.div
            animate={{ scale: isExpanded ? 1.1 : 1, rotate: isExpanded ? 360 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <MapPin className="w-7 h-7" />
          </motion.div>
          {!isExpanded && (
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              className="w-full px-5 py-6 space-y-6 overflow-hidden"
            >
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">Set Delivery</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hostel & Room</p>
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
                    placeholder="Hostel (e.g. NC4)"
                    className="w-full h-12 bg-white/60 border border-black/5 rounded-2xl pl-11 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all placeholder:text-gray-400"
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
                    className="w-full h-12 bg-white/60 border border-black/5 rounded-2xl pl-11 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all placeholder:text-gray-400"
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
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="py-4 flex flex-col gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
