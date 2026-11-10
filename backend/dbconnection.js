/**
 * MySQL connection pool for the Welfare Society of Fentons API.
 *
 * Credentials come from backend/.env - see backend/.env.example for the keys.
 * The values shipped in that example are placeholders; replace them with the
 * real host, user and password before running against a live database.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "welfare_admin",
  password: process.env.DB_PASSWORD || "change_me_before_deploying",
  database: process.env.DB_NAME || "Welfare_Society_Fentons",
};

export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: "utf8mb4_unicode_ci",
  /* DATE columns come back as "YYYY-MM-DD" strings rather than JS Dates, so
   * the API never shifts a date of birth across a timezone boundary. */
  dateStrings: ["DATE", "DATETIME"],
  namedPlaceholders: false,
});

/** Runs a query and returns the rows. */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Runs a query through `pool.query` rather than `pool.execute`.
 *
 * Needed for multi-row `INSERT ... VALUES ?`: prepared statements cannot take
 * a nested array, so bulk inserts have to go this way.
 */
export async function bulkQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Runs a query expected to match at most one row. */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/**
 * Runs `work` inside a transaction, handing it a dedicated connection.
 * Commits on success, rolls back on any throw, and always releases.
 *
 *   const id = await withTransaction(async (cx) => { ... });
 */
export async function withTransaction(work) {
  const cx = await pool.getConnection();
  try {
    await cx.beginTransaction();
    const result = await work(cx);
    await cx.commit();
    return result;
  } catch (err) {
    await cx.rollback();
    throw err;
  } finally {
    cx.release();
  }
}

/* --- The HR database -------------------------------------------------------
 * `intranet.employee` is the Company's staff record. This application only
 * ever reads from it: sign-in, the eligible-employee list and the form
 * pre-fill all come from here, and nothing is written back. It is a separate
 * pool so that read-only boundary is visible in the code rather than relying
 * on everyone remembering it.
 * ------------------------------------------------------------------------ */

export const intranetConfig = {
  ...dbConfig,
  database: process.env.DB_INTRANET_NAME || "intranet",
};

export const intranetPool = mysql.createPool({
  ...intranetConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_INTRANET_CONNECTION_LIMIT || 5),
  queueLimit: 0,
  charset: "utf8mb4_unicode_ci",
  dateStrings: ["DATE", "DATETIME"],
});

/** Runs a read against the HR database. */
export async function intranetQuery(sql, params = []) {
  const [rows] = await intranetPool.execute(sql, params);
  return rows;
}

export async function intranetQueryOne(sql, params = []) {
  const rows = await intranetQuery(sql, params);
  return rows[0] ?? null;
}

/** Verifies the pool can reach the database. Called once at startup. */
export async function testConnection() {
  const cx = await pool.getConnection();
  try {
    await cx.ping();
    return true;
  } finally {
    cx.release();
  }
}

/** Verifies the HR database is reachable and the employee table is readable. */
export async function testIntranetConnection() {
  const row = await intranetQueryOne("SELECT COUNT(*) AS total FROM `employee`");
  return row?.total ?? 0;
}

export async function closePool() {
  await Promise.allSettled([pool.end(), intranetPool.end()]);
}

export default pool;
