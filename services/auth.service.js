import crypto from "crypto";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "./email.service.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeEmail = (email) => email.trim().toLowerCase();

// Validate that the email has a valid format (accepts Gmail, college emails, etc.)
const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error("Please enter a valid email address (e.g. yourname@gmail.com)");
    err.statusCode = 400;
    throw err;
  }
};

// HMAC-SHA256 so the raw OTP is never stored in the database
const hashOtp = (otp) => {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET is not configured");
  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
};

// ─── Request OTP ─────────────────────────────────────────────────────────────

export const requestOtp = async (email, purpose) => {
  email = normalizeEmail(email);

  // Basic format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error("Invalid email address");
    err.statusCode = 400;
    throw err;
  }

  if (!["signup", "login"].includes(purpose)) {
    const err = new Error("Invalid authentication purpose");
    err.statusCode = 400;
    throw err;
  }

  // Accepts Gmail, college emails, and any valid address
  validateEmailFormat(email);

  const existingUser = await User.findOne({ email });

  if (purpose === "signup" && existingUser) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  if (purpose === "login" && !existingUser) {
    const err = new Error("No account found with this email. Please sign up first");
    err.statusCode = 404;
    throw err;
  }

  // Wipe any previous OTP for this email+purpose combo
  await OTP.deleteMany({ email, purpose });

  // Six-digit OTP using cryptographically secure random
  const otp = crypto.randomInt(100000, 1000000).toString();

  // 5-minute window
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.create({
    email,
    otpHash: hashOtp(otp),
    purpose,
    expiresAt,
  });

  // Always log OTP to server console for seamless local development & testing
  console.log(`\n======================================================`);
  console.log(`🔑 [BEGIN AUTH] 6-digit OTP for ${email}: ${otp} (${purpose})`);
  console.log(`======================================================\n`);

  // Attempt email delivery; if SMTP credentials are not configured or fail in dev, don't crash
  try {
    await sendOTPEmail(email, otp, purpose);
  } catch (smtpErr) {
    console.warn(`⚠️  [SMTP Notice]: Email delivery failed (${smtpErr.message}).`);
    console.warn(`👉  Use the OTP printed in the terminal console above: ${otp}`);
  }

  return { message: "OTP sent successfully. Check your inbox." };
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtp = async (email, enteredOtp, purpose) => {
  email = normalizeEmail(email);

  const otpRecord = await OTP.findOne({ email, purpose });

  if (!otpRecord) {
    const err = new Error("OTP not found. Please request a new one");
    err.statusCode = 400;
    throw err;
  }

  // Guard against expired records that the TTL index hasn't swept yet
  if (Date.now() >= otpRecord.expiresAt.getTime()) {
    await OTP.deleteOne({ _id: otpRecord._id });
    const err = new Error("OTP has expired. Please request a new one");
    err.statusCode = 400;
    throw err;
  }

  // Lock out after 5 wrong guesses
  if (otpRecord.attempts >= 5) {
    await OTP.deleteOne({ _id: otpRecord._id });
    const err = new Error("Too many incorrect attempts. Please request a new OTP");
    err.statusCode = 429;
    throw err;
  }

  const isValidFormat = /^\d{6}$/.test(enteredOtp);
  const submittedHash = isValidFormat ? hashOtp(enteredOtp) : "";

  // Constant-time comparison to avoid timing attacks
  const isValid =
    isValidFormat &&
    crypto.timingSafeEqual(
      Buffer.from(otpRecord.otpHash, "hex"),
      Buffer.from(submittedHash, "hex")
    );

  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      const err = new Error("Too many incorrect attempts. Please request a new OTP");
      err.statusCode = 429;
      throw err;
    }

    const remaining = 5 - otpRecord.attempts;
    const err = new Error(`Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining`);
    err.statusCode = 400;
    throw err;
  }

  // Single-use — delete immediately after a correct entry
  await OTP.deleteOne({ _id: otpRecord._id });

  return { email, purpose };
};

// ─── Post-verification actions ────────────────────────────────────────────────

// Called after a successful signup OTP → create or ensure the user
export const completeSignup = async (email) => {
  email = normalizeEmail(email);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
  }
  return user;
};

// Called after a successful login OTP → just return the user record
export const completeLogin = async (email) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// Called when user submits their Step 4 onboarding profile
export const saveUserProfile = async (email, profileData = {}) => {
  email = normalizeEmail(email);
  let user = await User.findOne({ email });
  if (!user) {
    // If not found yet, create the user record
    user = new User({ email });
  }

  const {
    fullName,
    role,
    year,
    branch,
    skills,
    lookingFor,
    startupStage,
  } = profileData;

  if (fullName !== undefined) user.fullName = String(fullName).trim();
  if (role && ["founder", "joiner", "both"].includes(role)) user.role = role;
  if (year !== undefined) user.year = String(year).trim();
  if (branch !== undefined) user.branch = String(branch).trim();
  if (Array.isArray(skills)) user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
  if (Array.isArray(lookingFor)) user.lookingFor = lookingFor.map((l) => String(l).trim()).filter(Boolean);
  if (startupStage && ["Idea", "Building MVP", "Launched", "Has users"].includes(startupStage)) {
    user.startupStage = startupStage;
  }
  user.profileCompleted = true;

  await user.save();
  return user;
};
