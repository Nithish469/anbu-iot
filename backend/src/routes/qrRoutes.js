const express = require("express");

const {
  generateQr,
  verifyQr,
} = require("../controllers/qrController");

const router = express.Router();

// Generate rotating QR
router.get("/generate", generateQr);

// Verify scanned QR
router.post("/verify", verifyQr);

module.exports = router;