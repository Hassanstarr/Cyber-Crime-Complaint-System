/**
 * config/initDB.js
 * Run this ONCE to create all required tables.
 * Command: node config/initDB.js
 */

import { getPool } from "./db.js";
import sql from "./db.js";

const initDB = async () => {
  try {
    const pool = await getPool();
    console.log("📦 Creating tables if they don't exist...\n");

    // ── Users ──────────────────────────────────────────────────────────────
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        UserID    INT           PRIMARY KEY IDENTITY(1,1),
        FullName  NVARCHAR(100) NOT NULL,
        Email     NVARCHAR(150) NOT NULL UNIQUE,
        Password  NVARCHAR(255) NOT NULL,
        Phone     NVARCHAR(20)  NULL,
        CreatedAt DATETIME      DEFAULT GETDATE()
      )
    `);
    console.log("✅  Users table ready.");

    // ── Admins ─────────────────────────────────────────────────────────────
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admins' AND xtype='U')
      CREATE TABLE Admins (
        AdminID   INT           PRIMARY KEY IDENTITY(1,1),
        Username  NVARCHAR(100) NOT NULL UNIQUE,
        Password  NVARCHAR(255) NOT NULL
      )
    `);
    console.log("✅  Admins table ready.");

    // ── Categories ─────────────────────────────────────────────────────────
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
      CREATE TABLE Categories (
        CategoryID   INT           PRIMARY KEY IDENTITY(1,1),
        CategoryName NVARCHAR(100) NOT NULL UNIQUE
      )
    `);
    console.log("✅  Categories table ready.");

    // ── Complaints ─────────────────────────────────────────────────────────
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Complaints' AND xtype='U')
      CREATE TABLE Complaints (
        ComplaintID INT            PRIMARY KEY IDENTITY(1,1),
        UserID      INT            NOT NULL,
        CategoryID  INT            NOT NULL,
        Title       NVARCHAR(200)  NOT NULL,
        Description NVARCHAR(MAX)  NOT NULL,
        Status      NVARCHAR(20)   NOT NULL DEFAULT 'Pending'
                                   CHECK (Status IN ('Pending','In Progress','Resolved','Rejected')),
        CreatedAt   DATETIME       DEFAULT GETDATE(),
        CONSTRAINT FK_Complaints_Users      FOREIGN KEY (UserID)     REFERENCES Users(UserID),
        CONSTRAINT FK_Complaints_Categories FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
      )
    `);
    console.log("✅  Complaints table ready.");

    // ── Seed: default admin account ────────────────────────────────────────
    const adminExists = await pool.request().query(
      `SELECT AdminID FROM Admins WHERE Username = 'admin'`
    );
    if (adminExists.recordset.length === 0) {
      // Password is:  admin123  (bcrypt hashed)
      await pool.request().query(`
        INSERT INTO Admins (Username, Password)
        VALUES ('admin', '$2b$12$KIXiOtGSGCEFbHCBMSAoTONqPFoUGFVgOHhWqfHCfEa6V1xRH1xUu')
      `);
      console.log("✅  Default admin seeded  →  username: admin  |  password: admin123");
    }

    // ── Seed: sample categories ────────────────────────────────────────────
    const categories = [
      "Online Fraud",
      "Cyberbullying",
      "Identity Theft",
      "Hacking",
      "Phishing",
      "Ransomware",
      "Child Exploitation",
      "Other",
    ];

    for (const name of categories) {
      await pool
        .request()
        .input("Name", sql.NVarChar(100), name)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Categories WHERE CategoryName = @Name)
          INSERT INTO Categories (CategoryName) VALUES (@Name)
        `);
    }
    console.log("✅  Categories seeded.");

    console.log("\n🎉  Database initialised successfully! You can now run: node server.js");
    process.exit(0);

  } catch (err) {
    console.error("❌  initDB failed:", err.message);
    process.exit(1);
  }
};

initDB();