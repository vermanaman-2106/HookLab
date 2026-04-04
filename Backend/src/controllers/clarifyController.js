const { z } = require("zod");
const { generateClarificationQuestions } = require("../services/openaiService");
const { getUserFromAuthorization } = require("../lib/supabase");

const bodySchema = z.object({
  idea: z.string().trim().min(1, "idea is required").max(8000, "idea is too long"),
});

async function clarify(req, res) {
  const parsed = bodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    });
  }

  const authUser = await getUserFromAuthorization(req);
  if (authUser) {
    req.hooklabUserId = authUser.id;
  }

  try {
    const questions = await generateClarificationQuestions(parsed.data.idea);
    return res.status(200).json({ questions });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(500).json({
        error: "Server is missing OPENAI_API_KEY. Add it to your .env file.",
      });
    }

    console.error("[clarify]", err);

    const upstreamStatus = err.status ?? err.statusCode;

    if (upstreamStatus === 429) {
      return res.status(429).json({
        error: "Rate limited. Please try again in a moment.",
      });
    }

    return res.status(502).json({
      error: "Could not generate questions. Please try again.",
    });
  }
}

module.exports = { clarify };
