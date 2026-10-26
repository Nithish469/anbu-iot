
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  CalendarDays,
} from "lucide-react";

function Sidebar({ page, setPage, onLogout }) {
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    if (typeof onLogout === "function") {
      onLogout();
    } else {
      console.error(
        "Logout function is not connected. Check App.jsx."
      );
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">A</div>

        <div>
          <h2>Anbu IoT</h2>
          <span>Attendance</span>
        </div>
      </div>

      <nav>
        <a
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a
          className={page === "employees" ? "active" : ""}
          onClick={() => setPage("employees")}
        >
          <Users size={20} />
          Employees
        </a>

        <a
          className={page === "attendance" ? "active" : ""}
          onClick={() => setPage("attendance")}
        >
          <ClipboardCheck size={20} />
          Attendance
        </a>

        <a
          className={page === "holidays" ? "active" : ""}
          onClick={() => setPage("holidays")}
        >
          <CalendarDays size={20} />
          Holidays
        </a>

        <a
          className={page === "reports" ? "active" : ""}
          onClick={() => setPage("reports")}
        >
          <BarChart3 size={20} />
          Reports
        </a>

        <a
          className={page === "settings" ? "active" : ""}
          onClick={() => setPage("settings")}
        >
          <Settings size={20} />
          Settings
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button type="button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
