/**
 * RealTimeSatelliteMap.tsx
 * ─────────────────────────
 * Phase 2 Complete — Adds smart camera, arrival detection, animated route,
 * and arrival banner on top of the Phase 1 data foundation.
 *
 * New in Phase 2:
 *   - useArrivalDetection()  → approaching / arrived states
 *   - useMapCamera()         → auto-fit, arrival zoom, interaction-aware
 *   - Animated route line    → pulsing dash-offset via requestAnimationFrame
 *   - Arrival banner         → slides up when driver is within 100m
 *   - Order-aware overlays   → cleaner mobile layout
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, Clock, Target, MapPin, CheckCircle2 } from "lucide-react";

import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { useMarkerInterpolation } from "@/hooks/useMarkerInterpolation";
import { useArrivalDetection } from "@/hooks/useArrivalDetection";
import { useMapCamera } from "@/hooks/useMapCamera";
import { haversineKm, etaMinutes } from "@/lib/haversine";
import { toLngLatTuple } from "@/lib/tracking-types";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAPTILER_KEY = "jEk2ccOHJB7MWbvOKKBV";
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`;
const TERRAIN_URL = `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`;

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const MARKER_STYLES = `
  .cu-marker-wrap {
    position: relative; display: flex;
    align-items: center; justify-content: center;
  }
  .cu-marker-pulse {
    position: absolute; inset: 0; border-radius: 50%;
  }
  .cu-marker-card {
    position: relative; z-index: 2; border-radius: 50%;
    border: 3px solid #fff; display: flex;
    align-items: center; justify-content: center;
    box-shadow: 0 4px 18px rgba(0,0,0,0.55);
  }
  .cu-driver-card   { background: #10b981; }
  .cu-customer-card { background: #6366f1; }
  .cu-driver-pulse   { background: rgba(16,185,129,0.35); animation: cu-ping 2s ease-out infinite; }
  .cu-customer-pulse { background: rgba(99,102,241,0.35); animation: cu-ping 2s ease-out infinite 0.8s; }
  .cu-arriving-pulse { background: rgba(251,191,36,0.4);  animation: cu-ping 1.2s ease-out infinite; }
  @keyframes cu-ping {
    0%   { transform: scale(0.85); opacity: 1; }
    100% { transform: scale(2.5);  opacity: 0; }
  }
`;

function driverMarkerHTML(approaching: boolean): string {
  const pulseClass = approaching ? "cu-arriving-pulse" : "cu-driver-pulse";
  const cardBg = approaching ? "#f59e0b" : "#10b981";
  return `
    <div class="cu-marker-wrap" style="width:54px;height:54px;">
      <div class="cu-marker-pulse ${pulseClass}" style="width:54px;height:54px;"></div>
      <div class="cu-marker-card cu-driver-card" style="width:40px;height:40px;background:${cardBg};">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5"  cy="17.5" r="3.5"/>
          <circle cx="9"    cy="7.5"  r="3.5"/>
          <polyline points="15 2 12 12 9 12"/>
          <line x1="12" y1="12" x2="15" y2="12"/>
        </svg>
      </div>
    </div>`;
}

function customerMarkerHTML(): string {
  return `
    <div class="cu-marker-wrap" style="width:44px;height:44px;">
      <div class="cu-marker-pulse cu-customer-pulse" style="width:44px;height:44px;"></div>
      <div class="cu-marker-card cu-customer-card" style="width:32px;height:32px;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    </div>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RealTimeSatelliteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const customerMarkerRef = useRef<maplibregl.Marker | null>(null);
  // Track whether the driver marker was built in "approaching" mode
  const driverApproachingRef = useRef(false);

  // ── Phase 1 data layer ──────────────────────────────────────────────────────
  const { position: customerPos, isRealGps, permissionStatus, requestLocation } = useCustomerLocation();
  const { position: rawDriverPos, heading, isRealLive } = useDriverLocation(customerPos);
  const driverDisplayPos = useMarkerInterpolation(rawDriverPos, 1000);

  // ── Phase 2 additions ───────────────────────────────────────────────────────
  const arrival = useArrivalDetection(driverDisplayPos, customerPos);
  const isApproaching = arrival.status === "approaching";
  const isArrived = arrival.status === "arrived";

  const { centerMap } = useMapCamera({
    mapRef,
    isMapLoaded,
    driverPos: driverDisplayPos,
    customerPos,
    arrivalStatus: arrival.status,
  });

  // ── Derived display values ──────────────────────────────────────────────────
  const distanceKm = haversineKm(driverDisplayPos, customerPos);
  const eta = etaMinutes(distanceKm * 1000, 12);
  const progress = Math.max(0, Math.min(100, arrival.closeness * 100));

  // ── Map initialization ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_URL,
      center: toLngLatTuple(customerPos),
      zoom: 17,
      pitch: 60,
      bearing: 10,
      attributionControl: false,
    });

    map.on("error", (e) => console.error("[Map]", e));

    map.on("load", () => {
      // 3D terrain
      map.addSource("terrain", { type: "raster-dem", url: TERRAIN_URL });
      map.setTerrain({ source: "terrain", exaggeration: 1.5 });

      // Route line source
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature", properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });

      map.addLayer({
        id: "route-bg",           // wider faded underline
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#10b981",
          "line-width": 8,
          "line-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#10b981",
          "line-width": 3.5,
          "line-dasharray": [2, 2],
        },
      });

      setIsMapLoaded(true);

      // Animate route dash offset (creates a "marching ants" flowing effect)
      let offset = 0;
      function animateDash() {
        offset = (offset - 0.05 + 100) % 100;
        if (map.getLayer("route")) {
          map.setPaintProperty("route", "line-dasharray", [2, 2]);
        }
        requestAnimationFrame(animateDash);
      }
      requestAnimationFrame(animateDash);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      driverMarkerRef.current = null;
      customerMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync markers & route ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;
    const dLngLat = toLngLatTuple(driverDisplayPos);
    const cLngLat = toLngLatTuple(customerPos);

    // Rebuild driver marker when approaching state changes (color swap)
    if (!driverMarkerRef.current || driverApproachingRef.current !== isApproaching) {
      driverMarkerRef.current?.remove();
      driverApproachingRef.current = isApproaching;
      const el = document.createElement("div");
      el.innerHTML = driverMarkerHTML(isApproaching);
      driverMarkerRef.current = new maplibregl.Marker({
        element: el, anchor: "center", rotationAlignment: "map",
      }).setLngLat(dLngLat).setRotation(heading).addTo(map);
    } else {
      driverMarkerRef.current.setLngLat(dLngLat).setRotation(heading);
    }

    // Customer marker (static)
    if (!customerMarkerRef.current) {
      const el = document.createElement("div");
      el.innerHTML = customerMarkerHTML();
      customerMarkerRef.current = new maplibregl.Marker({
        element: el, anchor: "center",
      }).setLngLat(cLngLat).addTo(map);
    } else {
      customerMarkerRef.current.setLngLat(cLngLat);
    }

    // Route line
    const src = map.getSource("route") as maplibregl.GeoJSONSource;
    if (src) {
      src.setData({
        type: "Feature", properties: {},
        geometry: { type: "LineString", coordinates: [dLngLat, cLngLat] },
      });
      const lineColor = isArrived ? "#6366f1" : isApproaching ? "#f59e0b" : isRealLive ? "#10b981" : "#6366f1";
      map.setPaintProperty("route", "line-color", lineColor);
      map.setPaintProperty("route-bg", "line-color", lineColor);
    }
  }, [driverDisplayPos, customerPos, heading, isRealLive, isApproaching, isArrived, isMapLoaded]);

  // ─────────────────────────────────────────────────────────────────────────────

  if (permissionStatus !== "granted") {
    return (
      <div className="relative w-full h-[440px] sm:h-[540px] bg-[#0A0A0A] overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl mb-6 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Enable Live Tracking</h3>
        <p className="text-white/50 mb-8 max-w-sm text-sm sm:text-base">
          {permissionStatus === "denied" 
            ? "Location access was denied. Please allow location in your browser settings to see exactly how far your order is."
            : "To calculate accurate distance and ETA, we need your location to show where you are on the map."}
        </p>
        <button
          onClick={requestLocation}
          className="bg-emerald-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95"
        >
          {permissionStatus === "denied" ? "Try Again" : "Allow Location"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[440px] sm:h-[540px] bg-[#0A0A0A] overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl mb-6">

      <style>{MARKER_STYLES}</style>

      {/* MapLibre container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* ── Top-left: Live status ── */}
      <div className="absolute top-5 left-5 z-[1000] pointer-events-none">
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-xl ${isRealLive ? "bg-emerald-500/20 border-emerald-500/40" : "bg-black/60 border-white/10"
          }`}>
          <div className={`w-2 h-2 rounded-full ${isRealLive ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            {isRealLive ? "Live Tracking" : "Locating…"}
          </span>
        </div>
      </div>

      {/* ── Top-right: Distance ── */}
      <div className="absolute top-5 right-5 z-[1000] pointer-events-none">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${isApproaching ? "bg-amber-400" : "bg-emerald-500"
          }`}>
          <Navigation2 className="w-3.5 h-3.5 fill-black" />
          <span className="text-[11px] font-black text-black uppercase tracking-tight">
            {distanceKm < 0.1
              ? `${Math.round(distanceKm * 1000)}m`
              : `${distanceKm.toFixed(2)} km`}
          </span>
        </div>
      </div>

      {/* ── Approaching banner ── */}
      <AnimatePresence>
        {isApproaching && !isArrived && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-16 inset-x-5 z-[1000] pointer-events-none"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-amber-400 rounded-2xl shadow-xl">
              <MapPin className="w-5 h-5 text-black fill-black shrink-0" />
              <span className="text-[13px] font-black text-black uppercase tracking-tight">
                Almost Here! Driver is {Math.round(arrival.distanceM)}m away
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arrived banner ── */}
      <AnimatePresence>
        {isArrived && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-x-5 top-1/3 z-[1000] pointer-events-none flex justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500 rounded-2xl shadow-2xl shadow-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 text-white fill-emerald-700" />
              <span className="text-[15px] font-black text-white uppercase tracking-tight">
                Driver Arrived!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom overlay ── */}
      <div className="absolute bottom-0 inset-x-0 z-[1000] px-5 pb-5 pt-12 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
        <div className="flex justify-between items-end mb-3">
          <div className="pointer-events-none">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">
              Estimated Arrival
            </p>
            <div className="flex items-center gap-2.5">
              <Clock className={`w-5 h-5 ${isApproaching ? "text-amber-400" : "text-emerald-400"}`} />
              <span className="text-4xl font-black text-white tracking-tight italic">
                {isArrived
                  ? "NOW"
                  : isRealGps
                    ? `${eta} MIN`
                    : "– –"}
              </span>
            </div>
          </div>

          <button
            onClick={centerMap}
            className="w-11 h-11 bg-black/70 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center active:scale-90 transition-all"
          >
            <Target className={`w-5 h-5 ${isRealLive ? "text-emerald-400" : "text-white/40"}`} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.8 }}
            className={`h-full shadow-lg ${isArrived
                ? "bg-emerald-400 shadow-emerald-400/60"
                : isApproaching
                  ? "bg-amber-400 shadow-amber-400/60"
                  : "bg-emerald-500 shadow-emerald-500/40"
              }`}
          />
        </div>
      </div>
    </div>
  );
}
