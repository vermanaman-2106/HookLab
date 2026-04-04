const { z } = require("zod");
const { generatePinterestInspiration } = require("../services/openaiService");
const { getUserFromAuthorization } = require("../lib/supabase");

const bodySchema = z.object({
  context: z
    .string()
    .trim()
    .min(20, "context is too short")
    .max(16000, "context is too long"),
});

async function pinterestInspiration(req, res) {
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
    const result = await generatePinterestInspiration(parsed.data.context);
    return res.status(200).json({ result });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(500).json({
        error: "Server is missing OPENAI_API_KEY. Add it to your .env file.",
      });
    }

    console.error("[pinterest-inspiration]", err);

    const upstreamStatus = err.status ?? err.statusCode;

    if (upstreamStatus === 429) {
      return res.status(429).json({
        error: "Rate limited. Please try again in a moment.",
      });
    }

    return res.status(502).json({
      error: "The AI service failed to respond. Please try again.",
    });
  }
}

module.exports = { pinterestInspiration };
