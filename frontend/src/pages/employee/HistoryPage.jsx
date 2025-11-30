// src/pages/employee/HistoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { logout } from "../../store/authSlice";

function HistoryPage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await axiosClient.get("/attendance/my-history");
        setRecords(res.data || []);
      } catch (error) {
        setErr(
          error.response?.data?.message || "Failed to load history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Build month options from data (YYYY-MM)
  const monthOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return records;
    return records.filter(
      (r) => r.date && r.date.startsWith(selectedMonth)
    );
  }, [records, selectedMonth]);

  const name = user?.name || "Employee";

  const formatTime = (val) =>
    val
      ? new Date(val).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-circle">🕒</div>
          <span className="app-logo-text">AttendEase</span>
        </div>

        <nav className="app-nav">
          <Link to="/employee/dashboard" className="app-nav-link">
            Dashboard
          </Link>
          <Link to="/employee/attendance" className="app-nav-link">
            Mark Attendance
          </Link>
          <span className="app-nav-link active">My History</span>
          <span className="app-nav-link disabled">Profile</span>
        </nav>

        <div className="app-header-right">
          <span className="app-header-name">{name}</span>
          <button className="app-avatar" onClick={handleLogout}>
            {name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="emp-hero">
          <div>
            <h2 className="emp-hero-title">My Attendance History</h2>
            <p className="emp-hero-subtitle">
              View your past attendance records and working hours.
            </p>
          </div>
        </section>

        <section className="emp-card">
          <div className="emp-card-header">
            <div className="emp-card-title-wrapper">
              <span className="emp-card-icon">📅</span>
              <h3 className="emp-card-title">Attendance Records</h3>
            </div>

            <div>
              <label className="auth-label" style={{ marginRight: 6 }}>
                Filter by month
              </label>
              <select
                className="auth-select"
                style={{ width: 180, display: "inline-block" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">All</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : err ? (
            <p className="auth-error">{err}</p>
          ) : filtered.length === 0 ? (
            <p className="emp-empty">No attendance records found.</p>
          ) : (
            <div className="emp-table-wrapper">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td>{r.date}</td>
                      <td>{formatTime(r.checkInTime)}</td>
                      <td>{formatTime(r.checkOutTime)}</td>
                      <td>{r.totalHours?.toFixed?.(2) || "0.00"}</td>
                      <td>{r.status}</td>
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

export default HistoryPage;
