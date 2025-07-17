// utils/supabase/client/supabaseBrowser.ts
import { createBrowserClient } from '@supabase/ssr'; // Use createBrowserClient for better SSR compatibility

// Ensure these environment variables are defined for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    // Optional: Add auth options if you're managing user sessions on the client
    // auth: {
    //   persistSession: true,
    //   autoRefreshToken: true,
    //   detectSessionInUrl: true,
    // }
  }
);