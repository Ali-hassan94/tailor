import { createClient } from "@supabase/supabase-js";

// Ye dono values PUBLIC hoti hain (anon key RLS ke peeche safe hai).
// Database password app mein KABHI nahi dalna.
const url =
  import.meta.env.VITE_SUPABASE_URL || "https://kjrkprduhjedwzfnwiso.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-anon-key";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true, // offline bhi login rahe
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});
