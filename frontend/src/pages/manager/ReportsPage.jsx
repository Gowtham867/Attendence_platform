// src/pages/manager/ReportsPage.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { logout } from "../../store/authSlice";

function ReportsPage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
    status: "all",
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildParams = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.status !== "all") params.status = filters.status;
    return params;
  };

  const fetchReports = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axiosClient.get("/attendance/all", {
        params: buildParams(),
      });
      setRecords(res.data || []);
    } catch (error) {
      setErr(
        error.response?.data?.message || "Failed to fetch attendance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load initial data without filters
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = () => {
    const params = buildParams();
    const qs = new URLSearchParams(params).toString();
    const url = `http://localhost:5000/api/attendance/export${
      qs ? `?${qs}` : ""
    }`;
    window.open(url, "_blank");
  };

  const name = user?.name || "Manager";

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
          <Link to="/manager/dashboard" className="app-nav-link">
            Dashboard
          </Link>
          <Link to="/manager/calendar" className="app-nav-link">
            Team Calendar
          </Link>
          <span className="app-nav-link active">Reports</span>
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
            <h2 className="emp-hero-title">Reports</h2>
            <p className="emp-hero-subtitle">
              Generate detailed attendance reports and export them as CSV.
            </p>
          </div>
        </section>

        <section className="mgr-panel" style={{ marginBottom: 18 }}>
          <div className="mgr-panel-header">
            <h3>Filters</h3>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "flex-end",
            }}
          >
            <div>
              <div className="auth-label">Start Date</div>
              <input
                type="date"
                className="auth-input"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <div className="auth-label">End Date</div>
              <input
                type="date"
                className="auth-input"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <div className="auth-label">Employee ID</div>
              <input
                className="auth-input"
                name="employeeId"
                placeholder="EMP001"
                value={filters.employeeId}
                onChange={handleChange}
              />
            </div>
            <div>
              <div className="auth-label">Status</div>
              <select
                className="auth-select"
                name="status"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="auth-button"
                style={{ maxWidth: 140 }}
                onClick={fetchReports}
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply Filters"}
              </button>
              <button
                className="auth-button"
                style={{
                  maxWidth: 160,
                  backgroundColor: "#16a34a",
                }}
                onClick={handleExport}
              >
                Export CSV
              </button>
            </div>
          </div>
        </section>

        <section className="mgr-panel">
          <div className="mgr-panel-header">
            <h3>Attendance Records</h3>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : err ? (
            <p className="auth-error">{err}</p>
          ) : records.length === 0 ? (
            <p className="emp-empty">No records found.</p>
          ) : (
            <div className="emp-table-wrapper">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.date}</td>
                      <td>{r.userName || r.user?.name}</td>
                      <td>{r.employeeId || r.user?.employeeId}</td>
                      <td>{r.department || r.user?.department}</td>
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

export default ReportsPage;
