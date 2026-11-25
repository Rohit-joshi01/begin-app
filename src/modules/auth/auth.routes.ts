import { Router } from "express";
import {
  handleSignup,
  handleLogin,
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

// Email + Password API routes
router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.post("/logout", logout);

export default router;