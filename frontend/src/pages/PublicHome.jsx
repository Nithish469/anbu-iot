
import { useState } from "react";

import {
  QrCode,
  ShieldCheck,
  UserRound,
  Zap,
  BarChart3,
  Info,
  RefreshCw,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";

import PublicDashboard from "./PublicDashboard";
import QRDisplay from "../pages/QRDisplay";

import "../pages/PublicHome.css";
import anbuLogo from "../assets/anbu-aiot-logo.png";

function PublicHome({ onAdminLogin, onEmployeeLogin }) {
  const [showDashboard, setShowDashboard] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  // Refresh dashboard
  const handleDashboardRefresh = () => {
    if (isRefreshing) return;

    window.dispatchEvent(
      new Event("anbu-public-refresh")
    );
  };

  const handleAdminClick = () => {
    setMobileMenu(false);
    onAdminLogin?.();
  };

  const handleEmployeeClick = () => {
    setMobileMenu(false);
    onEmployeeLogin?.();
  };

  return (
    <div className="public-home">

      {/* NAVBAR */}
      <header className="public-navbar">

        <a className="public-brand" href="/">
          <span className="public-brand-icon">
            <img src={anbuLogo} alt="Anbu IoT Logo" />
          </span>

          <span className="public-brand-copy">
            <strong>Anbu IoT</strong>
            <small>Employee Attendance System</small>
          </span>
        </a>

        <div
          className={`public-nav-actions ${
            mobileMenu ? "open" : ""
          }`}
        >
          <button
            type="button"
            className="public-login-btn public-admin-btn"
            onClick={handleAdminClick}
          >
            <ShieldCheck size={18} />
            Admin Login
          </button>

          <button
            type="button"
            className="public-login-btn public-employee-btn"
            onClick={handleEmployeeClick}
          >
            <UserRound size={18} />
            Employee Login
          </button>
        </div>

        <button
          type="button"
          className="public-mobile-menu"
          onClick={() => setMobileMenu((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

      </header>

      <main className="public-main">

        {/* MAIN TWO-COLUMN LAYOUT */}
        <section className="anbu-main-layout">

          {/* LEFT COLUMN */}
          <div className="anbu-left-column">

            {/* HERO SECTION */}
            <section className="anbu-hero-intro">

              <div className="anbu-hero-text">

                <span className="public-eyebrow">
                  <span className="public-live-dot" />
                  SMART ATTENDANCE MANAGEMENT
                </span>

                <h1>
                  Attendance Made
                  <br />
                  Simple, <span>Secure & Smart.</span>
                </h1>

                <p className="public-hero-description">
                  A QR code-based employee attendance system
                  with real-time tracking, automated reporting
                  and easy management.
                </p>

                {/* FEATURES */}
                <div className="anbu-hero-highlights">

                  <div className="anbu-highlight">
                    <span className="highlight-icon secure">
                      <ShieldCheck size={22} />
                    </span>

                    <div>
                      <strong>Secure & Reliable</strong>
                      <small>OTP / Token Based Access</small>
                    </div>
                  </div>

                  <div className="anbu-highlight">
                    <span className="highlight-icon realtime">
                      <Zap size={22} />
                    </span>

                    <div>
                      <strong>Real-time Tracking</strong>
                      <small>Live attendance updates</small>
                    </div>
                  </div>

                  <div className="anbu-highlight">
                    <span className="highlight-icon reports">
                      <BarChart3 size={22} />
                    </span>

                    <div>
                      <strong>Automated Reports</strong>
                      <small>Download ready reports</small>
                    </div>
                  </div>

                </div>
              </div>

              {/* HERO ILLUSTRATION */}
              <div className="anbu-hero-visual">
                <div className="anbu-visual-circle">

                  <BarChart3 size={90} strokeWidth={1.5} />

                  <span className="anbu-visual-qr">
                    <QrCode size={35} />
                  </span>

                </div>
              </div>

            </section>

            {/* ATTENDANCE DASHBOARD */}
            <section className="anbu-dashboard-card">

              <div className="anbu-dashboard-heading">

                <div>
                  <span className="public-section-eyebrow">
                    LIVE OVERVIEW
                  </span>

                  <h2>Attendance Dashboard</h2>

                  <p>
                    Today's attendance summary at a glance.
                  </p>
                </div>

                <div className="anbu-dashboard-actions">

                  <span className="anbu-dashboard-date">
                    <CalendarDays size={16} />
                    {currentDate}
                  </span>

                  {/* REFRESH BUTTON */}
                  <button
                    type="button"
                    className={`anbu-refresh-btn ${
                      isRefreshing ? "is-refreshing" : ""
                    }`}
                    onClick={handleDashboardRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      size={16}
                      className="anbu-refresh-icon"
                    />

                    <span>
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </span>
                  </button>

                </div>

              </div>

              {showDashboard && (
                <div className="anbu-dashboard-content">
                  <PublicDashboard
                    onLoadingChange={setIsRefreshing}
                  />
                </div>
              )}

              {/* DASHBOARD FOOTER */}
              <div className="anbu-dashboard-footer">

                <div className="public-privacy-note">
                  <Info size={19} />

                  <span>
                    This page displays summary counts only.
                    Individual employee attendance details are private.
                  </span>
                </div>

                <button
                  type="button"
                  className="anbu-dashboard-toggle"
                  onClick={() =>
                    setShowDashboard((value) => !value)
                  }
                >
                  {showDashboard ? "Hide Summary" : "Show Summary"}
                </button>

              </div>

            </section>

          </div>

          {/* RIGHT COLUMN - QR CODE */}
          <aside className="anbu-qr-card">

            <div className="anbu-qr-heading">

              <span className="public-qr-icon">
                <QrCode size={26} />
              </span>

              <div>
                <h2>Scan to Mark Attendance</h2>

                <p>
                  Use your phone camera to scan the QR code
                </p>
              </div>

            </div>

            <div className="anbu-qr-content">
              <QRDisplay />
            </div>

          </aside>

        </section>

        {/* FOOTER */}
        <footer className="public-footer">

          <div className="public-footer-brand">

            <span className="public-footer-icon">
              <img src={anbuLogo} alt="Anbu IoT" />
            </span>

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
