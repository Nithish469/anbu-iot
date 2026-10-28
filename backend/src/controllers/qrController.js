
const crypto = require("crypto");
const QRCode = require("qrcode");

const prisma = require("../config/database");

// QR validity: 120 seconds
const QR_VALIDITY_SECONDS = 120;

// ========================================
// GENERATE ROTATING QR
// ========================================

const generateQr = async (req, res) => {
  try {
    console.log(
      "[QR DEBUG] generateQr called:",
      new Date().toISOString()
    );

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "FRONTEND_URL is not configured",
      });
    }

    // Log how many active sessions exist before deactivation
    const activeBefore = await prisma.qrSession.count({
      where: { isActive: true },
    });

    console.log(
      "[QR DEBUG] Active sessions before generation:",
      activeBefore
    );

    // Deactivate previous QR sessions
    await prisma.qrSession.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + QR_VALIDITY_SECONDS * 1000
    );

    // Save QR session
    const qrSession = await prisma.qrSession.create({
      data: {
        token,
        createdAt,
        expiresAt,
        isActive: true,
      },
    });

    console.log("[QR DEBUG] New session created:", {
      sessionId: qrSession.id,
      createdAt: qrSession.createdAt,
      expiresAt: qrSession.expiresAt,
      isActive: qrSession.isActive,
      validForSeconds: QR_VALIDITY_SECONDS,
      serverTime: new Date().toISOString(),
    });

    // Build QR URL
    const baseUrl = frontendUrl.replace(/\/+$/, "");
    const qrData =
      `${baseUrl}/check-in` +
      `?sessionId=${encodeURIComponent(qrSession.id)}` +
      `&token=${encodeURIComponent(qrSession.token)}`;

    const qrCode = await QRCode.toDataURL(qrData);

    return res.status(201).json({
      message: "QR generated successfully",
      qrCode,
      sessionId: qrSession.id,
      expiresAt: qrSession.expiresAt,
      validFor: QR_VALIDITY_SECONDS,
    });
  } catch (error) {
    console.error("[QR DEBUG] QR generation error:", error);

    return res.status(500).json({
      message: "Failed to generate QR",
      error: error.message,
    });
  }
};

// ========================================
// VERIFY QR
// ========================================

const verifyQr = async (req, res) => {
  try {
    const { sessionId, token } = req.body;

    if (
      typeof sessionId !== "string" ||
      typeof token !== "string" ||
      !sessionId.trim() ||
      !token.trim()
    ) {
      return res.status(400).json({
        valid: false,
        code: "MISSING_QR_DATA",
        message: "QR session information is required",
      });
    }

    const qrSession = await prisma.qrSession.findUnique({
      where: { id: sessionId },
    });

    if (!qrSession) {
      console.warn("[QR DEBUG] Session not found:", sessionId);

      return res.status(404).json({
        valid: false,
        code: "SESSION_NOT_FOUND",
        message: "Invalid QR code: session not found",
      });
    }

    if (qrSession.token !== token) {
      console.warn("[QR DEBUG] Token mismatch for session:", sessionId);

      return res.status(401).json({
        valid: false,
        code: "TOKEN_MISMATCH",
        message: "Invalid QR token",
      });
    }

    const now = new Date();
    const expiresAt = new Date(qrSession.expiresAt);

    // Log session state without exposing the secret token
    console.log("[QR DEBUG] Verification status:", {
      sessionId: qrSession.id,
      isActive: qrSession.isActive,
      createdAt: qrSession.createdAt,
      expiresAt: qrSession.expiresAt,
      serverNow: now.toISOString(),
      ageSeconds: Math.floor(
        (now.getTime() - new Date(qrSession.createdAt).getTime()) / 1000
      ),
      remainingSeconds: Math.ceil(
        (expiresAt.getTime() - now.getTime()) / 1000
      ),
    });

    if (!qrSession.isActive) {
      console.warn("[QR DEBUG] Session is inactive:", sessionId);

      return res.status(400).json({
        valid: false,
        code: "SESSION_INACTIVE",
        message: "QR code is inactive or has expired",
      });
    }

    if (
      Number.isNaN(expiresAt.getTime()) ||
      now.getTime() >= expiresAt.getTime()
    ) {
      await prisma.qrSession.updateMany({
        where: {
          id: qrSession.id,
          isActive: true,
        },
        data: { isActive: false },
      });

      console.warn("[QR DEBUG] Session expired:", sessionId);

      return res.status(400).json({
        valid: false,
        code: "QR_EXPIRED",
        message: "QR code has expired. Please scan a new QR code.",
      });
    }

    const remainingSeconds = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / 1000
    );

    return res.status(200).json({
      valid: true,
      message: "QR verified successfully",
      sessionId: qrSession.id,
      expiresAt: qrSession.expiresAt,
      remainingSeconds,
    });
  } catch (error) {
    console.error("[QR DEBUG] QR verification error:", error);

    return res.status(500).json({
      valid: false,
      code: "VERIFICATION_ERROR",
      message: "Failed to verify QR",
      error: error.message,
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  generateQr,
  verifyQr,
};
