import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

function ManagerDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await axiosClient.get("/dashboard/manager");
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (error) {
        setErr(
          error.response?.data?.message ||
            "Failed to load manager dashboard"
        );
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const cards = data?.cards || {
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  };

  const departmentDistribution = data?.departmentDistribution || [];
  const lateArrivals = data?.lateArrivals || [];
  const presentList = data?.presentList || [];

  return (
    <div className="app-shell">
      {/* Top Nav */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-circle">🕒</div>
          <span className="app-logo-text">AttendEase</span>
        </div>

        <nav className="app-nav">
          <Link to="/manager/dashboard" className="app-nav-link active">
            Dashboard
          </Link>
          <span className="app-nav-link disabled">All Attendance</span>
          <span className="app-nav-link disabled">Team Calendar</span>
          <span className="app-nav-link disabled">Reports</span>
        </nav>

        <div className="app-header-right">
          <span className="app-header-name">
            {user?.name || "Manager"}
          </span>
          <button className="app-avatar" onClick={handleLogout}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="emp-hero mgr-hero">
          <div>
            <h2 className="emp-hero-title">Manager Dashboard</h2>
            <p className="emp-hero-subtitle">
              Overview of team attendance
            </p>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mgr-cards-grid">
          <div className="mgr-card mgr-card-blue">
            <div className="mgr-card-label">Total Employees</div>
            <div className="mgr-card-value">
              {cards.totalEmployees}
            </div>
          </div>
          <div className="mgr-card mgr-card-green">
            <div className="mgr-card-label">Present Today</div>
            <div className="mgr-card-value">
              {cards.presentToday}
            </div>
          </div>
          <div className="mgr-card mgr-card-red">
            <div className="mgr-card-label">Absent Today</div>
            <div className="mgr-card-value">
              {cards.absentToday}
            </div>
          </div>
          <div className="mgr-card mgr-card-yellow">
            <div className="mgr-card-label">Late Arrivals</div>
            <div className="mgr-card-value">
              {cards.lateToday}
            </div>
          </div>
        </section>

        {/* Charts row */}
        <section className="mgr-charts-grid">
          <div className="mgr-panel">
            <div className="mgr-panel-header">
              <h3>Weekly Attendance Trend</h3>
            </div>
            <div className="mgr-chart-placeholder">
              <p>Chart placeholder (you can add Recharts later)</p>
            </div>
          </div>

          <div className="mgr-panel">
            <div className="mgr-panel-header">
              <h3>Department Distribution</h3>
            </div>
            <div className="mgr-chart-placeholder">
              {departmentDistribution.length === 0 ? (
                <p>No department data yet.</p>
              ) : (
                <ul className="mgr-dept-list">
                  {departmentDistribution.map((d) => (
                    <li key={d.name}>
                      <span>{d.name}</span>
                      <span>{d.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Bottom row: Late + Present */}
        <section className="mgr-bottom-grid">
          <div className="mgr-panel">
            <div className="mgr-panel-header mgr-panel-header-yellow">
              <h3>Late Arrivals Today</h3>
            </div>
            <div className="mgr-panel-body">
              {lateArrivals.length === 0 ? (
                <p>No late arrivals today.</p>
              ) : (
                <ul className="mgr-list">
                  {lateArrivals.map((p, idx) => (
                    <li key={idx}>
                      <strong>{p.name}</strong> ({p.employeeId}) –{" "}
                      {p.department}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mgr-panel">
            <div className="mgr-panel-header mgr-panel-header-green">
              <h3>Present Today</h3>
            </div>
            <div className="mgr-panel-body">
              {presentList.length === 0 ? (
                <p>No one has checked in yet.</p>
              ) : (
                <ul className="mgr-list">
                  {presentList.map((p, idx) => (
                    <li key={idx}>
                      <strong>{p.name}</strong> ({p.employeeId}) –{" "}
                      {p.department} ({p.status})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {loading && <p>Loading...</p>}
        {err && <p className="auth-error">{err}</p>}
      </main>
    </div>
  );
}

export default ManagerDashboard;
