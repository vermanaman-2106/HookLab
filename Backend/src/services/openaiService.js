const { getOpenAIClient, getModel, getVisionModel } = require("../config/openai");
const instagramProfileAuditSystem = require("../prompts/instagramProfileAudit");

/* ---------------- PROMPTS ---------------- */

// 🎬 REEL
const reelPrompt = `
Reel Plan deliverable. Tone: "Wait… I’ve been doing this wrong." Insider, non-generic, uncomfortable truths where useful.

🔥 Viral Hooks (5 hooks)
Bold, curiosity-driven, tension; ≥2 controversial.

🎬 60 Sec Script
0–3s interrupt · 3–10s call viewer out · 10–25s hidden mistake · 25–45s why it hurts · 45–55s non-obvious fix · 55–60s memorable close. Call them out, help them.

🎥 How to Shoot
Angle, delivery, tone, scenes, backgrounds.

✂️ Editing Ideas
Cuts, zooms, captions, pacing.

🚀 Improvements
2–3 upgrades.

📈 Why This Can Go Viral
Triggers, relatability.

No ** or #.
`;

// 🧠 STRATEGY
const strategyPrompt = `
Strategy deliverable. Tone: "Wait… I’ve been doing this wrong." Authority-building, bold, insider.

📌 Content Pillars (3–4)

💡 5 More Viral Content Ideas
Tied to this idea; curiosity-driven.

📅 7-Day Posting Plan
Day 1–Day 7 — intentional, growth-focused lines each day.

📊 Growth Tips
Hooks, positioning, consistency, posting.

No ** or #.
`;

// 📱 POST
const postPrompt = `
Post Ideas deliverable. Scroll-stopping, bold, relatable. No Pinterest/pin URLs in the body—only in appended ✨ Next Steps rules.

🔥 Post Ideas (5 ideas)
Strong angles; curiosity or bold statements.

📊 Carousel Post Structure (best idea)
Slide 1 Hook · Slides 2–5 value · Slides 6–7 insight · Last CTA (save/share/comment).

✍️ Caption
Hook, brief idea, relatable insight, CTA.

🎯 Goal of Post
Awareness / Engagement / Education.

🚀 Improvements
2–3 clarity or engagement upgrades.

📈 Why This Will Perform
Scroll-stop and engagement rationale.

No ** or #.
`;

// 🚀 FULL
const fullPrompt = `
Full Plan: reel + strategy. Tone: "Wait… I’ve been doing this wrong." Sharp, insider, uncomfortable truths where useful—1M+ creator energy.

🔥 Viral Hooks (5 hooks)
Bold, scroll-stopping; tension/contrast; ≥2 controversial.

🎬 60 Sec Script (Timeline)
0–3s interrupt · 3–10s personal · 10–25s mistake · 25–45s why it hurts + example · 45–55s fix · 55–60s close. Call out but help.

🎥 How to Shoot
Angle, delivery, tone, scenes, backgrounds.

✂️ Editing Ideas
Cuts ~2–3s, zooms, captions, pacing, pauses.

🚀 Improvements
2–3 stronger.

📈 Why This Can Go Viral
Triggers; scroll-stop; watch-through.

🧠 Content Strategy

📌 Content Pillars (3–4)
Authority · Relatable · Educational · Story-based.

💡 5 More Viral Content Ideas
Same theme; bold.

📅 7-Day Posting Plan
Day 1–Day 7.

📊 Growth Tips
Hooks, positioning, consistency, audience.

No ** or #. (✨ Next Steps: follow appended rules.)
`;

/* ---------------- PROMPT SELECTOR ---------------- */

function getPrompt(type) {
  if (type === "reel") return reelPrompt;
  if (type === "strategy") return strategyPrompt;
  if (type === "post") return postPrompt;
  return fullPrompt;
}

/** Top of system prompt — identity + deliverable lock */
const STRATEGIST_IDENTITY = `
Top 1% Instagram growth strategist—think with the creator, not a generic tool. User already picked a deliverable: produce it fully in the structure below (complete, specific).

`;

/** Reel / Strategy / Full: voice + ✨ Next Steps contract */
const SYSTEM_VOICE_APPEND = `

---
Deliver: full structured sections. One callout (mistake/fear/pattern + fix). Insider tone; use CREATOR CONTEXT Q&A if present.
End with only:

✨ Next Steps:
Exactly 4 hyphen bullets—each a short question ending in ? (1) strategic/challenging vs idea (2) different “next move” question (3) another angle on this output (4) new angle—no duplicate intent/wording.
Never: "Want to take this further?" / "Want to go deeper?" Vary each run. Stay in-thread. No ** or #.
---
`;

/** Post Ideas: Pinterest line + same ✨ contract */
const POST_IDEAS_APPEND = `

---
Full Post Ideas sections. Callout + CREATOR CONTEXT if any. No Pinterest URLs before ✨ Next Steps.

✨ Next Steps:
4 hyphen bullets, each ending in ? — (1) strategic vs idea (2) EXACT: Do you want Pinterest-style visual inspiration for this? (3) dynamic follow-up, ≠(1) (4) new angle; no dupes. No lazy closers. No ** or #.
---
`;

const PINTEREST_INSPIRATION_SYSTEM = `Visual strategist. Pinterest search inspiration only.

🔥 Pinterest Inspiration
5 pairs: short label, then full https://www.pinterest.com/search/pins/?q=... (URL-encoded), niche-fit. Minimal prose. No ** or #.`;

const FALLBACK_CLARIFY_QUESTIONS = [
  "Who is this for specifically—and what should they feel after they watch or read it?",
  "What are you most afraid will go wrong if you post this (boring, cringe, ignored, or off-brand)?",
  "What platform and format are you optimizing for in the next 7 days?",
];

function parseQuestionsJson(text) {
  const raw = (text || "").trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.questions)) {
      const qs = parsed.questions
        .map((q) => String(q).trim())
        .filter(Boolean);
      if (qs.length >= 2) return qs.slice(0, 3);
    }
  } catch {
    /* try to find JSON object */
    const m = raw.match(/\{[\s\S]*"questions"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        if (parsed && Array.isArray(parsed.questions)) {
          const qs = parsed.questions
            .map((q) => String(q).trim())
            .filter(Boolean);
          if (qs.length >= 2) return qs.slice(0, 3);
        }
      } catch {
        /* noop */
      }
    }
  }
  return null;
}

async function generateClarificationQuestions(idea) {
  const openai = getOpenAIClient();

  if (!openai) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const system = `Intake strategist: for one creator idea, output exactly 3 short, specific questions covering audience, goal, constraint (time/niche/fear/platform). Open-ended, DM tone—not a form. JSON only, no markdown: {"questions":["q1?","q2?","q3?"]}`;

  const completion = await openai.chat.completions.create({
    model: getModel(),
    temperature: 0.65,
    max_tokens: 380,
    messages: [
      { role: "system", content: system },
      { role: "user", content: idea },
    ],
  });

  let reply = completion.choices[0]?.message?.content?.trim() ?? "";
  reply = reply
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/s, "")
    .trim();
  const parsed = parseQuestionsJson(reply);
  if (parsed && parsed.length >= 2) {
    const out = [...parsed];
    while (out.length < 3) out.push(FALLBACK_CLARIFY_QUESTIONS[out.length]);
    return out.slice(0, 3);
  }

  return [...FALLBACK_CLARIFY_QUESTIONS];
}

/* ---------------- MAIN FUNCTION ---------------- */

async function generateHookLabContent(
  input,
  type = "full",
  previousOutput = "",
  clarificationSummary = ""
) {
  const openai = getOpenAIClient();

  if (!openai) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const voiceAppend = type === "post" ? POST_IDEAS_APPEND : SYSTEM_VOICE_APPEND;
  const selectedPrompt = STRATEGIST_IDENTITY + getPrompt(type) + voiceAppend;

  let userContent;

  if (previousOutput) {
    userContent = `${input}

Based on this previous output:
${previousOutput}`;
  } else if (clarificationSummary && clarificationSummary.trim()) {
    userContent = `CREATOR CONTEXT (personalize everything):

${clarificationSummary.trim()}

Deliverable: ground in answers; include an early callout.`;
  } else {
    userContent = `Analyze this idea: ${input}`;
  }

  const completion = await openai.chat.completions.create({
    model: getModel(),
    temperature: 0.7,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: selectedPrompt,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    const err = new Error("Empty model response");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  return reply;
}

/**
 * Pinterest-style visual inspiration (search links only — separate from Post Ideas body).
 * @param {string} context — idea + prior model output, etc.
 */
async function generatePinterestInspiration(context) {
  const openai = getOpenAIClient();

  if (!openai) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const userContent =
    typeof context === "string" && context.trim()
      ? context.trim()
      : "No context provided.";

  const completion = await openai.chat.completions.create({
    model: getModel(),
    temperature: 0.65,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content: PINTEREST_INSPIRATION_SYSTEM,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  let reply = completion.choices[0]?.message?.content?.trim() ?? "";
  reply = stripMarkdownNoise(reply);

  if (!reply) {
    const err = new Error("Empty model response");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  return reply;
}

function stripMarkdownNoise(text) {
  return (text || "")
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

/**
 * Vision analysis of an Instagram profile screenshot (base64 + mime).
 * @param {string} imageBase64
 * @param {string} mimeType e.g. image/jpeg
 * @param {string} userIdea optional extra context
 */
async function analyzeInstagramProfileImage(imageBase64, mimeType, userIdea = "") {
  const openai = getOpenAIClient();

  if (!openai) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const safeMime =
    mimeType && /^image\/(jpeg|jpg|png)$/i.test(mimeType)
      ? mimeType.replace(/jpg/i, "jpeg")
      : "image/jpeg";

  const userText = userIdea.trim()
    ? `Additional context from the creator (optional):\n${userIdea.trim()}\n\nAnalyze the screenshot and follow all system instructions.`
    : `Analyze the Instagram profile screenshot and follow all system instructions.`;

  const completion = await openai.chat.completions.create({
    model: getVisionModel(),
    temperature: 0.65,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: instagramProfileAuditSystem,
      },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: {
              url: `data:${safeMime};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  });

  let reply = completion.choices[0]?.message?.content?.trim() ?? "";
  reply = stripMarkdownNoise(reply);

  if (!reply) {
    const err = new Error("Empty model response");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  return reply;
}

module.exports = {
  generateHookLabContent,
  generateClarificationQuestions,
  analyzeInstagramProfileImage,
  generatePinterestInspiration,
};