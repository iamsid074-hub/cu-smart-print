import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import EditLocationModal from './EditLocationModal';

export default function UserLocationCard() {
  const { data, isLoaded } = useUserLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!isLoaded) return null;

  const hasLocation = data && (data.hostel || data.phone);

  return (
    <>
      <div className="fixed top-3 sm:top-5 left-4 z-[10000] flex flex-col items-start gap-1 pointer-events-auto drop-shadow-sm">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none pl-0.5">
          Your location
        </p>
        <button 
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-1 text-slate-900 transition-opacity hover:opacity-80 group max-w-[140px] sm:max-w-[180px]"
        >
          <MapPin className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-800 shrink-0" strokeWidth={2.5} />
          <span className="text-[13px] sm:text-[15px] font-black tracking-tight truncate ml-0.5 leading-snug">
            {hasLocation ? `${data.hostel} ${data.room}` : "Add Location"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 mt-0.5" strokeWidth={3} />
        </button>
      </div>

      <EditLocationModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
