/**
 * routes/complaint.routes.js
 * All complaint routes require authentication.
 * Users can only see their own complaints.
 */

import { Router } from "express";
import {
  createComplaint,
  getMyComplaints,
} from "../controllers/complaint.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route  POST /api/complaints
 * @desc   Submit a new complaint
 * @access Private
 */
router.post("/", authenticateToken, createComplaint);

/**
 * @route  GET /api/complaints/my
 * @desc   Get all complaints belonging to the logged-in user
 * @access Private
 */
router.get("/my", authenticateToken, getMyComplaints);

export default router;