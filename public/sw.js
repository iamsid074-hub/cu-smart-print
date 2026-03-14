// CU Bazzar Service Worker — handles Web Push Notifications

self.addEventListener("install", (event) => {
    console.log("[SW] Installed");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("[SW] Activated");
    event.waitUntil(self.clients.claim());
});

// ── Push Event Handler ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = { title: "CU Bazzar", body: event.data.text(), url: "/" };
    }

    const { title = "CU Bazzar", body = "", url = "/tracking", icon = "/logo.png", badge = "/logo.png", tag } = payload;

    const options = {
        body,
        icon,
        badge,
        tag: tag || "cu-bazzar-notification",
        renotify: true,
        vibrate: [100, 50, 100],
        data: { url },
        actions: [
            { action: "view", title: "Track Order" },
            { action: "dismiss", title: "Dismiss" },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const url = notification.data?.url || "/tracking";

    notification.close();

    if (event.action === "dismiss") return;

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // If app is already open, focus and navigate
            for (const client of clients) {
                if ("navigate" in client) {
                    client.focus();
                    return client.navigate(url);
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow(url);
        })
    );
});
