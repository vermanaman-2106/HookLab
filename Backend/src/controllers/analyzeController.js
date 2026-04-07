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

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/jpg"]);

function parseDataUrl(dataUrl) {
  const m =
    typeof dataUrl === "string" &&
    dataUrl.match(/^data:(image\/(?:jpeg|png|jpg));base64,([\s\S]+)$/i);
  if (!m) return null;
  const mime = m[1].toLowerCase().replace("jpg", "jpeg");
  const b64 = m[2].replace(/\s/g, "");
  return { mime: mime === "image/jpg" ? "image/jpeg" : mime, base64: b64 };
}

function bufferFromBase64Payload(imageBase64, mimeType) {
  const raw = typeof imageBase64 === "string" ? imageBase64.trim() : "";
  if (!raw) return null;

  let b64;
  let mime = "image/jpeg";

  if (raw.startsWith("data:")) {
    const parsed = parseDataUrl(raw);
    if (!parsed) return null;
    b64 = parsed.base64;
    mime = parsed.mime;
  } else {
    b64 = raw.replace(/\s/g, "");
    if (
      typeof mimeType === "string" &&
      ALLOWED_MIME.has(mimeType.toLowerCase())
    ) {
      mime = mimeType.toLowerCase().replace("jpg", "jpeg");
    }
  }

  const buf = Buffer.from(b64, "base64");
  if (!buf.length) return null;
  if (buf.length > 5 * 1024 * 1024) return null;
  return { buffer: buf, mime };
}

async function runAnalyze(req, res, base64, mime, idea) {
  const authUser = await getUserFromAuthorization(req);
  if (authUser) {
    req.hooklabUserId = authUser.id;
  }

  try {
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

async function analyzeMultipart(req, res) {
  if (!req.file?.buffer?.length) {
    return res.status(400).json({
      error:
        "No image uploaded. Add a JPG or PNG screenshot of your Instagram profile.",
    });
  }

  const idea = typeof req.body?.idea === "string" ? req.body.idea : "";
  const base64 = req.file.buffer.toString("base64");
  const mime = req.file.mimetype || "image/jpeg";

  return runAnalyze(req, res, base64, mime, idea);
}

async function analyzeJson(req, res) {
  const body = req.body || {};
  const idea = typeof body.idea === "string" ? body.idea : "";

  const imageInput =
    typeof body.image === "string" && body.image.startsWith("data:")
      ? body.image
      : body.imageBase64 ?? body.image;

  const parsed = bufferFromBase64Payload(imageInput, body.mimeType);
  if (!parsed) {
    return res.status(400).json({
      error:
        "Missing or invalid image. Send multipart file field `image`, or JSON with image (data URL) or imageBase64 plus mimeType (image/jpeg or image/png). Max 5MB decoded.",
    });
  }

  const base64 = parsed.buffer.toString("base64");
  return runAnalyze(req, res, base64, parsed.mime, idea);
}

module.exports = { upload, analyzeMultipart, analyzeJson };
