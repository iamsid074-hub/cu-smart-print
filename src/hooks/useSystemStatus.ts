import { useState, useEffect } from "react";

export function useSystemStatus() {
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string>("wifi"); // Default to wifi

  useEffect(() => {
    // Battery Status API
    const updateBatteryStatus = (battery: any) => {
      setBatteryLevel(battery.level);
      setIsCharging(battery.charging);
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryStatus(battery);
        battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
        battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
      });
    }

    // Network Status (Online/Offline)
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API (Experimental, but works in many browsers)
    const nav: any = navigator;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      const updateConnectionStatus = () => {
        // If type is 'wifi', 'ethernet', etc.
        setNetworkType(connection.type || "wifi");
      };
      connection.addEventListener("change", updateConnectionStatus);
      updateConnectionStatus();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { batteryLevel, isCharging, isOnline, networkType };
}
