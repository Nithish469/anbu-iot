
const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const VALID_STATUSES = [
  "ACTIVE",
  "LEAVE (ML)",
  "RESIGNED",
  "TERMINATED",
];

// Create employee — Admin route only
const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, pin } = req.body;
    const status = req.body.status || "ACTIVE";

    if (!employeeId || !name || !pin) {
      return res.status(400).json({
        message: "Employee ID, name and PIN are required",
      });
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 4 digits",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid employee status",
      });
    }

    const cleanEmployeeId = String(employeeId).trim();
    const cleanName = String(name).trim();

    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: cleanEmployeeId },
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    const pinHash = await bcrypt.hash(String(pin), 10);

    const employee = await prisma.employee.create({
      data: {
        employeeId: cleanEmployeeId,
        name: cleanName,
        pinHash,
        status,
        isActive: status === "ACTIVE",
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      message: "Failed to create employee",
    });
  }
};

// Get employees — Admin route only
const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Employees fetched successfully",
      employees,
    });
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
};

// Update employee — Admin route only
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, pin } = req.body;
    const status = req.body.status || "ACTIVE";

    if (
      !employeeId ||
      !String(employeeId).trim() ||
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        message: "Employee ID and name are required",
      });
    }

    if (pin && !/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        message: "PIN must be exactly 4 digits",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid employee status",
      });
    }

    const existing = await prisma.employee.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const cleanEmployeeId = String(employeeId).trim();
    const cleanName = String(name).trim();

    const duplicate = await prisma.employee.findUnique({
      where: { employeeId: cleanEmployeeId },
    });

    if (duplicate && duplicate.id !== String(id)) {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    const data = {
      employeeId: cleanEmployeeId,
      name: cleanName,
      status,
      isActive: status === "ACTIVE",
    };

    // Blank PIN means keep the existing PIN
    if (pin) {
      data.pinHash = await bcrypt.hash(String(pin), 10);
    }

    const employee = await prisma.employee.update({
      where: { id: String(id) },
      data,
      select: {
        id: true,
        employeeId: true,
        name: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      message: "Failed to update employee",
    });
  }
};

// Employee login using Employee ID and 4-digit PIN
const employeeLogin = async (req, res) => {
  try {
    const { employeeId, pin } = req.body;

    if (!employeeId || !pin) {
      return res.status(400).json({
        message: "Employee ID and PIN are required",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId: String(employeeId).trim() },
    });

    if (!employee) {
      return res.status(401).json({
        message: "Invalid Employee ID or PIN",
      });
    }

    const validPin = await bcrypt.compare(
      String(pin),
      employee.pinHash
    );

    if (!validPin) {
      return res.status(401).json({
        message: "Invalid Employee ID or PIN",
      });
    }

    const token = jwt.sign(
      {
        employeeId: employee.employeeId,
        role: "employee",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      message: "Employee login successful",
      token,
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
        status: employee.status || "ACTIVE",
      },
    });
  } catch (error) {
    console.error("EMPLOYEE LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Employee login failed",
    });
  }
};

// Get only the logged-in employee's attendance

const getMyAttendance = async (req, res) => {
  try {
    const employeeCode = req.employee.employeeId;

    const employee = await prisma.employee.findUnique({
      where: { employeeId: employeeCode },
      select: { id: true },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const attendance = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { attendanceDate: "desc" },
    });

    return res.status(200).json({
      message: "Your attendance fetched successfully",
      attendance,
    });
  } catch (error) {
    console.error("MY ATTENDANCE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch your attendance",
    });
  }
};


module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  employeeLogin,
  getMyAttendance,
};
