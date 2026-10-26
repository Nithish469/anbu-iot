
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Clock, ShieldCheck } from "lucide-react";
import API from "../services/api";

const QR_VALIDITY_SECONDS = 90;

function QRDisplay() {
  const [qrCode, setQrCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generateQR = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/qr/generate");

      setQrCode(response.data.qrCode);
      setExpiresAt(response.data.expiresAt);
      setSeconds(response.data.validFor || QR_VALIDITY_SECONDS);
    } catch (err) {
      console.error("QR generation error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to generate QR. Retrying..."
      );
      setQrCode("");
      setExpiresAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate the first QR and refresh automatically.
  useEffect(() => {
    let cancelled = false;
    let refreshTimer;

    const run = async () => {
      await generateQR();

      if (!cancelled) {
        refreshTimer = setTimeout(
          run,
          QR_VALIDITY_SECONDS * 1000
        );
      }
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(refreshTimer);
    };
  }, [generateQR]);

  // Update countdown once per second.
  useEffect(() => {
    const timer = setInterval(() => {
      if (!expiresAt) return;

      const remaining = Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) / 1000
      );

      setSeconds(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="qr-display-page">
      <div className="qr-display-card">
        <div className="qr-display-header">
          <div className="qr-logo">A</div>
          <div>
            <h1>Anbu IoT</h1>
            <p>Attendance System</p>
          </div>
        </div>

        <div className="qr-title">
          <h2>Scan to Mark Attendance</h2>
          <p>
            Scan this QR code with your phone to check in or check out.
          </p>
        </div>

        <div className="qr-container">
          {loading ? (
            <div className="qr-loading">
              <RefreshCw size={35} className="spin" />
              <p>Generating QR...</p>
            </div>
          ) : error ? (
            <div className="qr-error">
              <p>{error}</p>
              <button onClick={generateQR}>
                Retry Now
              </button>
            </div>
          ) : (
            <img
              src={qrCode}
              alt="Attendance QR Code"
              className="qr-image"
            />
          )}
        </div>

        {!loading && !error && (
          <div className="qr-timer">
            <Clock size={18} />
            <span>QR refreshes in</span>
            <strong>{seconds}s</strong>
          </div>
        )}

        <div className="qr-security">
          <ShieldCheck size={18} />
          <div>
            <strong>Secure Attendance</strong>
            <span>
              This QR code expires after 90 seconds and refreshes
              automatically.
            </span>
          </div>
        </div>

        <p className="qr-footer">
          Anbu IoT Attendance System
        </p>
      </div>
    </div>
  );
}

export default QRDisplay;