/**
 * controllers/complaint.controller.js
 * Handles complaint creation and retrieval.
 * Complaint creation is a protected route — req.user is set by auth middleware.
 */

import { getPool } from "../config/db.js";
import sql from "../config/db.js";

// ── Create Complaint ───────────────────────────────────────────────────────

/**
 * POST /api/complaints
 * Body: { CategoryID, Title, Description }
 * Auth: Required (Bearer token)
 *
 * Creates a new complaint linked to the authenticated user.
 * Status defaults to 'Pending' (enforced at DB level, not set here).
 */
/*
  const categories = [
    "Online Fraud", //1
    "Cyberbullying", //2
    "Identity Theft", //3
    "Hacking", //4
    "Phishing", //5
    "Ransomware", //6
    "Child Exploitation", //7
    "Other", //8
  ]; // The Categories table is pre-seeded with these values, and CategoryID must reference one of them.
*/
export const createComplaint = async (req, res) => {
  const { CategoryID, Title, Description } = req.body;
  const UserID = req.user.UserID; // Injected by authenticateToken middleware

  // ── Field validation ────────────────────────────────────────────────────
  if (!CategoryID || !Title || !Description) {
    return res.status(400).json({
      success: false,
      message: "CategoryID, Title, and Description are required.",
    });
  }

  if (typeof Title !== "string" || Title.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Title cannot be empty." });
  }

  if (typeof Description !== "string" || Description.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Description cannot be empty." });
  }

  try {
    const pool = await getPool();

    // ── Verify the category exists ─────────────────────────────────────────
    const categoryCheck = await pool
      .request()
      .input("CategoryID", sql.Int, CategoryID)
      .query("SELECT CategoryID FROM Categories WHERE CategoryID = @CategoryID");

    if (categoryCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${CategoryID} does not exist.`,
      });
    }

    // ── Insert complaint ───────────────────────────────────────────────────
    // Status is intentionally omitted — the DB DEFAULT ('Pending') handles it
    const result = await pool
      .request()
      .input("UserID", sql.Int, UserID)
      .input("CategoryID", sql.Int, CategoryID)
      .input("Title", sql.NVarChar(200), Title.trim())
      .input("Description", sql.NVarChar(sql.MAX), Description.trim())
      .query(`
        INSERT INTO Complaints (UserID, CategoryID, Title, Description)
        OUTPUT
          INSERTED.ComplaintID,
          INSERTED.UserID,
          INSERTED.CategoryID,
          INSERTED.Title,
          INSERTED.Status,
          INSERTED.CreatedAt
        VALUES (@UserID, @CategoryID, @Title, @Description)
      `);

    const complaint = result.recordset[0];

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      data: complaint,
    });
  } catch (err) {
    console.error("createComplaint error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// ── Get All Complaints ─────────────────────────────────────────────────────

/**
 * GET /api/complaints
 * Public route (no auth required).
 * Optional query params: ?status=Pending&page=1&limit=20
 *
 * Returns all complaints with user full name and category name
 * via INNER JOINs. Supports optional status filtering and pagination.
 */
export const getAllComplaints = async (req, res) => {
  // Optional filters from query string
  const { status, page = 1, limit = 20 } = req.query;

  // Valid statuses matching the DB CHECK constraint
  const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status filter. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Ensure page and limit are positive integers
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  try {
    const pool = await getPool();
    const request = pool.request();

    // ── Build query dynamically (still parameterized) ──────────────────────
    let whereClause = "";
    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClause = "WHERE c.Status = @Status";
    }

    request.input("Offset", sql.Int, offset);
    request.input("Limit", sql.Int, limitNum);

    // ── Main SELECT with JOINs ─────────────────────────────────────────────
    const result = await request.query(`
      SELECT
        c.ComplaintID,
        u.FullName    AS UserFullName,
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

    // ── Count total records for pagination meta ────────────────────────────
    const countRequest = pool.request();
    if (status) {
      countRequest.input("Status", sql.NVarChar(20), status);
    }
    const countResult = await countRequest.query(`
      SELECT COUNT(*) AS Total
      FROM Complaints c
      ${whereClause}
    `);

    const total = countResult.recordset[0].Total;

    return res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getAllComplaints error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
