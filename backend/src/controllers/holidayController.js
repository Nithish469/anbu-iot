
const prisma = require("../config/database");

const getHolidays = async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: "asc" },
    });

    return res.status(200).json({ holidays });
  } catch (error) {
    console.error("GET HOLIDAYS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch holidays" });
  }
};

const createHoliday = async (req, res) => {
  try {
    const { date, name, description } = req.body;

    if (!date || !name?.trim()) {
      return res.status(400).json({
        message: "Holiday date and name are required",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid holiday date" });
    }

    const holiday = await prisma.holiday.create({
      data: {
        date: parsedDate,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return res.status(201).json({
      message: "Holiday added successfully",
      holiday,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A holiday already exists on this date",
      });
    }

    console.error("CREATE HOLIDAY ERROR:", error);
    return res.status(500).json({ message: "Failed to add holiday" });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.holiday.delete({ where: { id } });

    return res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Holiday not found" });
    }

    console.error("DELETE HOLIDAY ERROR:", error);
    return res.status(500).json({ message: "Failed to delete holiday" });
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  deleteHoliday,
};
