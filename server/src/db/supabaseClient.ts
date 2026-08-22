import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing SUPABASE_URL / SUPABASE_ANON_KEY. Copy server/.env.example to server/.env and fill them in — ' +
    'task history, the Algorand ledger, and the provider catalog are persisted in Postgres and cannot start without it.'
  );
}

// Server-side only client. This key must never be sent to the browser — the
// client app talks exclusively to our own Hono API, never to Supabase
// directly, which is what keeps disabled-RLS on these tables an acceptable
// tradeoff for this project's timeline (see README).
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  // We only ever do plain table reads/writes (no live subscriptions), but the
  // client still eagerly constructs a Realtime websocket client on Node < 22
  // unless given a transport — supply `ws` per Supabase's own guidance.
  realtime: { transport: ws as any }
});
