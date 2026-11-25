import type { Types } from "mongoose";

/**
 * Shared domain database types and model interfaces.
 * These types provide full compile-time type safety across
 * models, repositories, services, and controllers.
 */

// ----------------------------------------------------
// 1. Authentication Domain Types
// ----------------------------------------------------

export type UserRole = "USER" | "ADMIN";

export interface IAuth {
  _id?: Types.ObjectId;
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  profileImageUrl: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}



// ----------------------------------------------------
// 2. Profile Domain Types
// ----------------------------------------------------

export type PastWorkLinkType =
  | "GitHub"
  | "Behance"
  | "Portfolio"
  | "Figma"
  | "Live Demo"
  | "Other";

export interface IPastWork {
  _id?: Types.ObjectId;
  title: string;
  url: string;
  linkType: PastWorkLinkType;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILinkedStartup {
  _id?: Types.ObjectId;
  name?: string;
  stage?: string;
  role?: string;
  startupId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface IPrivacySettings {
  hideYear: boolean;
  hideBranch: boolean;
  allowIntroRequests: boolean;
}

export interface IFounderDetails {
  startupName?: string;
  stage?: string;
}

export interface IJoinerDetails {
  skills?: string[];
  graduationYear?: number;
}

export type ProfileRole = "FOUNDER" | "JOINER" | "BOTH" | null;

export type AvailabilityStatus =
  | "Open to join"
  | "Looking for co-founder"
  | "Just exploring";

export interface IProfile {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  college: string;
  year: string;
  branch: string;
  bio: string;
  avatarUrl: string;
  role: ProfileRole;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  pastWork: IPastWork[];
  linkedStartups: ILinkedStartup[];
  availabilityStatus: AvailabilityStatus;
  weeklyHoursAvailable: number;
  isBuilder: boolean;
  builderBadgeAwardedAt?: Date | null;
  profileCompletionPercentage: number;
  socialLinks: ISocialLinks;
  privacy: IPrivacySettings;
  reputationCount: number;
  weeklyStreak: number;
  founderDetails: IFounderDetails;
  joinerDetails: IJoinerDetails;
  isOnboarded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------------------------------------
// 3. Startup Domain Types
// ----------------------------------------------------

export interface ITeamMember {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  joinedDate: Date;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface IStartupInvitation {
  _id?: Types.ObjectId;
  email: string;
  role: string;
  status: InvitationStatus;
  invitedAt: Date;
}

export type MilestoneType =
  | "Idea validated"
  | "Prototype ready"
  | "First users"
  | "Launched"
  | "Won event"
  | "Custom update";

export interface IStartupMilestone {
  _id?: Types.ObjectId;
  title: string;
  milestoneType: MilestoneType;
  description?: string;
  completedDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OpenRoleType = "co-founder" | "teammate" | "short-term collaboration";
export type OpenRoleStatus = "OPEN" | "FILLED" | "CLOSED";

export interface IOpenRole {
  _id?: Types.ObjectId;
  title: string;
  skillsNeeded: string[];
  commitmentHours: number;
  roleType: OpenRoleType;
  equityOrCreditNote?: string;
  status: OpenRoleStatus;
  createdAt: Date;
}

export type StartupStage = "Idea" | "Building MVP" | "Launched" | "Has users";
export type StartupVisibility = "PUBLIC" | "STEALTH";

export interface IStartupLinks {
  website?: string;
  demo?: string;
  github?: string;
  pitchDeck?: string;
}

export interface IStartup {
  _id?: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  pitch: string;
  problem?: string;
  solution?: string;
  industryTags: string[];
  stage: StartupStage;
  visibility: StartupVisibility;
  links: IStartupLinks;
  teamMembers: ITeamMember[];
  invitations: IStartupInvitation[];
  openRoles: IOpenRole[];
  milestones: IStartupMilestone[];
  isArchived: boolean;
  archivedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------------------------------------
// 4. Discovery Domain Types (Follow & Shortlist)
// ----------------------------------------------------

export type FollowTargetType = "USER" | "STARTUP";

export interface IFollow {
  _id?: Types.ObjectId;
  followerId: Types.ObjectId;
  targetType: FollowTargetType;
  targetId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ShortlistItemType = "USER" | "STARTUP";

export interface IShortlist {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  itemType: ShortlistItemType;
  itemId: Types.ObjectId;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------------------------------------
// 5. Post Domain Types
// ----------------------------------------------------

export type PostType = "Update" | "Milestone" | "Looking For";

export interface IPost {
  _id?: Types.ObjectId;
  title: string;
  postType: PostType;
  body: string;
  CoverImageUrl?: string;
  profileImageUrl: string;
  StartupName: string;
  time: Date;
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
