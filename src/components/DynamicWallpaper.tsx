import { useEffect } from "react";
import { useWallpaper } from "../contexts/WallpaperContext";

/**
 * Syncs the global wallpaper state to the document body.
 * This ensures that when pages animate (scale/fade), the background
 * matches the user's selected wallpaper instead of a hardcoded one.
 */
export default function DynamicWallpaper() {
  const wallpaper = useWallpaper();

  useEffect(() => {
    // Apply wallpaper to body
    document.body.style.backgroundImage = `url(${wallpaper})`;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    
    // Debug log to ensure sync
    console.log("Wallpaper synced to body:", wallpaper);
  }, [wallpaper]);

  return null; // Side-effect only component
}
