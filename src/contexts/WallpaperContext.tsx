import React, { createContext, useContext, useState, useEffect } from "react";

const WALLPAPER_KEY = "cu_bazzar_wallpaper";
const DEFAULT_WALLPAPER = "/1stwall.webp";

interface WallpaperContextType {
  wallpaper: string;
  setWallpaper: (url: string) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const [wallpaper, setWallpaperState] = useState(() => {
    try {
      return localStorage.getItem(WALLPAPER_KEY) || DEFAULT_WALLPAPER;
    } catch {
      return DEFAULT_WALLPAPER;
    }
  });

  const setWallpaper = (url: string) => {
    try {
      localStorage.setItem(WALLPAPER_KEY, url);
    } catch {
      // ignore
    }
    setWallpaperState(url);
  };

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper(): string {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error("useWallpaper must be used within a WallpaperProvider");
  }
  return context.wallpaper;
}

export function useSetWallpaper(): (url: string) => void {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error("useSetWallpaper must be used within a WallpaperProvider");
  }
  return context.setWallpaper;
}
