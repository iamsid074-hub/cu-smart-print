import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// In production (cubazzar.shop), route all Supabase traffic through Vercel proxy
// so the browser only talks to cubazzar.shop — this bypasses SSL interception
// on college/university WiFi networks that intercept traffic to supabase.co
const effectiveUrl = (import.meta.env.PROD && typeof window !== 'undefined')
    ? `${window.location.origin}/supabase-proxy`
    : supabaseUrl

export const supabase = createClient(effectiveUrl, supabaseAnonKey, {
    realtime: {
        // Realtime WebSocket connects directly; falls back gracefully if blocked
        params: { apikey: supabaseAnonKey }
    }
})
