/**
 * useDriverLocation.ts
 * ─────────────────────
 * Phase 1 – Hook that listens to the Supabase Realtime Broadcast channel
 * for live driver GPS updates from the admin portal.
 *
 * Features:
 * - Subscribes to 'delivery-tracking' Supabase Broadcast channel
 * - Validates incoming payload with fromDriverEvent()
 * - Runs driver coords through the GPS smoother pipeline
 * - Falls back to a simulated approach toward the customer if no real signal
 * - Exposes isRealLive so the UI can distinguish real vs simulated tracking
 *
 * Simulation logic (when !isRealLive):
 * - Moves driver 18m per second toward the customer
 * - Stops when within 5m — prevents infinite oscillation
 * - Automatically replaced by real GPS the moment a broadcast arrives
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  fromDriverEvent,
  toLngLatTuple,
  type LatLng,
} from "@/lib/tracking-types";
import {
  smooth,
  createSmootherState,
  type SmoothedFix,
} from "@/lib/gps-smoother";
import { haversineMeters } from "@/lib/haversine";

/** Default driver start position — near CU food courts */
const DRIVER_DEFAULT: LatLng = {
  lat: 30.7695,
  lng: 76.6110,
};

/** Distance in degrees per second for simulation (~18m/s ≈ 65 km/h — fast for visibility) */
const SIM_STEP_DEG = 0.000162;

/** Stop simulation when within this many meters of customer */
const SIM_STOP_METERS = 5;

export interface DriverLocationState {
  /** Smoothed driver position — always populated */
  position: SmoothedFix;
  /** Heading in degrees (0–360) for icon rotation */
  heading: number;
  /** True if the position is coming from a real Supabase broadcast */
  isRealLive: boolean;
  /** Channel connection status — useful for debugging */
  channelStatus: string;
}

export function useDriverLocation(
  customerPosition: LatLng
): DriverLocationState {
  const smootherRef = useRef(createSmootherState());

  const [position, setPosition] = useState<SmoothedFix>({
    lat: DRIVER_DEFAULT.lat,
    lng: DRIVER_DEFAULT.lng,
    heading: 0,
    timestamp: Date.now(),
  });
  const [heading, setHeading] = useState(0);
  const [isRealLive, setIsRealLive] = useState(false);
  const [channelStatus, setChannelStatus] = useState("CONNECTING");

  // Keep a ref of current position for use inside the simulation interval
  const positionRef = useRef<LatLng>(DRIVER_DEFAULT);

  // Update the ref whenever position state changes
  useEffect(() => {
    positionRef.current = { lat: position.lat, lng: position.lng };
  }, [position]);

  // ── Supabase Realtime listener ─────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel("delivery-tracking", {
      config: {
        broadcast: { self: false, ack: false },
      },
    });

    channel
      .on("broadcast", { event: "location-update" }, ({ payload }) => {
        const event = fromDriverEvent(payload);
        if (!event) {
          console.warn("[useDriverLocation] Invalid broadcast payload:", payload);
          return;
        }

        const raw = {
          lat: event.lat,
          lng: event.lng,
          accuracy: event.accuracy ?? 20, // Assume good accuracy from admin portal
          speed: null,
          heading: event.heading ?? null,
          timestamp: event.timestamp ?? Date.now(),
        };

        const smoothed = smooth(smootherRef.current, raw);
        if (smoothed) {
          setPosition(smoothed);
          setHeading(smoothed.heading);
          setIsRealLive(true);
        }
      })
      .subscribe((status) => {
        console.log("[useDriverLocation] Channel status:", status);
        setChannelStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Simulation (only when no real signal) ──────────────────────────────────
  useEffect(() => {
    if (isRealLive) return; // Real data is flowing — don't simulate

    const interval = setInterval(() => {
      const current = positionRef.current;
      const dLat = customerPosition.lat - current.lat;
      const dLng = customerPosition.lng - current.lng;
      const distM = haversineMeters(current, customerPosition);

      if (distM < SIM_STOP_METERS) return; // Close enough — stop moving

      const magnitude = Math.sqrt(dLat * dLat + dLng * dLng);
      const newLat = current.lat + (dLat / magnitude) * SIM_STEP_DEG;
      const newLng = current.lng + (dLng / magnitude) * SIM_STEP_DEG;

      // Calculate heading from movement direction
      const bearingRad = Math.atan2(dLng, dLat);
      const bearingDeg = ((bearingRad * 180) / Math.PI + 360) % 360;

      const simFix: SmoothedFix = {
        lat: newLat,
        lng: newLng,
        heading: bearingDeg,
        timestamp: Date.now(),
      };

      setPosition(simFix);
      setHeading(bearingDeg);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRealLive, customerPosition]);

  return { position, heading, isRealLive, channelStatus };
}
