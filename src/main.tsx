import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";
import { initPostHog } from "./lib/posthog";

initPostHog();

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
