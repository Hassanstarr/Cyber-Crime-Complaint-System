/**
 * controllers/admin.controller.js
 * Handles admin operations:
 *  - Admin login (returns JWT)
 *  - Update complaint status
 *  - Get complaint by ID (for detail view)
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../config/db.js";
import sql from "../config/db.js";

// All statuses allowed by the DB CHECK constraint
const VALID_STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];

// ── Admin Login ────────────────────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Body: { Username, Password }
 *
 * Authenticates an admin and returns a JWT.
 * The token payload includes AdminID and a role field for route-level
 * differentiation (not enforced at middleware level in this implementation).
 */
export const adminLogin = async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({
      success: false,
      message: "Username and Password are required.",
    });
  }

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("Username", sql.NVarChar(100), Username)
      .query("SELECT AdminID, Username, Password FROM Admins WHERE Username = @Username");

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const admin = result.recordset[0];

    // ── Compare password ──────────────────────────────────────────────────
    // Supports both bcrypt-hashed and plain passwords for legacy seed data.
    // In production all admin passwords should be hashed.
    let isMatch = false;
    const isHashed = admin.Password.startsWith("$2");
    if (isHashed) {
      isMatch = await bcrypt.compare(Password, admin.Password);
    } else {
      isMatch = Password === admin.Password; // Plain-text fallback
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // ── Sign JWT ───────────────────────────────────────────────────────────
    const token = jwt.sign(
      { AdminID: admin.AdminID, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      data: {
        AdminID: admin.AdminID,
        Username: admin.Username,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// ── Update Complaint Status ────────────────────────────────────────────────

/**
 * PUT /api/admin/update-status/:complaintId
 * Body: { Status }
 *
 * Updates the status of a complaint.
 * Only accepts values from VALID_STATUSES (matching the DB CHECK constraint).
 */
export const updateComplaintStatus = async (req, res) => {
  const { complaintId } = req.params;
  const { Status } = req.body;

  // ── Validate complaintId ────────────────────────────────────────────────
  const parsedId = parseInt(complaintId, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "complaintId must be a valid positive integer.",
    });
  }

  // ── Validate Status value ───────────────────────────────────────────────
  if (!Status) {
    return res.status(400).json({
      success: false,
      message: "Status field is required.",
    });
  }

  if (!VALID_STATUSES.includes(Status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
    });
  }

  try {
    const pool = await getPool();

    // ── Check complaint exists ─────────────────────────────────────────────
    const existing = await pool
      .request()
      .input("ComplaintID", sql.Int, parsedId)
      .query("SELECT ComplaintID, Status FROM Complaints WHERE ComplaintID = @ComplaintID");

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Complaint with ID ${parsedId} not found.`,
      });
    }

    const currentStatus = existing.recordset[0].Status;

    // ── Prevent redundant update ───────────────────────────────────────────
    if (currentStatus === Status) {
      return res.status(400).json({
        success: false,
        message: `Complaint is already in '${Status}' status.`,
      });
    }

    // ── Perform the update ─────────────────────────────────────────────────
    const result = await pool
      .request()
      .input("Status", sql.NVarChar(20), Status)
      .input("ComplaintID", sql.Int, parsedId)
      .query(`
        UPDATE Complaints
        SET Status = @Status
        OUTPUT
          INSERTED.ComplaintID,
          INSERTED.Status,
          INSERTED.UserID,
          INSERTED.Title
        WHERE ComplaintID = @ComplaintID
      `);

    const updated = result.recordset[0];

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to '${Status}' successfully.`,
      data: {
        ComplaintID: updated.ComplaintID,
        Title: updated.Title,
        PreviousStatus: currentStatus,
        NewStatus: updated.Status,
      },
    });
  } catch (err) {
    console.error("updateComplaintStatus error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// ── Get Single Complaint (Admin Detail View) ───────────────────────────────

/**
 * GET /api/admin/complaints/:complaintId
 *
 * Returns full detail for a single complaint including user and category info.
 */
export const getComplaintById = async (req, res) => {
  const { complaintId } = req.params;

  const parsedId = parseInt(complaintId, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "complaintId must be a valid positive integer.",
    });
  }

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("ComplaintID", sql.Int, parsedId)
      .query(`
        SELECT
          c.ComplaintID,
          u.UserID,
          u.FullName    AS UserFullName,
          u.Email       AS UserEmail,
          u.Phone       AS UserPhone,
          cat.CategoryID,
          cat.CategoryName,
          c.Title,
          c.Description,
          c.Status,
          c.CreatedAt
        FROM Complaints c
          INNER JOIN Users      u   ON c.UserID     = u.UserID
          INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID
        WHERE c.ComplaintID = @ComplaintID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Complaint with ID ${parsedId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("getComplaintById error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// ── Get All Complaints (Admin Dashboard) ──────────────────────────────────

/**
 * GET /api/admin/complaints
 * Optional query: ?status=Pending&page=1&limit=20
 *
 * Admin view — includes full user details alongside complaint data.
 */
export const getAllComplaintsAdmin = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  try {
    const pool = await getPool();
    const request = pool.request();

    let whereClause = "";
    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClause = "WHERE c.Status = @Status";
    }

    request.input("Offset", sql.Int, offset);
    request.input("Limit", sql.Int, limitNum);

    const result = await request.query(`
      SELECT
        c.ComplaintID,
        u.FullName     AS UserFullName,
        u.Email        AS UserEmail,
        u.Phone        AS UserPhone,
        cat.CategoryName,
        c.Title,
        c.Description,
        c.Status,
        c.CreatedAt
      FROM Complaints c
        INNER JOIN Users      u   ON c.UserID     = u.UserID
        INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID
      ${whereClause}
      ORDER BY c.CreatedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY
    `);

    const countRequest = pool.request();
    if (status) countRequest.input("Status", sql.NVarChar(20), status);

    const countResult = await countRequest.query(
      `SELECT COUNT(*) AS Total FROM Complaints c ${whereClause}`
    );

    return res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: {
        total: countResult.recordset[0].Total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult.recordset[0].Total / limitNum),
      },
    });
  } catch (err) {
    console.error("getAllComplaintsAdmin error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
