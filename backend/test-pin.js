
require("dotenv").config();

const prisma = require("./src/config/database");
const bcrypt = require("bcrypt");

async function resetPin() {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeId: "AIOT2605" },
    });

    if (!employee) {
      console.log("Employee AIOT2605 not found");
      return;
    }

    const newPinHash = await bcrypt.hash("1234", 10);

    await prisma.employee.update({
      where: { employeeId: "AIOT2605" },
      data: { pinHash: newPinHash },
    });

    const updatedEmployee = await prisma.employee.findUnique({
      where: { employeeId: "AIOT2605" },
    });

    const verified = await bcrypt.compare(
      "1234",
      updatedEmployee.pinHash
    );

    console.log("PIN reset complete");
    console.log("Employee ID:", updatedEmployee.employeeId);
    console.log("PIN 1234 matches:", verified);
  } catch (error) {
    console.error("PIN RESET ERROR:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPin();
