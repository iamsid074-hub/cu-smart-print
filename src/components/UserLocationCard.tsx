import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useUserLocation } from '@/hooks/useUserLocation';
import EditLocationModal from './EditLocationModal';

export default function UserLocationCard() {
  const { data, isLoaded } = useUserLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const location = useLocation();

  if (!isLoaded || location.pathname !== '/home') return null;

  const hasLocation = data && (data.hostel || data.phone);

  return (
    <>
      <div className="absolute top-[4.5rem] sm:top-5 left-0 right-0 px-4 lg:px-8 z-[99] flex justify-between items-center pointer-events-none drop-shadow-sm">
        {/* Optimized Premium Purple Background Shine without heavy CSS blurs */}
        <div className="absolute inset-0 z-[-1] flex items-center justify-center pointer-events-none transform-gpu overflow-hidden">
          <div 
            className="w-[120%] h-[150%] max-w-[600px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top center, rgba(127,119,221,0.25) 0%, rgba(127,119,221,0.05) 40%, transparent 70%)',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          />
        </div>

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
              {hasLocation ? `${data.hostel} ${data.room}` : "Add Location"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 mt-0.5" strokeWidth={3} />
          </button>
        </div>
        
        <Link 
          to="/profile" 
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-purple-100 shadow-[0_2px_12px_rgba(127,119,221,0.15)] flex items-center justify-center text-purple-600 hover:text-purple-700 hover:scale-105 transition-all pointer-events-auto"
        >
          <User className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </Link>
      </div>

      <EditLocationModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
