import { createClient } from '@supabase/supabase-js'
import type DB from './types/database.types'

// FIX: Add type definitions for import.meta.env to resolve TypeScript errors
// when vite/client types are not automatically picked up.
interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  [key: string]: string | boolean | undefined
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

// Get URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}

// Create and export the client
export const supabase = createClient<DB>(supabaseUrl, supabaseAnonKey)
