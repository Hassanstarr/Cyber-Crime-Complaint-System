/**
 * config/swagger.js
 * Swagger/OpenAPI 3.0 definition for the Cyber Crime Complaint Management API.
 */

import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cyber Crime Complaint Management API",
      version: "1.0.0",
      description:
        "REST API for filing and managing cyber crime complaints. Built with Node.js, Express, and Microsoft SQL Server.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token. Get it from /api/users/login or /api/admin/login",
        },
      },
      schemas: {
        // ── User schemas ──────────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["FullName", "Email", "Password"],
          properties: {
            FullName:  { type: "string", example: "Ali Hassan" },
            Email:     { type: "string", example: "ali@gmail.com" },
            Password:  { type: "string", example: "123456" },
            Phone:     { type: "string", example: "03001234567" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["Email", "Password"],
          properties: {
            Email:    { type: "string", example: "ali@gmail.com" },
            Password: { type: "string", example: "123456" },
          },
        },
        AdminLoginRequest: {
          type: "object",
          required: ["Username", "Password"],
          properties: {
            Username: { type: "string", example: "admin" },
            Password: { type: "string", example: "admin123" },
          },
        },
        // ── Complaint schemas ─────────────────────────────────────────────
        CreateComplaintRequest: {
          type: "object",
          required: ["CategoryID", "Title", "Description"],
          properties: {
            CategoryID:  { type: "integer", example: 1 },
            Title:       { type: "string",  example: "Fake online shop stole my money" },
            Description: { type: "string",  example: "I paid Rs. 50,000 for a laptop but never received it." },
          },
        },
        UpdateStatusRequest: {
          type: "object",
          required: ["Status"],
          properties: {
            Status: {
              type: "string",
              enum: ["Pending", "In Progress", "Resolved", "Rejected"],
              example: "In Progress",
            },
          },
        },
        // ── Generic responses ─────────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string",  example: "Operation completed successfully." },
            data:    { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string",  example: "An error occurred." },
          },
        },
        PaginatedComplaints: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ComplaintID:   { type: "integer", example: 1 },
                  UserFullName:  { type: "string",  example: "Ali Hassan" },
                  CategoryName:  { type: "string",  example: "Online Fraud" },
                  Title:         { type: "string",  example: "Fake online shop" },
                  Description:   { type: "string",  example: "Full description..." },
                  Status:        { type: "string",  example: "Pending" },
                  CreatedAt:     { type: "string",  example: "2025-01-01T12:00:00.000Z" },
                },
              },
            },
            pagination: {
              type: "object",
              properties: {
                total:      { type: "integer", example: 42 },
                page:       { type: "integer", example: 1 },
                limit:      { type: "integer", example: 20 },
                totalPages: { type: "integer", example: 3 },
              },
            },
          },
        },
      },
    },
    // ── Route documentation via JSDoc comments in route files ─────────────
    tags: [
      { name: "Users",      description: "User registration and authentication" },
      { name: "Complaints", description: "Filing and viewing complaints" },
      { name: "Admin",      description: "Admin authentication and complaint management" },
    ],
  },
  // Where to scan for JSDoc @swagger comments
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;