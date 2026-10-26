
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceResponse, employeesResponse] = await Promise.all([
        API.get("/attendance"),
        API.get("/employees"),
      ]);

      const attendanceData = attendanceResponse.data;
      const employeesData = employeesResponse.data;

      const attendanceList = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.attendance || attendanceData.records || [];

      const employeeList = Array.isArray(employeesData)
        ? employeesData
        : employeesData.employees || [];

      setAttendance(attendanceList);
      setEmployees(employeeList);
    } catch (err) {
      console.error("Attendance fetch error:", err);

      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Admin session expired. Please log in again."
          : err.response?.data?.message ||
              "Unable to load attendance. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use the local calendar date in the Asia/Kolkata timezone.
  const getDateKey = (date) => {
    if (!date) return "";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(parsed);

    const values = {};
    parts.forEach(({ type, value }) => {
      values[type] = value;
    });

    return `${values.year}-${values.month}-${values.day}`;
  };

  const todayKey = getDateKey(new Date());

  const formatDate = (date) => {
    if (!date) return "--";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "--";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatTime = (time) => {
    if (!time) return "--";

    const parsed = new Date(time);
    if (Number.isNaN(parsed.getTime())) return "--";

    return parsed.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  // Backend attendance.employeeId normally stores the employee database ID.
  const getRecordEmployeeId = (record) => {
    if (record.employee && typeof record.employee === "object") {
      return record.employee.id ?? record.employee.employeeId;
    }

    return record.employeeId;
  };

  const matchesEmployee = (record, employee) => {
    const recordId = getRecordEmployeeId(record);

    return (
      recordId === employee.id ||
      recordId === employee.employeeId
    );
  };

  const getStatus = (record) => {
    if (!record?.entryTime) return "Absent";
    if (record.exitTime) return "Completed";
    return "Present";
  };

  const getWorkingHours = (record) => {
    if (!record) return "0h 0m";

    if (record.totalMinutes != null) {
      const minutes = Math.max(0, Number(record.totalMinutes) || 0);
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }

    if (record.entryTime && record.exitTime) {
      const difference = Math.max(
        0,
        Math.floor(
          (new Date(record.exitTime).getTime() -
            new Date(record.entryTime).getTime()) /
            60000
        )
      );

      return `${Math.floor(difference / 60)}h ${difference % 60}m`;
    }

    return "0h 0m";
  };

  // Selected date affects the table; summary cards always show today's counts.
  const todayRows = employees.map((employee) => {
    const records = attendance
      .filter(
        (record) =>
          matchesEmployee(record, employee) &&
          getDateKey(record.attendanceDate) === todayKey
      )
      .sort(
        (a, b) =>
          new Date(b.attendanceDate).getTime() -
          new Date(a.attendanceDate).getTime()
      );

    return {
      employee,
      record: records[0] || null,
    };
  });

  const totalEmployees = employees.length;

  const presentCount = todayRows.filter(
    ({ record }) => record?.entryTime && !record?.exitTime
  ).length;

  const completedCount = todayRows.filter(
    ({ record }) => record?.entryTime && record?.exitTime
  ).length;

  const checkedInCount = todayRows.filter(
    ({ record }) => Boolean(record?.entryTime)
  ).length;

  const absentCount = Math.max(0, totalEmployees - checkedInCount);

  const attendanceRows = employees.map((employee) => {
    const records = attendance
      .filter(
        (record) =>
          matchesEmployee(record, employee) &&
          (!selectedDate ||
            getDateKey(record.attendanceDate) === selectedDate)
      )
      .sort(
        (a, b) =>
          new Date(b.attendanceDate).getTime() -
          new Date(a.attendanceDate).getTime()
      );

    return {
      employee,
      record: records[0] || null,
    };
  });

  const filteredRows = attendanceRows.filter(({ employee }) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      employee.employeeId?.toLowerCase().includes(query) ||
      employee.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Attendance</h1>
          <p>View and manage employee attendance</p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button type="button" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <span>Total Employees</span>
            <strong>{loading ? "—" : totalEmployees}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span>Present</span>
            <strong>{loading ? "—" : presentCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">◷</div>
          <div>
            <span>Completed</span>
            <strong>{loading ? "—" : completedCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">!</div>
          <div>
            <span>Absent</span>
            <strong>{loading ? "—" : absentCount}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Attendance Records</h2>
            <p>Employee check-in and check-out records</p>
          </div>

          <div className="attendance-filters">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Filter attendance by date"
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="search-input"
              aria-label="Search employee"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map(({ employee, record }) => {
                    const status = getStatus(record);

                    return (
                      <tr key={employee.id || employee.employeeId}>
                        <td>{employee.employeeId || "--"}</td>

                        <td>
                          <div className="employee-name">
                            <div className="avatar">
                              {(employee.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {employee.name || "--"}
                          </div>
                        </td>

                        <td>
                          {record
                            ? formatDate(record.attendanceDate)
                            : selectedDate
                              ? formatDate(`${selectedDate}T12:00:00`)
                              : "--"}
                        </td>

                        <td>{formatTime(record?.entryTime)}</td>
                        <td>{formatTime(record?.exitTime)}</td>
                        <td>{getWorkingHours(record)}</td>

                        <td>
                          <span className={`status ${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty">
                      {error ? "Unable to load employees." : "No employees found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;
