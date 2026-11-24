import type { Request, Response } from "express";
import { getSuggestedMatches } from "../discovery/discovery.service.ts";

/**
 * Controller rendering the root home dashboard and welcome feed.
 * Integrates suggested matches for onboarded builders.
 */

export async function renderHomePage(req: Request, res: Response) {
  let suggested = { recommendedMembers: [], recommendedStartups: [] };

  if (req.user?.userId) {
    try {
      suggested = await getSuggestedMatches(req.user.userId);
    } catch {
      // Gracefully fall back if matching service encounters an issue
    }
  }

  return res.render("home", {
    user: res.locals.user,
    suggestedMembers: suggested.recommendedMembers || [],
    suggestedStartups: suggested.recommendedStartups || [],
  });
}
