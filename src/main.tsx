import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WebsiteSmoothnessAI from "./utils/smoothness-ai";

// Initialize AI Smoothness Tool
if (typeof window !== "undefined") {
  new WebsiteSmoothnessAI({
    debugMode: false, // Set to true to show the 🤖 monitor panel
    autoFix: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
