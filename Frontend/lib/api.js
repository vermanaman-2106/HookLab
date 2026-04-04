const DEFAULT_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:5001";

const base = () => DEFAULT_BASE.replace(/\/$/, "");

function headersWithAuth(accessToken) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * POST /api/clarify — returns { questions: string[] }
 * @param {string | null} [accessToken] — Supabase session access token (optional)
 */
export async function fetchClarifyQuestions(idea, accessToken = null) {
  const url = `${base()}/api/clarify`;

  const res = await fetch(url, {
    method: "POST",
    headers: headersWithAuth(accessToken),
    body: JSON.stringify({ idea: idea.trim() }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const t = await res.text();
    if (!res.ok) throw new Error(t || `Request failed (${res.status})`);
    throw new Error("Invalid response");
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const questions = data?.questions;
  if (!Array.isArray(questions) || questions.length < 2) {
    throw new Error("Could not load questions. Try again.");
  }

  return questions.map((q) => String(q).trim()).filter(Boolean);
}

/**
 * POST /api/generate
 * Supports idea + type + previousOutput + clarificationSummary
 * @param {string | null} [accessToken] — Supabase session access token (optional)
 */
export async function generateFromIdea(
  idea,
  type = "full",
  previousOutput = "",
  clarificationSummary = "",
  accessToken = null
) {
  const url = `${base()}/api/generate`;

  const res = await fetch(url, {
    method: "POST",
    headers: headersWithAuth(accessToken),
    body: JSON.stringify({
      idea: idea.trim(),
      type,
      previousOutput,
      clarificationSummary,
    }),
  });

  let data;

  try {
    data = await res.json();
  } catch {
    const t = await res.text();
    if (!res.ok) throw new Error(t || `Request failed (${res.status})`);
    return t;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  const text =
    data?.result ??
    data?.reply ??
    data?.message ??
    data?.content ??
    data?.text ??
    (typeof data === "string" ? data : null);

  if (text != null && typeof text === "string") return text;

  if (data != null && typeof data === "object") {
    return JSON.stringify(data, null, 2);
  }

  return "";
}

/**
 * POST /api/analyze — multipart: image (file) + idea (optional text)
 * @param {File} imageFile
 * @param {string} idea
 * @param {string | null} [accessToken]
 */
export async function analyzeInstagramProfile(imageFile, idea, accessToken = null) {
  const url = `${base()}/api/analyze`;

  const fd = new FormData();
  fd.append("image", imageFile);
  fd.append("idea", idea ?? "");

  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: fd,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const t = await res.text();
    if (!res.ok) throw new Error(t || `Request failed (${res.status})`);
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const text = data?.result;
  if (text != null && typeof text === "string") return text;
  throw new Error("No analysis returned. Try again.");
}

/**
 * POST /api/pinterest-inspiration — Pinterest search links for a post idea (rich context string).
 * @param {string} context — idea + prior assistant output, etc.
 * @param {string | null} [accessToken]
 */
export async function fetchPinterestInspiration(context, accessToken = null) {
  const url = `${base()}/api/pinterest-inspiration`;

  const res = await fetch(url, {
    method: "POST",
    headers: headersWithAuth(accessToken),
    body: JSON.stringify({ context: context.trim() }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const t = await res.text();
    if (!res.ok) throw new Error(t || `Request failed (${res.status})`);
    throw new Error("Invalid response");
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const text = data?.result;
  if (text != null && typeof text === "string") return text;
  throw new Error("No inspiration returned. Try again.");
}
