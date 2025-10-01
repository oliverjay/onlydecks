import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://absjsrsmgpnmockujuho.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic2pzcnNtZ3BubW9ja3VqdWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI2NzEsImV4cCI6MjA2NjA4ODY3MX0.6tOu4m3e4YhbEKomjJo4EaVcvLMTQTMyH6WFPDpFt98'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
