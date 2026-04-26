/**
 * haversine.ts
 * ─────────────
 * Phase 1 – Pure math utilities for distance and ETA calculation.
 * No external dependencies. Works on any LatLng pair.
 *
 * Based on research findings: Haversine is accurate enough for a 1 km campus.
 * Error margin is tens to a few hundred meters — acceptable for display.
 */

import type { LatLng } from "./tracking-types";

const EARTH_RADIUS_M = 6_371_000; // meters

/**
 * Haversine great-circle distance between two coordinates.
 * Returns distance in METERS.
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Distance in kilometers (display-friendly) */
export function haversineKm(a: LatLng, b: LatLng): number {
  return haversineMeters(a, b) / 1000;
}

/**
 * ETA in minutes given a distance in meters and speed in km/h.
 *
 * Campus calibration (from research):
 *   - Bikes/scooters: 10–15 km/h effective (accounts for zig-zags, stops)
 *   - Walking delivery: ~5 km/h
 *
 * Returns at minimum 1 minute.
 */
export function etaMinutes(
  distanceM: number,
  speedKmh: number = 12
): number {
  if (distanceM <= 0 || speedKmh <= 0) return 1;
  const speedMs = speedKmh / 3.6;
  const seconds = distanceM / speedMs;
  return Math.max(1, Math.ceil(seconds / 60));
}

/**
 * Implied speed in km/h between two GPS fixes.
 * Used for jump/outlier detection in the smoother.
 */
export function impliedSpeedKmh(
  a: LatLng & { timestamp: number },
  b: LatLng & { timestamp: number }
): number {
  const dtSec = (b.timestamp - a.timestamp) / 1000;
  if (dtSec <= 0) return 0;
  const distM = haversineMeters(a, b);
  return (distM / dtSec) * 3.6;
}
