
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./src/routes/employeeRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const qrRoutes = require("./src/routes/qrRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const holidayRoutes = require("./src/routes/holidayRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/holidays", holidayRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
