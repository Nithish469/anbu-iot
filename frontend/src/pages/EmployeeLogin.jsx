
import { useState } from "react";
import {
  UserRound,
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Fingerprint,
  CalendarCheck,
  Clock3,
  ClipboardCheck,
  CircleCheck,
} from "lucide-react";
import API from "../services/api";
import logo from "../assets/anbu-aiot-logo.png";
import "./EmployeeLogin.css";

function EmployeeLogin({ onLogin, onBack }) {
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!employeeId.trim() || !/^\d{4}$/.test(pin)) {
      setError("Please enter your Employee ID and 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/employees/login", {
        employeeId: employeeId.trim(),
        pin,
      });

      sessionStorage.setItem("employeeToken", response.data.token);
      sessionStorage.setItem(
        "employeeUser",
        JSON.stringify(response.data.employee)
      );

      onLogin(response.data.employee);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-page">
      <div className="employee-login-card">

        {/* LEFT BRANDING PANEL */}
        <section className="employee-brand-panel">

          <div className="employee-brand-top">
            <div className="employee-logo-box">
              <img src={logo} alt="Anbu IoT Logo" />
            </div>

            <h1>Anbu IoT</h1>
            <p>Employee Attendance Portal</p>
          </div>

          <div className="employee-illustration">
            <ShieldCheck className="illustration-shield" />
            <Fingerprint className="illustration-fingerprint" />

            <div className="employee-avatar-box">
              <UserRound size={76} strokeWidth={1.5} />
            </div>

            <div className="illustration-check">
              <CircleCheck size={27} />
            </div>
          </div>

          <div className="employee-brand-message">
            <h2>Your Workday. Your Records.</h2>
            <p>
              Access your attendance records, track working hours
              and manage your daily attendance easily.
            </p>
          </div>

          <div className="employee-benefits">
            <div className="employee-benefit">
              <div className="benefit-icon">
                <CalendarCheck size={23} />
              </div>
              <span>Attendance</span>
            </div>

            <div className="employee-benefit">
              <div className="benefit-icon">
                <Clock3 size={23} />
              </div>
              <span>Working Hours</span>
            </div>

            <div className="employee-benefit">
              <div className="benefit-icon">
                <ClipboardCheck size={23} />
              </div>
              <span>My Records</span>
            </div>
          </div>

          <div className="employee-brand-footer">
            SMARTER ATTENDANCE, BETTER MANAGEMENT
          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="employee-form-panel">

          <div className="employee-portal-badge">
            <UserRound size={16} />
            Employee Portal
          </div>

          <div className="employee-form-heading">
            <h2>Welcome Back</h2>
            <p>Sign in to view your attendance details</p>
          </div>

          <form onSubmit={handleSubmit} className="employee-form">

            <div className="employee-field">
              <label>Employee ID</label>

              <div className="employee-input-wrapper">
                <UserRound size={17} />

                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Example: AIOT2605"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="employee-field">
              <label>4-digit PIN</label>

              <div className="employee-input-wrapper">
                <ShieldCheck size={17} />

                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="Enter your 4-digit PIN"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="employee-eye-button"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="employee-security-note">
              <ShieldCheck size={15} />
              <span>Your attendance information is securely protected</span>
            </div>

            {error && (
              <div className="employee-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="employee-login-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Employee Portal"}
              {!loading && <LogIn size={18} />}
            </button>

           <button
  type="button"
  onClick={() => {}}
  className="employee-back-home"
>
  <ArrowLeft size={16} />
  Back to Home
</button>
          </form>

          <div className="employee-copyright">
            © {new Date().getFullYear()} Anbu IoT. All rights reserved.
          </div>

        </section>
      </div>
    </div>
  );
}

export default EmployeeLogin;
