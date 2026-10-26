import { useEffect, useState } from "react";
import {
  LogIn,
  LogOut,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import API from "../services/api";

function EmployeeAttendance() {
  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");

      setEmployees(
        response.data.employees || response.data || []
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const findEmployee = () => {
    const id = employeeId.trim().toUpperCase();

    const found = employees.find(
      (employee) =>
        employee.employeeId?.toUpperCase() === id
    );

    return found;
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleCheckIn = async () => {
    if (!employeeId.trim()) {
      showMessage("Please enter Employee ID", "error");
      return;
    }

    const foundEmployee = findEmployee();

    if (!foundEmployee) {
      showMessage("Employee not found", "error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await API.post(
        "/attendance/check-in",
        {
          employeeId: employeeId.trim().toUpperCase(),
        }
      );

      setEmployee(foundEmployee);
      setAttendance(response.data.attendance);

      showMessage(
        `Welcome ${foundEmployee.name}! Check-in successful.`,
        "success"
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Check-in failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId.trim()) {
      showMessage("Please enter Employee ID", "error");
      return;
    }

    const foundEmployee = findEmployee();

    if (!foundEmployee) {
      showMessage("Employee not found", "error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await API.post(
        "/attendance/check-out",
        {
          employeeId: employeeId.trim().toUpperCase(),
        }
      );

      setEmployee(foundEmployee);
      setAttendance(response.data.attendance);

      showMessage(
        `Goodbye ${foundEmployee.name}! Check-out successful.`,
        "success"
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Check-out failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="employee-attendance-page">
      <div className="attendance-kiosk">
        <div className="kiosk-header">
          <div className="kiosk-logo">A</div>

          <div>
            <h1>Anbu IoT</h1>
            <p>Employee Attendance</p>
          </div>
        </div>

        <div className="kiosk-icon">
          <Clock size={32} />
        </div>

        <h2>Mark Your Attendance</h2>

        <p className="kiosk-description">
          Enter your Employee ID to check in or check out.
        </p>

        <div className="employee-input-wrapper">
          <User size={19} />

          <input
            type="text"
            placeholder="Enter Employee ID"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(
                e.target.value.toUpperCase()
              );

              setMessage("");
              setEmployee(null);
              setAttendance(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCheckIn();
              }
            }}
          />
        </div>

        <div className="attendance-buttons">
          <button
            className="check-in-btn"
            onClick={handleCheckIn}
            disabled={loading}
          >
            <LogIn size={20} />

            {loading ? "Processing..." : "Check In"}
          </button>

          <button
            className="check-out-btn"
            onClick={handleCheckOut}
            disabled={loading}
          >
            <LogOut size={20} />

            {loading ? "Processing..." : "Check Out"}
          </button>
        </div>

        {message && (
          <div
            className={`attendance-message ${messageType}`}
          >
            {messageType === "success" ? (
              <CheckCircle size={19} />
            ) : (
              <AlertCircle size={19} />
            )}

            <span>{message}</span>
          </div>
        )}

        {employee && attendance && (
          <div className="attendance-result">
            <div className="result-header">
              <div className="result-avatar">
                {employee.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{employee.name}</strong>
                <span>{employee.employeeId}</span>
              </div>
            </div>

            <div className="result-times">
              <div>
                <span>Check In</span>
                <strong>
                  {formatTime(attendance.entryTime)}
                </strong>
              </div>

              <div>
                <span>Check Out</span>
                <strong>
                  {formatTime(attendance.exitTime)}
                </strong>
              </div>
            </div>

            {attendance.totalMinutes != null && (
              <div className="working-time">
                <Clock size={18} />

                <span>Working Time</span>

                <strong>
                  {Math.floor(
                    attendance.totalMinutes / 60
                  )}
                  h{" "}
                  {attendance.totalMinutes % 60}
                  m
                </strong>
              </div>
            )}
          </div>
        )}

        <p className="kiosk-footer">
          Anbu IoT Attendance System
        </p>
      </div>
    </div>
  );
}

export default EmployeeAttendance;