/**
 * config/db.js
 * SQL Server connection pool configuration using mssql.
 * A single pool instance is created and reused across all queries.
 */

import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// ── Connection config built from environment variables ─────────────────────
const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,                  // Set true if using Azure SQL
    trustServerCertificate: true,    // Required for local / self-signed certs
    enableArithAbort: true,
  },
  pool: {
    max: 10,       // Maximum number of connections in the pool
    min: 0,        // Minimum connections kept alive
    idleTimeoutMillis: 30000, // Close idle connections after 30 s
  },
};

// ── Singleton pool reference ───────────────────────────────────────────────
let pool = null;

/**
 * Returns the active connection pool.
 * Creates one on the first call; subsequent calls reuse it.
 *
 * @returns {Promise<sql.ConnectionPool>}
 */
export const getPool = async () => {
  if (pool) return pool;

  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log("✅  SQL Server connection pool established.");

    // Surface pool-level errors so they don't go silent
    pool.on("error", (err) => {
      console.error("❌  SQL Server pool error:", err.message);
    });

    return pool;
  } catch (err) {
    console.error("❌  Failed to connect to SQL Server:", err.message);
    process.exit(1); // Fatal — cannot run without a DB
  }
};

export default sql;
