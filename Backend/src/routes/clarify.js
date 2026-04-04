const express = require("express");
const clarifyController = require("../controllers/clarifyController");

const router = express.Router();

router.post("/", clarifyController.clarify);

module.exports = router;
