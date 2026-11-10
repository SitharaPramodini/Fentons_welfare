/**
 * /api/admin - the Society's office.
 *
 * The two decision-by-link routes are deliberately outside the sign-in guard:
 * they carry their own signed token, which names one loan and one action and
 * expires. Everything else needs an administrator's session.
 */
import { Router } from "express";
import {
  applyDecision,
  approveLoan,
  declineLoan,
  describeDecision,
  listAudit,
  listConsents,
  pending,
  readConsent,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminRouter = Router();

/* Deciding from the notification e-mail. The token is the authorisation. */
adminRouter.get("/decision/:token", describeDecision);
adminRouter.post("/decision/:token", applyDecision);

/* Everything below needs an administrator signed in. */
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/pending", pending);
adminRouter.patch("/loans/:id/approve", approveLoan);
adminRouter.patch("/loans/:id/decline", declineLoan);

/* The records. Read-only - nothing here is ever edited or deleted. */
adminRouter.get("/consents", listConsents);
adminRouter.get("/consents/:id", readConsent);
adminRouter.get("/audit", listAudit);

export default adminRouter;
