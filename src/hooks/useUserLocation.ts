import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  hostel: string;
  room: string;
  phone: string;
}

const STORAGE_KEY = 'cubazzar_user_location';

export function useUserLocation() {
  const [data, setData] = useState<LocationData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse location data", e);
        }
      }
      setIsLoaded(true);
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener('cubazzar_location_updated', handleUpdate);
    return () => window.removeEventListener('cubazzar_location_updated', handleUpdate);
  }, []);

  const saveLocation = useCallback((newData: LocationData) => {
    const cleanedData = {
      hostel: newData.hostel.trim(),
      room: newData.room.trim(),
      phone: newData.phone.replace(/\D/g, "").slice(0, 10),
    };
    
    // Only save if data is valid (i.e. not completely empty)
    if (cleanedData.hostel || cleanedData.room || cleanedData.phone) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));
        setData(cleanedData);
        window.dispatchEvent(new Event('cubazzar_location_updated'));
    }
  }, []);

  return { data, saveLocation, isLoaded };
}
