/**
 * Shared domain enumerations and system constants.
 * Strongly typed with const assertions for compile-time safety.
 */

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRoleConstant = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const BUILDER_ROLES = {
  FOUNDER: "FOUNDER",
  JOINER: "JOINER",
  BOTH: "BOTH",
} as const;
export type BuilderRoleConstant = (typeof BUILDER_ROLES)[keyof typeof BUILDER_ROLES];



export const STARTUP_STAGES = {
  IDEA: "Idea",
  BUILDING_MVP: "Building MVP",
  LAUNCHED: "Launched",
  HAS_USERS: "Has users",
} as const;
export type StartupStageConstant = (typeof STARTUP_STAGES)[keyof typeof STARTUP_STAGES];

export const STARTUP_VISIBILITY = {
  PUBLIC: "PUBLIC",
  STEALTH: "STEALTH",
} as const;
export type StartupVisibilityConstant = (typeof STARTUP_VISIBILITY)[keyof typeof STARTUP_VISIBILITY];

export const ROLE_TYPES = {
  CO_FOUNDER: "co-founder",
  TEAMMATE: "teammate",
  SHORT_TERM: "short-term collaboration",
} as const;
export type RoleTypeConstant = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];

export const ROLE_STATUS = {
  OPEN: "OPEN",
  FILLED: "FILLED",
  CLOSED: "CLOSED",
} as const;
export type RoleStatusConstant = (typeof ROLE_STATUS)[keyof typeof ROLE_STATUS];

export const AVAILABILITY_STATUS = {
  OPEN_TO_JOIN: "Open to join",
  LOOKING_FOR_COFOUNDER: "Looking for co-founder",
  JUST_EXPLORING: "Just exploring",
} as const;
export type AvailabilityStatusConstant = (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];

export const FOLLOW_TARGET_TYPES = {
  USER: "USER",
  STARTUP: "STARTUP",
} as const;
export type FollowTargetTypeConstant = (typeof FOLLOW_TARGET_TYPES)[keyof typeof FOLLOW_TARGET_TYPES];

export const SHORTLIST_ITEM_TYPES = {
  USER: "USER",
  STARTUP: "STARTUP",
} as const;
export type ShortlistItemTypeConstant = (typeof SHORTLIST_ITEM_TYPES)[keyof typeof SHORTLIST_ITEM_TYPES];
