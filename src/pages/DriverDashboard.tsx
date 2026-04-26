import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, MapPin, Power, ShieldCheck, Wifi, Signal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Geolocation } from '@capacitor/geolocation';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState("Standing By");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: string;
    let channel = supabase.channel('delivery-tracking', {
        config: {
            broadcast: { self: true, ack: true }
        }
    });

    channel.subscribe();

    const startTracking = async () => {
      try {
        setStatus("Initializing GPS...");
        
        // Request permissions (only mandatory on native APK)
        try {
          const permissions = await Geolocation.requestPermissions();
          if (permissions.location !== 'granted' && permissions.location !== 'prompt') {
            setError("GPS Permission Denied");
            setIsLive(false);
            return;
          }
        } catch (e) {
          console.warn("Permission request skipped or failed:", e);
        }

        setStatus("Tracking Active");
        
        // Use Geolocation (Works for both APK and Web)
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          (pos) => {
            if (pos) {
              const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
              setLocation(newPos);
              
              // Broadcast to Supabase
              channel.send({
                type: 'broadcast',
                event: 'location-update',
                payload: { 
                  lat: pos.coords.latitude, 
                  lng: pos.coords.longitude,
                  timestamp: new Date().toISOString(),
                  driverId: user?.id 
                }
              });
            }
          }
        );
      } catch (err) {
        console.error("GPS Error:", err);
        setError("GPS Initialization Error");
        setIsLive(false);
      }
    };

    if (isLive) {
      startTracking();
    } else {
      setStatus("Standing By");
    }

    return () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
      supabase.removeChannel(channel);
    };
  }, [isLive, user]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Partner Hub</h1>
          <p className="text-emerald-500 text-[10px] uppercase font-bold tracking-[0.2em]">Native Android Tracking</p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center border-emerald-500/50">
            <Signal className={isLive ? "text-emerald-500 animate-pulse" : "text-white/20"} />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <motion.div 
          onClick={() => setIsLive(!isLive)}
          whileTap={{ scale: 0.95 }}
          className={`relative overflow-hidden p-8 rounded-[2.5rem] border transition-all cursor-pointer ${
            isLive 
            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]" 
            : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${isLive ? "bg-emerald-500" : "bg-white/10"}`}>
              <Power className={`w-8 h-8 ${isLive ? "text-black" : "text-white"}`} />
            </div>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
                Broadcasting
              </div>
            )}
          </div>
          
          <h2 className="text-4xl font-black mb-2">{isLive ? "TRANSMITTING" : "START DRIVE"}</h2>
          <p className="text-white/40 text-sm">{isLive ? "Your live coordinates are syncing with Bazzar Satellites" : "Tap to activate your native GPS for tracking"}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Wifi className="w-5 h-5 text-blue-500 mb-4" />
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">P2P Status</p>
            <p className="text-lg font-bold">{isLive ? "Linked" : "Offline"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <MapPin className="w-5 h-5 text-purple-500 mb-4" />
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Precision</p>
            <p className="text-lg font-bold">{isLive ? "High" : "Low"}</p>
          </div>
        </div>

        <AnimatePresence>
          {location && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Navigation2 className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Live Telemetry</span>
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-mono text-emerald-400">COORDS: {location[0].toFixed(5)}, {location[1].toFixed(5)}</p>
                 <p className="text-[10px] text-white/20 mt-2 font-mono">BROADCASTING AT 50MS LATENCY</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4" />
        Verified Logistic Node: {user?.id?.slice(0, 8)}
      </div>

      {error && (
        <div className="fixed bottom-10 left-6 right-6 p-4 bg-red-500 text-black font-black rounded-2xl text-center uppercase text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
