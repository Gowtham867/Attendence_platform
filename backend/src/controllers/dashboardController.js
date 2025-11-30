// backend/src/controllers/dashboardController.js
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { formatDate } = require("../utils/dateUtils");

// Helper to get YYYY-MM for current month
const getYearMonthPrefix = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-`; // e.g. 2025-11-
};

// ---------- EMPLOYEE DASHBOARD ----------
exports.getEmployeeDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const today = formatDate(new Date());
    const monthPrefix = getYearMonthPrefix(new Date());

    // All this month's records for this user
    const monthRecords = await Attendance.find({
      userId: user._id,
      date: { $regex: `^${monthPrefix}` },
    }).sort({ date: 1 });

    let present = 0;
    let absent = 0;
    let late = 0;
    let totalHours = 0;

    monthRecords.forEach((r) => {
      if (r.status === "present") present++;
      if (r.status === "absent") absent++;
      if (r.status === "late") late++;
      totalHours += r.totalHours || 0;
    });

    const todayRecord = await Attendance.findOne({
      userId: user._id,
      date: today,
    });

    const todayStatus = todayRecord
      ? todayRecord.status
      : "not_checked_in";

    // Last 7 days
    const last7 = await Attendance.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // Attendance rate (simple: present days / total records)
    const totalMarkedDays = monthRecords.length || 1;
    const attendanceRate = Math.round((present / totalMarkedDays) * 100);

    res.json({
      user: {
        id: user._id,
        name: user.name,
      },
      monthSummary: {
        present,
        absent,
        late,
        totalHours: Number(totalHours.toFixed(2)),
      },
      today: {
        status: todayStatus, // present / absent / late / half-day / not_checked_in
      },
      attendanceRate,
      recent: last7.reverse(), // oldest -> newest
    });
  } catch (err) {
    next(err);
  }
};

// ---------- MANAGER DASHBOARD ----------
exports.getManagerDashboard = async (req, res, next) => {
  try {
    const today = formatDate(new Date());
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Total employees
    const totalEmployees = await User.countDocuments({ role: "employee" });

    // Today's attendance
    const todayRecords = await Attendance.find({ date: today }).populate(
      "userId",
      "name department employeeId"
    );

    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;

    todayRecords.forEach((r) => {
      if (r.status === "present" || r.status === "half-day") presentToday++;
      if (r.status === "absent") absentToday++;
      if (r.status === "late") lateToday++;
    });

    // Department distribution (simple count)
    const employees = await User.find({ role: "employee" }).lean();
    const deptMap = {};
    employees.forEach((e) => {
      const dep = e.department || "Unassigned";
      deptMap[dep] = (deptMap[dep] || 0) + 1;
    });

    const departmentDistribution = Object.entries(deptMap).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // Weekly trend (just placeholder counts for now, you can improve later)
    const weeklyTrend = weekDays.map((d) => ({
      day: d,
      present: 0,
      absent: 0,
    }));

    // Late arrivals list (today)
    const lateArrivals = todayRecords
      .filter((r) => r.status === "late")
      .map((r) => ({
        name: r.userId?.name,
        employeeId: r.userId?.employeeId,
        department: r.userId?.department,
        checkInTime: r.checkInTime,
      }));

    // Present today list
    const presentList = todayRecords
      .filter(
        (r) =>
          r.status === "present" ||
          r.status === "late" ||
          r.status === "half-day"
      )
      .map((r) => ({
        name: r.userId?.name,
        employeeId: r.userId?.employeeId,
        department: r.userId?.department,
        status: r.status,
      }));

    res.json({
      cards: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
      },
      weeklyTrend,
      departmentDistribution,
      lateArrivals,
      presentList,
      today,
    });
  } catch (err) {
    next(err);
  }
};
