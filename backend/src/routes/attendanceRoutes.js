const express = require("express");
const router = express.Router();
const { protect, managerOnly } = require("../middleware/authMiddleware");
const attendanceController = require("../controllers/attendanceController");

// Employee
router.post("/checkin", protect, attendanceController.checkIn);
router.post("/checkout", protect, attendanceController.checkOut);
router.get("/my-history", protect, attendanceController.getMyHistory);
router.get("/my-summary", protect, attendanceController.getMySummary);
router.get("/today", protect, attendanceController.getMyTodayStatus);

// Manager
router.get("/all", protect, managerOnly, attendanceController.getAllAttendance);
router.get(
  "/employee/:id",
  protect,
  managerOnly,
  attendanceController.getEmployeeAttendance
);
router.get(
  "/summary",
  protect,
  managerOnly,
  attendanceController.getTeamSummary
);
router.get(
  "/export",
  protect,
  managerOnly,
  attendanceController.exportCSV
);
router.get(
  "/today-status",
  protect,
  managerOnly,
  attendanceController.getTodayStatus
);

module.exports = router;
