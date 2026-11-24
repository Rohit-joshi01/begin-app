import { BadRequestError } from "../../shared/errors/index.js";
import type { PastWorkLinkType } from "../../shared/types/database.types.js";

/**
 * Validation rules for profile updates, past work entries, and privacy settings.
 */

const VALID_LINK_TYPES = [
  "GitHub",
  "Behance",
  "Portfolio",
  "Figma",
  "Live Demo",
  "Other",
];

export interface PastWorkInput {
  title: string;
  url: string;
  linkType: PastWorkLinkType;
  description: string;
}

export interface PrivacyInput {
  hideYear?: boolean;
  hideBranch?: boolean;
  allowIntroRequests?: boolean;
}

export function validatePastWorkPayload({
  title,
  url,
  linkType,
  description,
}: any): PastWorkInput {
  if (!title || !title.trim()) {
    throw new BadRequestError("Project title is required.");
  }
  if (!url || !url.trim()) {
    throw new BadRequestError("Project URL is required.");
  }

  const selectedLinkType =
    linkType && VALID_LINK_TYPES.includes(linkType)
      ? (linkType as PastWorkLinkType)
      : "Portfolio";

  return {
    title: title.trim(),
    url: url.trim(),
    linkType: selectedLinkType,
    description: (description || "").trim().slice(0, 280),
  };
}

export function validatePrivacyPayload(body: any): PrivacyInput {
  const privacy: PrivacyInput = {};
  if (body.hideYear !== undefined) {
    privacy.hideYear = body.hideYear === true || body.hideYear === "true";
  }
  if (body.hideBranch !== undefined) {
    privacy.hideBranch = body.hideBranch === true || body.hideBranch === "true";
  }
  if (body.allowIntroRequests !== undefined) {
    privacy.allowIntroRequests =
      body.allowIntroRequests === true || body.allowIntroRequests === "true";
  }
  return privacy;
}
