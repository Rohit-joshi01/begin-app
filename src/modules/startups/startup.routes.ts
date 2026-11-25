import { Router } from "express";
import {
  renderStartupListPage,
  renderCreateStartupPage,
  renderStartupDetailPage,
  renderEditStartupPage,
  createStartupApi,
  getStartupApi,
  listStartupsApi,
  updateStartupApi,
  inviteMemberApi,
  removeMemberApi,
  addOpenRoleApi,
  deleteOpenRoleApi,
  addMilestoneApi,
  transferOwnershipApi,
  archiveStartupApi,
} from "./startup.controller.ts";
import { requireAuth, requireOnboarded } from "../../middleware/auth.middleware.ts";

const router = Router();

// Page views
router.get("/", requireAuth, requireOnboarded, renderStartupListPage);
router.get("/new", requireAuth, requireOnboarded, renderCreateStartupPage);
router.get("/:id", requireAuth, requireOnboarded, renderStartupDetailPage);
router.get("/:id/edit", requireAuth, requireOnboarded, renderEditStartupPage);

// REST API endpoints
router.post("/api", requireAuth, createStartupApi);
router.get("/api", requireAuth, listStartupsApi);
router.get("/api/:id", requireAuth, getStartupApi);
router.put("/api/:id", requireAuth, updateStartupApi);
router.post("/api/:id/invite", requireAuth, inviteMemberApi);
router.delete("/api/:id/member/:memberUserId", requireAuth, removeMemberApi);
router.post("/api/:id/role", requireAuth, addOpenRoleApi);
router.delete("/api/:id/role/:roleId", requireAuth, deleteOpenRoleApi);
router.post("/api/:id/milestone", requireAuth, addMilestoneApi);
router.post("/api/:id/transfer", requireAuth, transferOwnershipApi);
router.post("/api/:id/archive", requireAuth, archiveStartupApi);

// Direct aliases for when mounted under /api/startup
router.post("/", requireAuth, createStartupApi);
router.get("/", requireAuth, listStartupsApi);
router.get("/:id", requireAuth, getStartupApi);
router.put("/:id", requireAuth, updateStartupApi);
router.post("/:id/invite", requireAuth, inviteMemberApi);
router.delete("/:id/member/:memberUserId", requireAuth, removeMemberApi);
router.post("/:id/role", requireAuth, addOpenRoleApi);
router.delete("/:id/role/:roleId", requireAuth, deleteOpenRoleApi);
router.post("/:id/milestone", requireAuth, addMilestoneApi);
router.post("/:id/transfer", requireAuth, transferOwnershipApi);
router.post("/:id/archive", requireAuth, archiveStartupApi);

export default router;
