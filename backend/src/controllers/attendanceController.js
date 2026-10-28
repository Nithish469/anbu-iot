
const prisma = require("../config/database");
const bcrypt = require("bcrypt");

// ========================================
// VERIFY QR SESSION
// ========================================

const verifyQrSession = async (sessionId, token) => {
  if (!sessionId || !token) {
    return {
      valid: false,
      message: "QR session information is required",
    };
  }

  const qrSession = await prisma.qrSession.findUnique({
    where: { id: sessionId },
  });

  if (!qrSession) {
    return {
      valid: false,
      message: "Invalid QR code: session not found",
    };
  }

  if (qrSession.token !== token) {
    return {
      valid: false,
      message: "Invalid QR token",
    };
  }

  if (!qrSession.isActive) {
    return {
      valid: false,
      message:
        "QR session is inactive. Generate a new QR code and scan it.",
    };
  }

  const now = Date.now();
  const expiresAt = new Date(qrSession.expiresAt).getTime();

  if (!Number.isFinite(expiresAt) || now >= expiresAt) {
    await prisma.qrSession.updateMany({
      where: {
        id: qrSession.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return {
      valid: false,
      message: "QR code has expired. Please scan a new QR code.",
    };
  }

  return {
    valid: true,
    qrSession,
    remainingSeconds: Math.ceil((expiresAt - now) / 1000),
  };
};

// ========================================
// CHECK IN
// ========================================
const checkIn = async (req, res) => {
  try {
    const { employeeId, pin, sessionId, token } = req.body;

    if (!employeeId || !pin || !sessionId || !token) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, PIN and QR information are required",
      });
    }

    const cleanEmployeeId = employeeId.trim();
    const cleanPin = String(pin).trim();

    const qrResult = await verifyQrSession(sessionId, token);

    if (!qrResult.valid) {
      return res.status(400).json({
        success: false,
        message: qrResult.message,
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId: cleanEmployeeId },
    });

    if (!employee || !employee.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or PIN",
      });
    }

    const pinValid = await bcrypt.compare(
      cleanPin,
      employee.pinHash
    );

    if (!pinValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or PIN",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: employee.id,
          attendanceDate: today,
        },
      },
    });

    if (existingAttendance?.entryTime) {
      return res.status(400).json({
        success: false,
        message: "Employee already checked in today",
      });
    }

    const entryTime = new Date();
    let attendance;

    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          entryTime,
          qrSessionId: qrResult.qrSession.id,
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          qrSessionId: qrResult.qrSession.id,
          attendanceDate: today,
          entryTime,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Welcome ${employee.name}! Check-in successful.`,
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
      },
      attendance: {
        id: attendance.id,
        entryTime: attendance.entryTime,
      },
    });
  } catch (error) {
    console.error("CHECK-IN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check in",
      error: error.message,
    });
  }
};

// ========================================
// CHECK OUT
// ========================================
const checkOut = async (req, res) => {
  try {
    const { employeeId, pin, sessionId, token } = req.body;

    if (!employeeId || !pin || !sessionId || !token) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, PIN and QR information are required",
      });
    }

    const cleanEmployeeId = employeeId.trim();
    const cleanPin = String(pin).trim();

    const qrResult = await verifyQrSession(sessionId, token);

    if (!qrResult.valid) {
      return res.status(400).json({
        success: false,
        message: qrResult.message,
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId: cleanEmployeeId },
    });

    if (!employee || !employee.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or PIN",
      });
    }

    const pinValid = await bcrypt.compare(
      cleanPin,
      employee.pinHash
    );

    if (!pinValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or PIN",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: employee.id,
          attendanceDate: today,
        },
      },
    });

    if (!attendance || !attendance.entryTime) {
      return res.status(400).json({
        success: false,
        message: "Employee has not checked in today",
      });
    }

    if (attendance.exitTime) {
      return res.status(400).json({
        success: false,
        message: "Employee already checked out today",
      });
    }

    const exitTime = new Date();
    const entryTime = new Date(attendance.entryTime);

    const totalMinutes = Math.max(
      0,
      Math.floor(
        (exitTime.getTime() - entryTime.getTime()) / (1000 * 60)
      )
    );

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        exitTime,
        totalMinutes,
        qrSessionId: qrResult.qrSession.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Goodbye ${employee.name}! Check-out successful.`,
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
      },
      attendance: {
        id: updatedAttendance.id,
        entryTime: updatedAttendance.entryTime,
        exitTime: updatedAttendance.exitTime,
        totalMinutes: updatedAttendance.totalMinutes,
      },
      totalHours: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
    });
  } catch (error) {
    console.error("CHECK-OUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check out",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL ATTENDANCE
// ========================================
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
          },
        },
      },
      orderBy: { attendanceDate: "desc" },
    });

    return res.status(200).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

// ========================================
// GET ATTENDANCE BY EMPLOYEE
// ========================================
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
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
      message: "Employee attendance fetched successfully",
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
      },
      attendance,
    });
  } catch (error) {
    console.error("Employee attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch employee attendance",
      error: error.message,
    });
  }
};

 // ========================================
// GET EMPLOYEE REPORT
// ========================================
const getEmployeeReport = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        totalMinutes: { not: null },
      },
      orderBy: { attendanceDate: "desc" },
    });

    const totalMinutes = attendance.reduce(
      (total, record) => total + (record.totalMinutes || 0),
      0
    );

    const totalDays = attendance.length;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const averageMinutes = totalDays > 0
      ? Math.floor(totalMinutes / totalDays)
      : 0;

    const averageHours = Math.floor(averageMinutes / 60);
    const averageRemainingMinutes = averageMinutes % 60;

    return res.status(200).json({
      message: "Employee report fetched successfully",
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
      },
      report: {
        totalDays,
        totalWorkingHours: `${totalHours}h ${remainingMinutes}m`,
        averageWorkingHours: `${averageHours}h ${averageRemainingMinutes}m`,
      },
      attendance,
    });
  } catch (error) {
    console.error("Employee report error:", error);

    return res.status(500).json({
      message: "Failed to fetch employee report",
      error: error.message,
    });
  }
};

// ========================================
// MONTHLY REPORT
// ========================================
const getMonthlyReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    if (
      !selectedMonth ||
      !selectedYear ||
      selectedMonth < 1 ||
      selectedMonth > 12
    ) {
      return res.status(400).json({
        message: "Please provide valid month and year",
      });
    }

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        attendanceDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { attendanceDate: "asc" },
    });

    const totalMinutes = attendance.reduce(
      (total, record) => total + (record.totalMinutes || 0),
      0
    );

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return res.status(200).json({
      message: "Monthly report fetched successfully",
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
      },
      month: selectedMonth,
      year: selectedYear,
      report: {
        totalDays: attendance.length,
        totalWorkingHours: `${totalHours}h ${remainingMinutes}m`,
      },
      attendance,
    });
  } catch (error) {
    console.error("Monthly report error:", error);

    return res.status(500).json({
      message: "Failed to fetch monthly report",
      error: error.message,
    });
  }
};

 // ========================================
// GET TODAY'S ATTENDANCE DASHBOARD
// ========================================
const getTodayDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSunday = today.getDay() === 0;

    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    // Fetch all employees so inactive filtering does not hide the list.
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        isActive: true,
      },
      orderBy: { employeeId: "asc" },
    });

    const attendance = await prisma.attendance.findMany({
      where: {
        attendanceDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const dashboard = employees.map((employee) => {
      const record = attendance.find(
        (item) => item.employeeId === employee.id
      );

      let status = "Absent";

      if (holiday) {
        status = "Holiday";
      } else if (isSunday) {
        status = "Weekly Off";
      }

      // Attendance record takes priority over calendar status.
      if (record?.entryTime && !record?.exitTime) {
        status = "Present";
      }

      if (record?.entryTime && record?.exitTime) {
        status = "Completed";
      }

      return {
        employeeId: employee.employeeId,
        name: employee.name,
        isActive: employee.isActive,
        status,
        entryTime: record?.entryTime || null,
        exitTime: record?.exitTime || null,
        totalMinutes: record?.totalMinutes ?? 0,
        holidayName: holiday?.name || null,
      };
    });

    const summary = {
      totalEmployees: dashboard.length,
      present: dashboard.filter(
        (item) => item.status === "Present"
      ).length,
      completed: dashboard.filter(
        (item) => item.status === "Completed"
      ).length,
      absent: dashboard.filter(
        (item) => item.status === "Absent"
      ).length,
      weeklyOff: dashboard.filter(
        (item) => item.status === "Weekly Off"
      ).length,
      holiday: dashboard.filter(
        (item) => item.status === "Holiday"
      ).length,
    };

    return res.status(200).json({
      success: true,
      summary,
      employees: dashboard,
    });
  } catch (error) {
    console.error("Today's dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's dashboard",
      error: error.message,
    });
  }
};

// ========================================
// PUBLIC DASHBOARD SUMMARY
// ========================================

const getPublicDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count ALL registered employees, including inactive employees.
    // This matches the admin dashboard's employee list.
    const [totalEmployees, attendanceRecords] = await Promise.all([
      prisma.employee.count(),

      prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        select: {
          employeeId: true,
          entryTime: true,
          exitTime: true,
        },
      }),
    ]);

    // Employees who checked in today
    const checkedIn = attendanceRecords.filter(
      (record) => record.entryTime
    );

    // Employees who completed check-in and check-out
    const completed = checkedIn.filter(
      (record) => record.exitTime
    ).length;

    const present = checkedIn.length;

    // Keep the existing summary calculation:
    // total registered employees minus employees checked in today.
    const absent = Math.max(0, totalEmployees - present);

    return res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        present,
        completed,
        absent,
      },
    });
  } catch (error) {
    console.error("Public dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public dashboard summary",
    });
  }
};


// ========================================
// EXPORT
// ========================================
module.exports = {
  checkIn,
  checkOut,
  getAllAttendance,
  getEmployeeAttendance,
  getEmployeeReport,
  getMonthlyReport,
  getTodayDashboard,
  getPublicDashboardSummary,
};
