import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../store/authSlice";
import "./Auth.css";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser(form)).unwrap();

      // ⭐ Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN ERROR >>>", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-icon">
          <span>🕒</span>
        </div>
        <h1 className="auth-title">AttendEase</h1>
        <p className="auth-subtitle">Employee Attendance Management System</p>
      </div>

      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button className="auth-tab auth-tab-active">Login</button>
          <Link to="/register" className="auth-tab auth-tab-link">
            Sign Up
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="form-error">
              {typeof error === "string"
                ? error
                : error.message || "Login failed. Try again."}
            </p>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
