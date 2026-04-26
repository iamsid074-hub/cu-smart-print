/**
 * useCustomerLocation.ts
 * ───────────────────────
 * Phase 1 – Hook that tracks the customer's own GPS position.
 *
 * Features:
 * - watchPosition for continuous updates (not one-shot)
 * - Runs the raw fix through the GPS smoother pipeline
 * - Falls back to CU campus center if GPS is denied or unavailable
 * - Exposes permission status so the UI can show appropriate messaging
 */

import { useEffect, useRef, useState } from "react";
import { fromGeolocationPosition, type LatLng } from "@/lib/tracking-types";
import {
  smooth,
  createSmootherState,
  type SmoothedFix,
} from "@/lib/gps-smoother";

/** CU Campus center — used as fallback when GPS is unavailable */
const CU_CAMPUS_CENTER: LatLng = {
  lat: 30.7673,
  lng: 76.6074,
};

export type GpsPermissionStatus = "pending" | "granted" | "denied" | "unsupported";

export interface CustomerLocationState {
  /** The smoothed customer position. Never null — falls back to campus center */
  position: SmoothedFix;
  /** Whether the position is a real GPS fix (true) or the campus fallback (false) */
  isRealGps: boolean;
  /** Current GPS permission state */
  permissionStatus: GpsPermissionStatus;
}

export function useCustomerLocation(): CustomerLocationState & { requestLocation: () => void } {
  const smootherRef = useRef(createSmootherState());
  const watchIdRef = useRef<number | null>(null);

  const [permissionStatus, setPermissionStatus] =
    useState<GpsPermissionStatus>("pending");
  const [position, setPosition] = useState<SmoothedFix>({
    lat: CU_CAMPUS_CENTER.lat,
    lng: CU_CAMPUS_CENTER.lng,
    heading: 0,
    timestamp: Date.now(),
  });
  const [isRealGps, setIsRealGps] = useState(false);

  const startWatching = () => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      return;
    }

    if (watchIdRef.current !== null) return; // Already watching

    const onSuccess = (pos: GeolocationPosition) => {
      setPermissionStatus("granted");
      const raw = fromGeolocationPosition(pos);
      const smoothed = smooth(smootherRef.current, raw);
      if (smoothed) {
        setPosition(smoothed);
        setIsRealGps(true);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("[useCustomerLocation] GPS error:", err.message);
      // PERMISSION_DENIED = 1
      if (err.code === 1) {
        setPermissionStatus("denied");
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  };

  const requestLocation = () => {
    startWatching();
  };

  useEffect(() => {
    // Check if already granted, if so start automatically
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          startWatching();
        } else if (result.state === "denied") {
          setPermissionStatus("denied");
        }
      });
    } else {
      // Fallback if permissions API is not available
      startWatching();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, isRealGps, permissionStatus, requestLocation };
}
