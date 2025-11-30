const express = require("express");
const router = express.Router();
const { protect, managerOnly } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// Employee dashboard stats
router.get("/employee", protect, dashboardController.getEmployeeDashboard);

// Manager dashboard stats
router.get("/manager", protect, managerOnly, dashboardController.getManagerDashboard);

module.exports = router;
