import { useState, useEffect } from "react";
import { getWallpaper } from "../lib/wallpaper";

/**
 * Hook that reactively returns the currently selected wallpaper URL.
 * Automatically re-renders when the wallpaper is changed from any component.
 */
export function useWallpaper(): string {
  const [wallpaper, setWallpaper] = useState<string>(getWallpaper);

  useEffect(() => {
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setWallpaper(detail);
    };
    window.addEventListener("wallpaper-changed", handleChange);
    return () => window.removeEventListener("wallpaper-changed", handleChange);
  }, []);

  return wallpaper;
}
