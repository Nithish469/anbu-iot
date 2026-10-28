
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
    // Deactivate previous QR sessions
    await prisma.qrSession.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    const createdAt = new Date();

    const expiresAt = new Date(
      createdAt.getTime() + QR_VALIDITY_SECONDS * 1000
    );

    // Check frontend URL configuration
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "FRONTEND_URL is not configured",
      });
    }

    // Save QR session in database
    const qrSession = await prisma.qrSession.create({
      data: {
        token,
        createdAt,
        expiresAt,
        isActive: true,
      },
    });

    // URL stored inside QR
    const baseUrl = frontendUrl.replace(/\/+$/, "");

    const qrData =
      `${baseUrl}/check-in` +
      `?sessionId=${encodeURIComponent(qrSession.id)}` +
      `&token=${encodeURIComponent(qrSession.token)}`;

    // Generate QR image
    const qrCode = await QRCode.toDataURL(qrData);

    return res.status(201).json({
      message: "QR generated successfully",
      qrCode,
      sessionId: qrSession.id,
      expiresAt: qrSession.expiresAt,
      validFor: QR_VALIDITY_SECONDS,
    });
  } catch (error) {
    console.error("QR generation error:", error);

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

    // Check required data
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

    // Find QR session
    const qrSession = await prisma.qrSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    // Session doesn't exist
    if (!qrSession) {
      return res.status(404).json({
        valid: false,
        code: "SESSION_NOT_FOUND",
        message: "Invalid QR code: session not found",
      });
    }

    // Check token
    if (qrSession.token !== token) {
      return res.status(401).json({
        valid: false,
        code: "TOKEN_MISMATCH",
        message: "Invalid QR token",
      });
    }

    // Check active status
    if (!qrSession.isActive) {
      return res.status(400).json({
        valid: false,
        code: "SESSION_INACTIVE",
        message: "QR code is inactive or has expired",
      });
    }

    // Check expiration using server/database session timestamp
    const now = new Date();
    const expiresAt = new Date(qrSession.expiresAt);

    if (
      Number.isNaN(expiresAt.getTime()) ||
      now.getTime() >= expiresAt.getTime()
    ) {
      // Deactivate expired session
      await prisma.qrSession.updateMany({
        where: {
          id: qrSession.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return res.status(400).json({
        valid: false,
        code: "QR_EXPIRED",
        message: "QR code has expired. Please scan a new QR code.",
      });
    }

    // QR is valid
    const remainingSeconds = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)
    );

    return res.status(200).json({
      valid: true,
      message: "QR verified successfully",
      sessionId: qrSession.id,
      expiresAt: qrSession.expiresAt,
      remainingSeconds,
    });
  } catch (error) {
    console.error("QR verification error:", error);

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
