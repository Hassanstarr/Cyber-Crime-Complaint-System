/**
 * routes/complaint.routes.js
 */

import { Router } from "express";
import { createComplaint, getMyComplaints } from "../controllers/complaint.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: File a new cyber crime complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComplaintRequest'
 *     responses:
 *       201:
 *         description: Complaint submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: No token provided or token expired
 *       403:
 *         description: Invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticateToken, createComplaint);

/**
 * @swagger
 * /api/complaints/my:
 *   get:
 *     summary: Get all complaints filed by the logged-in user
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved, Rejected]
 *         description: Filter complaints by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page (max 100)
 *     responses:
 *       200:
 *         description: List of user's own complaints
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedComplaints'
 *       401:
 *         description: No token or expired token
 *       403:
 *         description: Invalid token
 *       500:
 *         description: Internal server error
 */
router.get("/my", authenticateToken, getMyComplaints);

export default router;