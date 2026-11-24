import { Router } from "express";
import {
  renderDiscoveryPage,
  searchMembersApi,
  searchStartupsApi,
  globalSearchApi,
  getSuggestedMatchesApi,
  toggleFollowApi,
  toggleShortlistApi,
  getShortlistApi,
} from "./discovery.controller.js";
import { requireAuth, requireOnboarded } from "../../middleware/auth.middleware.js";

const router = Router();

// Page views
router.get("/", requireAuth, requireOnboarded, renderDiscoveryPage);

// REST API search endpoints
router.get("/members", requireAuth, searchMembersApi);
router.get("/startups", requireAuth, searchStartupsApi);
router.get("/search", requireAuth, globalSearchApi);
router.get("/suggested", requireAuth, getSuggestedMatchesApi);

// Social Follow & Private Shortlist endpoints
router.post("/follow", requireAuth, toggleFollowApi);
router.post("/shortlist", requireAuth, toggleShortlistApi);
router.get("/shortlist", requireAuth, getShortlistApi);

// Aliases when mounted under /api/discovery
router.get("/api/members", requireAuth, searchMembersApi);
router.get("/api/startups", requireAuth, searchStartupsApi);
router.get("/api/search", requireAuth, globalSearchApi);
router.get("/api/suggested", requireAuth, getSuggestedMatchesApi);
router.post("/api/follow", requireAuth, toggleFollowApi);
router.post("/api/shortlist", requireAuth, toggleShortlistApi);
router.get("/api/shortlist", requireAuth, getShortlistApi);

export default router;
