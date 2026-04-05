import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// â”€â”€ VAPID Public Key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// This is the public key used to subscribe to push notifications.
// The matching private key must be used in the server-side send function.
// Generate a new pair at: https://vapidkeys.com
// For now we use a placeholder â€” replace with your real key
const VAPID_PUBLIC_KEY =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDkBWine6t5j5H6qB7kKOGWZzOkqFOEMl6FhMiOq_w";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  // Register service worker + subscribe to push
  const registerAndSubscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      // Subscribe to Push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save to Supabase
      const subJSON = subscription.toJSON();
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      console.log("[Push] Subscribed successfully");
      return true;
    } catch (error) {
      console.error("[Push] Subscription failed:", error);
      return false;
    }
  }, [isSupported, user]);

  // Auto-register on first load if already granted
  useEffect(() => {
    if (isSupported && user && permission === "granted") {
      registerAndSubscribe();
    }
  }, [isSupported, user, permission, registerAndSubscribe]);

  return { permission, isSupported, requestPermission: registerAndSubscribe };
}
