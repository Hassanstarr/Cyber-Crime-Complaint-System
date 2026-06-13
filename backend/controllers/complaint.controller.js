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

// ── Get MY Complaints (authenticated user sees only their own) ─────────────

/**
 * GET /api/complaints/my
 * Auth: Required
 * Returns only complaints belonging to the logged-in user (via JWT).
 */
export const getMyComplaints = async (req, res) => {
  const UserID = req.user.UserID; // from JWT — cannot be faked

  const { status, page = 1, limit = 20 } = req.query;

  const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
    });
  }

  const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset   = (pageNum - 1) * limitNum;

  try {
    const pool    = await getPool();
    const request = pool.request();

    request.input("UserID", sql.Int, UserID);
    request.input("Offset", sql.Int, offset);
    request.input("Limit",  sql.Int, limitNum);

    let whereClause = "WHERE c.UserID = @UserID";
    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClause += " AND c.Status = @Status";
    }

    const result = await request.query(`
      SELECT
        c.ComplaintID,
        cat.CategoryID,
        c.Title,
        c.Description,
        c.Status,
        c.CreatedAt
      FROM Complaints c
        INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID
      ${whereClause}
      ORDER BY c.CreatedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY
    `);

    const countReq = pool.request().input("UserID", sql.Int, UserID);
    if (status) countReq.input("Status", sql.NVarChar(20), status);

    const countResult = await countReq.query(
      `SELECT COUNT(*) AS Total FROM Complaints c ${whereClause}`
    );

    const total = countResult.recordset[0].Total;

    return res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getMyComplaints error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};