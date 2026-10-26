import { useState } from "react";
import { UserRound, ArrowLeft, LogIn } from "lucide-react";
import API from "../services/api";

function EmployeeLogin({ onLogin, onBack }) {
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!employeeId.trim() || !/^\d{4}$/.test(pin)) {
      setError("Employee ID and 4-digit PIN enter pannunga.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/employees/login", {
        employeeId: employeeId.trim(),
        pin,
      });

      sessionStorage.setItem(
        "employeeToken",
        response.data.token
      );

      sessionStorage.setItem(
        "employeeUser",
        JSON.stringify(response.data.employee)
      );

      onLogin(response.data.employee);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <button
          type="button"
          onClick={onBack}
          style={styles.back}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <UserRound size={42} color="#2563eb" />

        <h2>Employee Login</h2>
        <p style={styles.muted}>
          Login to view your own attendance details.
        </p>

        <label style={styles.label}>Employee ID</label>
        <input
          style={styles.input}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Example: AIOT2605"
          autoComplete="username"
          required
        />

        <label style={styles.label}>4-digit PIN</label>
        <input
          style={styles.input}
          type="password"
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          placeholder="Enter your PIN"
          autoComplete="current-password"
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={styles.submit}
        >
          <LogIn size={17} />
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    boxSizing: "border-box",
    padding: 28,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  back: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: 0,
    background: "transparent",
    cursor: "pointer",
  },
  muted: { color: "#64748b", marginTop: 0 },
  label: { fontWeight: 600, fontSize: 14 },
  input: {
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  error: { color: "#dc2626", fontSize: 14 },
  submit: {
    marginTop: 8,
    padding: 12,
    border: 0,
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
  },
};

export default EmployeeLogin;
