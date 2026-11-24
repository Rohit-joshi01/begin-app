import profileRepository from "./profile.repository.js";
import { calculateProfileCompletion } from "../../shared/helpers/profileCompletion.helper.js";
import { NotFoundError, BadRequestError } from "../../shared/errors/index.js";
import type { IProfile, IPrivacySettings, PastWorkLinkType } from "../../shared/types/database.types.js";

/**
 * Profile service managing builder profile data, past work portfolios,
 * privacy controls, and badge awards.
 */

const VALID_AVAILABILITY = [
  "Open to join",
  "Looking for co-founder",
  "Just exploring",
];

const VALID_LINK_TYPES = [
  "GitHub",
  "Behance",
  "Portfolio",
  "Figma",
  "Live Demo",
  "Other",
];

function sanitizeStringList(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(input)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getProfileByUserId(userId: string | any): Promise<IProfile | null> {
  let profileDoc = await profileRepository.findDocumentByUserId(userId);
  if (!profileDoc) {
    await profileRepository.create({ userId });
    profileDoc = await profileRepository.findDocumentByUserId(userId);
  }

  const { completionPercentage, isBuilder } = calculateProfileCompletion(profileDoc);
  let changed = false;

  if (profileDoc.profileCompletionPercentage !== completionPercentage) {
    profileDoc.profileCompletionPercentage = completionPercentage;
    changed = true;
  }
  if (profileDoc.isBuilder !== isBuilder) {
    profileDoc.isBuilder = isBuilder;
    profileDoc.builderBadgeAwardedAt = isBuilder
      ? profileDoc.builderBadgeAwardedAt || new Date()
      : null;
    changed = true;
  }

  if (changed) {
    await profileRepository.save(profileDoc);
  }

  return profileRepository.findByUserId(userId, true);
}

export async function getPublicProfileById(
  identifier: string,
  requesterUserId: string | any = null
): Promise<any> {
  let profile: any = null;

  if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    profile = await profileRepository.findById(identifier, true);
    if (!profile) {
      profile = await profileRepository.findByUserId(identifier, true);
    }
  }

  if (!profile) {
    return null;
  }

  const isOwner =
    requesterUserId &&
    profile.userId?._id?.toString() === requesterUserId.toString();

  const profileObject: any = { ...profile };

  if (!isOwner) {
    if (profileObject.privacy?.hideYear) {
      delete profileObject.year;
    }
    if (profileObject.privacy?.hideBranch) {
      delete profileObject.branch;
    }
  }

  profileObject.canSendIntro = Boolean(profileObject.privacy?.allowIntroRequests);
  profileObject.isOwner = Boolean(isOwner);

  return profileObject;
}

export async function updateProfile(userId: string | any, updateData: any): Promise<IProfile> {
  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  const fields = [
    "fullName",
    "college",
    "year",
    "branch",
    "bio",
    "avatarUrl",
    "role",
    "weeklyHoursAvailable",
    "isOnboarded",
  ];

  fields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (typeof updateData[field] === "string") {
        profile[field] = updateData[field].trim();
      } else {
        profile[field] = updateData[field];
      }
    }
  });

  if (updateData.availabilityStatus) {
    if (VALID_AVAILABILITY.includes(updateData.availabilityStatus)) {
      profile.availabilityStatus = updateData.availabilityStatus;
    } else {
      throw new BadRequestError("Invalid availability status value.");
    }
  }

  if (updateData.skills !== undefined) {
    profile.skills = sanitizeStringList(updateData.skills);
  }

  if (updateData.interests !== undefined) {
    profile.interests = sanitizeStringList(updateData.interests);
  }

  if (updateData.lookingFor !== undefined) {
    profile.lookingFor = sanitizeStringList(updateData.lookingFor);
  }

  if (updateData.socialLinks) {
    profile.socialLinks = {
      linkedin: (updateData.socialLinks.linkedin || profile.socialLinks?.linkedin || "").trim(),
      github: (updateData.socialLinks.github || profile.socialLinks?.github || "").trim(),
      twitter: (updateData.socialLinks.twitter || profile.socialLinks?.twitter || "").trim(),
      portfolio: (updateData.socialLinks.portfolio || profile.socialLinks?.portfolio || "").trim(),
    };
  }

  if (updateData.founderDetails) {
    profile.founderDetails = {
      startupName: (updateData.founderDetails.startupName || profile.founderDetails?.startupName || "").trim(),
      stage: (updateData.founderDetails.stage || profile.founderDetails?.stage || "").trim(),
    };
  }

  if (updateData.privacy) {
    profile.privacy = {
      hideYear:
        updateData.privacy.hideYear !== undefined
          ? Boolean(updateData.privacy.hideYear)
          : profile.privacy?.hideYear,
      hideBranch:
        updateData.privacy.hideBranch !== undefined
          ? Boolean(updateData.privacy.hideBranch)
          : profile.privacy?.hideBranch,
      allowIntroRequests:
        updateData.privacy.allowIntroRequests !== undefined
          ? Boolean(updateData.privacy.allowIntroRequests)
          : profile.privacy?.allowIntroRequests,
    };
  }

  return profileRepository.save(profile);
}

export async function addPastWork(
  userId: string | any,
  { title, url, linkType, description }: { title: string; url: string; linkType?: string; description?: string }
): Promise<IProfile> {
  if (!title || !title.trim()) {
    throw new BadRequestError("Project title is required.");
  }
  if (!url || !url.trim()) {
    throw new BadRequestError("Project URL is required.");
  }

  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  const selectedLinkType =
    linkType && VALID_LINK_TYPES.includes(linkType) ? (linkType as PastWorkLinkType) : "Portfolio";

  profile.pastWork.push({
    title: title.trim(),
    url: url.trim(),
    linkType: selectedLinkType,
    description: (description || "").trim(),
  });

  return profileRepository.save(profile);
}

export async function updateAvatar(userId: string | any, avatarUrl: string): Promise<IProfile> {
  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }
  profile.avatarUrl = avatarUrl;
  return profileRepository.save(profile);
}

export async function deletePastWork(userId: string | any, pastWorkId: string | any): Promise<IProfile> {
  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  profile.pastWork = profile.pastWork.filter(
    (item: any) => item._id.toString() !== pastWorkId.toString()
  );

  return profileRepository.save(profile);
}

export const removePastWork = deletePastWork;

export async function updatePrivacySettings(
  userId: string | any,
  privacyUpdates: any
): Promise<IPrivacySettings> {
  const profile = (await profileRepository.findDocumentByUserId(userId)) as any;
  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  profile.privacy = {
    hideYear:
      privacyUpdates.hideYear !== undefined
        ? Boolean(privacyUpdates.hideYear)
        : profile.privacy?.hideYear,
    hideBranch:
      privacyUpdates.hideBranch !== undefined
        ? Boolean(privacyUpdates.hideBranch)
        : profile.privacy?.hideBranch,
    allowIntroRequests:
      privacyUpdates.allowIntroRequests !== undefined
        ? Boolean(privacyUpdates.allowIntroRequests)
        : profile.privacy?.allowIntroRequests,
  };

  const saved = (await profileRepository.save(profile)) as IProfile;
  return saved.privacy;
}
