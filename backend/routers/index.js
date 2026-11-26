/**
 * Mounts every route under /api and exposes the two small shared endpoints:
 * a health check and the option lists the frontend selects are built from.
 */
import { Router } from "express";
import { memberRouter } from "./member.router.js";
import { loanRouter } from "./loan.router.js";
import { authRouter } from "./auth.router.js";
import { employeeRouter } from "./employee.router.js";
import { documentRouter } from "./document.router.js";
import { adminRouter } from "./admin.router.js";
import { testConnection } from "../dbconnection.js";
import { asyncHandler, ok } from "../utils/validate.js";
import { RETENTION, consentsForDisplay } from "../utils/consent.js";
import { officeBearerContacts } from "../utils/society.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  COMPANIES,
  EMPLOYMENT_CATEGORIES,
  FEES,
  IDENTITY_TYPES,
  LOAN_STATUSES,
  MEMBER_STATUSES,
  PARENT_RELATIONSHIPS,
  TITLES,
} from "../utils/constants.js";

export const apiRouter = Router();

apiRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await testConnection();
    return ok(res, { status: "ok", database: "connected", time: new Date().toISOString() });
  }),
);

/* Served rather than duplicated in the frontend, so a change to an ENUM in
 * schema.sql only has to be reflected in utils/constants.js. */
apiRouter.get("/meta/options", (_req, res) =>
  ok(res, {
    companies: COMPANIES,
    employmentCategories: EMPLOYMENT_CATEGORIES,
    parentRelationships: PARENT_RELATIONSHIPS,
    titles: TITLES,
    identityTypes: IDENTITY_TYPES,
    memberStatuses: MEMBER_STATUSES,
    loanStatuses: LOAN_STATUSES,
    fees: FEES,
  }),
);

/* The exact wording of each consent, so the form shows what the server will
 * record. The client never sends the text back. */
apiRouter.get("/meta/consents", (_req, res) =>
  ok(res, { consents: consentsForDisplay(), retention: RETENTION }),
);

/**
 * How to reach the Society's office bearers. Members only - the addresses
 * are not compiled into the public bundle, so a visitor who is not signed in
 * never receives them at all.
 */
apiRouter.get("/society/contacts", requireAuth, (_req, res) =>
  ok(res, { contacts: officeBearerContacts() }),
);

apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeeRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/documents", documentRouter);
apiRouter.use("/members", memberRouter);
apiRouter.use("/loans", loanRouter);

export default apiRouter;
