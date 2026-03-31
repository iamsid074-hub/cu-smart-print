import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOSTEL_GROUPS = [
  { name: "NC Series", options: ["NC1", "NC2", "NC3", "NC4", "NC5", "NC6"] },
  { name: "Zakir Series", options: ["Zakir A", "Zakir B", "Zakir C", "Zakir D"] }
];

export default function EditLocationModal({ isOpen, onClose }: EditLocationModalProps) {
  const { data, saveLocation } = useUserLocation();
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      setHostel(data.hostel || "");
      setRoom(data.room || "");
      setPhone(data.phone || "");
    }
  }, [isOpen, data]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveLocation({ hostel, room, phone });
      setIsSaving(false);
      onClose();
    }, 400); // Small delay for UX
  };

  const isFormValid = hostel.trim() !== "" && room.trim() !== "" && phone.replace(/\D/g, "").length === 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden pb-8 sm:pb-0 mx-0 sm:mx-4"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Location</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Hostel Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Hostel Block</label>
                <div className="space-y-4">
                  {HOSTEL_GROUPS.map((group) => (
                    <div key={group.name}>
                      <p className="text-[10px] font-bold text-slate-400 mb-2 px-1">{group.name}</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setHostel(opt)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                              hostel === opt 
                              ? "bg-brand text-white border-brand shadow-md shadow-brand/20 scale-[1.02]" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-brand/40 hover:bg-slate-50"
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

              {/* Room Editor */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Room Number</label>
                <input
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 402"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand transition-all placeholder:font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Phone Editor */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand transition-all placeholder:font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-white border-t border-slate-50">
              <button 
                disabled={!isFormValid || isSaving}
                onClick={handleSave}
                className="w-full h-14 rounded-full bg-brand text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Save Location</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
