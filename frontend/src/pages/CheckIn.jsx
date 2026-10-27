
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  "https://anbu-iot.onrender.com/api";

function CheckIn() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId");
  const token = params.get("token");

  const [qrLoading, setQrLoading] = useState(true);
  const [qrValid, setQrValid] = useState(false);
  const [qrMessage, setQrMessage] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify QR
  useEffect(() => {
    let cancelled = false;

    const verifyQR = async () => {
      try {
        if (!sessionId || !token) {
          setQrMessage("QR link is missing session information.");
          return;
        }

        const response = await axios.post(
          `${API_URL}/qr/verify`,
          { sessionId, token },
          { timeout: 15000 }
        );

        if (cancelled) return;

        if (response.data?.valid) {
          setQrValid(true);
          setQrMessage("QR verified successfully");
        } else {
          setQrValid(false);
          setQrMessage(
            response.data?.message || "QR code is invalid or expired"
          );
        }
      } catch (error) {
        if (cancelled) return;

        console.error("QR verification URL:", `${API_URL}/qr/verify`);
        console.error("QR verification status:", error.response?.status);
        console.error("QR verification response:", error.response?.data);

        setQrValid(false);
        setQrMessage(
          error.response?.data?.message ||
            (error.response?.status === 404
              ? "QR verification endpoint not found. Check backend routes."
              : error.message === "Network Error"
                ? "Cannot connect to the attendance server. Check the backend tunnel."
                : error.message || "QR code is invalid or expired")
        );
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    };

    verifyQR();

    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  // Check-in / Check-out
  const markAttendance = async (type) => {
    if (!employeeId.trim() || !pin.trim()) {
      setSuccess(false);
      setMessage("Please enter Employee ID and PIN");
      return;
    }

    if (!sessionId || !token) {
      setSuccess(false);
      setMessage("QR session information is missing. Scan the latest QR.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const endpoint =
        type === "check-in"
          ? "/attendance/check-in"
          : "/attendance/check-out";

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        {
          employeeId: employeeId.trim(),
          pin,
          sessionId,
          token,
        },
        { timeout: 15000 }
      );

      setSuccess(true);
      setMessage(
        response.data?.message || "Attendance recorded successfully"
      );
      setPin("");
    } catch (error) {
      console.error("Attendance URL:", `${API_URL}/attendance/${type}`);
      console.error("Attendance status:", error.response?.status);
      console.error("Attendance response:", error.response?.data);

      setSuccess(false);
      setMessage(
        error.response?.data?.message ||
          (error.response?.status === 404
            ? "Attendance endpoint not found. Check backend routes."
            : error.message === "Network Error"
              ? "Cannot connect to the attendance server."
              : error.message || "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (qrLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>A</div>
          <h1>Anbu IoT</h1>
          <h2>Employee Attendance</h2>
          <div style={styles.loadingBox}>
            <div style={styles.spinner}></div>
            <p>Verifying QR code...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid QR
  if (!qrValid) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>A</div>
          <h1>Anbu IoT</h1>
          <h2>Employee Attendance</h2>

          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>✕</div>
            <h3>QR Code Invalid</h3>
            <p>{qrMessage}</p>
          </div>

          <p style={styles.helpText}>
            Please scan the latest QR code displayed at the office.
          </p>
        </div>
      </div>
    );
  }

  // Valid QR: Attendance form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>A</div>
        <h1>Anbu IoT</h1>
        <h2>Employee Attendance</h2>

        <div style={styles.successBox}>
          <span style={styles.checkIcon}>✓</span>
          <span>QR Verified</span>
        </div>

        <p style={styles.subtitle}>Enter your Employee ID and PIN</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Employee ID</label>
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
            style={styles.input}
            autoCapitalize="characters"
            autoComplete="username"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>PIN</label>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
            inputMode="numeric"
            maxLength={6}
            autoComplete="current-password"
          />
        </div>

        <button
          onClick={() => markAttendance("check-in")}
          disabled={loading}
          style={{
            ...styles.checkInButton,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Please wait..." : "✓ Check In"}
        </button>

        <button
          onClick={() => markAttendance("check-out")}
          disabled={loading}
          style={{
            ...styles.checkOutButton,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Please wait..." : "↪ Check Out"}
        </button>

        {message && (
          <div
            style={success ? styles.resultSuccess : styles.resultError}
            role="status"
          >
            <strong>{success ? "✓ " : "✕ "}</strong>
            {message}
          </div>
        )}

        <p style={styles.footer}>Anbu IoT Attendance System</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow: "0 10px 35px rgba(0,0,0,0.10)",
    boxSizing: "border-box",
  },
  logo: {
    width: "48px",
    height: "48px",
    margin: "0 auto 10px",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  successBox: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "#e8f7ee",
    color: "#16803c",
    fontWeight: "bold",
    fontSize: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },
  checkIcon: {
    fontSize: "22px",
  },
  errorBox: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "12px",
    background: "#fdecec",
    color: "#c62828",
  },
  errorIcon: {
    fontSize: "28px",
    fontWeight: "bold",
  },
  loadingBox: {
    marginTop: "30px",
    padding: "20px",
  },
  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #ddd",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 1s linear infinite",
  },
  subtitle: {
    color: "#666",
    marginTop: "15px",
    marginBottom: "25px",
  },
  inputGroup: {
    textAlign: "left",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #d5d5d5",
    borderRadius: "10px",
    fontSize: "16px",
    outline: "none",
  },
  checkInButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
  },
  checkOutButton: {
    width: "100%",
    padding: "15px",
    border: "1px solid #d5d5d5",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#111827",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  resultSuccess: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    background: "#e8f7ee",
    color: "#16803c",
    fontWeight: "bold",
  },
  resultError: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    background: "#fdecec",
    color: "#c62828",
    fontWeight: "bold",
  },
  helpText: {
    marginTop: "20px",
    color: "#777",
    fontSize: "14px",
  },
  footer: {
    marginTop: "25px",
    color: "#999",
    fontSize: "12px",
  },
};

export default CheckIn;
