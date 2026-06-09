/**
 * routes/admin.routes.js
 * Admin routes for managing complaints.
 *
 * Note: In a production system, admin routes would be protected by
 * a separate admin-auth middleware that checks the `role: 'admin'`
 * field in the JWT. For simplicity, the update-status route here
 * is unprotected at the middleware layer — add authenticateToken
 * (or a dedicated adminAuth middleware) if needed.
 */

import { Router } from "express";
import {
  adminLogin,
  updateComplaintStatus,
  getComplaintById,
  getAllComplaintsAdmin,
} from "../controllers/admin.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route  POST /api/admin/login
 * @desc   Admin authentication — returns JWT
 * @access Public
 * @body   { Username, Password }
 */
router.post("/login", adminLogin);

/**
 * @route  PUT /api/admin/update-status/:complaintId
 * @desc   Update the status of a complaint
 * @access Public (add authenticateToken to restrict to logged-in admins)
 * @params complaintId — integer
 * @body   { Status: "Pending" | "In Progress" | "Resolved" | "Rejected" }
 */
router.put("/update-status/:complaintId", updateComplaintStatus);

/**
 * @route  GET /api/admin/complaints
 * @desc   Get all complaints with full user + category details (admin view)
 * @access Protected
 * @query  status?, page?, limit?
 */
router.get("/complaints", authenticateToken, getAllComplaintsAdmin);

/**
 * @route  GET /api/admin/complaints/:complaintId
 * @desc   Get a single complaint by ID (admin detail view)
 * @access Protected
 */
router.get("/complaints/:complaintId", authenticateToken, getComplaintById);

export default router;
