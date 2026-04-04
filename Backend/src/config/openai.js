const OpenAI = require("openai");

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  return new OpenAI({
    apiKey: key,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "HookLab AI",
    },
  });
}

function getModel() {
  return process.env.OPENAI_MODEL?.trim() || "deepseek/deepseek-chat";
}

/** Vision-capable model on OpenRouter (e.g. openai/gpt-4o-mini, openai/gpt-4o) */
function getVisionModel() {
  return process.env.OPENAI_VISION_MODEL?.trim() || "openai/gpt-4o-mini";
}

module.exports = { getOpenAIClient, getModel, getVisionModel };