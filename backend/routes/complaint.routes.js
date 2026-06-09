/**
 * routes/complaint.routes.js
 * Complaint routes.
 * POST /  is protected by authenticateToken middleware.
 * GET  /  is public (anyone can view complaints).
 */

import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
} from "../controllers/complaint.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route  POST /api/complaints
 * @desc   Submit a new complaint
 * @access Private (JWT required)
 * @body   { CategoryID, Title, Description }
 */
router.post("/", authenticateToken, createComplaint);

/**
 * @route  GET /api/complaints
 * @desc   Get all complaints with user and category info
 * @access Public
 * @query  status? (Pending | In Progress | Resolved | Rejected)
 * @query  page?  (default: 1)
 * @query  limit? (default: 20, max: 100)
 */
router.get("/", getAllComplaints);

export default router;
