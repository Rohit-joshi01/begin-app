import type { Request, Response } from "express";
import * as profileService from "./profile.service.ts";
import { calculateProfileCompletion } from "../../shared/helpers/profileCompletion.helper.ts";
import { validatePastWorkPayload, validatePrivacyPayload } from "./profile.validation.ts";

/**
 * Controller managing builder profile presentation and API endpoints.
 * Handles profile viewing, inline editing, badge verification, and privacy settings.
 */

export async function renderMyProfilePage(req: Request, res: Response) {
  try {
    const profile = await profileService.getProfileByUserId(req.user.userId);
    const completionData = calculateProfileCompletion(profile);

    return res.render("profile/view", {
      user: res.locals.user,
      profile,
      isOwner: true,
      completionData,
    });
  } catch (error: any) {
    return res.status(500).render("error", {
      message: error.message || "Failed to load profile.",
    });
  }
}

export async function renderEditProfilePage(req: Request, res: Response) {
  try {
    const profile = await profileService.getProfileByUserId(req.user.userId);
    const completionData = calculateProfileCompletion(profile);

    return res.render("profile/edit", {
      user: res.locals.user,
      profile,
      completionData,
    });
  } catch (error: any) {
    return res.status(500).render("error", {
      message: error.message || "Failed to load profile editor.",
    });
  }
}

export async function renderPublicProfilePage(req: Request, res: Response) {
  try {
    const profile = await profileService.getPublicProfileById(req.params.id, req.user?.userId);
    if (!profile) {
      return res.status(404).render("error", {
        message: "Profile not found.",
      });
    }

    const completionData = calculateProfileCompletion(profile);

    return res.render("profile/view", {
      user: res.locals.user,
      profile,
      isOwner: profile.isOwner,
      completionData,
    });
  } catch (error: any) {
    return res.status(500).render("error", {
      message: error.message || "Failed to load builder profile.",
    });
  }
}

export async function getMyProfileApi(req: Request, res: Response) {
  try {
    const profile = await profileService.getProfileByUserId(req.user.userId);
    const completionData = calculateProfileCompletion(profile);

    return res.status(200).json({
      success: true,
      profile,
      completionData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfileApi(req: Request, res: Response) {
  try {
    const updated = await profileService.updateProfile(req.user.userId, req.body);
    const completionData = calculateProfileCompletion(updated);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
      completionData,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function uploadAvatarApi(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const updated = await profileService.updateAvatar(req.user.userId, avatarUrl);

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      avatarUrl,
      profile: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function addPastWorkApi(req: Request, res: Response) {
  try {
    const validated = validatePastWorkPayload(req.body);
    const updated = await profileService.addPastWork(req.user.userId, validated);

    return res.status(201).json({
      success: true,
      message: "Project added to portfolio.",
      profile: updated,
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function deletePastWorkApi(req: Request, res: Response) {
  try {
    const workId = req.params.workId || req.body.workId;
    if (!workId) {
      return res.status(400).json({ success: false, message: "workId is required." });
    }

    const updated = await profileService.deletePastWork(req.user.userId, workId);
    return res.status(200).json({
      success: true,
      message: "Project removed from portfolio.",
      profile: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updatePrivacyApi(req: Request, res: Response) {
  try {
    const validated = validatePrivacyPayload(req.body);
    const privacy = await profileService.updatePrivacySettings(req.user.userId, validated);

    return res.status(200).json({
      success: true,
      message: "Privacy settings updated.",
      privacy,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getPublicProfileApi(req: Request, res: Response) {
  try {
    const profile = await profileService.getPublicProfileById(req.params.id, req.user?.userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const completionData = calculateProfileCompletion(profile);

    return res.status(200).json({
      success: true,
      profile,
      completionData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
