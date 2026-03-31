import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Edit2 } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import EditLocationModal from './EditLocationModal';

export default function UserLocationCard() {
  const { data, isLoaded } = useUserLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Smooth appearance matching iOS design language
  if (!isLoaded || !data || (!data.hostel && !data.phone)) return null;

  return (
    <>
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-[320px] px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative rounded-3xl p-4 sm:p-5 bg-white/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 pointer-events-auto"
        >
          {/* Edit Button */}
          <button 
            onClick={() => setIsEditOpen(true)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100/50 hover:bg-slate-200/50 flex items-center justify-center text-slate-500 hover:text-brand transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col gap-3">
            {/* Location Line */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[10px] font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">Delivery Details</p>
                <div className="flex items-baseline gap-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate leading-snug">{data.hostel}</p>
                    {data.room && <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Rm {data.room}</span>}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-slate-200/60 ml-11" />

            {/* Phone Line */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 tracking-tight">+91 {data.phone}</p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" title="Active Contact" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EditLocationModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
