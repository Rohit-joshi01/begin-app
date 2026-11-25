import type { Request, Response } from "express";
import * as authService from "./auth.service.ts";
import { validateSignupPayload, validateLoginPayload } from "./auth.validation.ts";
import { getGoogleAuthUrl, getGoogleUserFromCode } from "../../infrastructure/external-services/googleAuth.service.ts";
import config from "../../config/env.ts";

/**
 * Controller handling authentication page views, email+password auth,
 * Google OAuth callbacks, and cookie lifecycle.
 */

// ── Page views ───────────────────────────────────────────────────────────────

export function handleGetUserSignIn(req: Request, res: Response) {
  return res.render("signup", { user: res.locals.user });
}

export function handleGetLogin(req: Request, res: Response) {
  return res.render("login", { user: res.locals.user });
}

// ── Email + Password ─────────────────────────────────────────────────────────

export const handleSignup = async (req: Request, res: Response) => {
  try {
    const { email, password } = validateSignupPayload(req.body);
    const { token, isOnboarded, nextStep } = await authService.register(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      isOnboarded,
      nextStep,
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = validateLoginPayload(req.body);
    const { token, isOnboarded, nextStep } = await authService.login(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      isOnboarded,
      nextStep,
    });
  } catch (error: any) {
    const status = error.statusCode || 401;
    return res.status(status).json({ success: false, message: error.message });
  }
};

// ── Logout ───────────────────────────────────────────────────────────────────

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.redirect("/");
};

// ── Google OAuth ─────────────────────────────────────────────────

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