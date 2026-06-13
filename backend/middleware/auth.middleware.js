/**
 * middleware/auth.middleware.js
 * Two middlewares:
 *  - authenticateToken → any valid JWT (users + admins)
 *  - authorizeAdmin    → JWT must have role: 'admin'
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ── Verify any valid JWT ───────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { UserID, iat, exp }  OR  { AdminID, role:'admin', iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// ── Verify JWT AND confirm role is admin ───────────────────────────────────
const authorizeAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User tokens have UserID but no role field
    // Admin tokens have AdminID and role: 'admin'
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export { authenticateToken, authorizeAdmin };
export default authenticateToken;