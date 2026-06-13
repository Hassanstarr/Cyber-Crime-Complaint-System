/**
 * routes/admin.routes.js
 * All routes that require authentication use authorizeAdmin —
 * a user JWT will be rejected with 403.
 */

import { Router } from "express";
import {
  adminLogin,
  updateComplaintStatus,
  getComplaintById,
  getAllComplaintsAdmin,
} from "../controllers/admin.controller.js";
import { authorizeAdmin } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login as admin and receive a JWT token
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", adminLogin);

/**
 * @swagger
 * /api/admin/update-status/{complaintId}:
 *   put:
 *     summary: Update the status of a complaint (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value or same status
 *       401:
 *         description: No token or expired token
 *       403:
 *         description: Invalid token or not an admin
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Internal server error
 */
router.put("/update-status/:complaintId", authorizeAdmin, updateComplaintStatus);

/**
 * @swagger
 * /api/admin/complaints:
 *   get:
 *     summary: Get all complaints — admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved, Rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: All complaints with user and category info
 *       401:
 *         description: No token or expired token
 *       403:
 *         description: Invalid token or not an admin
 *       500:
 *         description: Internal server error
 */
router.get("/complaints", authorizeAdmin, getAllComplaintsAdmin);

/**
 * @swagger
 * /api/admin/complaints/{complaintId}:
 *   get:
 *     summary: Get a single complaint by ID — admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Full complaint detail
 *       401:
 *         description: No token or expired token
 *       403:
 *         description: Invalid token or not an admin
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Internal server error
 */
router.get("/complaints/:complaintId", authorizeAdmin, getComplaintById);

export default router;