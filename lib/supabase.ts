import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-supabase-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock_anon_key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for anonymous browser operations (e.g. streaming watermarked previews)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for secure server-side operations (e.g. generating 48hr signed download links)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
