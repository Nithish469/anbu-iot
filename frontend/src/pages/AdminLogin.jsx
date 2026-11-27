
import { useState } from "react";
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Users,
  CalendarDays,
  ChartNoAxesColumn,
} from "lucide-react";

import API from "../services/api";
import "./AdminLogin.css";
import anbuLogo from "../assets/anbu-aiot-logo.png";
function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/admin/login", {
        username,
        password,
      });

      sessionStorage.setItem("adminToken", response.data.token);
      sessionStorage.setItem(
        "adminUser",
        JSON.stringify(response.data.admin)
      );

      onLogin();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">

        {/* LEFT BRAND PANEL */}
        <section className="admin-brand-panel">
          <div className="admin-brand-content">

            <div className="admin-logo-wrapper">
             <img
  src={anbuLogo}
  alt="Anbu IoT Logo"
  className="admin-brand-logo"
/>
            </div>

            <h1>ANBU IoT</h1>
            <p className="admin-brand-subtitle">
              Smart Attendance Management
            </p>

            <div className="admin-illustration">
              <div className="admin-illustration-box">
                <CalendarDays size={76} strokeWidth={1.5} />
                <span className="admin-illustration-check">
                  <ShieldCheck size={27} />
                </span>
              </div>
            </div>

            <h2>Track. Manage. Report.</h2>

            <p className="admin-brand-description">
              A smarter way to manage employee attendance,
              monitor work hours and generate reports.
            </p>

            <div className="admin-feature-list">
              <div>
                <span><Users size={25} /></span>
                <small>Employees</small>
              </div>

              <div>
                <span><CalendarDays size={25} /></span>
                <small>Attendance</small>
              </div>

              <div>
                <span><ChartNoAxesColumn size={25} /></span>
                <small>Reports</small>
              </div>
            </div>

            <p className="admin-brand-footer">
              SMARTER ATTENDANCE, BETTER MANAGEMENT
            </p>
          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="admin-form-panel">
          <form className="admin-login-form" onSubmit={handleSubmit}>

            <div className="admin-login-badge">
              <ShieldCheck size={17} />
              <span>Admin Login</span>
            </div>

            <h2>Welcome Back</h2>

            <p className="admin-login-description">
              Sign in to access the Anbu IoT admin portal
            </p>

            <div className="admin-input-group">
              <label>Username</label>

              <div className="admin-input-wrapper">
                <UserRound size={19} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Password</label>

              <div className="admin-input-wrapper">
                <LockKeyhole size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-error-message">
                {error}
              </div>
            )}

            <div className="admin-secure-text">
              <ShieldCheck size={15} />
              <span>Secure Administrator Authentication</span>
            </div>

            <button
              type="submit"
              className="admin-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login to Admin"}
              {!loading && <ArrowRight size={19} />}
            </button>

            <div className="admin-divider">
              <span></span>
              <small>or</small>
              <span></span>
            </div>

            <button
              type="button"
              className="admin-back-button"
              onClick={onBack}
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <p className="admin-copyright">
              © 2026 Anbu IoT. All rights reserved.
            </p>

          </form>
        </section>

      </div>
    </div>
  );
}

export default AdminLogin;
