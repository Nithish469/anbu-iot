
const crypto = require("crypto");
const QRCode = require("qrcode");

const prisma = require("../config/database");

const QR_VALIDITY_SECONDS = 120;

// Build a QR response from an existing session.
const buildQrResponse = async (res, qrSession, status = 200) => {
  const frontendUrl = process.env.FRONTEND_URL;

  const baseUrl = frontendUrl.replace(/\/+$/, "");
  const qrData =
    `${baseUrl}/check-in` +
    `?sessionId=${encodeURIComponent(qrSession.id)}` +
    `&token=${encodeURIComponent(qrSession.token)}`;

  const qrCode = await QRCode.toDataURL(qrData);

  const remainingSeconds = Math.max(
    0,
    Math.ceil(
      (new Date(qrSession.expiresAt).getTime() - Date.now()) / 1000
    )
  );

  return res.status(status).json({
    message: "QR generated successfully",
    qrCode,
    sessionId: qrSession.id,
    expiresAt: qrSession.expiresAt,
    validFor: remainingSeconds,
  });
};

// Generate or reuse the current valid QR.
const generateQr = async (req, res) => {
  try {
    console.log("[QR DEBUG] generateQr called:", new Date().toISOString());

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "FRONTEND_URL is not configured",
      });
    }

    const now = new Date();

    // Deactivate only sessions that have actually expired.
    await prisma.qrSession.updateMany({
      where: {
        isActive: true,
        expiresAt: { lte: now },
      },
      data: { isActive: false },
    });

    // Reuse an existing unexpired QR instead of invalidating it.
    const existingSession = await prisma.qrSession.findFirst({
      where: {
        isActive: true,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingSession) {
      console.log("[QR DEBUG] Reusing active session:", {
        sessionId: existingSession.id,
        expiresAt: existingSession.expiresAt,
        serverTime: new Date().toISOString(),
      });

      return await buildQrResponse(res, existingSession, 200);
    }

    // Create a new QR only when no valid active session exists.
    const token = crypto.randomBytes(32).toString("hex");
    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + QR_VALIDITY_SECONDS * 1000
    );

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

    return await buildQrResponse(res, qrSession, 201);
  } catch (error) {
    console.error("[QR DEBUG] QR generation error:", error);

    return res.status(500).json({
      message: "Failed to generate QR",
      error: error.message,
    });
  }
};

// Verify a QR session and token.
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
      console.warn("[QR DEBUG] Token mismatch:", sessionId);

      return res.status(401).json({
        valid: false,
        code: "TOKEN_MISMATCH",
        message: "Invalid QR token",
      });
    }

    const now = new Date();
    const expiresAt = new Date(qrSession.expiresAt);

    console.log("[QR DEBUG] Verification status:", {
      sessionId: qrSession.id,
      isActive: qrSession.isActive,
      createdAt: qrSession.createdAt,
      expiresAt: qrSession.expiresAt,
      serverNow: now.toISOString(),
      remainingSeconds: Math.ceil(
        (expiresAt.getTime() - now.getTime()) / 1000
      ),
    });

    // Check expiry explicitly.
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

      return res.status(400).json({
        valid: false,
        code: "QR_EXPIRED",
        message: "QR code has expired. Please scan a new QR code.",
      });
    }

    if (!qrSession.isActive) {
      console.warn("[QR DEBUG] Session inactive:", sessionId);

      return res.status(400).json({
        valid: false,
        code: "SESSION_INACTIVE",
        message: "QR code is inactive or has expired",
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

module.exports = {
  generateQr,
  verifyQr,
};
