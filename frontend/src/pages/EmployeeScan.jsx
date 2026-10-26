import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

import API from "../services/api";

function EmployeeScan() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [qrVerified, setQrVerified] = useState(false);
  const [qrSession, setQrSession] = useState(null);

  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode("employee-qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          await handleQrScanned(decodedText);
        },
        () => {}
      );
    } catch (error) {
      console.error("Camera error:", error);

      setMessage(
        "Unable to access camera. Please allow camera permission.",
      );
      setMessageType("error");
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();

        if (state === 2) {
          await scannerRef.current.stop();
        }

        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (error) {
      console.error("Scanner stop error:", error);
    }
  };

  const handleQrScanned = async (decodedText) => {
    if (!scanning) return;

    setScanning(false);

    try {
      const qrData = JSON.parse(decodedText);

      if (
        qrData.type !==
        "ANBU_IOT_ATTENDANCE"
      ) {
        throw new Error("Invalid attendance QR");
      }

      const response = await API.post(
        "/qr/verify",
        {
          sessionId: qrData.sessionId,
          token: qrData.token,
        }
      );

      if (!response.data.valid) {
        throw new Error(
          response.data.message ||
            "QR verification failed"
        );
      }

      setQrSession(response.data);
      setQrVerified(true);

      await stopScanner();

      setMessage(
        "QR verified successfully. Enter your Employee ID and PIN."
      );
      setMessageType("success");
    } catch (error) {
      console.error("QR scan error:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Invalid or expired QR code"
      );

      setMessageType("error");

      setTimeout(() => {
        setScanning(true);
        startScanner();
      }, 2000);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!employeeId.trim()) {
      setMessage("Please enter your Employee ID.");
      setMessageType("error");
      return;
    }

    if (pin.length !== 4) {
      setMessage("PIN must be 4 digits.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setMessageType("");

    /*
      Employee verification and check-in/check-out
      will be connected in the next step.
    */

    setMessage(
      "QR verified. Employee verification is ready for the next step."
    );

    setMessageType("success");
  };

  const scanAgain = async () => {
    setQrVerified(false);
    setQrSession(null);
    setEmployeeId("");
    setPin("");
    setMessage("");
    setMessageType("");
    setScanning(true);

    await startScanner();
  };

  return (
    <div className="employee-scan-page">
      <div className="employee-scan-card">
        <div className="employee-scan-logo">
          <QrCode size={25} />
        </div>

        <h1>Scan Attendance QR</h1>

        <p className="employee-scan-description">
          Scan the rotating QR code displayed by
          Anbu IoT to mark your attendance.
        </p>

        {!qrVerified ? (
          <>
            <div
              id="employee-qr-reader"
              className="employee-qr-reader"
            />

            <div className="scan-status">
              <QrCode size={18} />

              <span>
                Scan the current attendance QR
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="qr-verified-box">
              <CheckCircle size={25} />

              <div>
                <strong>QR Verified</strong>

                <span>
                  Attendance QR is valid
                </span>
              </div>
            </div>

            <form
              className="employee-verification-form"
              onSubmit={handleContinue}
            >
              <label>Employee ID</label>

              <input
                type="text"
                placeholder="Example: AIOT2608"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(
                    e.target.value.toUpperCase()
                  )
                }
              />

              <label>4-Digit PIN</label>

              <input
                type="password"
                placeholder="Enter your PIN"
                maxLength="4"
                inputMode="numeric"
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />

              <button
                type="submit"
                className="continue-attendance-btn"
              >
                Continue
              </button>
            </form>

            {qrSession?.remainingSeconds != null && (
              <p className="qr-session-time">
                QR session valid for{" "}
                {qrSession.remainingSeconds}s
              </p>
            )}

            <button
              className="scan-again-btn"
              onClick={scanAgain}
            >
              Scan Another QR
            </button>
          </>
        )}

        {message && (
          <div
            className={`employee-scan-message ${messageType}`}
          >
            {messageType === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>{message}</span>
          </div>
        )}

        <p className="employee-scan-footer">
          Anbu IoT Attendance System
        </p>
      </div>
    </div>
  );
}

export default EmployeeScan;