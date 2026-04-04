const express = require("express");
const { pinterestInspiration } = require("../controllers/pinterestController");

const router = express.Router();

router.post("/", pinterestInspiration);

module.exports = router;
