import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, RefreshCw } from "lucide-react";
import API from "../services/api";

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await API.get("/holidays");
      setHolidays(response.data.holidays || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load holidays"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const addHoliday = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await API.post("/holidays", {
        date,
        name,
        description,
      });

      setMessage(response.data.message || "Holiday added successfully");
      setDate("");
      setName("");
      setDescription("");
      await fetchHolidays();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to add holiday"
      );
    }
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    setMessage("");

    try {
      const response = await API.delete(`/holidays/${id}`);
      setMessage(response.data.message || "Holiday deleted successfully");
      await fetchHolidays();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete holiday"
      );
    }
  };

  return (
    <div className="holidays-page">
      <header className="header">
        <div>
          <h1>Holiday Management</h1>
          <p>Manage company holidays and weekly offs</p>
        </div>

        <button className="refresh-btn" onClick={fetchHolidays}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="table-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Add Company Holiday</h2>

        <form onSubmit={addHoliday} style={{ display: "grid", gap: 14, maxWidth: 600 }}>
          <label>
            Holiday Date *
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>

          <label>
            Holiday Name *
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Pongal"
              required
              style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
              rows={3}
              style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>

          <button type="submit" disabled={loading} className="refresh-btn">
            <Plus size={17} />
            Add Holiday
          </button>
        </form>

        {message && <p role="status">{message}</p>}
      </section>

      <section className="table-card">
        <div className="table-header">
          <div>
            <h2><CalendarDays size={20} /> Company Holidays</h2>
            <p>{holidays.length} holiday(s) configured</p>
          </div>
        </div>

        {loading && holidays.length === 0 ? (
          <p style={{ padding: 20 }}>Loading holidays...</p>
        ) : holidays.length === 0 ? (
          <p style={{ padding: 20 }}>No holidays added yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>{new Date(holiday.date).toLocaleDateString()}</td>
                    <td><strong>{holiday.name}</strong></td>
                    <td>{holiday.description || "--"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteHoliday(holiday.id)}
                        aria-label={`Delete ${holiday.name}`}
                        title="Delete holiday"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p style={{ marginTop: 16 }}>
        Sundays are intended to be automatic weekly offs. Attendance calculations
        still need to be updated separately to exclude Sundays and configured holidays.
      </p>
    </div>
  );
}

export default Holidays;