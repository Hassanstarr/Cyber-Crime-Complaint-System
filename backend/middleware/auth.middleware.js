/**
 * middleware/auth.middleware.js
 * Verifies the JWT bearer token on protected routes.
 * Attaches the decoded payload to `req.user` on success.
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * authenticateToken
 * Express middleware that:
 *  1. Reads the Authorization header  (Bearer <token>)
 *  2. Verifies the token with JWT_SECRET
 *  3. Attaches decoded payload → req.user
 *  4. Calls next() on success, returns 401/403 on failure
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Expect header format:  Authorization: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { UserID, iat, exp }
    next();
  } catch (err) {
    // Distinguish between expired and otherwise invalid tokens
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

export default authenticateToken;
