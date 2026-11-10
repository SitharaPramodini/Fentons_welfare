/**
 * /api/auth - sign-in and the signed-in member's own account.
 *
 * `/me`, `/me/history` and `/change-password` stay reachable while a member
 * still owes a password change; everything else in the API does not.
 */
import { Router } from "express";
import { changePassword, login, logout, me, myHistory } from "../controllers/auth.controller.js";
import { allowDuringPasswordChange, requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.get("/me", allowDuringPasswordChange, requireAuth, me);
authRouter.post("/change-password", allowDuringPasswordChange, requireAuth, changePassword);

authRouter.get("/me/history", requireAuth, myHistory);

export default authRouter;
