import express from "express";
import {
  requestOtpController,
  verifyOtpController,
  saveProfileController,
  googleAuthController,
  logoutController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ─── Public ──────────────────────────────────────────────────────────────────

// Google Auth (Better Auth / One-Click sign up & login)
router.get("/google", googleAuthController);
router.post("/google", googleAuthController);

// Send OTP to the given email
router.post("/request-otp", requestOtpController);

// Verify the OTP the user typed in
router.post("/verify-otp", verifyOtpController);

// Logout — clears the session cookie
router.get("/logout", logoutController);

// ─── Protected ───────────────────────────────────────────────────────────────

// Save user onboarding profile (requires auth)
router.post("/profile", requireAuth, saveProfileController);

export default router;
