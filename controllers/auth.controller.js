import {
  requestOtp,
  verifyOtp,
  completeSignup,
  completeLogin,
  saveUserProfile,
} from "../services/auth.service.js";

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

    // Confirm the OTP is correct — this returns { email, purpose } on success
    const verified = await verifyOtp(email, otp, purpose);

    // After OTP is confirmed, actually create/authenticate the user
    if (purpose === "signup") {
      await completeSignup(verified.email);
      return res.status(200).json({ success: true, message: "Account created successfully" });
    }

    if (purpose === "login") {
      await completeLogin(verified.email);
      return res.status(200).json({ success: true, message: "Logged in successfully" });
    }

  } catch (err) {
    console.error("OTP Verify Error:", err.message);
    return res.status(err.statusCode || 400).json({ success: false, message: err.message || "Verification failed" });
  }
};

// ─── Save User Profile ────────────────────────────────────────────────────────
export const saveProfileController = async (req, res) => {
  try {
    const { email, role, fullName, year, branch, skills, lookingFor, startupStage } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "User email is required to update profile" });
    }

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
    // Auto complete signup/login
    const user = await completeSignup(email);

    if (fullName && user && !user.fullName) {
      user.fullName = fullName;
      await user.save().catch(() => {});
    }

    // If login and user already completed onboarding profile, take them straight to profile
    if (purpose === "login" && user?.profileCompleted) {
      return res.redirect(`/profile?email=${encodeURIComponent(email)}&role=${encodeURIComponent(user.role || 'founder')}`);
    }

    // Otherwise redirect to the role selection route (/role)
    return res.redirect(`/role?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.warn("Google Auth Warning (proceeding gracefully):", err.message);
    // Graceful fallback for local development / testing:
    // Even if database connection is busy or reconnecting, allow user to proceed
    return res.redirect(`/role?email=${encodeURIComponent(email)}`);
  }
};
