import { createClient } from '@supabase/supabase-js'

// Use env vars if available, otherwise use hardcoded fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://txlnensotksykgwrxdrw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bG5lbnNvdGtzeWtnd3J4ZHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzc1MjUsImV4cCI6MjA3NDg1MzUyNX0.DNE3BSMM0qCSNn_xxFP_zlLXyMTuM21jwnJDVZqCIR0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
