/**
 * /api/documents - the Constitution, for signed-in members only.
 *
 * It is a confidential internal document, so it is served from here rather
 * than from the site's public folder.
 */
import { Router } from "express";
import { constitution, constitutionStatus } from "../controllers/document.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const documentRouter = Router();

documentRouter.use(requireAuth);

documentRouter.get("/constitution/status", constitutionStatus);
documentRouter.get("/constitution", constitution);

export default documentRouter;
