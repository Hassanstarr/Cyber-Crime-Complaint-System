/**
 * routes/user.routes.js
 * Public user authentication routes.
 * No business logic here — all logic is in the controller.
 */

import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = Router();

/**
 * @route  POST /api/users/register
 * @desc   Register a new user
 * @access Public
 * @body   { FullName, Email, Password, Phone? }
 */
router.post("/register", registerUser);

/**
 * @route  POST /api/users/login
 * @desc   Authenticate user and return JWT
 * @access Public
 * @body   { Email, Password }
 */
router.post("/login", loginUser);

export default router;
