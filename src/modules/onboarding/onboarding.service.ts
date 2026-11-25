import profileRepository from "../profiles/profile.repository.ts";
import { NotFoundError } from "../../shared/errors/index.ts";
import type { IProfile, ProfileRole } from "../../shared/types/database.types.ts";
import type { ProfileSetupPayload } from "./onboarding.validation.ts";

/**
 * Onboarding service handling student role selection and initial builder profile setup.
 */

export interface OnboardingStateResult {
  profile: IProfile | null;
  isOnboarded: boolean;
  role: ProfileRole;
}

export const getOnboardingState = async (userId: string | any): Promise<OnboardingStateResult> => {
  const profile = (await profileRepository.findByUserId(userId)) as IProfile | null;
  return {
    profile,
    isOnboarded: Boolean(profile?.isOnboarded),
    role: profile?.role || null,
  };
};

export const saveRole = async (userId: string | any, role: ProfileRole): Promise<{ profile: IProfile; nextStep: string }> => {
  const profile = (await profileRepository.upsertByUserId(userId, { role })) as IProfile;

  return {
    profile,
    nextStep: "/onboarding/profile",
  };
};

export const completeProfileSetup = async (
  userId: string | any,
  data: ProfileSetupPayload
): Promise<{ profile: IProfile; nextStep: string }> => {
  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  profile.fullName = data.fullName;
  profile.college = data.college;
  profile.bio = data.bio;
  profile.isOnboarded = true;

  if (data.year) profile.year = data.year;
  if (data.branch) profile.branch = data.branch;

  if (data.startupName) {
    if (!profile.founderDetails) profile.founderDetails = {};
    profile.founderDetails.startupName = data.startupName;
  }
  if (data.stage) {
    if (!profile.founderDetails) profile.founderDetails = {};
    profile.founderDetails.stage = data.stage;
  }

  if (data.skills) {
    const parsedSkills = Array.isArray(data.skills)
      ? data.skills
      : String(data.skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    profile.skills = parsedSkills;
    if (!profile.joinerDetails) profile.joinerDetails = {};
    profile.joinerDetails.skills = parsedSkills;
  }

  if (data.interests) {
    profile.interests = Array.isArray(data.interests)
      ? data.interests
      : String(data.interests)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }

  if (data.lookingFor) {
    profile.lookingFor = Array.isArray(data.lookingFor)
      ? data.lookingFor
      : String(data.lookingFor)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }

  const saved = (await profileRepository.save(profile)) as IProfile;

  return {
    profile: saved,
    nextStep: "/",
  };
};
