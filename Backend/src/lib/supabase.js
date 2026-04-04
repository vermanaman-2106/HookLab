const { createClient } = require("@supabase/supabase-js");

/**
 * Validates Supabase JWT and returns the user, or null if missing/invalid.
 * Uses the anon key + getUser (server-side verification).
 */
function getSupabaseAuthClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key);
}

async function getUserFromAuthorization(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return null;
  }
  const sb = getSupabaseAuthClient();
  if (!sb) {
    return null;
  }
  const {
    data: { user },
    error,
  } = await sb.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

module.exports = {
  getUserFromAuthorization,
  getSupabaseAuthClient,
};
