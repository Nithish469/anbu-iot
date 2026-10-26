const crypto = require("crypto");
const QRCode = require("qrcode");

const prisma = require("../config/database");

const QR_VALIDITY_SECONDS = 90;

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

    // Save QR session
    const qrSession = await prisma.qrSession.create({
      data: {
        token,
        createdAt,
        expiresAt,
        isActive: true,
      },
    });

    // ========================================
    // URL STORED INSIDE QR
    // ========================================

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "FRONTEND_URL is not configured",
      });
    }

    const qrData =
      `${frontendUrl}/check-in` +
      `?sessionId=${encodeURIComponent(qrSession.id)}` +
      `&token=${encodeURIComponent(qrSession.token)}`;

    // Generate QR image
    const qrCode = await QRCode.toDataURL(qrData);

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      message: "QR generated successfully",
      qrCode,
      sessionId: qrSession.id,
      token: qrSession.token, // Temporary: useful for Postman testing
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
    if (!sessionId || !token) {
      return res.status(400).json({
        valid: false,
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
        message: "Invalid QR code",
      });
    }

    // Check token
    if (qrSession.token !== token) {
      return res.status(401).json({
        valid: false,
        message: "Invalid QR token",
      });
    }

    // Check active status
    if (!qrSession.isActive) {
      return res.status(400).json({
        valid: false,
        message: "QR code has expired",
      });
    }

    // Check expiration
    const now = new Date();

    if (now >= qrSession.expiresAt) {
      // Deactivate expired session
      await prisma.qrSession.update({
        where: {
          id: qrSession.id,
        },
        data: {
          isActive: false,
        },
      });

      return res.status(400).json({
        valid: false,
        message: "QR code has expired",
      });
    }

    // QR is valid
    const remainingSeconds = Math.ceil(
      (qrSession.expiresAt.getTime() - now.getTime()) / 1000
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