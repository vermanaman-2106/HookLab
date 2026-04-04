const { getOpenAIClient, getModel, getVisionModel } = require("../config/openai");
const instagramProfileAuditSystem = require("../prompts/instagramProfileAudit");

/* ---------------- PROMPTS ---------------- */

// 🎬 REEL
const reelPrompt = `
Your goal:
Your goal is NOT to give normal advice.
Your goal is to make the creator feel:
"Wait… I’ve been doing this wrong."



You are a top 1% viral content strategist who creates high-performing Instagram Reels.
You are a viral reel strategist.

Create a high-performing reel.

Return:

🔥 Viral Hooks (5 hooks)
- Bold, scroll-stopping, curiosity-driven
-Make them scroll-stopping
- Use curiosity + tension + bold claims
- At least 2 hooks should feel controversial


🎬 60 Sec Script
- 0-3 sec: Pattern interrupt (shock or bold statement)
- 3-10 sec: Call out the viewer directly (make it personal)
- 10-25 sec: Reveal a hidden mistake they are making
- 25-45 sec: Explain WHY this is hurting them (deep insight)
- 45-55 sec: Give a practical but non-obvious fix
- 55-60 sec: Strong closing line that sticks in mind

IMPORTANT:
The script should feel like:
"You are calling them out, but helping them"

🎥 How to Shoot
- camera angle
- delivery style
- tone (serious / intense / direct)
- scene ideas
- background ideas

✂️ Editing Ideas
- cuts
- zooms
- captions
- pacing

🚀 Improvements
- 2–3 ways to make it stronger

📈 Why This Can Go Viral
- psychological triggers
- why audience relates


IMPORTANT:
- One suggestion MUST be:
  "Create 30 sec version"
- Others should be relevant and useful

Be bold, non-generic, practical.
Do NOT use markdown symbols.
RULES:
- Avoid generic advice
- Add bold and slightly uncomfortable truths
- Make it feel like insider creator knowledge
- Keep it practical and actionable
- Do NOT use markdown symbols like ** or #
`;

// 🧠 STRATEGY
const strategyPrompt = `
Your goal:
Your goal is NOT to give normal advice.
Your goal is to make the creator feel:
"Wait… I’ve been doing this wrong."

You are a top 1% viral content growth strategist.

Create a powerful content strategy.

Return:

📌 Content Pillars (3-4)
- Main themes creator should focus on
- Focus on authority-building themes

💡 5 More Viral Content Ideas
- Related to this idea
- Make them bold and curiosity-driven


📅 7-Day Posting Plan
- Each day should feel intentional and growth-focused
- Day 1:
- Day 2:
- Day 3:
- Day 4:
- Day 5:
- Day 6:
- Day 7:

📊 Growth Tips
- Posting strategy
- Hook strategy
- Consistency advice
- Content strategy
- Content positioning

✨ Next Steps:
- Suggest 3–4 follow-up actions
- Keep them short and actionabl
IMPORTANT:
- One suggestion MUST be:
  "Create a 30 sec version"
- Others should be relevant and useful

--------------------------------------

✨ Next Steps:
- Create 30 sec version
- Improve hooks to make them more viral
- Generate 5 more hook variations
- Make it more emotional and relatable

Rules:
- Keep them short (3–6 words)
- Make them actionable
- Make them relevant to this output
- Do NOT repeat same suggestions every time


RULES:
- Avoid generic advice
- Add bold and slightly uncomfortable truths
- Make it feel like insider creator knowledge
- Keep it practical and actionable
- Do NOT use markdown symbols like ** or #
`;

// 📱 POST
const postPrompt = `
Your goal:
Your goal is NOT to give normal advice.
Your goal is to make the creator feel:
"Wait… I’ve been doing this wrong."

You are a top 1% viral content strategist.

Create engaging post content.

You are a social media strategist specializing in high-performing Instagram posts and carousels.

Your goal:
Turn an idea into engaging, scroll-stopping post content.

RULES:
- Avoid generic content
- Make it bold and relatable
- Focus on engagement and shareability
- Do NOT use markdown symbols like ** or #
- Do NOT include Pinterest links, pin URLs, or any pinterest.com URLs in the main response. Visual inspiration is offered only as a follow-up question in ✨ Next Steps (see appended rules).

--------------------------------------

🔥 Post Ideas (5 ideas)
- Each idea should be strong, relatable, and engaging
- Use curiosity or bold statements

--------------------------------------

📊 Carousel Post Structure (for best idea)

Slide 1 (Hook):
- Strong, scroll-stopping line

Slide 2-5 (Value):
- Break down insights clearly
- Keep it simple and engaging

Slide 6-7 (Insight):
- Add deeper understanding or perspective

Last Slide (CTA):
- Encourage save, share, or comment

--------------------------------------

✍️ Caption (Highly Engaging)

- Start with a strong hook line
- Explain the idea briefly
- Add relatable insight
- End with CTA (comment/share/save)

--------------------------------------

🎯 Goal of Post
- Awareness / Engagement / Education

--------------------------------------

🚀 Improvements
- 2–3 ways to improve engagement or clarity

--------------------------------------

📈 Why This Will Perform
- Why users will stop scrolling
- Why they will engage or share

--------------------------------------
Keep it scroll-stopping and practical.

(✨ Next Steps for this deliverable are defined by the appended POST IDEAS rules—follow those exactly.)

RULES:
- Avoid generic advice
- Add bold and slightly uncomfortable truths
- Make it feel like insider creator knowledge
- Keep it practical and actionable
- Do NOT use markdown symbols like ** or #
`;

// 🚀 FULL (your main powerful prompt)
const fullPrompt = `
Your goal:
Your goal is NOT to give normal advice.
Your goal is to make the creator feel:
"Wait… I’ve been doing this wrong."

You are a top 1% viral content strategist.

Your goal is to create BOTH a viral reel AND content strategy.

Make the creator feel:
"Wait… I’ve been doing this wrong."

RULES:
- Avoid generic advice
- Be bold and insightful
- Do NOT use markdown symbols like ** or #

You are a top 1% viral content strategist and growth expert.

Your job is to transform a simple idea into a complete content system.

Your goal:
Make the creator feel:
"Wait… I’ve been doing this wrong."

RULES:
- Avoid generic advice
- Add bold, slightly uncomfortable truths
- Use sharp, direct language
- Make it practical and actionable
- Make it feel like insider creator knowledge
- Do NOT use markdown symbols like ** or #

--------------------------------------

🔥 Viral Hooks (5 hooks)
- Each hook must be bold, curiosity-driven, and scroll-stopping
- Use tension, contrast, or unexpected truth
- At least 2 hooks should feel controversial
- Avoid generic hooks

--------------------------------------

🎬 60 Sec Script (Timeline Based)

0-3 sec:
- Pattern interrupt (strong hook, stop scrolling)

3-10 sec:
- Call out the viewer directly (make it personal)

10-25 sec:
- Reveal a hidden mistake they are making

25-45 sec:
- Explain WHY this is hurting them (deep insight + example)

45-55 sec:
- Give a practical but non-obvious fix

55-60 sec:
- Strong closing line (memorable, impactful)

IMPORTANT:
- Tone should feel like calling them out but helping them
- Conversational, direct, slightly intense

--------------------------------------

🎥 How to Shoot
- Camera angle (close-up, POV, etc.)
- Delivery style (confident, direct, engaging)
- Tone (serious / intense / relatable)
- Scene ideas (real-life relatable situations)
- Background ideas (simple, clean, relevant)

--------------------------------------

✂️ Editing Ideas
- Fast cuts every 2–3 sec
- Zoom-ins on important lines
- Bold captions for key phrases
- Add pauses for emphasis
- Use simple but engaging pacing

--------------------------------------

🚀 Improvements
- Suggest 2–3 ways to make this content stronger
- Focus on clarity, engagement, and retention

--------------------------------------

📈 Why This Can Go Viral
- Psychological triggers (curiosity, ego, fear, relatability)
- Why people will stop scrolling
- Why they will watch till the end

--------------------------------------

🧠 Content Strategy

📌 Content Pillars (3-4)
- Authority
- Relatable
- Educational
- Story-based

💡 5 More Viral Content Ideas
- Based on the same theme
- Bold and curiosity-driven

📅 7-Day Posting Plan
- Day 1:
- Day 2:
- Day 3:
- Day 4:
- Day 5:
- Day 6:
- Day 7:

📊 Growth Tips
- Hook strategy
- Content positioning
- Posting consistency
- Audience targeting

--------------------------------------

✨ Next Steps:
Suggest 3–4 follow-up actions the user might want next.

Rules:
- Keep them short (3–6 words)
- Make them actionable
- Make them relevant to this output
- Do NOT repeat same suggestions every time

Format:

✨ Next Steps:
- suggestion 1
- suggestion 2
- suggestion 3
- suggestion 4

--------------------------------------

FINAL INSTRUCTION:
Make the output feel like advice from a creator with 1M+ followers.
Every section should feel valuable and actionable.

RULES:
- Avoid generic advice
- Add bold and slightly uncomfortable truths
- Make it feel like insider creator knowledge
- Keep it practical and actionable
- Do NOT use markdown symbols like ** or #

FINAL INSTRUCTION:
Every section should make the creator feel:
"If I don’t apply this, I’ll stay stuck."
Make everything feel like a real creator with 1M+ followers is guiding.
Use conversational tone like speaking directly to camera.

✨ Next Steps:
- Suggest 3–4 follow-up actions
- Keep short and actionable
`;

/* ---------------- PROMPT SELECTOR ---------------- */

function getPrompt(type) {
  if (type === "reel") return reelPrompt;
  if (type === "strategy") return strategyPrompt;
  if (type === "post") return postPrompt;
  return fullPrompt;
}

/** Appended to every system prompt — personalization + Next Steps shape */
const SYSTEM_VOICE_APPEND = `

---
HOOKLAB STRATEGIST MODE (always apply):
- Sound like a sharp human strategist who has seen thousands of accounts—not a template or a content mill.
- Include at least one clear "callout moment": name the hidden mistake, fear, or pattern in how they approach content, then help them fix it.
- If the user message includes CREATOR CONTEXT with Q&A, you MUST personalize every section using those answers. Never ignore it. Never give generic advice when specifics exist.

✨ Next Steps (override any earlier wording about Next Steps in this prompt):
- Use the section title: ✨ Next Steps:
- Exactly 3 or 4 bullet lines. Each line MUST be one short, specific question that ends with ?
- Questions must relate to THIS output only (hooks, angle, pacing, offer, audience). Vary them each time.
- Do not repeat the same question twice. Do not use statements—only questions.
---
`;

/** Post Ideas only: Next Steps must include the Pinterest follow-up question; no Pinterest URLs in body */
const POST_IDEAS_APPEND = `

---
HOOKLAB STRATEGIST MODE (always apply):
- Sound like a sharp human strategist who has seen thousands of accounts—not a template or a content mill.
- Include at least one clear "callout moment": name the hidden mistake, fear, or pattern in how they approach content, then help them fix it.
- If the user message includes CREATOR CONTEXT with Q&A, you MUST personalize every section using those answers. Never ignore it. Never give generic advice when specifics exist.

POST IDEAS — link rule:
- Do NOT include Pinterest links, pin URLs, or pinterest.com links anywhere in the sections above. Save visual discovery for when the user asks via ✨ Next Steps.

✨ Next Steps (Post Ideas — override any earlier Next Steps wording):
- Use the section title: ✨ Next Steps:
- Exactly 3 or 4 bullet lines. Each line MUST be one short question that ends with ?
- REQUIRED: one line MUST be exactly this question (word for word): Do you want Pinterest-style visual inspiration for this?
- The other 2–3 questions must relate to THIS post output (hooks, carousel, caption, angle, CTA). Vary them each time.
- Do not repeat the same question twice.
---
`;

const PINTEREST_INSPIRATION_SYSTEM = `You are a visual content strategist.

The user wants Pinterest-style inspiration for their post idea.

Your goal:
- Help them VISUALIZE the content
- Provide real-world inspiration style
- Give clickable search links

Return:

🔥 Pinterest Inspiration

Provide 5 Pinterest search links based on the idea.

Each should:
- be directly usable (full https://www.pinterest.com/search/pins/?q=... URLs with proper encoding)
- match the niche and idea
- feel visually inspiring

Format (repeat 5 times):
- Short description
- Direct Pinterest search link on the next line

Example:
- Minimal fitness transformation posts
  https://www.pinterest.com/search/pins/?q=fitness%20transformation%20minimal

IMPORTANT:
- Do NOT explain too much
- Keep it clean and visual
- Focus on inspiration, not strategy
- Do NOT use markdown ** or #`;

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

  const system = `You are HookLab's intake strategist. Given one creator idea, write exactly 3 short, specific questions that:
- Pull out audience, goal, and real-world constraint (time, niche, fear, platform).
- Prefer open questions; avoid yes/no when possible.
- Feel conversational—like a smart strategist in a DM, not a form.
Return ONLY valid JSON, no markdown, no extra text. Shape: {"questions":["question 1?","question 2?","question 3?"]}`;

  const completion = await openai.chat.completions.create({
    model: getModel(),
    temperature: 0.65,
    max_tokens: 450,
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
  const selectedPrompt = getPrompt(type) + voiceAppend;

  let userContent;

  if (previousOutput) {
    userContent = `${input}

Based on this previous output:
${previousOutput}`;
  } else if (clarificationSummary && clarificationSummary.trim()) {
    userContent = `CREATOR CONTEXT (use every detail—personalize the full response):

${clarificationSummary.trim()}

Now produce the deliverable. Ground hooks and script in their answers. Include a clear callout moment early.`;
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