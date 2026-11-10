/**
 * /api/employees - the eligible-employee list.
 *
 * Signed-in members only: this is the Company's staff record, not public
 * information.
 */
import { Router } from "express";
import {
  employeeCompanies,
  listEmployees,
  prefillForMe,
} from "../controllers/employee.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const employeeRouter = Router();

employeeRouter.use(requireAuth);

employeeRouter.get("/companies", employeeCompanies);
employeeRouter.get("/prefill", prefillForMe);
employeeRouter.get("/", listEmployees);

export default employeeRouter;
