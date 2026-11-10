/**
 * Creates the database and its tables by running sql/schema.sql.
 *
 *   cd backend && npm run db:init
 *
 * Connects without a database selected, because schema.sql creates it. Safe
 * to run more than once - every statement is CREATE ... IF NOT EXISTS.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const here = dirname(fileURLToPath(import.meta.url));

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "welfare_admin",
  password: process.env.DB_PASSWORD || "change_me_before_deploying",
  multipleStatements: true,
};

/* schema.sql is written against the default name. If DB_NAME says otherwise
 * - a host that prefixes databases with the account name, for instance -
 * honour that, so the schema and the API always target the same database. */
const DEFAULT_DB = "Welfare_Society_Fentons";
const dbName = process.env.DB_NAME || DEFAULT_DB;

const sql = (await readFile(join(here, "schema.sql"), "utf8")).replaceAll(DEFAULT_DB, dbName);

let connection;
try {
  connection = await mysql.createConnection(config);
  console.log(`Connected to MySQL at ${config.host}:${config.port} as ${config.user}.`);

  if (dbName !== DEFAULT_DB) {
    console.log(`Using database name from .env: ${dbName}`);
  }

  await connection.query(sql);

  const [tables] = await connection.query(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [dbName],
  );

  console.log(`\n${dbName} is ready. Tables:`);
  for (const t of tables) console.log(`  - ${t.name}`);
  console.log("");
} catch (err) {
  console.error("\nCould not initialise the database.");
  console.error(`  ${err.code || ""} ${err.message}`);
  console.error("  Check the credentials in backend/.env.\n");
  process.exitCode = 1;
} finally {
  await connection?.end();
}
