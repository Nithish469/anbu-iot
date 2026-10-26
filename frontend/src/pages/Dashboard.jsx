import { useEffect, useState } from "react";

import {
  Users,
  ClipboardCheck,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await API.get("/attendance/dashboard");

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="loading">
        Loading Attendance Dashboard...
      </div>
    );
  }

  const employees = dashboard?.employees || [];

  // Search employees
  const filteredEmployees = employees.filter((employee) =>
    `${employee.employeeId} ${employee.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================================
  // ATTENDANCE SUMMARY
  // Calculate from the actual employee status
  // =====================================================

  const totalEmployees = employees.length;

  const presentCount = employees.filter(
    (employee) => employee.status === "Present"
  ).length;

  const completedCount = employees.filter(
    (employee) => employee.status === "Completed"
  ).length;

  const absentCount = employees.filter(
    (employee) => employee.status === "Absent"
  ).length;

  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="header">
        <div>
          <h1>Dashboard</h1>

          <p>Employee attendance overview</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchDashboard}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {/* ================= STAT CARDS ================= */}

      <section className="stats">

        {/* TOTAL EMPLOYEES */}

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Employees</span>

            <h2>{totalEmployees}</h2>
          </div>
        </div>


        {/* PRESENT */}

        <div className="stat-card present">
          <div className="stat-icon">
            <ClipboardCheck size={22} />
          </div>

          <div>
            <span>Present Today</span>

            <h2>{presentCount}</h2>
          </div>
        </div>


        {/* COMPLETED */}

        <div className="stat-card completed">
          <div className="stat-icon">
            <Clock size={22} />
          </div>

          <div>
            <span>Completed</span>

            <h2>{completedCount}</h2>
          </div>
        </div>


        {/* ABSENT */}

        <div className="stat-card absent">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Absent</span>

            <h2>{absentCount}</h2>
          </div>
        </div>

      </section>


      {/* ================= ATTENDANCE TABLE ================= */}

      <section className="table-card">

        <div className="table-header">

          <div>
            <h2>Today's Attendance</h2>

            <p>
              Employee attendance status
            </p>
          </div>


          {/* SEARCH */}

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>


        {/* ================= TABLE ================= */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Employee ID</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
              </tr>

            </thead>


            <tbody>

              {filteredEmployees.length > 0 ? (

                filteredEmployees.map(
                  (employee) => (

                    <tr
                      key={employee.employeeId}
                    >

                      {/* EMPLOYEE ID */}

                      <td>
                        <strong>
                          {employee.employeeId}
                        </strong>
                      </td>


                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-name">

                          <div className="avatar">
                            {employee.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>
                            {employee.name}
                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status ${(
                            employee.status || "Absent"
                          ).toLowerCase()}`}
                        >

                          <span className="status-dot"></span>

                          {employee.status || "Absent"}

                        </span>

                      </td>


                      {/* CHECK IN */}

                      <td>

                        {employee.entryTime
                          ? new Date(
                              employee.entryTime
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "--"}

                      </td>


                      {/* CHECK OUT */}

                      <td>

                        {employee.exitTime
                          ? new Date(
                              employee.exitTime
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "--"}

                      </td>


                      {/* WORKING HOURS */}

                      <td>

                        <strong>
                          {employee.totalHours ||
                            "0h 0m"}
                        </strong>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No employees found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>
    </>
  );
}

export default Dashboard;
