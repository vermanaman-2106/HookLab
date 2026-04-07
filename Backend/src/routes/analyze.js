const express = require("express");
const multer = require("multer");
const {
  upload,
  analyzeMultipart,
  analyzeJson,
} = require("../controllers/analyzeController");

const router = express.Router();

router.post("/", (req, res, next) => {
  const ct = String(req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("application/json")) {
    return analyzeJson(req, res).catch(next);
  }

  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image must be 5MB or smaller." });
        }
        return res.status(400).json({ error: "Upload failed. Try again." });
      }
      return res.status(400).json({
        error: err.message || "Upload failed. Try again.",
      });
    }
    return analyzeMultipart(req, res).catch(next);
  });
});

module.exports = router;
