import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholder values in development to prevent crash.
// The app will be non-functional for DB operations, but will render.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

const isDemoMode = !supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseAnonKey

if (import.meta.env.DEV && isDemoMode) {
  console.warn(
    '[Jample Life] ⚠️  Supabase credentials not configured.\n' +
    'Copy .env.example to .env.local and add your Supabase project URL and anon key.\n' +
    'The app is running in demo/preview mode — database operations will not work.'
  )
}

/**
 * Supabase client for browser use.
 * Uses the public anon key only.
 * Service role key MUST NEVER be used here — only in Edge Functions.
 */
export const supabase = createClient(
  isDemoMode ? PLACEHOLDER_URL : supabaseUrl,
  isDemoMode ? PLACEHOLDER_KEY : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-app-name': 'jample-life',
      },
    },
  }
)

/** Whether the app is running without real Supabase credentials */
export const isConfigured = !isDemoMode

export default supabase
