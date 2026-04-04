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

/** ✅ CORS — comma-separated origins (local + Vercel). Set CORS_ORIGIN in production. */
const defaultOrigins = "http://localhost:3000";
const corsOrigins = (process.env.CORS_ORIGIN || defaultOrigins)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = {
  origin:
    corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/** ✅ Body Parser */
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