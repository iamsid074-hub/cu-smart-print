/**
 * useCustomerLocation.ts
 * ───────────────────────
 * Tracks customer GPS using the native Web Geolocation API directly.
 *
 * WHY NOT @capacitor/geolocation for the prompt:
 *   Capacitor's `requestPermissions()` on web just queries the permission state —
 *   it does NOT trigger the browser's native Allow/Deny dialog.
 *   Only calling `navigator.geolocation.getCurrentPosition()` actually shows the popup.
 *
 * Strategy:
 *  - On mount: check if already granted → auto-watch silently
 *  - On button click: call getCurrentPosition() (this shows the Allow/Deny dialog)
 *    then switch to watchPosition() for live updates
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { LatLng, RawGPSFix } from "@/lib/tracking-types";
import {
  smooth,
  createSmootherState,
  type SmoothedFix,
} from "@/lib/gps-smoother";

const CU_CAMPUS_CENTER: LatLng = { lat: 30.7673, lng: 76.6074 };

export type GpsPermissionStatus = "pending" | "granted" | "denied" | "unsupported";

export interface CustomerLocationState {
  position: SmoothedFix;
  isRealGps: boolean;
  permissionStatus: GpsPermissionStatus;
}

export function useCustomerLocation(): CustomerLocationState & { requestLocation: () => void } {
  const smootherRef = useRef(createSmootherState());
  const watchIdRef = useRef<number | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<GpsPermissionStatus>("pending");
  const [position, setPosition] = useState<SmoothedFix>({
    lat: CU_CAMPUS_CENTER.lat,
    lng: CU_CAMPUS_CENTER.lng,
    heading: 0,
    timestamp: Date.now(),
  });
  const [isRealGps, setIsRealGps] = useState(false);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    setPermissionStatus("granted");
    const raw: RawGPSFix = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? 50,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
    };
    const smoothed = smooth(smootherRef.current, raw);
    if (smoothed) {
      setPosition(smoothed);
      setIsRealGps(true);
    }
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.warn("[useCustomerLocation] GPS error:", err.code, err.message);
    if (err.code === 1 /* PERMISSION_DENIED */) {
      setPermissionStatus("denied");
    }
  }, []);

  // Start continuous tracking after permission is confirmed
  const startWatch = useCallback(() => {
    if (watchIdRef.current !== null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  }, [handlePosition, handleError]);

  // Called when user taps "Allow Location" button.
  // getCurrentPosition() is the ONLY call that triggers the browser's Allow/Deny dialog.
  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      return;
    }
    // This triggers the native browser / Android permission popup
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePosition(pos);
        startWatch(); // Then switch to continuous tracking
      },
      handleError,
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  }, [handlePosition, handleError, startWatch]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      return;
    }

    // On mount: only auto-start if permission is ALREADY granted (no popup)
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          setPermissionStatus("granted");
          startWatch();
        }
        // 'prompt' → stay "pending", button shows "Allow Location"
        // 'denied' → stay "pending" too — let user click the button which
        //            will show "Go to Settings" type message via the browser
      });
    }
    // If Permissions API not available (older browsers), stay pending

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startWatch]);

  return { position, isRealGps, permissionStatus, requestLocation };
}
