import { Router } from "express";
import {
  renderMyProfilePage,
  renderEditProfilePage,
  renderPublicProfilePage,
  getMyProfileApi,
  updateProfileApi,
  uploadAvatarApi,
  addPastWorkApi,
  deletePastWorkApi,
  updatePrivacyApi,
  getPublicProfileApi,
} from "./profile.controller.js";
import { requireAuth, requireOnboarded } from "../../middleware/auth.middleware.js";
import { avatarUpload } from "../../infrastructure/storage/multer.storage.js";

const router = Router();

// Page routes
router.get("/", requireAuth, requireOnboarded, renderMyProfilePage);
router.get("/me", requireAuth, requireOnboarded, renderMyProfilePage);
router.get("/edit", requireAuth, requireOnboarded, renderEditProfilePage);
router.get("/:id", requireAuth, requireOnboarded, renderPublicProfilePage);

// API routes for profile management
router.get("/api/me", requireAuth, getMyProfileApi);
router.put("/api/me", requireAuth, updateProfileApi);
router.post("/api/avatar", requireAuth, avatarUpload.single("avatar"), uploadAvatarApi);
router.post("/api/past-work", requireAuth, addPastWorkApi);
router.delete("/api/past-work/:workId", requireAuth, deletePastWorkApi);
router.put("/api/privacy", requireAuth, updatePrivacyApi);
router.get("/api/:id", requireAuth, getPublicProfileApi);

// Direct aliases for when mounted under /api/profile
router.get("/me", requireAuth, getMyProfileApi);
router.put("/me", requireAuth, updateProfileApi);
router.post("/avatar", requireAuth, avatarUpload.single("avatar"), uploadAvatarApi);
router.post("/past-work", requireAuth, addPastWorkApi);
router.delete("/past-work/:workId", requireAuth, deletePastWorkApi);
router.put("/privacy", requireAuth, updatePrivacyApi);

export default router;
