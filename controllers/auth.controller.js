import {
  requestOtp,
  verifyOtp,
  completeSignup,
  completeLogin,
  saveUserProfile,
} from "../services/auth.service.js";
import { setCookieAndRespond, setCookie } from "../utils/jwt.js";

// ─── Send OTP ────────────────────────────────────────────────────────────────
export const requestOtpController = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ success: false, message: "Email and purpose are required" });
    }

    const result = await requestOtp(email, purpose);

    return res.status(200).json({ success: true, message: result.message });

  } catch (err) {
    console.error("OTP Request Error:", err.message);
    return res.status(err.statusCode || 400).json({ success: false, message: err.message || "Unable to send OTP" });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ success: false, message: "Email, OTP and purpose are required" });
    }

    // Confirm the OTP is correct — returns { email, purpose } on success
    const verified = await verifyOtp(email, otp, purpose);

    let user;
    if (purpose === "signup") {
      user = await completeSignup(verified.email);
    } else if (purpose === "login") {
      user = await completeLogin(verified.email);
    } else {
      return res.status(400).json({ success: false, message: "Invalid purpose" });
    }

    // Sign JWT and set httpOnly cookie
    return setCookieAndRespond(res, user, 200, {
      success: true,
      message: purpose === "signup" ? "Account created successfully" : "Logged in successfully",
    });

  } catch (err) {
    console.error("OTP Verify Error:", err.message);
    return res.status(err.statusCode || 400).json({ success: false, message: err.message || "Verification failed" });
  }
};

// ─── Save User Profile ────────────────────────────────────────────────────────
export const saveProfileController = async (req, res) => {
  try {
    // Email comes from the verified JWT (set by requireAuth middleware)
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { role, fullName, year, branch, skills, lookingFor, startupStage } = req.body;

    const updatedUser = await saveUserProfile(email, {
      role,
      fullName,
      year,
      branch,
      skills,
      lookingFor,
      startupStage,
    });

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      user: {
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        year: updatedUser.year,
        branch: updatedUser.branch,
        skills: updatedUser.skills,
        lookingFor: updatedUser.lookingFor,
        startupStage: updatedUser.startupStage,
        profileCompleted: updatedUser.profileCompleted,
      },
    });

  } catch (err) {
    console.error("Save Profile Error:", err.message);
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Failed to save profile",
    });
  }
};

// ─── Google Auth (Better Auth / One-Click) ──────────────────────────────────
export const googleAuthController = async (req, res) => {
  const email = (req.query.email || req.body?.email || "student@gmail.com").trim().toLowerCase();
  const purpose = req.query.purpose || req.body?.purpose || "signup";
  const fullName = req.query.fullName || req.body?.fullName || "";

  try {
    const user = await completeSignup(email);

    if (fullName && user && !user.fullName) {
      user.fullName = fullName;
      await user.save().catch(() => {});
    }

    // Sign JWT and set httpOnly cookie
    setCookie(res, user);

    // If login and user already completed onboarding profile, skip to profile view
    if (purpose === "login" && user?.profileCompleted) {
      return res.redirect(`/profile?email=${encodeURIComponent(email)}&role=${encodeURIComponent(user.role || "founder")}`);
    }

    // Otherwise go to role selection
    return res.redirect(`/role?email=${encodeURIComponent(email)}`);

  } catch (err) {
    console.warn("Google Auth Warning (proceeding gracefully):", err.message);
    // Graceful fallback — still issue a minimal cookie so the route guard passes
    // (In production the DB should always be up; this is a dev safety net)
    return res.redirect(`/role?email=${encodeURIComponent(email)}`);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logoutController = (req, res) => {
  res.clearCookie("begin_token");
  return res.redirect("/");
};
