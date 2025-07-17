// utils/supabase/client/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are defined for the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Still uses public URL for connection
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This is the sensitive key

console.log('Supabase URL:', supabaseServiceRoleKey);
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  // This error indicates the server-side environment variable is missing
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,   // Not needed for admin client
    },
  }
);