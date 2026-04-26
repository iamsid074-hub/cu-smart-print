/**
 * useMarkerInterpolation.ts
 * ──────────────────────────
 * Phase 1 – Smooth marker gliding using requestAnimationFrame.
 *
 * When a new GPS target arrives every 1-5 seconds, this hook animates
 * the rendered marker position smoothly between old and new coordinates
 * using linear interpolation (LERP), driven by requestAnimationFrame.
 *
 * Based on research findings from the MapLibre community examples and
 * the Uber/Zomato animation pattern described in research.md.
 *
 * Usage:
 *   const displayPos = useMarkerInterpolation(driverPosition, 1000);
 *   // displayPos updates 60x/sec, smoothly gliding to driverPosition
 */

import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/tracking-types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * @param target  The "true" target position (updated every GPS tick)
 * @param durationMs  Animation duration in ms. Match your GPS update interval.
 */
export function useMarkerInterpolation(
  target: LatLng,
  durationMs: number = 1000
): LatLng {
  const [display, setDisplay] = useState<LatLng>(target);

  // Track the start position of the current animation segment
  const startRef = useRef<LatLng>(target);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any running animation
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // Start new animation from current display position toward new target
    startRef.current = display; // Animate FROM wherever the icon currently is
    startTimeRef.current = null; // Will be set on first frame

    function step(now: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);

      setDisplay({
        lat: lerp(startRef.current.lat, target.lat, progress),
        lng: lerp(startRef.current.lng, target.lng, progress),
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    }

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
    // Only re-run when the target coordinates actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lat, target.lng, durationMs]);

  return display;
}
