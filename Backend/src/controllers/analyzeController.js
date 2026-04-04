const multer = require("multer");
const { analyzeInstagramProfileImage } = require("../services/openaiService");
const { getUserFromAuthorization } = require("../lib/supabase");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okMime = /^image\/(jpeg|png)$/i.test(file.mimetype);
    const okName = /\.(jpe?g|png)$/i.test(file.originalname || "");
    if (okMime || okName) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPG and PNG images are allowed."));
  },
});

async function analyze(req, res) {
  const authUser = await getUserFromAuthorization(req);
  if (authUser) {
    req.hooklabUserId = authUser.id;
  }

  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({
        error:
          "No image uploaded. Add a JPG or PNG screenshot of your Instagram profile.",
      });
    }

    const idea = typeof req.body?.idea === "string" ? req.body.idea : "";
    const base64 = req.file.buffer.toString("base64");
    const mime = req.file.mimetype || "image/jpeg";

    const result = await analyzeInstagramProfileImage(base64, mime, idea);
    return res.status(200).json({ result });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(500).json({
        error: "Server is missing OPENAI_API_KEY. Add it to your .env file.",
      });
    }

    console.error("[analyze]", err);

    const upstreamStatus = err.status ?? err.statusCode;
    if (upstreamStatus === 429) {
      return res.status(429).json({
        error: "Rate limited. Please try again in a moment.",
      });
    }

    return res.status(502).json({
      error:
        "Could not analyze the image. Try a clearer screenshot or try again.",
    });
  }
}

module.exports = { upload, analyze };
