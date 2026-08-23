import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && key && !url.includes('placeholder') && !key.includes('placeholder')) {
  try {
    client = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { transport: ws as any }
    });
    console.log('[Supabase] Connected to Postgres database.');
  } catch (err: any) {
    console.warn('[Supabase] Failed to initialize client, using in-memory store:', err?.message || err);
  }
} else {
  console.log('[Supabase] No SUPABASE_URL / SUPABASE_ANON_KEY set — running with in-memory persistence.');
}

export const supabase = client;
