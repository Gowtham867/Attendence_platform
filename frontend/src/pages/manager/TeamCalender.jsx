// src/pages/manager/TeamCalender.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { logout } from "../../store/authSlice";

function TeamCalender() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [month, setMonth] = useState("current");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await axiosClient.get("/attendance/all");
        setRecords(res.data || []);
      } catch (error) {
        setErr(
          error.response?.data?.message || "Failed to load attendance data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Filter + group by date
  const groupedByDate = useMemo(() => {
    const map = new Map();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    records.forEach((r) => {
      if (!r.date) return;
      if (month === "current" && !r.date.startsWith(currentMonth)) return;

      if (!map.has(r.date)) {
        map.set(r.date, {
          date: r.date,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
        });
      }
      const entry = map.get(r.date);
      if (r.status === "present") entry.present++;
      else if (r.status === "absent") entry.absent++;
      else if (r.status === "late") entry.late++;
      else if (r.status === "half-day") entry.halfDay++;
    });

    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [records, month]);

  const name = user?.name || "Manager";

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-circle">🕒</div>
          <span className="app-logo-text">AttendEase</span>
        </div>

        <nav className="app-nav">
          <Link to="/manager/dashboard" className="app-nav-link">
            Dashboard
          </Link>
          <span className="app-nav-link active">Team Calendar</span>
          <Link to="/manager/reports" className="app-nav-link">
            Reports
          </Link>
        </nav>

        <div className="app-header-right">
          <span className="app-header-name">{name}</span>
          <button className="app-avatar" onClick={handleLogout}>
            {name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="emp-hero mgr-hero">
          <div>
            <h2 className="emp-hero-title">Team Calendar View</h2>
            <p className="emp-hero-subtitle">
              See daily attendance summary for your team.
            </p>
          </div>
        </section>

        <section className="mgr-panel">
          <div className="mgr-panel-header">
            <h3>Daily Summary</h3>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="auth-label" style={{ marginRight: 6 }}>
              Month
            </label>
            <select
              className="auth-select"
              style={{ width: 200, display: "inline-block" }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="current">Current month only</option>
              <option value="all">All months</option>
            </select>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : err ? (
            <p className="auth-error">{err}</p>
          ) : groupedByDate.length === 0 ? (
            <p className="emp-empty">No attendance data yet.</p>
          ) : (
            <div className="emp-table-wrapper">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Half Day</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByDate.map((d) => (
                    <tr key={d.date}>
                      <td>{d.date}</td>
                      <td>{d.present}</td>
                      <td>{d.absent}</td>
                      <td>{d.late}</td>
                      <td>{d.halfDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TeamCalender;
