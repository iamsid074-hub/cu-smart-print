/**
 * tracking-types.ts
 * ─────────────────
 * Phase 1 – Single source of truth for all coordinate and location types used
 * across the CU Bazzar live delivery tracking system.
 *
 * RULE: Raw GPS data from the browser or Supabase is ALWAYS converted to LatLng
 * at the boundary. MapLibre ALWAYS receives LngLatTuple. Never pass raw arrays.
 */

// ─── Core domain types ─────────────────────────────────────────────────────────

/** Human-readable lat/lng pair — used everywhere in application logic */
export interface LatLng {
  lat: number;
  lng: number;
}

/** MapLibre GL requires [longitude, latitude] order — only used at render time */
export type LngLatTuple = [number, number];

/** A GPS fix with metadata — used for accuracy filtering and speed checks */
export interface RawGPSFix {
  lat: number;
  lng: number;
  accuracy: number;   // meters — lower is better
  speed: number | null;      // m/s from device
  heading: number | null;    // degrees 0–360
  timestamp: number;  // ms since epoch
}

/** Smoothed position passed to the map and ETA logic */
export interface SmoothedPosition extends LatLng {
  heading: number;    // smoothed heading for marker rotation
  timestamp: number;
}

// ─── Supabase Broadcast payload ─────────────────────────────────────────────────

/** What the admin portal broadcasts via Supabase Realtime channel 'delivery-tracking' */
export interface DriverLocationEvent {
  lat: number;
  lng: number;
  heading?: number;   // optional — used to rotate bike icon
  accuracy?: number;  // optional — for diagnostics
  timestamp?: number; // ms since epoch
}

// ─── Boundary converters ─────────────────────────────────────────────────────────

/** Convert a browser GeolocationPosition to our domain LatLng */
export function fromGeolocationPosition(pos: GeolocationPosition): RawGPSFix {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    speed: pos.coords.speed,
    heading: pos.coords.heading,
    timestamp: pos.timestamp,
  };
}

/** Convert a Supabase broadcast payload to our domain LatLng (with validation) */
export function fromDriverEvent(payload: unknown): DriverLocationEvent | null {
  const p = payload as any;
  if (typeof p?.lat !== "number" || typeof p?.lng !== "number") return null;
  return {
    lat: p.lat,
    lng: p.lng,
    heading: typeof p.heading === "number" ? p.heading : undefined,
    accuracy: typeof p.accuracy === "number" ? p.accuracy : undefined,
    timestamp: typeof p.timestamp === "number" ? p.timestamp : Date.now(),
  };
}

/** Convert our domain LatLng to a MapLibre-compatible [lng, lat] tuple */
export function toLngLatTuple(p: LatLng): LngLatTuple {
  return [p.lng, p.lat]; // MapLibre requires [lng, lat] — enforced in one place
}
