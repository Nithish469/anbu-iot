
import { useState } from "react";
import API from "../services/api";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/admin/login", {
        username,
        password,
      });

      sessionStorage.setItem("adminToken", response.data.token);
      sessionStorage.setItem(
        "adminUser",
        JSON.stringify(response.data.admin)
      );

      onLogin();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1>Admin Login</h1>
        <p>Sign in to manage employee attendance</p>

        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f6fb",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 30,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  error: { color: "#c62828" },
  button: {
    marginTop: 10,
    padding: 12,
    border: 0,
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AdminLogin;
