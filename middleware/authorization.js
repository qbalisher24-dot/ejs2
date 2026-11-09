const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    if (token.split(" ")[0] !== "Bearer") {
      return res.status(401).json({ message: "Bearer token is required" });
    }

    const decode = jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);

    if (decode.role !== "admin") {
      return res.status(403).json({ message: "You are not admin" });
    }

    // Tiklashda qo'shilgan: ruxsat berilgan so'rov controllerga o'tishi uchun.
    // Videoning so'nggi saqlangan holatida borligini tasdiqlashning iloji bo'lmadi.
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
