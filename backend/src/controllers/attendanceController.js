const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { formatDate } = require("../utils/dateUtils");
const { attendanceToCSV } = require("../utils/csvExporter");

// Mark Check-in
exports.checkIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = formatDate(new Date());

    let record = await Attendance.findOne({ userId, date: today });

    if (record && record.checkInTime) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const officeStart = new Date();
    officeStart.setHours(9, 30, 0, 0); // 9:30 AM as start time

    const status = now > officeStart ? "late" : "present";

    if (!record) {
      record = await Attendance.create({
        userId,
        date: today,
        checkInTime: now,
        status,
      });
    } else {
      record.checkInTime = now;
      record.status = status;
      await record.save();
    }

    res.status(200).json({ message: "Checked in", record });
  } catch (error) {
    next(error);
  }
};

// Mark Check-out
exports.checkOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = formatDate(new Date());
    const record = await Attendance.findOne({ userId, date: today });

    if (!record || !record.checkInTime) {
      return res
        .status(400)
        .json({ message: "You must check in before checking out" });
    }

    if (record.checkOutTime) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    record.checkOutTime = now;

    const diffMs = now - record.checkInTime;
    const hours = diffMs / (1000 * 60 * 60);
    record.totalHours = Number(hours.toFixed(2));

    // half-day logic (example)
    if (record.totalHours < 4) {
      record.status = "half-day";
    }

    await record.save();

    res.status(200).json({ message: "Checked out", record });
  } catch (error) {
    next(error);
  }
};

// Employee: My history
exports.getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    let filter = { userId };

    if (month && year) {
      const m = String(month).padStart(2, "0");
      const prefix = `${year}-${m}-`;
      filter.date = { $regex: `^${prefix}` };
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .lean();

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// Employee: My summary for month
exports.getMySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;
    const now = new Date();

    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;
    const mStr = String(m).padStart(2, "0");
    const prefix = `${y}-${mStr}-`;

    const records = await Attendance.find({
      userId,
      date: { $regex: `^${prefix}` },
    }).lean();

    let present = 0,
      absent = 0,
      late = 0,
      halfDay = 0,
      totalHours = 0;

    records.forEach((r) => {
      if (r.status === "present") present++;
      if (r.status === "absent") absent++;
      if (r.status === "late") late++;
      if (r.status === "half-day") halfDay++;
      totalHours += r.totalHours || 0;
    });

    res.json({
      month: m,
      year: y,
      present,
      absent,
      late,
      halfDay,
      totalHours: Number(totalHours.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

// Employee: Today's status
exports.getMyTodayStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = formatDate(new Date());

    const record = await Attendance.findOne({ userId, date: today }).lean();

    if (!record) {
      return res.json({
        date: today,
        status: "not_marked",
        checkedIn: false,
        checkedOut: false,
      });
    }

    res.json({
      date: today,
      status: record.status,
      checkedIn: !!record.checkInTime,
      checkedOut: !!record.checkOutTime,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Manager: All attendance with filters
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, employeeId, status } = req.query;

    const filter = {};

    if (date) {
      filter.date = date;
    }
    if (status) {
      filter.status = status;
    }

    let query = Attendance.find(filter).populate("userId", "-password");

    let records = await query.lean();

    if (employeeId) {
      records = records.filter(
        (r) => r.userId && r.userId.employeeId === employeeId
      );
    }

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// Manager: Specific employee attendance
exports.getEmployeeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params; // userId
    const { startDate, endDate } = req.query;

    const filter = { userId: id };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate("userId", "-password")
      .lean();

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// Manager: Team summary
exports.getTeamSummary = async (req, res, next) => {
  try {
    const today = formatDate(new Date());

    const records = await Attendance.find({ date: today })
      .populate("userId", "-password")
      .lean();

    let present = 0,
      absent = 0,
      late = 0,
      halfDay = 0;

    records.forEach((r) => {
      if (r.status === "present") present++;
      if (r.status === "absent") absent++;
      if (r.status === "late") late++;
      if (r.status === "half-day") halfDay++;
    });

    res.json({
      date: today,
      present,
      absent,
      late,
      halfDay,
    });
  } catch (error) {
    next(error);
  }
};

// Manager: CSV export
exports.exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    let records = await Attendance.find(filter)
      .populate("userId", "-password")
      .lean();

    if (employeeId) {
      records = records.filter(
        (r) => r.userId && r.userId.employeeId === employeeId
      );
    }

    const csv = attendanceToCSV(records);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Manager: Who's present today
exports.getTodayStatus = async (req, res, next) => {
  try {
    const today = formatDate(new Date());

    const employees = await User.find({ role: "employee" }).lean();
    const attendance = await Attendance.find({ date: today }).lean();

    const map = new Map();
    attendance.forEach((a) => {
      map.set(String(a.userId), a);
    });

    const result = employees.map((emp) => {
      const rec = map.get(String(emp._id));
      return {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        status: rec ? rec.status : "absent",
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
