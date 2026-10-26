
import { useEffect, useState } from "react";
import {
  CalendarDays,
  LogOut,
  RefreshCw,
  Clock3,
  UserCheck,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import "./MyAttendance.css";

function MyAttendance({ employee, onLogout }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/employees/me/attendance");
      setRecords(response.data.attendance || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getMinutes = (record) => {
    if (record.totalMinutes != null) {
      return Math.max(0, record.totalMinutes);
    }

    if (record.entryTime && record.exitTime) {
      return Math.max(
        0,
        Math.floor(
          (new Date(record.exitTime) -
            new Date(record.entryTime)) /
            60000
        )
      );
    }

    return 0;
  };

  const formatMinutes = (minutes) =>
    `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  const isThisMonth = (record) => {
    if (!record.attendanceDate) return false;

    const date = new Date(record.attendanceDate);
    const now = new Date();

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  };

  const monthRecords = records.filter(isThisMonth);

  const presentCount = monthRecords.filter(
    (record) => record.entryTime
  ).length;

  const totalMinutes = monthRecords.reduce(
    (sum, record) => sum + getMinutes(record),
    0
  );

  const status = employee?.status || "ACTIVE";
  const employeeName = employee?.name || "Employee";
  const employeeId = employee?.employeeId || "";

  return (
    <main className="my-attendance">
      <header className="ma-header">
        <div className="ma-heading">
          <span className="ma-eyebrow">EMPLOYEE PORTAL</span>
          <h1>My Attendance</h1>

          <div className="ma-identity">
            <span className="ma-avatar">
              {employeeName.charAt(0).toUpperCase()}
            </span>

            <div>
              <p className="ma-employee-name">{employeeName}</p>
              <span className="ma-employee-id">
                Employee ID: {employeeId || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="ma-actions">
          <button
            type="button"
            className="ma-button ma-refresh"
            onClick={loadAttendance}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "ma-spin" : ""}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="ma-button ma-logout"
            onClick={onLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <section className="ma-summary-grid">
        <article className="ma-summary-card ma-present-card">
          <div className="ma-card-top">
            <div className="ma-icon ma-icon-teal">
              <UserCheck size={23} />
            </div>
            <span className="ma-card-caption">THIS MONTH</span>
          </div>

          <p className="ma-summary-label">Days Present</p>
          <h2 className="ma-summary-value">
            {loading ? "—" : presentCount}
          </h2>
          <p className="ma-summary-note">
            Attendance days recorded
          </p>
        </article>

        <article className="ma-summary-card ma-hours-card">
          <div className="ma-card-top">
            <div className="ma-icon ma-icon-blue">
              <Clock3 size={23} />
            </div>
            <span className="ma-card-caption">THIS MONTH</span>
          </div>

          <p className="ma-summary-label">Total Working Hours</p>
          <h2 className="ma-summary-value">
            {loading ? "—" : formatMinutes(totalMinutes)}
          </h2>
          <p className="ma-summary-note">
            Based on recorded attendance
          </p>
        </article>

        <article className="ma-summary-card ma-status-card">
          <div className="ma-card-top">
            <div className="ma-icon ma-icon-purple">
              <User size={23} />
            </div>
            <span className="ma-card-caption">PROFILE</span>
          </div>

          <p className="ma-summary-label">Employee Status</p>

          <div className="ma-status-line">
            <span className="ma-status-dot" />
            <h2 className="ma-status-value">{status}</h2>
          </div>

          <p className="ma-summary-note">
            Current employment status
          </p>
        </article>
      </section>

      <section className="ma-history-card">
        <div className="ma-history-header">
          <div className="ma-history-title">
            <div className="ma-history-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <h2>Attendance History</h2>
              <p>Review your check-in and check-out records</p>
            </div>
          </div>

          <span className="ma-record-count">
            {records.length} records
          </span>
        </div>

        {loading && (
          <div className="ma-message">
            <RefreshCw size={19} className="ma-spin" />
            <span>Loading attendance records...</span>
          </div>
        )}

        {!loading && error && (
          <div className="ma-error">
            <AlertCircle size={20} />
            <div>
              <strong>Unable to load attendance</strong>
              <p>{error}</p>
              <button
                type="button"
                className="ma-retry-button"
                onClick={loadAttendance}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="ma-empty">
            <div className="ma-empty-icon">
              <CalendarDays size={28} />
            </div>
            <h3>No attendance records yet</h3>
            <p>Your attendance history will appear here.</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="ma-table-wrapper">
            <table className="ma-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="ma-date-cell">
                      {formatDate(record.attendanceDate)}
                    </td>

                    <td>
                      {formatTime(record.entryTime)}
                    </td>

                    <td>
                      {formatTime(record.exitTime)}
                    </td>

                    <td className="ma-hours-cell">
                      {record.entryTime
                        ? formatMinutes(getMinutes(record))
                        : "-"}
                    </td>

                    <td>
                      {record.entryTime ? (
                        <span className="ma-status-badge">
                          <CheckCircle2 size={14} />
                          Present
                        </span>
                      ) : (
                        <span className="ma-no-status">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="ma-history-footer">
          <span>
            <span className="ma-footer-dot" />
            Attendance records from your account
          </span>
        </div>
      </section>
    </main>
  );
}

export default MyAttendance;
