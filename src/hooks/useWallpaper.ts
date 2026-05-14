import { useSyncExternalStore } from "react";
import { getWallpaper } from "../lib/wallpaper";

/**
 * Hook that reactively returns the currently selected wallpaper URL.
 * Automatically re-renders when the wallpaper is changed from any component.
 */

// Subscribe function for useSyncExternalStore
const subscribe = (callback: () => void) => {
  window.addEventListener("wallpaper-changed", callback);
  return () => window.removeEventListener("wallpaper-changed", callback);
};

export function useWallpaper(): string {
  // useSyncExternalStore guarantees 100% sync, even if state changes during render
  return useSyncExternalStore(subscribe, getWallpaper, getWallpaper);
}
