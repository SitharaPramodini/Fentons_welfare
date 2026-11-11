/**
 * Welfare Society of Fentons - API server.
 *
 *   cd backend
 *   cp .env.example .env     # then put the real credentials in it
 *   npm install
 *   npm run db:init          # creates Welfare_Society_Fentons and its tables
 *   npm run dev
 *
 * Listens on PORT (default 4000) and serves everything under /api.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { apiRouter } from "./routers/index.js";
import {
  closePool,
  dbConfig,
  intranetConfig,
  testConnection,
  testIntranetConnection,
} from "./dbconnection.js";
import { ApiError } from "./utils/validate.js";
import { SOCIETY_INBOX, mailIsConfigured, verifyMail } from "./utils/mailer.js";
import { ADMIN_HRIS } from "./utils/admin.js";
import { describeStorage, testStorage } from "./utils/storage.js";
import { describeTarget } from "./utils/compress.js";
import { ACCEPTED_LABEL } from "./utils/uploads.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

/* --- Middleware ----------------------------------------------------------- */

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

/* Vite takes the next free port when 5173 is busy, and a POST carries an
 * Origin header even through the dev proxy - so a pinned port list breaks as
 * soon as the port moves. In development any loopback origin is accepted;
 * production honours CORS_ORIGINS and nothing else. */
const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function originIsAllowed(origin) {
  if (allowedOrigins.includes(origin)) return true;
  return !isProduction && LOOPBACK.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      /* No Origin header: curl, Postman, server-to-server. Allowed. */
      if (!origin || originIsAllowed(origin)) return callback(null, true);
      return callback(
        new ApiError(
          403,
          `Origin ${origin} is not allowed by CORS. Add it to CORS_ORIGINS in backend/.env.`,
        ),
      );
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

/**
 * Request logging.
 *
 * `LOG_REQUESTS` picks how much:
 *
 *   changes  (default) anything that changes something, plus any failure.
 *            Reads are left out - a single page opening fires a handful of
 *            them and they drown the log without telling you anything.
 *   all      every request, for when you are chasing something.
 *   off      nothing.
 */
const LOG_REQUESTS = (process.env.LOG_REQUESTS || "changes").toLowerCase();

if (LOG_REQUESTS !== "off") {
  app.use((req, res, next) => {
    const started = Date.now();

    res.on("finish", () => {
      const changed = req.method !== "GET" && req.method !== "HEAD";
      const failed = res.statusCode >= 400;
      if (LOG_REQUESTS !== "all" && !changed && !failed) return;

      console.log(
        `${new Date().toISOString()}  ${req.method} ${req.originalUrl} ` +
          `${res.statusCode} ${Date.now() - started}ms`,
      );
    });

    next();
  });
}

/* --- Routes --------------------------------------------------------------- */

app.get("/", (_req, res) =>
  res.json({
    name: "Welfare Society of Fentons API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      options: "/api/meta/options",
      members: "/api/members",
      loans: "/api/loans",
    },
  }),
);

app.use("/api", apiRouter);

/* --- Errors --------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({ success: false, message: `No route matches ${req.method} ${req.path}.` });
});

/* Express identifies error middleware by its four-argument signature, so
 * `_next` must stay even though it is never called. */
app.use((err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  /* An upload that was too large, or too many of them. Multer throws its own
   * error type, which would otherwise fall through to a bare 500 and tell the
   * member nothing about what to do. */
  if (err?.name === "MulterError") {
    const field = err.field || "file";
    const messages = {
      LIMIT_FILE_SIZE: `That file is too large. ${ACCEPTED_LABEL}.`,
      LIMIT_FILE_COUNT: "Too many files were attached.",
      LIMIT_UNEXPECTED_FILE: "That file was not expected here.",
    };
    const message = messages[err.code] ?? "That file could not be accepted.";
    return res.status(413).json({
      success: false,
      message: "Please correct the highlighted fields.",
      errors: { [field]: message },
    });
  }

  /* Malformed JSON body. */
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "The request body is not valid JSON." });
  }

  /* The database is unreachable or the schema has not been created. */
  if (typeof err?.code === "string" && err.code.startsWith("ER_")) {
    console.error("MySQL error:", err.code, err.sqlMessage);
    return res.status(500).json({ success: false, message: "A database error occurred." });
  }
  if (["ECONNREFUSED", "PROTOCOL_CONNECTION_LOST", "ETIMEDOUT"].includes(err?.code)) {
    console.error("Database unreachable:", err.code);
    return res.status(503).json({ success: false, message: "The database is unavailable." });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ success: false, message: "Something went wrong." });
});

/* --- Start ---------------------------------------------------------------- */

const server = app.listen(PORT, async () => {
  console.log(`\nWelfare Society of Fentons API  ->  http://localhost:${PORT}`);
  console.log(
    `CORS origins: ${allowedOrigins.join(", ")}${
      isProduction ? "" : " (plus any localhost port, development only)"
    }`,
  );

  try {
    await testConnection();
    console.log(`MySQL: connected to ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);

    try {
      const staff = await testIntranetConnection();
      console.log(`HR:    ${intranetConfig.database}.employee readable (${staff} staff)`);
    } catch (hrErr) {
      console.error(
        `HR:    could NOT read ${intranetConfig.database}.employee - sign-in will fail.`,
      );
      console.error(`       ${hrErr.code || ""} ${hrErr.sqlMessage || hrErr.message}`);
    }

    console.log(`Admin: HRIS ${ADMIN_HRIS.join(", ") || "(nobody)"}`);

    const store = await testStorage();
    console.log(
      store.ok
        ? `Files: ${describeStorage()}, images compressed to ${describeTarget()}`
        : `Files: ${describeStorage()} is NOT reachable - ${store.reason}`,
    );

    if (mailIsConfigured()) {
      const mail = await verifyMail();
      console.log(
        mail.ok
          ? `Mail:  SMTP ready, applications go to ${SOCIETY_INBOX}\n`
          : `Mail:  SMTP configured but NOT reachable - ${mail.reason}\n`,
      );
    } else {
      console.log(
        `Mail:  SMTP not configured - messages for ${SOCIETY_INBOX} go to backend/outbox\n`,
      );
    }
  } catch (err) {
    console.error(
      `\nMySQL: could NOT connect to ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`,
    );
    console.error(`       ${err.code || ""} ${err.message}`);
    console.error("       Check the credentials in backend/.env, then restart.\n");
  }
});

/* Finish in-flight requests and close the pool on Ctrl-C / container stop. */
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n${signal} received - shutting down.`);
    server.close(async () => {
      await closePool().catch(() => {});
      process.exit(0);
    });
  });
}

export default app;
