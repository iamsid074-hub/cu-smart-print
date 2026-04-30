import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Geolocation } from "@capacitor/geolocation";

/**
 * AdminPushService — Persistent order notification service
 * 
 * This service runs at the APP level (not just Admin page) for admin users.
 * It listens for new orders via Supabase real-time AND polls as a fallback.
 * On native platforms, it fires local notifications with sound + vibration.
 * It also reconnects automatically when the app resumes from background.
 */
export class AdminPushService {
  private static isListening = false;
  private static channelSubscription: any = null;
  private static appStateListener: any = null;
  private static pollInterval: any = null;
  private static lastKnownOrderCount: number = -1;
  private static isInitialized = false;
  private static status: "inactive" | "initializing" | "active" | "error" = "inactive";

  // Auto-tracking variables
  private static watchId: string | null = null;
  private static adminId: string | null = null;
  private static geoChannel: any = null;

  /**
   * Get the current status of the service
   */
  static getStatus() {
    return this.status;
  }

  /**
   * Initialize the push service. Safe to call multiple times — will only init once.
   */
  static async initialize(adminId?: string) {
    if (adminId) this.adminId = adminId;
    
    // Auto-start location tracking if possible
    this.startAutoTracking();

    // Prevent double initialization
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.status = "initializing";

    console.log("[AdminPush] 🚀 Initializing service...");

    try {
      if (Capacitor.isNativePlatform()) {
        // 1. Check and request permissions
        const permStatus = await LocalNotifications.checkPermissions();
        console.log("[AdminPush] Permission status:", permStatus.display);
        
        if (permStatus.display !== "granted") {
          const result = await LocalNotifications.requestPermissions();
          console.log("[AdminPush] Permission request result:", result.display);
          if (result.display !== "granted") {
            console.warn("[AdminPush] ⚠️ Notification permission denied");
            this.status = "error";
          }
        }

        // 2. Create high priority channel for Android
        try {
          await LocalNotifications.createChannel({
            id: "admin-alerts",
            name: "Admin Orders",
            description: "Critical notifications for new orders",
            importance: 5,
            visibility: 1,
            vibration: true,
            // We use default sound as fallback if custom one is missing
            sound: "beep.wav",
          });
          console.log("[AdminPush] Channel 'admin-alerts' ready");
        } catch (e) {
          console.log("[AdminPush] Channel creation (expected if exists):", e);
        }
      }

      // 3. Start real-time listener
      this.startListening();

      // 4. Start fallback polling (every 15 seconds)
      this.startPolling();

      // 5. Listen for app state changes to reconnect when resuming from background
      this.setupAppStateListener();

      this.status = "active";
      console.log("[AdminPush] ✅ Initialized successfully");
    } catch (e) {
      console.error("[AdminPush] ❌ Init failed", e);
      this.isInitialized = false;
      this.status = "error";
    }
  }

  /**
   * Start 24/7 background driver location tracking automatically without UI interaction.
   */
  static async startAutoTracking() {
    if (this.watchId) return;

    try {
      console.log("[AdminPush] 🗺️ Initializing GPS...");
      
      // On web, requestPermissions might throw or not be needed. 
      // We'll try it but catch errors and proceed to watchPosition which triggers browser prompt.
      try {
        if (Capacitor.isNativePlatform()) {
          const permissions = await Geolocation.requestPermissions();
          if (permissions.location !== 'granted') {
             console.warn("[AdminPush] GPS permission denied");
             return;
          }
        }
      } catch (e) {
        console.warn("[AdminPush] Permission request failed (expected on some browsers), proceeding...", e);
      }

      this.geoChannel = supabase.channel('delivery-tracking', {
          config: { broadcast: { self: true, ack: true } }
      });
      this.geoChannel.subscribe();

      console.log("[AdminPush] 🗺️ Auto-Tracking engaged");

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        (pos) => {
          if (pos && this.adminId) {
            console.log("[AdminPush] 📡 Broadcasting location:", pos.coords.latitude, pos.coords.longitude);
            this.geoChannel.send({
              type: 'broadcast',
              event: 'location-update',
              payload: { 
                lat: pos.coords.latitude, 
                lng: pos.coords.longitude,
                heading: pos.coords.heading ?? 0,
                accuracy: pos.coords.accuracy ?? 20,
                timestamp: Date.now(),
                driverId: this.adminId 
              }
            });
          }
        }
      );
    } catch (e) {
      console.error("[AdminPush] Error in Auto-Tracking", e);
      this.status = "error";
    }
  }

  /**
   * Check if tracking is currently active
   */
  static isTrackingActive() {
    return !!this.watchId;
  }

  /**
   * Toggle tracking manually (for UI controls)
   */
  static async toggleTracking() {
    if (this.watchId) {
      if (this.watchId) {
        Geolocation.clearWatch({ id: this.watchId }).catch(() => {});
        this.watchId = null;
      }
      if (this.geoChannel) {
        supabase.removeChannel(this.geoChannel);
        this.geoChannel = null;
      }
      return false;
    } else {
      await this.startAutoTracking();
      return !!this.watchId;
    }
  }

  private static notifiedOrderIds = new Set<string>();

  /**
   * Start listening to Supabase real-time inserts and updates on the orders table
   */
  static startListening() {
    if (this.isListening) return;
    this.isListening = true;

    console.log("[AdminPush] 📡 Starting real-time listener...");

    try {
      this.channelSubscription = supabase
        .channel("admin_orders_push_v3")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          async (payload) => {
            console.log("[AdminPush] 🔔 NEW ORDER DETECTED!", payload.new);
            const order = payload.new;
            
            // For COD orders, status is 'pending' immediately. 
            // For Online orders, status is 'draft' initially (don't notify).
            if (order.status !== "draft" && !this.notifiedOrderIds.has(order.id)) {
              this.notifiedOrderIds.add(order.id);
              await this.triggerNotification(order.id, order.total_price, order.delivery_location);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
          },
          async (payload) => {
            console.log("[AdminPush] 🔔 ORDER UPDATE DETECTED!", payload.new);
            const order = payload.new;
            
            // Notify if order just got paid (moves from draft to seller_accepted)
            if (order.status === "seller_accepted" && !this.notifiedOrderIds.has(order.id)) {
              console.log("[AdminPush] 💰 Order was just paid!");
              this.notifiedOrderIds.add(order.id);
              await this.triggerNotification(order.id, order.total_price, order.delivery_location);
            }
          }
        )
        .subscribe((status: string) => {
          console.log("[AdminPush] Real-time channel status:", status);
          if (status === "SUBSCRIBED") {
            console.log("[AdminPush] ✅ Real-time channel active and listening");
          } else if (status === "CHANNEL_ERROR") {
            console.error("[AdminPush] ❌ Real-time channel error. Check Supabase real-time settings!");
            this.status = "error";
          }
        });
    } catch (err) {
      console.error("[AdminPush] Subscription setup error:", err);
      this.isListening = false;
    }
  }

  /**
   * Fallback polling: Check for new pending orders every N seconds.
   */
  static startPolling() {
    // Clear existing interval if any
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Initialize the last known count
    this.fetchPendingCount().then(count => {
      this.lastKnownOrderCount = count;
      console.log(`[AdminPush] 📊 Polling started. Initial pending count: ${count}`);
    });

    // Poll every 15 seconds
    this.pollInterval = setInterval(async () => {
      try {
        const currentCount = await this.fetchPendingCount();
        
        if (this.lastKnownOrderCount >= 0 && currentCount > this.lastKnownOrderCount) {
          const newOrdersAvailable = currentCount - this.lastKnownOrderCount;
          console.log(`[AdminPush] 📈 Poll detected ${newOrdersAvailable} new order(s)!`);
          
          // Trigger notification for new orders found via polling
          await this.triggerNotification(
            "poll-detected",
            0,
            `${newOrdersAvailable} new order${newOrdersAvailable > 1 ? 's' : ''} waiting!`
          );
        }
        
        this.lastKnownOrderCount = currentCount;
      } catch (e) {
        console.error("[AdminPush] Poll error:", e);
      }
    }, 15000);
  }

  /**
   * Fetch the count of pending orders from Supabase
   */
  private static async fetchPendingCount(): Promise<number> {
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "seller_accepted"]);
    
    if (error) {
       // Only log if not a network error which might happen during sleep
       if (error.code !== "PGRST116") {
         console.error("[AdminPush] Error fetching pending count:", error);
       }
       return this.lastKnownOrderCount >= 0 ? this.lastKnownOrderCount : 0;
    }
    return count || 0;
  }

  /**
   * Listen for app foreground/background transitions.
   * When the app resumes from background, reconnect the real-time channel.
   */
  static setupAppStateListener() {
    if (this.appStateListener) return;

    if (Capacitor.isNativePlatform()) {
      this.appStateListener = App.addListener("appStateChange", async ({ isActive }) => {
        console.log(`[AdminPush] App state: ${isActive ? "FOREGROUND" : "BACKGROUND"}`);
        
        if (isActive) {
          console.log("[AdminPush] Re-syncing status...");
          
          // Force reconnect the real-time channel
          if (this.channelSubscription) {
            try {
              supabase.removeChannel(this.channelSubscription);
            } catch (e) {
              // Ignore cleanup errors
            }
            this.channelSubscription = null;
            this.isListening = false;
          }
          
          // Re-start listening
          this.startListening();
          
          // Also do an immediate poll to catch anything missed while in background
          const currentCount = await this.fetchPendingCount();
          if (this.lastKnownOrderCount >= 0 && currentCount > this.lastKnownOrderCount) {
            const diff = currentCount - this.lastKnownOrderCount;
            await this.triggerNotification(
              "resume-detected",
              0,
              `${diff} new order${diff > 1 ? 's' : ''} arrived while away!`
            );
          }
          this.lastKnownOrderCount = currentCount;
        }
      });
    }
  }

  /**
   * Stop all listeners. Only call this on logout, NOT on page navigation.
   */
  static stopListening() {
    console.log("[AdminPush] 🛑 Stopping service...");
    if (this.channelSubscription) {
      supabase.removeChannel(this.channelSubscription);
      this.channelSubscription = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
    
    // Stop tracking
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId }).catch(() => {});
      this.watchId = null;
    }
    if (this.geoChannel) {
      supabase.removeChannel(this.geoChannel);
      this.geoChannel = null;
    }

    this.isListening = false;
    this.isInitialized = false;
    this.status = "inactive";
    this.lastKnownOrderCount = -1;
  }

  /**
   * Public test method to verify notifications are working
   */
  static async testNotification() {
    console.log("[AdminPush] 🧪 Running test notification...");
    await this.triggerNotification("test-order", 499, "Admin Test Location");
  }

  /**
   * Fire a local notification (native) or web Notification (browser fallback)
   */
  private static async triggerNotification(
    orderId: string,
    price: number,
    locationOrMessage?: string
  ) {
    const title = "🔔 New Order Arrived!";
    const body = price > 0
      ? `Order for ₹${price} received! ${locationOrMessage ? `(${locationOrMessage.split(' - ')[0]})` : ''}`
      : locationOrMessage || "A new order has been placed!";

    console.log(`[AdminPush] 📢 Triggering: ${title} — ${body}`);

    if (Capacitor.isNativePlatform()) {
      try {
        // Haptic feedback sequence for urgency
        await Haptics.impact({ style: ImpactStyle.Heavy });
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 400);

        // Schedule local notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              channelId: "admin-alerts",
              schedule: { at: new Date(Date.now() + 100) },
              // Note: If beep.wav is missing, OS defaults to system sound
              sound: "beep.wav",
              smallIcon: "ic_launcher",
              largeIcon: "ic_launcher",
              extra: { orderId },
            },
          ],
        });

        console.log("[AdminPush] ✅ Native notification fired");
      } catch (e) {
        console.error("[AdminPush] ❌ Native notification failed:", e);
      }
    } else {
      // Web browser fallback
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body, icon: "/logo.webp" });
        } catch (e) {
          console.error("[AdminPush] 🖥️ Web notification failed:", e);
        }
      } else {
        console.log("[AdminPush] 🖥️ Browser notification blocked or unsupported");
      }
    }
  }
}
