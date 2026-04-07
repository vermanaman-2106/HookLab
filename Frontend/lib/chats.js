/** Serialized shape stored in public.chats.messages (jsonb) */
export const CHAT_STATE_VERSION = 1;

export function buildChatPayload(state) {
  return {
    v: CHAT_STATE_VERSION,
    thread: state.messages,
    phase: state.phase,
    idea: state.idea,
    clarifyQuestions: state.clarifyQuestions,
    clarifyAnswers: state.clarifyAnswers,
    lastResult: state.lastResult,
    suggestions: state.suggestions,
  };
}

export function parseChatPayload(messagesJson) {
  if (!messagesJson || typeof messagesJson !== "object") {
    return null;
  }
  if (Array.isArray(messagesJson)) {
    return {
      messages: messagesJson,
      phase: "intake",
      idea: "",
      clarifyQuestions: [],
      clarifyAnswers: [],
      lastResult: "",
      suggestions: [],
    };
  }
  const thread = messagesJson.thread;
  if (!Array.isArray(thread)) {
    return null;
  }
  return {
    messages: thread,
    phase: messagesJson.phase ?? "intake",
    idea: messagesJson.idea ?? "",
    clarifyQuestions: messagesJson.clarifyQuestions ?? [],
    clarifyAnswers: messagesJson.clarifyAnswers ?? [],
    lastResult: messagesJson.lastResult ?? "",
    suggestions: messagesJson.suggestions ?? [],
  };
}

export function chatTitleFromPayload(messagesJson) {
  const parsed = parseChatPayload(messagesJson);
  if (!parsed) return "New chat";
  const firstUser = parsed.messages.find((m) => m.role === "user");
  const raw = (firstUser?.content ?? parsed.idea ?? "New chat").trim();
  if (!raw) {
    if (firstUser?.image?.src) return "Profile screenshot";
    return "New chat";
  }
  return raw.length > 44 ? `${raw.slice(0, 44)}…` : raw;
}

/**
 * Readable message for Supabase PostgREST errors (avoids `{}` in console).
 * @param {unknown} err
 */
export function formatSupabaseError(err) {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Error";
  if (typeof err === "object") {
    const o = err;
    const msg = o.message ?? o.error_description ?? o.msg;
    const code = o.code;
    const details = o.details;
    const hint = o.hint;
    const parts = [msg, code && `code: ${code}`, details, hint].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * User-facing copy when `chats` table is missing (PGRST205) or similar.
 * @param {unknown} err
 */
export function userFacingChatsFetchError(err) {
  const raw = formatSupabaseError(err);
  if (
    raw.includes("PGRST205") ||
    /could not find the table.*chats/i.test(raw) ||
    /schema cache/i.test(raw)
  ) {
    return "Chat history isn’t set up yet. In the Supabase dashboard open SQL Editor, paste and run the file supabase/migrations/20260404120000_chats.sql from this project, then tap Reload.";
  }
  return raw;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ data: Array<{ id: string; messages: unknown; created_at: string }>; error: object | null }>}
 */
export async function fetchUserChats(supabase) {
  const { data, error } = await supabase
    .from("chats")
    .select("id, messages, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error };
  }
  return { data: data ?? [], error: null };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {object} payload
 * @param {string | null} chatId
 */
export async function saveChat(supabase, userId, payload, chatId) {
  if (chatId) {
    const { error } = await supabase
      .from("chats")
      .update({ messages: payload })
      .eq("id", chatId);
    if (error) throw error;
    return { id: chatId };
  }

  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: userId, messages: payload })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function deleteChat(supabase, chatId) {
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) throw error;
}
