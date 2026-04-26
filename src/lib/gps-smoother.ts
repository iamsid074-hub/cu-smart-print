/**
 * gps-smoother.ts
 * ────────────────
 * Phase 1 – Stateful GPS smoothing pipeline.
 *
 * Three-stage pipeline (per research recommendations):
 *   1. Accuracy filter   — reject fixes worse than ACCURACY_MAX_M
 *   2. Speed/jump filter — reject fixes implying impossible speed
 *   3. EMA smoothing     — exponential moving average for visual glide
 *
 * Designed to be used inside a React ref so state persists across renders
 * without causing re-renders.
 */

import type { RawGPSFix, LatLng } from "./tracking-types";
import { impliedSpeedKmh } from "./haversine";

// ─── Tuning constants ─────────────────────────────────────────────────────────

/** Reject GPS fixes with accuracy worse than this (in meters) */
const ACCURACY_MAX_M = 70;

/** Reject fixes that imply speed faster than this (in km/h) — campus max */
const MAX_SPEED_KMH = 40;

/**
 * EMA alpha — controls smoothing vs. responsiveness.
 * 0.3 = heavily smoothed (lags behind fast movement)
 * 0.7 = more responsive (closer to raw data)
 * 0.5 is a good campus balance.
 */
const EMA_ALPHA = 0.5;

/** EMA alpha for heading smoothing (more aggressive — headings jump wildly) */
const HEADING_EMA_ALPHA = 0.3;

// ─── Smoother state ───────────────────────────────────────────────────────────

export interface SmootherState {
  lastAccepted: (RawGPSFix & { smoothedLat: number; smoothedLng: number; smoothedHeading: number }) | null;
}

export function createSmootherState(): SmootherState {
  return { lastAccepted: null };
}

// ─── Main pipeline ─────────────────────────────────────────────────────────────

export interface SmoothedFix extends LatLng {
  heading: number;
  timestamp: number;
}

/**
 * Feed a raw GPS fix through the three-stage pipeline.
 * Returns a smoothed fix, or null if the fix was rejected.
 * Mutates `state` in place — store in a ref.
 */
export function smooth(
  state: SmootherState,
  raw: RawGPSFix
): SmoothedFix | null {
  // ── First fix ever — accept immediately ───────────────────────────────────
  if (!state.lastAccepted) {
    state.lastAccepted = {
      ...raw,
      smoothedLat: raw.lat,
      smoothedLng: raw.lng,
      smoothedHeading: raw.heading ?? 0,
    };
    return {
      lat: raw.lat,
      lng: raw.lng,
      heading: raw.heading ?? 0,
      timestamp: raw.timestamp,
    };
  }

  // ── Stage 1: Accuracy filter ───────────────────────────────────────────────
  if (raw.accuracy > ACCURACY_MAX_M) {
    // Fix is too imprecise — return last known position unchanged
    return {
      lat: state.lastAccepted.smoothedLat,
      lng: state.lastAccepted.smoothedLng,
      heading: state.lastAccepted.smoothedHeading,
      timestamp: state.lastAccepted.timestamp,
    };
  }

  // ── Stage 2: Speed/jump filter ─────────────────────────────────────────────
  const speed = impliedSpeedKmh(
    { lat: state.lastAccepted.lat, lng: state.lastAccepted.lng, timestamp: state.lastAccepted.timestamp },
    { lat: raw.lat, lng: raw.lng, timestamp: raw.timestamp }
  );

  if (speed > MAX_SPEED_KMH) {
    // Impossible jump — return last smoothed position
    return {
      lat: state.lastAccepted.smoothedLat,
      lng: state.lastAccepted.smoothedLng,
      heading: state.lastAccepted.smoothedHeading,
      timestamp: state.lastAccepted.timestamp,
    };
  }

  // ── Stage 3: EMA smoothing ─────────────────────────────────────────────────
  const smoothedLat =
    EMA_ALPHA * raw.lat + (1 - EMA_ALPHA) * state.lastAccepted.smoothedLat;
  const smoothedLng =
    EMA_ALPHA * raw.lng + (1 - EMA_ALPHA) * state.lastAccepted.smoothedLng;

  const rawHeading = raw.heading ?? state.lastAccepted.smoothedHeading;
  const smoothedHeading =
    HEADING_EMA_ALPHA * rawHeading +
    (1 - HEADING_EMA_ALPHA) * state.lastAccepted.smoothedHeading;

  state.lastAccepted = {
    ...raw,
    smoothedLat,
    smoothedLng,
    smoothedHeading,
  };

  return {
    lat: smoothedLat,
    lng: smoothedLng,
    heading: smoothedHeading,
    timestamp: raw.timestamp,
  };
}
