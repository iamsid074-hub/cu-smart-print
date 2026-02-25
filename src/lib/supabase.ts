import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// In production, intercept all Supabase HTTP requests and route them
// through our Vercel serverless function at /api/sb.
// This means the browser only contacts cubazzar.shop (trusted SSL cert)
// instead of supabase.co directly — bypassing college WiFi SSL interception.
const proxyFetch: typeof fetch = async (input, init?) => {
    const url =
        typeof input === 'string' ? input
            : input instanceof URL ? input.href
                : (input as Request).url

    if (import.meta.env.PROD && url.includes('supabase.co')) {
        // Pass the full URL (including query string) as an encoded param
        const proxyUrl = `/api/sb?url=${encodeURIComponent(url)}`
        return fetch(proxyUrl, { ...init, credentials: 'omit' })
    }

    return fetch(input, init as RequestInit)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: proxyFetch }
})
