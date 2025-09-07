// FIX: Resolve errors related to missing Vite client types and undeclared environment variables.
// The reference to 'vite/client' was removed as it couldn't be found, and manual
// type definitions for 'import.meta.env' are provided instead. This makes the
// environment variables types available globally across the project.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
