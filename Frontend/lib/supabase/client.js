import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase browser client, or `null` if env vars are not set.
 * Callers must handle `null` (show setup UI / skip auth features).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    return null;
  }
  return createBrowserClient(url, key);
}
