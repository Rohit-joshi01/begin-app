import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config/env.ts";
import authRepository from "./auth.repository.ts";
import profileRepository from "../profiles/profile.repository.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "../../shared/errors/index.ts";
import type { IAuth } from "../../shared/types/database.types.ts";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Result shape returned after successful user authentication.
 */
export interface AuthSessionResult {
  user: IAuth;
  token: string;
  isOnboarded: boolean;
  nextStep: string;
}

// ── Password Auth ────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Throws ConflictError if the email is already registered.
 */
export const register = async (
  email: string,
  password: string
): Promise<AuthSessionResult> => {
  const existing = await authRepository.findByEmail(email);

  if (existing) {
    throw new ConflictError("An account with this email already exists. Please log in.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await authRepository.create({
    email,
    passwordHash,
    isEmailVerified: true,          // treat signup itself as verification
    emailVerifiedAt: new Date(),
  });

  const profile = await profileRepository.create({
    userId: user._id as any,
    fullName: "",
    avatarUrl: "/images/default.svg",
  });

  const token = generateAuthToken(user);
  const isOnboarded = Boolean(profile?.isOnboarded);

  return {
    user,
    token,
    isOnboarded,
    nextStep: isOnboarded ? "/" : "/onboarding/role",
  };
};

/**
 * Log in an existing user with email + password.
 * Uses bcrypt.compare — password is NEVER stored or transmitted in plain text.
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthSessionResult> => {

  const user = await authRepository.findByEmailWithPassword(email);

  if (!user) {
    throw new NotFoundError("No account found with this email. Please sign up.");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Your account is currently inactive.");
  }

  if (!user.passwordHash) {
    // Account exists but was created via Google OAuth — no passwrd set
    throw new BadRequestError(
      "This account uses Google Sign-In. Please continue with Google."
    );

    // hala madrid
  }

  // passsowrd are never decyprted , bcrypt does that.
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new UnauthorizedError("Incorrect password. Please try again.");
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

// ── Google OAuth ─────────────────────────────────────────────────

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

// ── Token ────────────────────────────────────────────────────────────────────

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