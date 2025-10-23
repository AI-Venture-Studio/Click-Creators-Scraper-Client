import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a client even if env vars are missing (for build time)
// Runtime checks will handle missing credentials gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Create a Supabase client with RLS context set for a specific base_id
 * This enables multi-tenant data isolation at the database level
 * 
 * @param baseId - The Airtable base ID to use for RLS filtering
 * @returns A Supabase client configured for the specified base
 */
export function createSupabaseClientWithContext(baseId: string) {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          'X-Base-Id': baseId
        }
      }
    }
  )
}
