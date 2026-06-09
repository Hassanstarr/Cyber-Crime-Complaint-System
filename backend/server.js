/**
 * server.js
 * Application entry point.
 * Initialises the DB pool, wires up middleware, mounts all routes,
 * and starts the HTTP server.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool } from "./config/db.js";

// ── Route imports ──────────────────────────────────────────────────────────
import userRoutes      from "./routes/user.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import adminRoutes     from "./routes/admin.routes.js";

// Load environment variables from .env before anything else
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ──────────────────────────────────────────────────────

// CORS — allow all origins in development; tighten in production
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form-based clients if needed)
app.use(express.urlencoded({ extended: true }));

// ── Health-check route ─────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Cyber Crime Complaint Management System API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use("/api/users",      userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin",      adminRoutes);

// ── 404 handler — catches any unmatched route ──────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ── Global error handler ───────────────────────────────────────────────────
// Catches any error passed via next(err) from async route handlers
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
});

// ── Bootstrap ──────────────────────────────────────────────────────────────
const startServer = async () => {
  // Establish the DB connection pool before accepting requests
  await getPool();

  app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📋  Health check: http://localhost:${PORT}/health`);
    console.log("─────────────────────────────────────────────");
    console.log("Available endpoints:");
    console.log("  POST   /api/users/register");
    console.log("  POST   /api/users/login");
    console.log("  POST   /api/complaints          [JWT required]");
    console.log("  GET    /api/complaints");
    console.log("  POST   /api/admin/login");
    console.log("  PUT    /api/admin/update-status/:id");
    console.log("  GET    /api/admin/complaints    [JWT required]");
    console.log("  GET    /api/admin/complaints/:id [JWT required]");
    console.log("─────────────────────────────────────────────");
  });
};

startServer();
