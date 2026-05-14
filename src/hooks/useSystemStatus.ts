import { useState, useEffect } from "react";
import { Device } from "@capacitor/device";
import { Capacitor } from "@capacitor/core";

export function useSystemStatus() {
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string>("wifi"); // Default to wifi

  const [isBatteryAvailable, setIsBatteryAvailable] = useState(true);

  useEffect(() => {
    // Battery Status
    const checkBattery = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const info = await Device.getBatteryInfo();
          if (info.batteryLevel !== undefined) setBatteryLevel(info.batteryLevel);
          if (info.isCharging !== undefined) setIsCharging(info.isCharging);
          setIsBatteryAvailable(true);
        } catch (e) {
          console.warn("Native battery failed:", e);
          setIsBatteryAvailable(false);
        }
      } else if ("getBattery" in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
          setIsBatteryAvailable(true);
        } catch (e) {
          console.warn("Web battery failed:", e);
          setIsBatteryAvailable(false);
        }
      } else {
        // Safari fallback
        setIsBatteryAvailable(false);
      }
    };

    checkBattery();

    let intervalId: any;
    if (Capacitor.isNativePlatform()) {
      // Poll every 5 seconds on native since Capacitor doesn't have battery events
      intervalId = setInterval(checkBattery, 5000);
    } else if ("getBattery" in navigator) {
      // Event listeners for Web API
      (navigator as any).getBattery().then((battery: any) => {
        const update = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
        };
        battery.addEventListener("levelchange", update);
        battery.addEventListener("chargingchange", update);
      }).catch(() => { /* ignore */ });
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
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { batteryLevel, isCharging, isOnline, networkType, isBatteryAvailable };
}
