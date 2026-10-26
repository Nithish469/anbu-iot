const jwt = require("jsonwebtoken");

const requireEmployee = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Employee login required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "employee" || !decoded.employeeId) {
      return res.status(403).json({
        message: "Employee access only",
      });
    }

    req.employee = {
      employeeId: decoded.employeeId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired employee login",
    });
  }
};

module.exports = requireEmployee;
