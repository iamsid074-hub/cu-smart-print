import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// In production, route through our Vercel serverless proxy (/api/*)
// so the browser never contacts supabase.co directly.
// This bypasses college WiFi SSL inspection that blocks supabase.co.
const effectiveUrl = (import.meta.env.PROD && typeof window !== 'undefined')
    ? `${window.location.origin}/api`
    : supabaseUrl

export const supabase = createClient(effectiveUrl, supabaseAnonKey)
