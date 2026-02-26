import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client using the service role key.
// IMPORTANT: Never import this from client components.
export function createServerSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are not set');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

