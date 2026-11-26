/**
 * Applies the files in sql/migrations/ to an existing database.
 *
 *   cd backend && npm run db:migrate
 *
 * Each file is applied once and recorded in `schema_migrations`, so running
 * this again is a no-op. Use it on a database that already holds data;
 * `npm run db:init` only creates what is missing and never alters a table
 * that already exists.
 */
import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const here = dirname(fileURLToPath(import.meta.url));
const folder = join(here, "migrations");

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "welfare_admin",
  password: process.env.DB_PASSWORD || "change_me_before_deploying",
  database: process.env.DB_NAME || "Welfare_Society_Fentons",
  multipleStatements: true,
};

let connection;
try {
  connection = await mysql.createConnection(config);
  console.log(`Connected to ${config.database} at ${config.host}:${config.port}.`);

  await connection.query(
    "CREATE TABLE IF NOT EXISTS `schema_migrations` (" +
      "`filename` VARCHAR(255) NOT NULL," +
      "`applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "PRIMARY KEY (`filename`)) ENGINE=InnoDB",
  );

  const [done] = await connection.query("SELECT `filename` FROM `schema_migrations`");
  const applied = new Set(done.map((r) => r.filename));

  const files = (await readdir(folder)).filter((f) => f.endsWith(".sql")).sort();
  let ran = 0;

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  - ${file} (already applied)`);
      continue;
    }

    const sql = await readFile(join(folder, file), "utf8");
    await connection.query(sql);
    await connection.execute("INSERT INTO `schema_migrations` (`filename`) VALUES (?)", [file]);
    console.log(`  + ${file}`);
    ran += 1;
  }

  console.log(
    ran === 0 ? "\nNothing to do - the database is up to date.\n" : `\n${ran} applied.\n`,
  );
} catch (err) {
  console.error("\nThe migration did not complete.");
  console.error(`  ${err.code || ""} ${err.message}`);
  console.error("  Nothing after the failing statement was applied.\n");
  process.exitCode = 1;
} finally {
  await connection?.end();
}
