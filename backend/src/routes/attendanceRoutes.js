
const express = require("express");

const {
  checkIn,
  checkOut,
  getAllAttendance,
  getEmployeeAttendance,
  getEmployeeReport,
  getMonthlyReport,
  getTodayDashboard,
  getPublicDashboardSummary,
} = require("../controllers/attendanceController");

const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Employee attendance actions — public
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

// Attendance records and reports — admin only
router.get("/", requireAdmin, getAllAttendance);

router.get(
  "/employee/:employeeId",
  requireAdmin,
  getEmployeeAttendance
);

router.get(
  "/employee/:employeeId/report",
  requireAdmin,
  getEmployeeReport
);

router.get(
  "/employee/:employeeId/monthly",
  requireAdmin,
  getMonthlyReport
);

router.get("/dashboard", requireAdmin, getTodayDashboard);

// Public attendance summary
router.get("/public-summary", getPublicDashboardSummary);

module.exports = router;
