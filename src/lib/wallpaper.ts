// Global wallpaper state — persisted to localStorage, syncs across components via a custom event.
const WALLPAPER_KEY = "cu_bazzar_wallpaper";
const DEFAULT_WALLPAPER = "/mobile-ethereal-v3.webp";

export function getWallpaper(): string {
  try {
    return localStorage.getItem(WALLPAPER_KEY) || DEFAULT_WALLPAPER;
  } catch {
    return DEFAULT_WALLPAPER;
  }
}

export function setWallpaper(url: string): void {
  try {
    localStorage.setItem(WALLPAPER_KEY, url);
    window.dispatchEvent(new CustomEvent("wallpaper-changed", { detail: url }));
  } catch {
    /* storage unavailable */
  }
}
