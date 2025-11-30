import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

function EmployeeDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await axiosClient.get("/dashboard/employee");
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (error) {
        setErr(
          error.response?.data?.message ||
            "Failed to load dashboard data"
        );
        setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const name = user?.name || data?.user?.name || "Employee";
  const monthSummary = data?.monthSummary || {
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0,
  };
  const attendanceRate = data?.attendanceRate || 0;
  const todayStatus = data?.today?.status || "not_checked_in";
  const recent = data?.recent || [];

  const statusLabel =
    todayStatus === "present"
      ? "Present"
      : todayStatus === "late"
      ? "Late"
      : todayStatus === "half-day"
      ? "Half Day"
      : todayStatus === "absent"
      ? "Absent"
      : "Not Checked In";

  return (
    <div className="app-shell">
      {/* Top Nav */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-circle">🕒</div>
          <span className="app-logo-text">AttendEase</span>
        </div>

        <nav className="app-nav">
          <Link to="/employee/dashboard" className="app-nav-link active">
            Dashboard
          </Link>
          <Link to="/employee/attendance" className="app-nav-link">
            Mark Attendance
          </Link>
          <Link to="/employee/history" className="app-nav-link">
            My History
          </Link>
          {/* Profile is not built yet, keep disabled */}
          <span className="app-nav-link disabled">Profile</span>
        </nav>

        <div className="app-header-right">
          <span className="app-header-name">{user?.name || "User"}</span>
          <button className="app-avatar" onClick={handleLogout}>
            {name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Welcome + status */}
        <section className="emp-hero">
          <div>
            <h2 className="emp-hero-title">
              Welcome back, {name.toLowerCase()}!
            </h2>
            <p className="emp-hero-subtitle">
              Here&apos;s your attendance overview for this month.
            </p>
          </div>
          <div className="emp-status-pill">
            <span className="emp-status-label">Today&apos;s Status</span>
            <span className="emp-status-value">{statusLabel}</span>
          </div>
        </section>

        {/* Stat cards */}
        <section className="emp-stats-grid">
          <div className="emp-stat-card">
            <div className="emp-stat-title">Present Days</div>
            <div className="emp-stat-value">{monthSummary.present}</div>
            <div className="emp-stat-footer">This month</div>
          </div>

          <div className="emp-stat-card">
            <div className="emp-stat-title">Absent Days</div>
            <div className="emp-stat-value">{monthSummary.absent}</div>
            <div className="emp-stat-footer">This month</div>
          </div>

          <div className="emp-stat-card">
            <div className="emp-stat-title">Late Arrivals</div>
            <div className="emp-stat-value">{monthSummary.late}</div>
            <div className="emp-stat-footer">This month</div>
          </div>

          <div className="emp-stat-card">
            <div className="emp-stat-title">Total Hours</div>
            <div className="emp-stat-value">
              {monthSummary.totalHours.toFixed
                ? monthSummary.totalHours.toFixed(1)
                : monthSummary.totalHours}
              h
            </div>
            <div className="emp-stat-footer">This month</div>
          </div>
        </section>

        {/* Monthly attendance rate */}
        <section className="emp-card">
          <div className="emp-card-header">
            <div className="emp-card-title-wrapper">
              <span className="emp-card-icon">📅</span>
              <h3 className="emp-card-title">Monthly Attendance Rate</h3>
            </div>
            <span className="emp-card-percentage">{attendanceRate}%</span>
          </div>
          <div className="emp-progress">
            <div
              className="emp-progress-bar"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </section>

        {/* Recent attendance table */}
        <section className="emp-card">
          <div className="emp-card-header">
            <div className="emp-card-title-wrapper">
              <span className="emp-card-icon">📊</span>
              <h3 className="emp-card-title">
                Recent Attendance (Last 7 Days)
              </h3>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : err ? (
            <p className="auth-error">{err}</p>
          ) : recent.length === 0 ? (
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
                  {recent.map((r) => (
                    <tr key={r._id}>
                      <td>{r.date}</td>
                      <td>
                        {r.checkInTime
                          ? new Date(r.checkInTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td>
                        {r.checkOutTime
                          ? new Date(r.checkOutTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td>{r.totalHours?.toFixed(2) || "0.00"}</td>
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

export default EmployeeDashboard;
