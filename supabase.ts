
import { createClient } from '@supabase/supabase-js';

// Jika URL kosong, berikan placeholder agar library tidak crash saat inisialisasi.
// Ganti nilai ini di environment variables (Vercel/Cloud) atau langsung di index.html jika perlu.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
