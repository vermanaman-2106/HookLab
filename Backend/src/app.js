require("dotenv").config();

const express = require("express");
const cors = require("cors");

const multer = require("multer");
const generateRoutes = require("./routes/generate");
const clarifyRoutes = require("./routes/clarify");
const analyzeRoutes = require("./routes/analyze");
const pinterestRoutes = require("./routes/pinterest");

const app = express();

/** ✅ Request Logger (helps debugging) */
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/** ✅ CORS — dynamic origin; defaults + optional CORS_ORIGIN (comma-separated) */
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://hook-lab-brown.vercel.app",
];
const extraOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOriginSet = new Set([...defaultAllowedOrigins, ...extraOrigins]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOriginSet.has(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

/** CORS for all methods/paths (including OPTIONS preflight). Do not use "*" routes — Express 5 / path-to-regexp rejects them. */
app.use(cors(corsOptions));
/** Explicit root OPTIONS (valid path); other paths are covered by the middleware above. */
app.options("/", cors(corsOptions));

/** ✅ Body Parser — larger cap for analyze JSON (base64 images) before global limit */
app.use("/api/analyze", express.json({ limit: "12mb" }));
app.use(express.json({ limit: "64kb" }));

/** ✅ Routes */
app.use("/api/generate", generateRoutes);
app.use("/api/clarify", clarifyRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/pinterest-inspiration", pinterestRoutes);

/** ✅ Health Check */
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

/** ❌ 404 Handler */
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

/** ❌ Global Error Handler */
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image must be 5MB or smaller." });
    }
    return res.status(400).json({ error: "Upload failed. Try again." });
  }

  if (err && err.message === "Only JPG and PNG images are allowed.") {
    return res.status(400).json({ error: err.message });
  }

  console.error("[GLOBAL ERROR]", err);

  res.status(500).json({
    error: "Something went wrong on the server",
  });
});

/** ✅ Start Server */
const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;