import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { validateRequestOTPPayload, validateVerifyOTPPayload } from "./auth.validation.js";
import { getGoogleAuthUrl, getGoogleUserFromCode } from "../../infrastructure/external-services/googleAuth.service.js";
import config from "../../config/env.js";

/**
 * Controller handling authentication page views, email OTP verification,
 * Google OAuth callbacks, and cookie lifecycle.
 */

export function handleGetUserSignIn(req: Request, res: Response) {
  return res.render("signup", { user: res.locals.user });
}

export function handleGetLogin(req: Request, res: Response) {
  return res.render("login", { user: res.locals.user });
}

export const requestOTP = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = validateRequestOTPPayload(req.body);
    const result = await authService.requestOTP(email, purpose);

    return res.status(200).json({
      success: true,
      message: result.message,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const verifyOTPAndLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp, purpose } = validateVerifyOTPPayload(req.body);
    const { token, isOnboarded, nextStep } = await authService.verifyOTPAndAuthenticate(email, otp, purpose);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Verified successfully!",
      isOnboarded,
      nextStep,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.redirect("/");
};

export const handleGoogleLogin = (req: Request, res: Response) => {
  try {
    const authUrl = getGoogleAuthUrl();
    return res.redirect(authUrl);
  } catch (error: any) {
    return res.redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query as { code?: string; error?: string };

    if (error) {
      return res.redirect(`/auth/login?error=${encodeURIComponent("Google sign-in was cancelled or denied.")}`);
    }

    if (!code) {
      return res.redirect(`/auth/login?error=${encodeURIComponent("Authorization code missing from Google callback.")}`);
    }

    const { user: googleUser } = await getGoogleUserFromCode(code);
    const { token, nextStep } = await authService.authenticateWithGoogle(googleUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(nextStep);
  } catch (error: any) {
    return res.redirect(`/auth/login?error=${encodeURIComponent(error.message || "Failed to authenticate with Google.")}`);
  }
};
