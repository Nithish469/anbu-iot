
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
  const generatingRef = useRef(false);
  const mountedRef = useRef(false);

  const generateQR = useCallback(async () => {
    // Prevent overlapping requests in this component instance.
    if (generatingRef.current) return;

    generatingRef.current = true;

    try {
      setLoading(true);
      setError("");

      console.log("[QR DEBUG] Requesting a new QR");

      const response = await API.get("/qr/generate");

      if (!response.data?.qrCode) {
        throw new Error("QR code was not returned by the server.");
      }

      const validFor =
        Number(response.data?.validFor) || QR_VALIDITY_SECONDS;

      setQrCode(response.data.qrCode);
      setSeconds(validFor);

      targetTimeRef.current = Date.now() + validFor * 1000;

      console.log("[QR DEBUG] QR received", {
        validFor,
        receivedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("QR generation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate QR. Please retry."
      );

      setQrCode("");
      targetTimeRef.current = null;
      setSeconds(0);
    } finally {
      generatingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Generate the initial QR.
  useEffect(() => {
    mountedRef.current = true;

    generateQR();

    return () => {
      mountedRef.current = false;
    };
  }, [generateQR]);

  // Countdown and refresh only when the current QR reaches expiry.
  useEffect(() => {
    const timer = setInterval(() => {
      const targetTime = targetTimeRef.current;

      if (!targetTime || generatingRef.current) return;

      const remaining = Math.max(
        0,
        Math.ceil((targetTime - Date.now()) / 1000)
      );

      setSeconds(remaining);

      if (remaining === 0) {
        targetTimeRef.current = null;
        generateQR();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [generateQR]);

  const handleRetry = () => {
    targetTimeRef.current = null;
    generateQR();
  };

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
              <button onClick={handleRetry} disabled={loading}>
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
