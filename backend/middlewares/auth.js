const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    // ✅ Extract token properly
    let token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization"); // 👈 ye important fix

console.log("🟢 Extracted token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // ✅ Clean "Bearer "
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
