import type { Request, Response } from "express";
import * as discoveryService from "./discovery.service.ts";
import { validateFollowPayload, validateShortlistPayload } from "./discovery.validation.ts";

/**
 * Controller handling campus discovery views, directory searches,
 * suggested matching, social follows, and private shortlisting.
 */

export async function renderDiscoveryPage(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { q, skill, year, branch, availability, lookingFor, stage, industry, hasOpenRoles, tab } = req.query as Record<string, string>;

    const memberFilters = {
      skill: skill || "",
      year: year || "",
      branch: branch || "",
      availability: availability || "",
      lookingFor: lookingFor || "",
    };

    const startupFilters = {
      stage: stage || "",
      industry: industry || "",
      hasOpenRoles: hasOpenRoles || "",
    };

    const currentTab = (tab as string) || "members";

    let members: any[] = [];
    let startups: any[] = [];
    let following = { memberIds: [] as string[], startupIds: [] as string[] };
    let shortlistIds = { memberIds: [] as string[], startupIds: [] as string[] };

    if (userId) {
      [following, shortlistIds] = await Promise.all([
        discoveryService.getFollowingIds(userId),
        discoveryService.getShortlistIds(userId),
      ]);
    }

    if (currentTab === "shortlist" && userId) {
      const shortlistData = await discoveryService.getShortlist(userId);
      members = shortlistData.members || [];
      startups = shortlistData.startups || [];
    } else {
      const [searchedMembers, searchedStartups] = await Promise.all([
        discoveryService.searchMembers(q || "", memberFilters, userId),
        discoveryService.searchStartups(q || "", startupFilters, userId),
      ]);
      members = searchedMembers;
      startups = searchedStartups;
    }

    return res.render("discovery/index", {
      user: res.locals.user || req.user,
      members,
      startups,
      followingMemberIds: following.memberIds || [],
      followingStartupIds: following.startupIds || [],
      shortlistedMemberIds: shortlistIds.memberIds || [],
      shortlistedStartupIds: shortlistIds.startupIds || [],
      query: q || "",
      tab: currentTab,
      memberFilters,
      startupFilters,
    });
  } catch (error: any) {
    return res.status(500).render("error", {
      message: error.message || "Failed to load discovery directory.",
    });
  }
}

export async function searchMembersApi(req: Request, res: Response) {
  try {
    const { q, ...filters } = req.query as Record<string, string>;
    const members = await discoveryService.searchMembers(q || "", filters, req.user?.userId);
    return res.status(200).json({ success: true, count: members.length, members });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function searchStartupsApi(req: Request, res: Response) {
  try {
    const { q, ...filters } = req.query as Record<string, string>;
    const startups = await discoveryService.searchStartups(q || "", filters, req.user?.userId);
    return res.status(200).json({ success: true, count: startups.length, startups });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function globalSearchApi(req: Request, res: Response) {
  try {
    const { q } = req.query as { q?: string };
    const results = await discoveryService.globalSearch(q || "", req.user?.userId);
    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSuggestedMatchesApi(req: Request, res: Response) {
  try {
    const matches = await discoveryService.getSuggestedMatches(req.user.userId);
    return res.status(200).json({ success: true, matches });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleFollowApi(req: Request, res: Response) {
  try {
    const payload = validateFollowPayload(req.body);
    const result = await discoveryService.toggleFollow(req.user.userId, payload.targetType, payload.targetId);
    return res.status(200).json({
      success: true,
      message: result.isFollowing ? "Followed successfully." : "Unfollowed successfully.",
      isFollowing: result.isFollowing,
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function toggleShortlistApi(req: Request, res: Response) {
  try {
    const payload = validateShortlistPayload(req.body);
    const result = await discoveryService.toggleShortlist(
      req.user.userId,
      payload.itemType,
      payload.itemId,
      payload.note
    );
    return res.status(200).json({
      success: true,
      message: result.isShortlisted ? "Item added to shortlist." : "Item removed from shortlist.",
      isShortlisted: result.isShortlisted,
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function getShortlistApi(req: Request, res: Response) {
  try {
    const shortlist = await discoveryService.getShortlist(req.user.userId);
    return res.status(200).json({ success: true, shortlist });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
