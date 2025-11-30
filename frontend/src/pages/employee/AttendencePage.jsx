import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { logout } from "../../store/authSlice";

function AttendencePage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const fetchToday = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get("/attendance/today");
      setTodayData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load today's attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);
    setMessage("");
    try {
      const res = await axiosClient.post("/attendance/checkin");
      setMessage(res.data?.message || "Checked in successfully");
      await fetchToday();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to check in. Try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError(null);
    setMessage("");
    try {
      const res = await axiosClient.post("/attendance/checkout");
      setMessage(res.data?.message || "Checked out successfully");
      await fetchToday();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to check out. Try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Use backend status but fall back safely
  const todayStatus = todayData?.status || "not_marked";

  // ✅ Better conditions: allow check-in if there is NO checkInTime yet
  const canCheckIn = !todayData?.checkInTime;
  // ✅ Allow checkout only after check-in and before checkout
  const canCheckOut = !!todayData?.checkInTime && !todayData?.checkOutTime;

  const formatTime = (val) =>
    val
      ? new Date(val).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const name = user?.name || "Employee";

  // For display only
  const statusLabel =
    todayStatus === "present"
      ? "Present"
      : todayStatus === "late"
      ? "Late"
      : todayStatus === "half-day"
      ? "Half Day"
      : todayStatus === "absent"
      ? "Absent"
      : "Not Marked";

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-circle">🕒</div>
          <span className="app-logo-text">AttendEase</span>
        </div>

        <nav className="app-nav">
          <Link to="/employee/dashboard" className="app-nav-link">
            Dashboard
          </Link>
          <span className="app-nav-link active">Mark Attendance</span>
          <Link to="/employee/history" className="app-nav-link">
            My History
          </Link>
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
            <h2 className="emp-hero-title">Mark Attendance</h2>
            <p className="emp-hero-subtitle">
              Check in and out to record your working hours for today.
            </p>
          </div>
        </section>

        <section className="emp-card">
          <div className="emp-card-header">
            <div className="emp-card-title-wrapper">
              <span className="emp-card-icon">📍</span>
              <h3 className="emp-card-title">Today&apos;s Attendance</h3>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p style={{ fontSize: 14, marginBottom: 12 }}>
                <strong>Date:</strong> {todayData?.date || "N/A"}
                <br />
                <strong>Status:</strong> {statusLabel}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div className="auth-label">Check In Time</div>
                  <div>{formatTime(todayData?.checkInTime)}</div>
                </div>
                <div>
                  <div className="auth-label">Check Out Time</div>
                  <div>{formatTime(todayData?.checkOutTime)}</div>
                </div>
                <div>
                  <div className="auth-label">Total Hours</div>
                  <div>{todayData?.totalHours?.toFixed?.(2) || "0.00"} h</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="auth-button"
                  style={{ maxWidth: 180 }}
                  disabled={!canCheckIn || actionLoading}
                  onClick={handleCheckIn}
                >
                  {actionLoading ? "Processing..." : "Check In"}
                </button>

                <button
                  className="auth-button"
                  style={{
                    maxWidth: 180,
                    backgroundColor: "#111827",
                  }}
                  disabled={!canCheckOut || actionLoading}
                  onClick={handleCheckOut}
                >
                  {actionLoading ? "Processing..." : "Check Out"}
                </button>
              </div>

              {message && (
                <p
                  style={{
                    marginTop: 10,
                    color: "#16a34a",
                    fontSize: 13,
                  }}
                >
                  {message}
                </p>
              )}

              {error && <p className="auth-error">{error}</p>}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AttendencePage;
