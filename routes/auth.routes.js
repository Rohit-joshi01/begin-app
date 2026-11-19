import express from "express";
import {
  requestOtpController,
  verifyOtpController,
  saveProfileController,
  googleAuthController,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Google Auth (Better Auth / One-Click sign up & login)
router.get("/google", googleAuthController);
router.post("/google", googleAuthController);

// Send OTP to the given email
router.post("/request-otp", requestOtpController);

// Verify the OTP the user typed in
router.post("/verify-otp", verifyOtpController);

// Save user onboarding profile
router.post("/profile", saveProfileController);

export default router;
