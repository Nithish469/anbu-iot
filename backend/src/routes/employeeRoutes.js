const express = require("express");

const {
  createEmployee,
  getEmployees,
  updateEmployee,
  employeeLogin,
  getMyAttendance,
} = require("../controllers/employeeController");

const requireAdmin = require("../middleware/adminAuth");
const requireEmployee = require("../middleware/employeeAuth");

const router = express.Router();

// Public employee login
router.post("/login", employeeLogin);

// Logged-in employee can see only their own attendance
router.get("/me/attendance", requireEmployee, getMyAttendance);

// Admin-only employee management
router.post("/", requireAdmin, createEmployee);
router.get("/", requireAdmin, getEmployees);
router.put("/:id", requireAdmin, updateEmployee);
module.exports = router;
