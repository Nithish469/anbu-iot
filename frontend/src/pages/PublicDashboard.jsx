
import { useEffect, useState } from "react";
import {
  Users,
  ClipboardCheck,
  Clock,
  UserX,
  RefreshCw,
  Info,
} from "lucide-react";
import API from "../services/api";

function PublicDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/attendance/public-summary");

console.log("Public summary API response:", response.data);

setSummary(response.data.summary);
    } catch (err) {
      console.error("Public dashboard error:", err);
      setError("Dashboard summary load aagala. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const cards = [
    {
      title: "Total Employees",
      value: summary?.totalEmployees ?? 0,
      icon: Users,
      className: "total",
      description: "Total registered employees",
    },
    {
      title: "Present Today",
      value: summary?.present ?? 0,
      icon: ClipboardCheck,
      className: "present",
      description: "Checked in today",
    },
    {
      title: "Completed Today",
      value: summary?.completed ?? 0,
      icon: Clock,
      className: "completed",
      description: "Checked in and out",
    },
    {
      title: "Absent Today",
      value: summary?.absent ?? 0,
      icon: UserX,
      className: "absent",
      description: "Not yet checked in",
    },
  ];

  return (
    <section className="public-dashboard">
      <header className="public-dashboard-header">
      
<br></br>
         
         
       <button
          type="button"
          className="refresh-btn"
          onClick={fetchSummary}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "refresh-spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <p className="public-dashboard-error" role="alert">
          {error}
        </p>
      )}

      <div className="public-dashboard-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className={`public-stat-card ${card.className}`}
              key={card.title}
            >
              <div className="public-stat-icon">
                <Icon size={24} />
              </div>

              <div className="public-stat-info">
                <span className="public-stat-title">
                  {card.title}
                </span>

                <strong className="public-stat-value">
                  {loading && !summary ? "—" : card.value}
                </strong>

                <span className="public-stat-description">
                  {card.description}
                </span>
              </div>
            </article>
          );
        })}
      </div>

    
    </section>
  );
}

export default PublicDashboard;
