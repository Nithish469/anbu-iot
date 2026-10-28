import { useEffect, useState, useCallback, useRef } from "react";
import { RefreshCw, Clock, ShieldCheck } from "lucide-react";
import API from "../services/api";

const QR_VALIDITY_SECONDS = 120;

function QRDisplay() {
  const [qrCode, setQrCode] = useState("");
  const [seconds, setSeconds] = useState(QR_VALIDITY_SECONDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const targetTimeRef = useRef(null);

  const generateQR = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/qr/generate");
      const validFor = response.data?.validFor || QR_VALIDITY_SECONDS;

      setQrCode(response.data.qrCode);
      setSeconds(validFor);
      targetTimeRef.current = Date.now() + validFor * 1000;
    } catch (err) {
      console.error("QR generation error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to generate QR. Retrying..."
      );
      setQrCode("");
      targetTimeRef.current = null;
      setSeconds(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Countdown timer and auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      if (!targetTimeRef.current) return;

      const remaining = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000));
      setSeconds(remaining);

      if (remaining <= 0) {
        targetTimeRef.current = null;
        generateQR();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [generateQR]);

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
              This QR code expires after 120 seconds and refreshes
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
