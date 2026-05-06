import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Building2, DoorOpen, X, Loader2, CheckCircle, Navigation } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { toast } from "sonner";

const HOSTEL_GROUPS = [
  { 
    name: "North Campus Series", 
    description: "Primary residential blocks",
    options: ["NC1", "NC2", "NC3", "NC4", "NC5", "NC6"] 
  },
  {
    name: "Zakir Series",
    description: "Premium residential wing",
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

  const handleSave = () => {
    if (!hostel || !room) {
      toast.error("Please select your hostel and room number");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      saveLocation({ hostel, room, phone: data?.phone || "" });
      setIsSaving(false);
      setIsExpanded(false);
      toast.success("Delivery address updated successfully!");
    }, 800);
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* Desktop Shortcut (Windows Style) */}
      <div className="fixed left-8 top-12 z-[100] hidden xl:block">
        <div ref={widgetRef} className="relative flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors w-28 active:scale-95"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md transition-all relative">
              <MapPin className="w-9 h-9 text-white" />
              <div className="absolute bottom-0.5 left-0.5 bg-white w-5 h-5 rounded-sm flex items-center justify-center border border-black/10 shadow-sm">
                 <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-blue-600 rotate-[-135deg] translate-x-[0.5px] translate-y-[0.5px]" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-white text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,1)] px-1 w-full" style={{ textShadow: "0 1px 4px rgba(0,0,0,1)" }}>
              Set Delivery Location
            </span>
          </button>
        </div>
      </div>

      {/* Large Modal Window Redesign */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            {/* Backdrop with heavy blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />

            {/* Large Window Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl h-auto min-h-[600px] rounded-[3.5rem] overflow-hidden border border-white/40 flex flex-col xl:flex-row"
              style={{ 
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(60px) saturate(210%)",
                WebkitBackdropFilter: "blur(60px) saturate(210%)",
                boxShadow: "0 40px 120px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
              }}
            >
              {/* Left Side: Visual/Branding Section */}
              <div className="hidden xl:flex w-2/5 bg-gradient-to-br from-blue-600/20 to-indigo-600/30 border-r border-white/20 p-12 flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Navigation className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">Delivery<br/>Information</h2>
                    <p className="mt-4 text-gray-700 font-medium leading-relaxed">
                      Please specify your exact hostel and room number to ensure your order reaches you flawlessly.
                    </p>
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Campus</p>
                      <p className="text-sm font-bold text-gray-800">Chandigarh University</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Form Section */}
              <div className="flex-1 p-8 xl:p-12 flex flex-col h-full relative">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex-1 flex flex-col space-y-10">
                  {/* Form Header */}
                  <div className="xl:hidden text-center pb-4">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Set Delivery</h2>
                  </div>

                  {/* Hostel Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h4 className="text-lg font-black text-gray-900">Select Hostel</h4>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hostel Block Series</p>
                      </div>
                    </div>

                    <div className="space-y-8 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                      {HOSTEL_GROUPS.map((group) => (
                        <div key={group.name} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-gray-500/70 uppercase tracking-[0.2em]">
                              {group.name}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {group.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setHostel(opt)}
                                className={`h-16 rounded-[1.5rem] text-[15px] font-black transition-all border flex flex-col items-center justify-center gap-0.5 ${
                                  hostel === opt
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/30 scale-[1.05] z-10"
                                    : "bg-white/30 text-gray-700 border-white/60 hover:border-blue-500/40 hover:bg-white/60"
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

                  {/* Room Number Entry */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-gray-900 px-1">Room Number</h4>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                        <DoorOpen className="w-6 h-6" />
                      </div>
                      <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter your room number (e.g. 402)"
                        className="w-full h-16 bg-white/40 border border-white/60 rounded-[1.5rem] pl-16 pr-8 text-lg font-bold text-gray-900 focus:outline-none focus:ring-8 focus:ring-blue-600/10 focus:bg-white/80 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full h-18 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-600/40 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          <span>Confirm Delivery Address</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
