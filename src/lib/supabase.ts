import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mmasinwiswqwqqbwfnde.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYXNpbndpc3dxd3FxYndmbmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjQ5MTEsImV4cCI6MjA4ODE0MDkxMX0.VMFw9jrg0Xspx4EuemZEWh2xgrgldHGuo4J33qeHGBY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
