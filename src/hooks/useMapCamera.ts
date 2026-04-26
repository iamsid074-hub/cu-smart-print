/**
 * useMapCamera.ts
 * ────────────────
 * Phase 2 – Smart camera management for the live tracking map.
 *
 * Behaviour:
 *   - On initial load: fit both markers into view
 *   - While tracking: auto re-fit every AUTO_FIT_INTERVAL_MS
 *   - On "approaching": zoom in tight (zoom 18) on both markers
 *   - On "arrived": zoom to customer position only (zoom 19)
 *   - Manual "center" button: always fits both markers instantly
 *
 * Returns a `centerMap` function to be called by the re-center button,
 * and internally manages the auto-fit timer.
 */

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { LatLng } from "@/lib/tracking-types";
import { toLngLatTuple } from "@/lib/tracking-types";
import type { ArrivalStatus } from "@/hooks/useArrivalDetection";

/** Auto re-fit camera every N ms while the user isn't interacting */
const AUTO_FIT_INTERVAL_MS = 12_000;

interface UseMapCameraOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isMapLoaded: boolean;
  driverPos: LatLng;
  customerPos: LatLng;
  arrivalStatus: ArrivalStatus;
}

export function useMapCamera({
  mapRef,
  isMapLoaded,
  driverPos,
  customerPos,
  arrivalStatus,
}: UseMapCameraOptions) {
  const autoFitRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractingRef = useRef(false);

  const fitBothMarkers = useCallback(
    (animated = true) => {
      const map = mapRef.current;
      if (!map) return;

      const padding = window.innerWidth < 640 ? 55 : 100;

      if (arrivalStatus === "arrived") {
        // Zoom to customer when arrived
        map.flyTo({
          center: toLngLatTuple(customerPos),
          zoom: 19,
          pitch: 45,
          duration: animated ? 800 : 0,
        });
        return;
      }

      if (arrivalStatus === "approaching") {
        // Tight zoom on both when approaching
        const bounds = new maplibregl.LngLatBounds()
          .extend(toLngLatTuple(driverPos))
          .extend(toLngLatTuple(customerPos));
        map.fitBounds(bounds, {
          padding,
          maxZoom: 18,
          duration: animated ? 800 : 0,
        });
        return;
      }

      // Normal: fit both markers
      const bounds = new maplibregl.LngLatBounds()
        .extend(toLngLatTuple(driverPos))
        .extend(toLngLatTuple(customerPos));
      map.fitBounds(bounds, {
        padding,
        maxZoom: 17,
        duration: animated ? 800 : 0,
      });
    },
    [mapRef, driverPos, customerPos, arrivalStatus]
  );

  // Detect user interaction — pause auto-fit when they are manually dragging
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const onInteractionStart = () => { userInteractingRef.current = true; };
    const onInteractionEnd = () => {
      // Resume auto-fit after 15 seconds of no interaction
      setTimeout(() => { userInteractingRef.current = false; }, 15_000);
    };

    map.on("dragstart", onInteractionStart);
    map.on("dragend", onInteractionEnd);
    map.on("zoomstart", onInteractionStart);
    map.on("zoomend", onInteractionEnd);

    return () => {
      map.off("dragstart", onInteractionStart);
      map.off("dragend", onInteractionEnd);
      map.off("zoomstart", onInteractionStart);
      map.off("zoomend", onInteractionEnd);
    };
  }, [mapRef, isMapLoaded]);

  // Initial fit when map loads
  useEffect(() => {
    if (!isMapLoaded) return;
    // Small delay so markers have been placed first
    const t = setTimeout(() => fitBothMarkers(true), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded]);

  // Auto-fit on arrival status change
  useEffect(() => {
    if (!isMapLoaded) return;
    if (arrivalStatus === "approaching" || arrivalStatus === "arrived") {
      fitBothMarkers(true);
    }
  }, [arrivalStatus, isMapLoaded, fitBothMarkers]);

  // Periodic auto-fit every AUTO_FIT_INTERVAL_MS
  useEffect(() => {
    if (!isMapLoaded) return;
    autoFitRef.current = setInterval(() => {
      if (!userInteractingRef.current) {
        fitBothMarkers(true);
      }
    }, AUTO_FIT_INTERVAL_MS);
    return () => {
      if (autoFitRef.current) clearInterval(autoFitRef.current);
    };
  }, [isMapLoaded, fitBothMarkers]);

  // Manual re-center (called by the button)
  const centerMap = useCallback(() => {
    userInteractingRef.current = false;
    fitBothMarkers(true);
  }, [fitBothMarkers]);

  return { centerMap };
}
