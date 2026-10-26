
import { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  UserRound,
  UsersRound,
  Zap,
  RefreshCw,
  Info,
} from "lucide-react";

import PublicDashboard from "./PublicDashboard";
import QRDisplay from "./QRDisplay";
import "./PublicHome.css";
import anbuLogo from "../assets/anbu-aiot-logo.png";

function PublicHome({ onAdminLogin, onEmployeeLogin }) {
  const [showDashboard, setShowDashboard] = useState(true);

  return (
    <div className="public-home">
      {/* Navigation */}
      <header className="public-navbar">
        <a
          className="public-brand"
          href="/"
          aria-label="Anbu IoT home"
        >
          {/* Logo in the top-left navbar */}
          <span className="public-brand-icon">
            <img src={anbuLogo} alt="Anbu IoT Logo" />
          </span>

          <span className="public-brand-copy">
            <strong>Anbu IoT</strong>
            <small>Employee Attendance System</small>
          </span>
        </a>

        <div className="public-nav-actions">
          <button
            type="button"
            className="public-login-btn public-admin-btn"
            onClick={onAdminLogin}
          >
            <ShieldCheck size={19} />
            Admin Login
          </button>

          <button
            type="button"
            className="public-login-btn public-employee-btn"
            onClick={onEmployeeLogin}
          >
            <UserRound size={19} />
            Employee Login
          </button>
        </div>
      </header>

      <main className="public-main">
        {/* Hero section */}
        <section className="public-hero">
          <div className="public-hero-content">
            {/* Main logo above the heading */}
            <div className="hero-logo">
              <img
                src={anbuLogo}
                alt="Anbu IoT Logo"
              />
            </div>

            <span className="public-eyebrow">
              <span className="public-live-dot" />
              SMART ATTENDANCE MANAGEMENT
            </span>

            <h1>
              Attendance made
              <span>simple and secure.</span>
            </h1>

            <p className="public-hero-description">
              Use the latest attendance QR code to check in or check out.
              Fast, simple and secure attendance tracking for your workplace.
            </p>

            <div className="public-hero-features">
              <div className="public-feature">
                <span className="public-feature-icon feature-teal">
                  <ShieldCheck size={29} />
                </span>
                <strong>
                  Secure QR
                  <br />
                  attendance
                </strong>
              </div>

              <div className="public-feature">
                <span className="public-feature-icon feature-blue">
                  <Zap size={29} />
                </span>
                <strong>
                  Quick
                  <br />
                  check-in
                </strong>
              </div>

              <div className="public-feature">
                <span className="public-feature-icon feature-purple">
                  <UsersRound size={29} />
                </span>
                <strong>
                  Easy and
                  <br />
                  reliable
                </strong>
              </div>
            </div>
          </div>

          {/* QR section */}
          <aside className="public-qr-panel">
            <div className="public-qr-panel-heading">
              <span className="public-qr-icon">
                <QrCode size={27} />
              </span>

              <div>
                <h2>Scan to Mark Attendance</h2>
                <p>Use your phone camera to scan the QR code</p>
              </div>
            </div>

            <div className="public-qr-display">
              <QRDisplay />
            </div>
          </aside>
        </section>

        {/* Public dashboard */}
        <section className="public-dashboard-section">
          <div className="public-section-heading">
            <div>
              <span className="public-section-eyebrow">
                LIVE OVERVIEW
              </span>

              <h2>Attendance Dashboard</h2>

              <p>Today's attendance summary at a glance.</p>
            </div>

            <button
              type="button"
              className="public-summary-toggle"
              onClick={() =>
                setShowDashboard((value) => !value)
              }
            >
              <RefreshCw size={19} />
              {showDashboard ? "Hide Summary" : "Show Summary"}
            </button>
          </div>

          {showDashboard && (
            <div className="public-dashboard-content">
              <PublicDashboard />
            </div>
          )}

          <div className="public-privacy-note">
            <Info size={21} />
            <span>
              This page displays summary counts only. Individual employee
              attendance details are private.
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="public-footer">
          <div className="public-footer-brand">
            <span className="public-footer-icon">A</span>
            <strong>Anbu IoT Attendance</strong>
          </div>

          <p>
            Smart attendance. Simple management. Secure access.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default PublicHome;
