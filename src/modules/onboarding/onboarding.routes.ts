import { Router } from "express";
import {
  getRolePage,
  saveRole,
  getProfilePage,
  saveProfile,
} from "./onboarding.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Page views (requires login token)
router.get("/role", requireAuth, getRolePage);
router.get("/profile", requireAuth, getProfilePage);

// API actions
router.post("/role", requireAuth, saveRole);
router.post("/profile", requireAuth, saveProfile);

export default router;
