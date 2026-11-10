/**
 * /api/loans - welfare loan applications (WFR/LOAN/2013).
 *
 * `/stats` and `/member/:memberId` come before `/:id` so the id route does
 * not capture them.
 */
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createLoan,
  decideLoan,
  downloadLoanPdf,
  deleteLoan,
  getLoanById,
  getLoanStats,
  listLoans,
  listLoansByMember,
  releaseLoan,
  settleLoan,
  updateLoan,
} from "../controllers/loan.controller.js";

export const loanRouter = Router();

/* Nothing about the loan is public. A visitor who is not signed in is told
 * nothing about the facility, its terms or anyone's application. */
loanRouter.use(requireAuth);

loanRouter.post("/", createLoan);

/* Administration */
loanRouter.get("/stats", getLoanStats);
loanRouter.get("/member/:memberId", listLoansByMember);
loanRouter.get("/", listLoans);
loanRouter.get("/:id", getLoanById);
loanRouter.get("/:id/pdf", downloadLoanPdf);
loanRouter.put("/:id", updateLoan);
loanRouter.patch("/:id/decision", decideLoan);
loanRouter.patch("/:id/release", releaseLoan);
loanRouter.patch("/:id/settle", settleLoan);
loanRouter.delete("/:id", deleteLoan);

export default loanRouter;
