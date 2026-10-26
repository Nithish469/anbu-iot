
const express = require("express");
const {
  getHolidays,
  createHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", requireAdmin, getHolidays);
router.post("/", requireAdmin, createHoliday);
router.delete("/:id", requireAdmin, deleteHoliday);

module.exports = router;
