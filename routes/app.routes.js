import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ─── Public ──────────────────────────────────────────────────────────────────

// Landing — render the auth page (defaults to Step 1: Sign up / Log in)
router.get("/", (req, res) => {
  const step = Number(req.query.step) || 1;
  const email = req.query.email || "";
  const purpose = req.query.purpose || "signup";
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  res.render("auth", { initialStep: step, email, purpose, googleClientId });
});

// Dedicated OTP verification route: http://localhost:8000/verify
router.get("/verify", (req, res) => {
  const email = req.query.email || "";
  const purpose = req.query.purpose || "signup";
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  res.render("auth", { initialStep: 2, email, purpose, googleClientId });
});

// ─── Protected (requires valid JWT cookie) ───────────────────────────────────

// Role selection: /role or /onboarding or /onboarding-role
router.get(["/role", "/onboarding", "/onboarding-role"], requireAuth, (req, res) => {
  const email = req.query.email || req.user.email;
  res.render("role", { email });
});

// Onboarding profile: /profile
router.get("/profile", requireAuth, (req, res) => {
  const email = req.query.email || req.user.email;
  const role = req.query.role || "Founder";
  const purpose = req.query.purpose || "signup";
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  res.render("auth", { initialStep: 3, email, role, purpose, googleClientId });
});

export default router;
