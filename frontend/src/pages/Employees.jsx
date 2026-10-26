
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  X,
  UserPlus,
  Pencil,
} from "lucide-react";
import API from "../services/api";

const STATUS_OPTIONS = [
  "ACTIVE",
  "LEAVE (ML)",
  "RESIGNED",
  "TERMINATED",
];

const statusColors = {
  "ACTIVE": { background: "#dcfce7", color: "#166534" },
  "LEAVE (ML)": { background: "#fef3c7", color: "#92400e" },
  "RESIGNED": { background: "#ffedd5", color: "#9a3412" },
  "TERMINATED": { background: "#fee2e2", color: "#991b1b" },
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    pin: "",
    status: "ACTIVE",
  });

  const [editForm, setEditForm] = useState({
    employeeId: "",
    name: "",
    pin: "",
    status: "ACTIVE",
  });

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await API.get("/employees");
      setEmployees(response.data.employees || response.data);
    } catch (error) {
      console.error("Employees error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ADD EMPLOYEE
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !form.employeeId.trim() ||
      !form.name.trim() ||
      !form.pin
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (!/^\d{4}$/.test(form.pin)) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    try {
      await API.post("/employees", {
        employeeId: form.employeeId.trim(),
        name: form.name.trim(),
        pin: form.pin,
        status: form.status,
      });

      alert("Employee added successfully");

      setForm({
        employeeId: "",
        name: "",
        pin: "",
        status: "ACTIVE",
      });

      setShowAddEmployee(false);
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to add employee"
      );
    }
  };

  // OPEN EDIT FORM
  const openEditEmployee = (employee) => {
    setEditingEmployee(employee);

    setEditForm({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      pin: "",
      status: STATUS_OPTIONS.includes(employee.status)
        ? employee.status
        : "ACTIVE",
    });
  };

  // UPDATE EMPLOYEE
  const handleEditEmployee = async (e) => {
    e.preventDefault();

    if (
      !editForm.employeeId.trim() ||
      !editForm.name.trim()
    ) {
      alert("Employee ID and name are required");
      return;
    }

    if (
      editForm.pin &&
      !/^\d{4}$/.test(editForm.pin)
    ) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    try {
      await API.put(
        `/employees/${editingEmployee.id}`,
        {
          employeeId: editForm.employeeId.trim(),
          name: editForm.name.trim(),
          pin: editForm.pin,
          status: editForm.status,
        }
      );

      alert("Employee updated successfully");
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to update employee"
      );
    }
  };

  // STATUS DROPDOWN
  const renderStatusSelect = (value, onChange) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "14px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "#fff",
        fontSize: "14px",
      }}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );

  // SEARCH
  const filteredEmployees = employees.filter((employee) =>
    `${employee.employeeId} ${employee.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>Employees</h1>
          <p>Manage your company employees</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setShowAddEmployee(true)}
        >
          <Plus size={18} />
          Add Employee
        </button>
      </header>

      {/* EMPLOYEE TABLE */}
      <section className="table-card">
        <div className="table-header">
          <div>
            <h2>All Employees</h2>
            <p>
              {employees.length} employees registered
            </p>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="empty">Loading employees...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center" }}
                    >
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const status =
                      STATUS_OPTIONS.includes(employee.status)
                        ? employee.status
                        : employee.isActive === false
                          ? "TERMINATED"
                          : "ACTIVE";

                    return (
                      <tr key={employee.id}>
                        <td>
                          <div className="employee-name">
                            <div className="avatar">
                              {employee.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <strong>{employee.name}</strong>
                            </div>
                          </div>
                        </td>

                        <td>{employee.employeeId}</td>

                        <td>
                          <span
                            style={{
                              ...statusColors[status],
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          {employee.createdAt
                            ? new Date(
                                employee.createdAt
                              ).toLocaleDateString()
                            : "--"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="add-btn"
                            onClick={() =>
                              openEditEmployee(employee)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 12px",
                              fontSize: "13px",
                            }}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ADD EMPLOYEE MODAL */}
      {showAddEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddEmployee(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add Employee</h2>
                <p>Create a new employee account</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => setShowAddEmployee(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="form-icon">
                <UserPlus size={25} />
              </div>

              <label>Employee ID</label>
              <input
                type="text"
                placeholder="Example: AIOT2609"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employeeId: e.target.value.toUpperCase(),
                  })
                }
              />

              <label>Employee Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <label>PIN</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="Enter 4 digit PIN"
                maxLength={4}
                value={form.pin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pin: e.target.value.replace(/\D/g, ""),
                  })
                }
              />

              <label>Employee Status</label>
              {renderStatusSelect(form.status, (status) =>
                setForm({ ...form, status })
              )}

              <button
                type="submit"
                className="submit-btn"
              >
                <UserPlus size={18} />
                Create Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setEditingEmployee(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Edit Employee</h2>
                <p>Update employee details</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => setEditingEmployee(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditEmployee}>
              <div className="form-icon">
                <Pencil size={25} />
              </div>

              <label>Employee ID</label>
              <input
                type="text"
                placeholder="Enter employee ID"
                value={editForm.employeeId}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    employeeId: e.target.value.toUpperCase(),
                  })
                }
              />

              <label>Employee Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
              />

              <label>New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="Leave blank to keep current PIN"
                maxLength={4}
                value={editForm.pin}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    pin: e.target.value.replace(/\D/g, ""),
                  })
                }
              />

              <label>Employee Status</label>
              {renderStatusSelect(editForm.status, (status) =>
                setEditForm({ ...editForm, status })
              )}

              <button
                type="submit"
                className="submit-btn"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="close-btn"
                style={{
                  width: "100%",
                  marginTop: "10px",
                }}
                onClick={() => setEditingEmployee(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Employees;
