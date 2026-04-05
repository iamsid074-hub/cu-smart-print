import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xzzjmhfsmdnpzegfzrvo.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6emptaGZzbWRucHplZ2Z6cnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg3MTcsImV4cCI6MjA4NzE4NDcxN30.qLCqiu2x2r9_qvPzMNhpiM4SSpN5ZpENxgbytjUiOUE";

// In production, intercept all Supabase HTTP requests and route them
// through our Vercel serverless function at /api/sb.
// This means the browser only contacts cubazzar.shop (trusted SSL cert)
// instead of supabase.co directly — bypassing college WiFi SSL interception.
const proxyFetch: typeof fetch = async (input, init?) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.href
      : (input as Request).url;
  // Check if we are running in a Capacitor app (Android/iOS)
  // window.Capacitor is always injected by the Capacitor runtime in native apps
  const isCapacitor =
    typeof window !== "undefined" &&
    ((window as any).Capacitor !== undefined ||
      window.location.origin.includes("capacitor://") ||
      window.location.origin.includes("localhost"));

  // Only use the Vercel proxy if we are in true production WEB, not native mobile
  if (import.meta.env.PROD && url.includes("supabase.co") && !isCapacitor) {
    // Pass the full URL (including query string) as an encoded param
    const proxyUrl = `/api/sb?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl, { ...init, credentials: "omit" });
  }

  return fetch(input, init as RequestInit);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: proxyFetch },
  auth: {
    // Disable the Navigator LockManager if it's failing on mobile by using simple localStorage
    // This prevents the "Acquiring an exclusive Navigator LockManager lock timed out" error
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Optional: reduce the chance of locks by disabling the broadcast feature across tabs
    // if this app is mostly used in a single PWA/web-app view
    storageKey: "sb-cubazzar-auth-token",
  },
});
