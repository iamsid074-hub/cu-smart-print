import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useMembership } from '@/hooks/useMembership';
import EditLocationModal from './EditLocationModal';
import MembershipPlansModal from './MembershipPlansModal';

export default function UserLocationCard() {
  const { data, isLoaded } = useUserLocation();
  const { isActive, plan } = useMembership();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const location = useLocation();

  if (!isLoaded || location.pathname !== '/home') return null;

  const hasLocation = data && (data.hostel || data.phone);

  return (
    <>
      <div className="absolute top-[4.5rem] sm:top-[6rem] left-0 right-0 z-[99] pointer-events-none drop-shadow-sm flex justify-center">
        <div className="w-full max-w-[1600px] px-4 lg:px-10 flex justify-between items-center">

        <div className="flex flex-col items-start gap-1 pointer-events-auto relative">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none pl-[2px]">
            Your location
          </p>
          <button 
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1 text-slate-900 transition-opacity hover:opacity-80 group max-w-[140px] sm:max-w-[180px]"
          >
            <div className="bg-purple-100 p-1 rounded-lg mr-0.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={3} />
            </div>
            <span className="text-[13px] sm:text-[15px] font-black tracking-tight truncate ml-0.5 leading-snug">
              {hasLocation ? `${data.room}, ${data.hostel}` : "Add Location"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 mt-0.5" strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {isActive && (
            <button 
              onClick={() => setIsPlansOpen(true)}
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all outline outline-2 outline-white/50"
            >
              MEMBER
            </button>
          )}
          <Link 
            to="/profile" 
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-purple-100 shadow-[0_2px_12px_rgba(127,119,221,0.15)] flex items-center justify-center text-purple-600 hover:text-purple-700 hover:scale-105 transition-all pointer-events-auto"
          >
            <User className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </Link>
        </div>
        </div>
      </div>

      <EditLocationModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      <MembershipPlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />
    </>
  );
}
