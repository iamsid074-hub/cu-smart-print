import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WebsiteSmoothnessAI from "./utils/smoothness-ai";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";
import { initPostHog } from "./lib/posthog";

initPostHog();

// Initialize AI Smoothness Tool
if (typeof window !== "undefined") {
  new WebsiteSmoothnessAI({
    debugMode: false, // Set to true to show the 🤖 monitor panel
    autoFix: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Hide the native splash screen when React is fully ready
if (Capacitor.isNativePlatform()) {
  setTimeout(async () => {
    try {
      await SplashScreen.hide();
    } catch (err) {
      console.warn("Splash screen hide failed", err);
    }
  }, 300); // Short delay ensures smooth fade-out into the app's loading states
}
