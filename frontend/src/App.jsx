
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import EmployeeScan from "./pages/EmployeeScan";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import CheckIn from "./pages/CheckIn";

import AdminLogin from "./pages/AdminLogin";
import PublicHome from "./pages/PublicHome";
import EmployeeLogin from "./pages/EmployeeLogin";
import MyAttendance from "./pages/MyAttendance";
import Holidays from "./pages/Holidays";

import "./App.css";

function AdminApp({ onLogout }) {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;

      case "employees":
        return <Employees />;

      case "attendance":
        return <Attendance />;

      case "holidays":
        return <Holidays />;

      case "reports":
        return <Reports />;

      case "settings":
        return <Settings />;

      case "employee-scan":
        return <EmployeeScan />;

      case "employee-attendance":
        return <EmployeeAttendance />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={onLogout}
      />

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  const [view, setView] = useState(() => {
    if (window.location.pathname === "/check-in") {
      return "check-in";
    }

    if (sessionStorage.getItem("adminToken")) {
      return "admin";
    }

    if (sessionStorage.getItem("employeeToken")) {
      return "employee";
    }

    return "home";
  });

  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("employeeUser") || "null"
      );
    } catch {
      return null;
    }
  });

  const handleAdminLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");

    setView("home");
  };

  const handleEmployeeLogin = (employeeInfo) => {
    setEmployee(employeeInfo);
    setView("employee");
  };

  const handleEmployeeLogout = () => {
    sessionStorage.removeItem("employeeToken");
    sessionStorage.removeItem("employeeUser");

    setEmployee(null);
    setView("home");
  };

  // Keep QR attendance entry public.
  if (window.location.pathname === "/check-in") {
    return <CheckIn />;
  }

  if (view === "admin") {
    return <AdminApp onLogout={handleAdminLogout} />;
  }

  if (view === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => setView("admin")}
      />
    );
  }

  if (view === "employee-login") {
    return (
      <EmployeeLogin
        onLogin={handleEmployeeLogin}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "employee") {
    if (
      !sessionStorage.getItem("employeeToken") ||
      !employee
    ) {
      return (
        <EmployeeLogin
          onLogin={handleEmployeeLogin}
          onBack={() => setView("home")}
        />
      );
    }

    return (
      <MyAttendance
        employee={employee}
        onLogout={handleEmployeeLogout}
      />
    );
  }

  return (
    <PublicHome
      onAdminLogin={() => setView("admin-login")}
      onEmployeeLogin={() => setView("employee-login")}
      onScanQR={() => {
        window.location.href = "/check-in";
      }}
    />
  );
}

export default App;
