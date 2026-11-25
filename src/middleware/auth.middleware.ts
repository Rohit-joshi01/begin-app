import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.ts";
import Profile from "../modules/profiles/models/profile.model.ts";

/**
 * Authentication and authorization middleware suite.
 * Extracts JWT sessions, populates user context, and enforces access guards.
 */

export const attachUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;

    // Attach profile data if it exists
    const profile = await Profile.findOne({ userId: decoded.userId });
    res.locals.user = {
      ...decoded,
      profile: profile || null,
      isOnboarded: profile?.isOnboarded || false,
    };
  } catch {
    res.locals.user = null;
  }

  next();
};

// Hard guard: user must be authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }
  next();
};

// Onboarding guard: redirect un-onboarded users to setup screens
export const requireOnboarded = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && res.locals.user && !res.locals.user.isOnboarded) {
    return res.redirect("/onboarding/role");
  }
  next();
};
