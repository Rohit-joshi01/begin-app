import { BadRequestError } from "../../shared/errors/index.ts";
import type { FollowTargetType, ShortlistItemType } from "../../shared/types/database.types.ts";

/**
 * Validation rules and types for discovery filters, follow actions, and shortlisting.
 */

export interface FollowPayload {
  targetType: FollowTargetType;
  targetId: string;
}

export interface ShortlistPayload {
  itemType: ShortlistItemType;
  itemId: string;
  note?: string;
}

export function validateFollowPayload({ targetType, targetId }: any): FollowPayload {
  if (!targetType || !["USER", "STARTUP"].includes(targetType)) {
    throw new BadRequestError("Valid targetType (USER or STARTUP) is required.");
  }
  if (!targetId) {
    throw new BadRequestError("targetId is required.");
  }
  return { targetType: targetType as FollowTargetType, targetId: String(targetId).trim() };
}

export function validateShortlistPayload({ itemType, itemId, note }: any): ShortlistPayload {
  if (!itemType || !["USER", "STARTUP"].includes(itemType)) {
    throw new BadRequestError("Valid itemType (USER or STARTUP) is required.");
  }
  if (!itemId) {
    throw new BadRequestError("itemId is required.");
  }
  return {
    itemType: itemType as ShortlistItemType,
    itemId: String(itemId).trim(),
    note: (note || "").slice(0, 300),
  };
}
