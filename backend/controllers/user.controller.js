/**
 * controllers/user.controller.js
 * Handles user registration and login.
 * All DB access uses parameterized queries to prevent SQL injection.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../config/db.js";
import sql from "../config/db.js";

// bcrypt salt rounds — 12 is a good production balance of security vs speed
const SALT_ROUNDS = 12;

// ── Register ───────────────────────────────────────────────────────────────

/**
 * POST /api/users/register
 * Body: { FullName, Email, Password, Phone? }
 *
 * Creates a new user after:
 *  - Validating required fields
 *  - Checking for duplicate email
 *  - Hashing the password with bcrypt
 */
export const registerUser = async (req, res) => {
  const { FullName, Email, Password, Phone } = req.body;

  // ── Field validation ────────────────────────────────────────────────────
  if (!FullName || !Email || !Password) {
    return res.status(400).json({
      success: false,
      message: "FullName, Email, and Password are required.",
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }

  if (Password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  try {
    const pool = await getPool();

    // ── Duplicate email check ──────────────────────────────────────────────
    const existingUser = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT UserID FROM Users WHERE Email = @Email");

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);

    // ── Insert new user ────────────────────────────────────────────────────
    const result = await pool
      .request()
      .input("FullName", sql.NVarChar(100), FullName)
      .input("Email", sql.NVarChar(150), Email)
      .input("Password", sql.NVarChar(255), hashedPassword)
      .input("Phone", sql.NVarChar(20), Phone || null)
      .query(`
        INSERT INTO Users (FullName, Email, Password, Phone)
        OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email, INSERTED.CreatedAt
        VALUES (@FullName, @Email, @Password, @Phone)
      `);

    const newUser = result.recordset[0];

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        UserID: newUser.UserID,
        FullName: newUser.FullName,
        Email: newUser.Email,
        CreatedAt: newUser.CreatedAt,
      },
    });
  } catch (err) {
    console.error("registerUser error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// ── Login ──────────────────────────────────────────────────────────────────

/**
 * POST /api/users/login
 * Body: { Email, Password }
 *
 * Verifies credentials and returns a signed JWT on success.
 */
export const loginUser = async (req, res) => {
  const { Email, Password } = req.body;

  // ── Field validation ────────────────────────────────────────────────────
  if (!Email || !Password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required.",
    });
  }

  try {
    const pool = await getPool();

    // ── Fetch user by email ────────────────────────────────────────────────
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT UserID, FullName, Email, Password FROM Users WHERE Email = @Email");

    if (result.recordset.length === 0) {
      // Generic message — don't reveal whether the email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.recordset[0];

    // ── Compare provided password with stored hash ─────────────────────────
    const isMatch = await bcrypt.compare(Password, user.Password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Sign JWT ───────────────────────────────────────────────────────────
    const token = jwt.sign(
      { UserID: user.UserID },           // Payload
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: {
        UserID: user.UserID,
        FullName: user.FullName,
        Email: user.Email,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
