import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, Clock, MapPin, Loader2, Target, SmartphoneLabel } from "lucide-react";

import "leaflet/dist/leaflet.css";

const CU_CENTER: [number, number] = [30.7673, 76.6074];

const deliveryIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="relative w-12 h-12 flex items-center justify-center">
            <div class="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
            <div class="w-10 h-10 bg-emerald-500 rounded-full border-4 border-[#0F0F10] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const userIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-blue-500/30 rounded-full animate-pulse"></div>
            <div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
               <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function RealTimeSatelliteMap() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [deliveryPos, setDeliveryPos] = useState<[number, number]>([30.7695, 76.6110]);
  const [isRealLive, setIsRealLive] = useState(false);
  const [eta, setEta] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  // ── 1. REAL-TIME BROADCAST LISTENER ─────────────────────────────────────
  // Listen for the driver's phone location updates via Supabase Broadcast
  useEffect(() => {
    const channel = supabase.channel('delivery-tracking');

    channel
      .on('broadcast', { event: 'location-update' }, (payload) => {
        console.log("REAL GPS RECEIVED:", payload);
        const { lat, lng } = payload.payload;
        setDeliveryPos([lat, lng]);
        setIsRealLive(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── 2. USER MOBILE GPS ──────────────────────────────────────────────────
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // ── 3. ETA & DISTANCE ───────────────────────────────────────────────────
  useEffect(() => {
    if (userPos && deliveryPos) {
      const lat1 = userPos[0];
      const lon1 = userPos[1];
      const lat2 = deliveryPos[0];
      const lon2 = deliveryPos[1];

      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;

      setDistanceKm(d);
      const speedKmH = 15;
      const timeHours = d / speedKmH;
      const timeMinutes = Math.max(Math.ceil(timeHours * 60), 1);
      setEta(timeMinutes);
      setProgress(Math.max(0, Math.min(100, (1 - d) * 100)));
    }
  }, [userPos, deliveryPos]);

  // ── 4. BACKUP SIMULATION ───────────────────────────────────────────────
  // Only move automatically if we haven't received a real live broadcast recently
  useEffect(() => {
    if (!userPos || isRealLive) return;
    const interval = setInterval(() => {
      setDeliveryPos(prev => {
        const dLat = userPos[0] - prev[0];
        const dLng = userPos[1] - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.00005) return prev; 
        return [prev[0] + (dLat / dist) * 0.000018, prev[1] + (dLng / dist) * 0.000018];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [userPos, isRealLive]);

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] bg-[#0A0A0A] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl mb-8 group">
      <div className="absolute inset-0">
        <MapContainer
          center={CU_CENTER}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png" opacity={0.4} />
          <ZoomControl position="bottomright" />

          <AnimatePresence>
            <Marker position={deliveryPos} icon={deliveryIcon} />
            {userPos && <Marker position={userPos} icon={userIcon} />}
            {userPos && (
              <Polyline 
                positions={[deliveryPos, userPos]} 
                color={isRealLive ? "#10b981" : "#ffffff"} 
                weight={3} 
                dashArray="12, 12" 
                opacity={0.5}
              />
            )}
          </AnimatePresence>

          <MapController userPos={userPos} deliveryPos={deliveryPos} isRealLive={isRealLive} />
        </MapContainer>
      </div>

      {/* ── LIVE BADGES ── */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
         <div className={`flex items-center gap-3 px-5 py-2 backdrop-blur-2xl border rounded-full transition-all ${
           isRealLive ? "bg-emerald-500/20 border-emerald-500/50" : "bg-black/60 border-white/10"
         }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${isRealLive ? "bg-emerald-500" : "bg-white/40"}`} />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
               {isRealLive ? "Satellite Link Active" : "Waiting for Driver..."}
            </span>
         </div>
      </div>

      <div className="absolute top-8 right-8 z-10">
         <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500 text-black rounded-full shadow-xl">
            <Navigation2 className="w-4 h-4 fill-black" />
            <span className="text-xs font-black uppercase tracking-tighter">{distanceKm.toFixed(2)} KM AWAY</span>
         </div>
      </div>

      <div className="absolute bottom-10 inset-x-8 z-10 flex flex-col gap-4">
         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Estimated Arrival</p>
               <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <span className="text-5xl font-black text-white tracking-tighter italic">
                     {userPos ? `${eta} MINS` : <Loader2 className="animate-spin w-10 h-10" />}
                  </span>
               </div>
            </div>
         </div>
         <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
         </div>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)] bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    </div>
  );
}

function MapController({ userPos, deliveryPos, isRealLive }: any) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (userPos && deliveryPos && !hasCentered.current) {
      const bounds = L.latLngBounds([userPos, deliveryPos]);
      map.fitBounds(bounds, { padding: [80, 80] });
      hasCentered.current = true;
    }
  }, [userPos, deliveryPos]);

  return (
    <button 
      onClick={() => {
        if (userPos && deliveryPos) {
          const bounds = L.latLngBounds([userPos, deliveryPos]);
          map.fitBounds(bounds, { padding: [100, 100], animate: true });
        }
      }}
      className="absolute bottom-40 right-2 z-[400] w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center text-white"
    >
      <Target className={`w-6 h-6 ${isRealLive ? "text-emerald-500" : ""}`} />
    </button>
  );
}
