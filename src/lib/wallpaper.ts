// Global wallpaper state — persisted to localStorage, syncs across components via a custom event.
const WALLPAPER_KEY = "cu_bazzar_wallpaper";
const DEFAULT_WALLPAPER = "/mobile-ethereal-v3.webp";

let cachedWallpaper: string | null = null;

export function getWallpaper(): string {
  if (cachedWallpaper) return cachedWallpaper;
  try {
    const val = localStorage.getItem(WALLPAPER_KEY) || DEFAULT_WALLPAPER;
    cachedWallpaper = val;
    return val;
  } catch {
    return DEFAULT_WALLPAPER;
  }
}

export function setWallpaper(url: string): void {
  try {
    cachedWallpaper = url; // Update memory cache synchronously
    localStorage.setItem(WALLPAPER_KEY, url);
    window.dispatchEvent(new CustomEvent("wallpaper-changed", { detail: url }));
  } catch {
    /* storage unavailable */
  }
}
