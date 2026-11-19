import express from "express";

const router = express.Router();

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

// Dedicated Role Selection route: http://localhost:8000/role or /onboarding
router.get(["/role", "/onboarding", "/onboarding-role"], (req, res) => {
  const email = req.query.email || "";
  res.render("role", { email });
});

// Dedicated Onboarding Profile route: http://localhost:8000/profile
router.get("/profile", (req, res) => {
  const email = req.query.email || "";
  const role = req.query.role || "Founder";
  const purpose = req.query.purpose || "signup";
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  res.render("auth", { initialStep: 3, email, role, purpose, googleClientId });
});

export default router;
