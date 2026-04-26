/**
 * useArrivalDetection.ts
 * ───────────────────────
 * Phase 2 – Detects when the driver is approaching and has arrived.
 *
 * Triggers:
 *   "approaching" — driver within APPROACHING_METERS of customer
 *   "arrived"     — driver within ARRIVED_METERS of customer
 *
 * Used to:
 *   - Show an arrival banner on the map
 *   - Zoom the camera in tight when driver is close
 *   - Trigger a celebration animation on the Tracking page
 */

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/tracking-types";
import { haversineMeters } from "@/lib/haversine";

/** Show "almost here!" banner when driver is within this many meters */
const APPROACHING_METERS = 100;

/** Show "arrived!" state when driver is within this many meters */
const ARRIVED_METERS = 25;

export type ArrivalStatus = "enroute" | "approaching" | "arrived";

export interface ArrivalState {
  status: ArrivalStatus;
  distanceM: number;
  /** Fraction 0→1 of how close the driver is (0 = far, 1 = arrived) */
  closeness: number;
}

export function useArrivalDetection(
  driverPos: LatLng,
  customerPos: LatLng,
  /** Max expected distance in meters — used to compute closeness */
  maxDistanceM: number = 1500
): ArrivalState {
  const [state, setState] = useState<ArrivalState>({
    status: "enroute",
    distanceM: maxDistanceM,
    closeness: 0,
  });

  useEffect(() => {
    const distanceM = haversineMeters(driverPos, customerPos);
    const closeness = Math.max(0, Math.min(1, 1 - distanceM / maxDistanceM));

    let status: ArrivalStatus = "enroute";
    if (distanceM <= ARRIVED_METERS) status = "arrived";
    else if (distanceM <= APPROACHING_METERS) status = "approaching";

    setState({ status, distanceM, closeness });
  }, [driverPos.lat, driverPos.lng, customerPos.lat, customerPos.lng, maxDistanceM]);

  return state;
}
