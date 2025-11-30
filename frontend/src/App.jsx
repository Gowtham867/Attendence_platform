import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import AttendencePage from "./pages/employee/AttendencePage.jsx";
import HistoryPage from "./pages/employee/HistoryPage.jsx";

import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";
import ReportsPage from "./pages/manager/ReportsPage.jsx";
import TeamCalender from "./pages/manager/TeamCalender.jsx";

function App() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role; // "employee" or "manager"

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee routes */}
      <Route
        path="/employee/dashboard"
        element={
          user && role === "employee" ? (
            <EmployeeDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee/attendance"
        element={
          user && role === "employee" ? (
            <AttendencePage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee/history"
        element={
          user && role === "employee" ? (
            <HistoryPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager/dashboard"
        element={
          user && role === "manager" ? (
            <ManagerDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/manager/reports"
        element={
          user && role === "manager" ? (
            <ReportsPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/manager/calendar"
        element={
          user && role === "manager" ? (
            <TeamCalender />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default route */}
      <Route
        path="*"
        element={
          user ? (
            role === "manager" ? (
              <Navigate to="/manager/dashboard" replace />
            ) : (
              <Navigate to="/employee/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
