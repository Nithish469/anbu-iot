
require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../config/database");

async function createAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env"
      );
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters long"
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash },
    });

    console.log(`Admin account ready: ${admin.username}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
