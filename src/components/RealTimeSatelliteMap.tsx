import React, { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, Clock, Loader2, Target, Bike, Home } from "lucide-react";

const MAPTILER_KEY = "jEk2ccOHJB7MWbvOKKBV";
// MapLibre uses [lng, lat]
const CU_CENTER: [number, number] = [76.6074, 30.7673];

const DRIVER_ICON_HTML = `
  <div class="marker-container">
    <div class="marker-pulse driver-pulse"></div>
    <div class="marker-card driver-card">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="9" cy="7.5" r="3.5"/>
        <polyline points="15 2 12 12 9 12"/><line x1="12" y1="12" x2="15" y2="12"/>
      </svg>
    </div>
  </div>
`;

const USER_ICON_HTML = `
  <div class="marker-container">
    <div class="marker-pulse user-pulse"></div>
    <div class="marker-card user-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  </div>
`;

export default function RealTimeSatelliteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [deliveryPos, setDeliveryPos] = useState<[number, number]>([76.6110, 30.7695]);
  const [driverHeading, setDriverHeading] = useState<number>(0);
  const [isRealLive, setIsRealLive] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const [eta, setEta] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const deliveryMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`,
      center: CU_CENTER,
      zoom: 17,
      pitch: 60,
      bearing: 10,
      attributionControl: false,
    });

    map.on('error', (err) => {
      console.error("MAPLIBRE ERROR:", err);
    });
    
    // Add 3D terrain
    map.on('load', () => {
      setIsMapLoaded(true);
      map.addSource('terrain-source', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`
      });
      map.setTerrain({
        source: 'terrain-source',
        exaggeration: 1.5
      });
      
      // Setup polyline source and layer
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers & Polyline
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Use actual userPos or fallback to center
    const effectiveUserPos = userPos || CU_CENTER;

    // Delivery Marker
    if (!deliveryMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = DRIVER_ICON_HTML;
      deliveryMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center', rotationAlignment: 'map' })
        .setLngLat(deliveryPos)
        .setRotation(driverHeading)
        .addTo(mapRef.current);
    } else {
      deliveryMarkerRef.current.setLngLat(deliveryPos);
      deliveryMarkerRef.current.setRotation(driverHeading);
    }

    // User Marker
    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = USER_ICON_HTML;
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(effectiveUserPos)
        .addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLngLat(effectiveUserPos);
    }
    
    // Update Polyline
    const routeSource = mapRef.current.getSource('route') as maplibregl.GeoJSONSource;
    if (routeSource) {
      routeSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [deliveryPos, effectiveUserPos]
        }
      });
      
      mapRef.current.setPaintProperty('route', 'line-color', isRealLive ? '#10b981' : '#6366f1');
    }
  }, [userPos, deliveryPos, driverHeading, isRealLive, isMapLoaded]);

  // Handle GPS location tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPos([pos.coords.longitude, pos.coords.latitude]),
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Listen to Supabase Broadcast for Driver Location
  useEffect(() => {
    const channel = supabase.channel('delivery-tracking', {
      config: {
        broadcast: { self: true, ack: false }
      }
    });

    channel
      .on('broadcast', { event: 'location-update' }, (payload) => {
        console.log("DRIVER GPS UPDATE RECEIVED:", payload);
        const { lat, lng, heading } = payload.payload;
        if (lat && lng) {
          setDeliveryPos([lng, lat]);
          if (heading !== undefined) setDriverHeading(heading);
          setIsRealLive(true);
        }
      })
      .subscribe((status) => {
        console.log("Supabase Tracking Channel Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulation & ETA
  useEffect(() => {
    const effectiveUserPos = userPos || CU_CENTER;
    if (effectiveUserPos && deliveryPos) {
      // Calculate distance using Haversine (needs lat/lng, so index 1 is lat)
      const lat1 = effectiveUserPos[1];
      const lon1 = effectiveUserPos[0];
      const lat2 = deliveryPos[1];
      const lon2 = deliveryPos[0];

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

  useEffect(() => {
    if (!userPos || isRealLive) return;
    const interval = setInterval(() => {
      setDeliveryPos(prev => {
        const dLng = userPos[0] - prev[0];
        const dLat = userPos[1] - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.00005) return prev; 
        return [prev[0] + (dLng / dist) * 0.000018, prev[1] + (dLat / dist) * 0.000018];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [userPos, isRealLive]);

  const centerMap = () => {
    const effectiveUserPos = userPos || CU_CENTER;
    if (mapRef.current && effectiveUserPos && deliveryPos) {
      // Create a bounding box enclosing both points
      const bounds = new maplibregl.LngLatBounds()
        .extend(effectiveUserPos)
        .extend(deliveryPos);
        
      // Use more padding on mobile
      const padding = window.innerWidth < 640 ? 40 : 80;
      mapRef.current.fitBounds(bounds, { padding, duration: 1000 });
    }
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] bg-[#0A0A0A] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl mb-8 group">
      
      {/* ── THE 3D MAP ── */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* ── INJECTED MARKER STYLES ── */}
      <style>{`
        .custom-marker {
          cursor: pointer;
        }
        .marker-container {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-card {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          z-index: 2;
          position: relative;
        }
        .driver-card { background: #10b981; }
        .user-card { background: #6366f1; width: 30px; height: 30px; }
        
        .marker-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          z-index: 1;
        }
        .driver-pulse { background: rgba(16, 185, 129, 0.4); animation: marker-ping 2s infinite; }
        .user-pulse { background: rgba(99, 102, 241, 0.4); animation: marker-ping 2s infinite 1s; }

        @keyframes marker-ping {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* ── LIVE BADGES ── */}
      <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-3 pointer-events-none">
         <div className={`flex items-center gap-3 px-5 py-2 backdrop-blur-2xl border rounded-full transition-all ${
           isRealLive ? "bg-emerald-500/20 border-emerald-500/50" : "bg-black/60 border-white/10"
         }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${isRealLive ? "bg-emerald-500" : "bg-white/40"}`} />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
               {isRealLive ? "Satellite Link Active" : "Waiting for Driver..."}
            </span>
         </div>
      </div>

      <div className="absolute top-8 right-8 z-[1000] pointer-events-none">
         <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500 text-black rounded-full shadow-xl">
            <Navigation2 className="w-4 h-4 fill-black" />
            <span className="text-xs font-black uppercase tracking-tighter">{distanceKm.toFixed(2)} KM AWAY</span>
         </div>
      </div>

      <div className="absolute bottom-10 inset-x-8 z-[1000] flex flex-col gap-4">
         <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1 pointer-events-none">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Estimated Arrival</p>
               <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <span className="text-5xl font-black text-white tracking-tighter italic">
                     {userPos ? `${eta} MINS` : <Loader2 className="animate-spin w-10 h-10" />}
                  </span>
               </div>
            </div>
            
            {/* Center Map Button */}
            <button 
              onClick={centerMap}
              className="w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-xl pointer-events-auto"
            >
              <Target className={`w-6 h-6 ${isRealLive ? "text-emerald-500" : ""}`} />
            </button>
         </div>
         <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 pointer-events-none">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
         </div>
      </div>

      {/* Removed the blocking dark overlay */}
    </div>
  );
}
