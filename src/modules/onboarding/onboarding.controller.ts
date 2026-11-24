import type { Request, Response } from "express";
import * as onboardingService from "./onboarding.service.js";
import { validateRoleSelection, validateProfileSetupPayload } from "./onboarding.validation.js";

/**
 * Controller handling onboarding HTTP views and completion endpoints.
 */

export const getRolePage = async (req: Request, res: Response) => {
  try {
    const state = await onboardingService.getOnboardingState(req.user.userId);
    if (state.isOnboarded) {
      return res.redirect("/");
    }

    return res.render("onboarding/role", {
      user: req.user,
      currentRole: state.role,
    });
  } catch {
    return res.redirect("/");
  }
};

export const saveRole = async (req: Request, res: Response) => {
  try {
    const role = validateRoleSelection(req.body.role);
    const result = await onboardingService.saveRole(req.user.userId, role);

    return res.status(200).json({
      success: true,
      message: "Role saved successfully.",
      nextStep: result.nextStep,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const getProfilePage = async (req: Request, res: Response) => {
  try {
    const state = await onboardingService.getOnboardingState(req.user.userId);

    if (!state.profile || !state.role) {
      return res.redirect("/onboarding/role");
    }

    if (state.isOnboarded) {
      return res.redirect("/");
    }

    return res.render("onboarding/profile", {
      user: req.user,
      role: state.role,
    });
  } catch {
    return res.redirect("/onboarding/role");
  }
};

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const validatedData = validateProfileSetupPayload(req.body);
    const result = await onboardingService.completeProfileSetup(req.user.userId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      nextStep: result.nextStep,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};
