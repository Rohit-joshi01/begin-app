import jwt from "jsonwebtoken";
import config from "../../config/env.ts";
import authRepository from "./auth.repository.ts";
import otpRepository from "./otp.repository.ts";
import profileRepository from "../profiles/profile.repository.ts";
import sendOTPEmail from "../../infrastructure/email/email.service.ts";
import { generateOTP, hashOTP, verifyOTP } from "../../shared/utils/crypto.utils.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../../shared/errors/index.js";
import type { IAuth, OTPPurpose } from "../../shared/types/database.types.ts";

/**
 * Result shape returned after successful user authentication.
 */
export interface AuthSessionResult {
  user: IAuth;
  token: string;
  isOnboarded: boolean;
  nextStep: string;
}

/**
 * Result shape returned after requesting an OTP.
 */
export interface RequestOTPResult {
  message: string;
  devOtp?: string;
}

/**
 * Authentication service managing credential-less email OTP flows,
 * Google OAuth profile resolution, and JWT session issuance.
 */

export const requestOTP = async (
  email: string,
  purpose: OTPPurpose | string
): Promise<RequestOTPResult> => {
  const user = await authRepository.findByEmail(email);

  if (purpose === "SIGNUP" && user?.isEmailVerified) {
    throw new ConflictError("Account already exists. Please login.");
  }

  if (purpose === "LOGIN" && !user) {
    throw new NotFoundError("Account not found. Please signup.");
  }

  if (user && !user.isActive) {
    throw new ForbiddenError("Account is inactive.");
  }

  // Prevent frequent OTP requests within cooldown window
  const recentOTP = await otpRepository.findRecentOTP(
    email,
    purpose,
    new Date(Date.now() - config.otp.cooldownSeconds * 1000)
  );

  if (recentOTP) {
    throw new BadRequestError("Please wait 60 seconds before requesting another OTP.");
  }

  // Invalidate previous OTPs for this email and purpose
  await otpRepository.deleteOTPsByEmailAndPurpose(email, purpose);

  const otp = generateOTP();
  console.log(`[AUTH OTP] Code for ${email} (${purpose}): ${otp}`);

  const otpRecord = await otpRepository.createOTP({
    email,
    otpHash: hashOTP(otp),
    purpose: purpose as OTPPurpose,
    expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
    attempts: 0,
    isUsed: false,
  });

  try {
    await sendOTPEmail({
      to: email,
      otp,
      purpose,
    });

    return {
      message: "OTP sent successfully. Check your email or server log.",
      devOtp: config.env !== "production" ? otp : undefined,
    };
  } catch (error: any) {
    if (config.env !== "production") {
      console.warn(`[AUTH OTP] Email sending failed (${error.message}). Use dev OTP: ${otp}`);
      return {
        message: `OTP sent (Dev code: ${otp}).`,
        devOtp: otp,
      };
    }

    await otpRepository.deleteOTPById(otpRecord._id);
    throw error;
  }
};

export const verifyOTPAndAuthenticate = async (
  email: string,
  otp: string,
  purpose: OTPPurpose | string
): Promise<AuthSessionResult> => {
  const otpRecord = await otpRepository.findActiveOTP(email, purpose);

  if (!otpRecord) {
    throw new BadRequestError("OTP expired or not found. Please request a new one.");
  }

  if (otpRecord.attempts >= config.otp.maxAttempts) {
    await otpRepository.deleteOTPById(otpRecord._id);
    throw new BadRequestError("Too many failed attempts. Please request a new OTP.");
  }

  const isValid = verifyOTP(otp, otpRecord.otpHash);
  if (!isValid) {
    await otpRepository.incrementAttempts(otpRecord._id);
    throw new BadRequestError("Invalid OTP. Please try again.");
  }

  await otpRepository.markOTPUsed(otpRecord._id);

  let user: IAuth | null;
  if (purpose === "SIGNUP") {
    user = await authRepository.upsertByEmail(email, {
      email,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else {
    user = await authRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Account not found.");
    }
  }

  const profile = await profileRepository.findByUserId(user._id as any) as any;
  const isOnboarded = Boolean(profile?.isOnboarded);
  const token = generateAuthToken(user);

  return {
    user,
    token,
    isOnboarded,
    nextStep: isOnboarded ? "/" : "/onboarding/role",
  };
};

export const authenticateWithGoogle = async (googleUser: any): Promise<AuthSessionResult> => {
  if (!googleUser?.email) {
    throw new BadRequestError("Failed to retrieve email address from Google.");
  }

  const email = googleUser.email.toLowerCase().trim();

  let user = await authRepository.findByGoogleIdOrEmail(googleUser.sub, email);

  if (!user) {
    user = await authRepository.create({
      email,
      googleId: googleUser.sub,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      profileImageUrl: googleUser.picture || "/images/default.svg",
    });
  } else {
    if (!user.isActive) {
      throw new ForbiddenError("Your account is currently inactive.");
    }

    const updates: Partial<IAuth> = {};
    if (!user.googleId) {
      updates.googleId = googleUser.sub;
    }
    if (!user.isEmailVerified) {
      updates.isEmailVerified = true;
      updates.emailVerifiedAt = new Date();
    }
    if ((!user.profileImageUrl || user.profileImageUrl === "/images/default.svg") && googleUser.picture) {
      updates.profileImageUrl = googleUser.picture;
    }

    if (Object.keys(updates).length > 0) {
      user = await authRepository.updateById(user._id, updates) as IAuth;
    }
  }

  let profile = await profileRepository.findByUserId(user._id as any) as any;
  if (!profile) {
    profile = await profileRepository.create({
      userId: user._id as any,
      fullName: googleUser.name || "",
      avatarUrl: googleUser.picture || "/images/default.svg",
    });
  } else if (!profile.fullName && googleUser.name) {
    const doc = await profileRepository.findDocumentByUserId(user._id as any) as any;
    if (doc) {
      doc.fullName = googleUser.name;
      if (!doc.avatarUrl || doc.avatarUrl === "/images/default.svg") {
        doc.avatarUrl = googleUser.picture || "/images/default.svg";
      }
      profile = await profileRepository.save(doc);
    }
  }

  const token = generateAuthToken(user);
  const isOnboarded = Boolean(profile?.isOnboarded);

  return {
    user,
    token,
    isOnboarded,
    nextStep: isOnboarded ? "/" : "/onboarding/role",
  };
};

export const generateAuthToken = (user: IAuth | { _id?: any; email: string; role?: string }): string => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};
