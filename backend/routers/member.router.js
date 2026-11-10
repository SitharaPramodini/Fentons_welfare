/**
 * /api/members - membership applications (WFR/F/09/2020 Rev 02).
 *
 * Literal paths are declared before `/:id` so that `/stats`, `/declinations`
 * and `/lookup/...` are not swallowed by the id route.
 */
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { uploadDocuments } from "../utils/uploads.js";
import { memberDocument } from "../controllers/document.controller.js";
import {
  createMember,
  declineMembership,
  deleteMember,
  getMemberById,
  getMemberStats,
  listDeclinations,
  listMembers,
  lookupMemberByEpf,
  updateMember,
  updateMemberStatus,
} from "../controllers/member.controller.js";

export const memberRouter = Router();

/* Applying requires a signed-in member: the application is tied to the staff
 * record behind the session rather than to whatever was typed into the form. */
/* `uploadDocuments` parses the multipart body: the application itself
 * arrives as one JSON field, the certificates as files. */
memberRouter.post("/", requireAuth, uploadDocuments, createMember);
memberRouter.post("/decline", requireAuth, declineMembership);
memberRouter.get("/lookup/:epf", requireAuth, lookupMemberByEpf);

/* Administration. Still open to any signed-in member - the Society has no
 * roles yet, so these are not restricted to the Committee. See README. */
memberRouter.get("/stats", requireAuth, getMemberStats);
memberRouter.get("/declinations", requireAuth, listDeclinations);
memberRouter.get("/", requireAuth, listMembers);
memberRouter.get("/:id", requireAuth, getMemberById);
memberRouter.get("/:id/documents/:docId", requireAuth, memberDocument);
memberRouter.put("/:id", requireAuth, updateMember);
memberRouter.patch("/:id/status", requireAuth, updateMemberStatus);
memberRouter.delete("/:id", requireAuth, deleteMember);

export default memberRouter;
