import { Router } from "express";
import {
  requestOTP,
  verifyOTPAndLogin,
  handleGetUserSignIn,
  handleGetLogin,
  logout,
  handleGoogleLogin,
  handleGoogleCallback,
} from "./auth.controller.ts";

const router = Router();

// Page routes
router.get("/signup", handleGetUserSignIn);
router.get("/signin", handleGetLogin);
router.get("/login", handleGetLogin);
router.get("/logout", logout);

// Google OAuth routes
router.get("/google", handleGoogleLogin);
router.get("/google/callback", handleGoogleCallback);

// API routes
router.post("/send-otp", requestOTP);
router.post("/verify-otp", verifyOTPAndLogin);
router.post("/logout", logout);

export default router;
