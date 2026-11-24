import { BadRequestError } from "../../shared/errors/index.js";
import type { ProfileRole } from "../../shared/types/database.types.js";

/**
 * Validation rules and types for onboarding steps.
 */

export interface ProfileSetupPayload {
  fullName: string;
  college: string;
  bio?: string;
  startupName?: string;
  stage?: string;
  skills?: string[] | string;
  year?: string;
  branch?: string;
  interests?: string[] | string;
  lookingFor?: string[] | string;
}

export function validateRoleSelection(role: any): ProfileRole {
  if (!["FOUNDER", "JOINER", "BOTH"].includes(role)) {
    throw new BadRequestError("Invalid role selected. Must be FOUNDER, JOINER, or BOTH.");
  }
  return role as ProfileRole;
}

export function validateProfileSetupPayload(body: any): ProfileSetupPayload {
  const { fullName, college } = body || {};

  if (!fullName || !fullName.trim()) {
    throw new BadRequestError("Full Name is required.");
  }

  if (!college || !college.trim()) {
    throw new BadRequestError("College is required.");
  }

  return {
    fullName: fullName.trim(),
    college: college.trim(),
    bio: (body.bio || "").trim().slice(0, 280),
    startupName: (body.startupName || "").trim(),
    stage: (body.stage || "").trim(),
    skills: body.skills,
    year: body.year ? String(body.year).trim() : "",
    branch: body.branch ? String(body.branch).trim() : "",
    interests: body.interests,
    lookingFor: body.lookingFor,
  };
}
