
import { useEffect, useState } from "react";

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
      <main className="main">{renderPage()}</main>
    </div>
  );
}

// Determine the page from the current URL.
function getInitialView(path) {
  if (path === "/check-in") return "check-in";

  if (path === "/employee/login") return "employee-login";

  if (path === "/employee/attendance") {
    return sessionStorage.getItem("employeeToken")
      ? "employee"
      : "employee-login";
  }

  if (path === "/admin/login") return "admin-login";

  if (path === "/admin") {
    return sessionStorage.getItem("adminToken")
      ? "admin"
      : "admin-login";
  }

  if (sessionStorage.getItem("adminToken")) return "admin";

  if (sessionStorage.getItem("employeeToken")) return "employee";

  return "home";
}

function App() {
  const [view, setView] = useState(() =>
    getInitialView(window.location.pathname)
  );

  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("employeeUser") || "null"
      );
    } catch {
      return null;
    }
  });

  // Update browser URL and application view together.
  const navigateTo = (path, nextView, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({}, "", path);
      } else {
        window.history.pushState({}, "", path);
      }
    }

    setView(nextView);
  };

  // Support browser Back and Forward buttons.
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const nextView = getInitialView(path);

      if (
        nextView === "employee-login" &&
        path === "/employee/attendance"
      ) {
        window.history.replaceState(
          {},
          "",
          "/employee/login"
        );
      }

      setView(nextView);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleAdminLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");

    navigateTo("/", "home");
  };

  const handleEmployeeLogin = (employeeInfo) => {
    setEmployee(employeeInfo);

    navigateTo("/employee/attendance", "employee");
  };

  const handleEmployeeLogout = () => {
    sessionStorage.removeItem("employeeToken");
    sessionStorage.removeItem("employeeUser");

    setEmployee(null);

    navigateTo("/employee/login", "employee-login");
  };

  // Public QR attendance route.
  if (window.location.pathname === "/check-in") {
    return <CheckIn />;
  }

  if (view === "admin") {
    if (!sessionStorage.getItem("adminToken")) {
      return (
        <AdminLogin
          onLogin={() => navigateTo("/admin", "admin")}
        />
      );
    }

    return <AdminApp onLogout={handleAdminLogout} />;
  }

  if (view === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => navigateTo("/admin", "admin")}
      />
    );
  }

  if (view === "employee-login") {
    return (
      <EmployeeLogin
        onLogin={handleEmployeeLogin}
        onBack={() => navigateTo("/employee/login", "employee-login")}
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
          onBack={() =>
            navigateTo("/employee/login", "employee-login")
          }
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
      onAdminLogin={() =>
        navigateTo("/admin/login", "admin-login")
      }
      onEmployeeLogin={() =>
        navigateTo("/employee/login", "employee-login")
      }
      onScanQR={() => {
        navigateTo("/check-in", "check-in");
      }}
    />
  );
}

export default App;
