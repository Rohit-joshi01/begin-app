import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { colleges } from "./colleges.ts";

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const otpPurposeEnum = pgEnum("otp_purpose", ["SIGNUP", "LOGIN"]);
export const profileRoleEnum = pgEnum("profile_role", ["FOUNDER", "JOINER", "BOTH"]);
export const availabilityStatusEnum = pgEnum("availability_status", [
  "Open to join",
  "Looking for co-founder",
  "Just exploring",
]);
export const pastWorkLinkTypeEnum = pgEnum("past_work_link_type", [
  "GitHub",
  "Behance",
  "Portfolio",
  "Figma",
  "Live Demo",
  "Other",
]);

export interface SocialLinksJson {
  linkedin: string;
  github: string;
  twitter: string;
  portfolio: string;
}

export interface PrivacySettingsJson {
  hideYear: boolean;
  hideBranch: boolean;
  allowIntroRequests: boolean;
}

export interface FounderDetailsJson {
  startupName: string;
  stage: string;
}

export interface JoinerDetailsJson {
  skills: string[];
  graduationYear?: number | null;
}

/**
 * Maps Mongoose Auth model (`src/modules/auth/models/auth.model.js`).
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    googleId: varchar("google_id", { length: 255 }),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    profileImageUrl: text("profile_image_url").notNull().default("/images/default.svg"),
    role: userRoleEnum("role").notNull().default("USER"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_users_email").on(table.email),
    uniqueIndex("uq_users_google_id").on(table.googleId),
  ]
);

/**
 * Maps Mongoose EmailOTP model (`src/modules/auth/models/otp.model.js`).
 */
export const emailOtps = pgTable(
  "email_otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    otpHash: varchar("otp_hash", { length: 255 }).notNull(),
    purpose: otpPurposeEnum("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    isUsed: boolean("is_used").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_email_otps_email_purpose").on(table.email, table.purpose),
    index("idx_email_otps_expires_at").on(table.expiresAt),
  ]
);

/**
 * Maps Mongoose Profile model (`src/modules/profiles/models/profile.model.js`).
 * Scalar 1:1 embedded objects (socialLinks, privacy, founderDetails, joinerDetails)
 * are stored as typed JSONB columns to preserve schema shape without unnecessary joins.
 */
export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "set null" }),
    fullName: varchar("full_name", { length: 255 }).notNull().default(""),
    collegeName: varchar("college_name", { length: 255 }).notNull().default(""),
    year: varchar("year", { length: 64 }).notNull().default(""),
    branch: varchar("branch", { length: 255 }).notNull().default(""),
    bio: varchar("bio", { length: 280 }).notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default("/images/default.svg"),
    role: profileRoleEnum("role"),
    interests: text("interests").array().notNull().default([]),
    lookingFor: text("looking_for").array().notNull().default([]),
    availabilityStatus: availabilityStatusEnum("availability_status")
      .notNull()
      .default("Just exploring"),
    weeklyHoursAvailable: integer("weekly_hours_available").notNull().default(0),
    isBuilder: boolean("is_builder").notNull().default(false),
    builderBadgeAwardedAt: timestamp("builder_badge_awarded_at", { withTimezone: true }),
    profileCompletionPercentage: integer("profile_completion_percentage").notNull().default(0),
    socialLinks: jsonb("social_links")
      .$type<SocialLinksJson>()
      .notNull()
      .default({ linkedin: "", github: "", twitter: "", portfolio: "" }),
    privacy: jsonb("privacy")
      .$type<PrivacySettingsJson>()
      .notNull()
      .default({ hideYear: false, hideBranch: false, allowIntroRequests: true }),
    reputationCount: integer("reputation_count").notNull().default(0),
    weeklyStreak: integer("weekly_streak").notNull().default(0),
    founderDetails: jsonb("founder_details")
      .$type<FounderDetailsJson>()
      .notNull()
      .default({ startupName: "", stage: "" }),
    joinerDetails: jsonb("joiner_details")
      .$type<JoinerDetailsJson>()
      .notNull()
      .default({ skills: [], graduationYear: null }),
    isOnboarded: boolean("is_onboarded").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_student_profiles_user_id").on(table.userId),
    index("idx_student_profiles_college_id").on(table.collegeId),
    index("idx_student_profiles_role").on(table.role),
    index("idx_student_profiles_availability").on(table.availabilityStatus),
    index("idx_student_profiles_is_builder").on(table.isBuilder),
    index("idx_student_profiles_is_onboarded").on(table.isOnboarded),
  ]
);

/**
 * Maps embedded Profile.pastWork[] array into a normalized 1:N relational table.
 */
export const pastWorks = pgTable(
  "past_works",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => studentProfiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    url: text("url").notNull(),
    linkType: pastWorkLinkTypeEnum("link_type").notNull().default("Portfolio"),
    description: varchar("description", { length: 280 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_past_works_profile_id").on(table.profileId)]
);

/**
 * Canonical skill catalog extracted from Profile.skills[] and Startup.openRoles[].skillsNeeded[].
 */
export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    category: varchar("category", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_skills_name").on(table.name),
    uniqueIndex("uq_skills_slug").on(table.slug),
  ]
);

/**
 * Join table linking users to normalized skills.
 */
export const userSkills = pgTable(
  "user_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    proficiency: varchar("proficiency", { length: 50 }).default("Intermediate"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_user_skills_user_skill").on(table.userId, table.skillId),
    index("idx_user_skills_skill_id").on(table.skillId),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmailOtp = typeof emailOtps.$inferSelect;
export type NewEmailOtp = typeof emailOtps.$inferInsert;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
export type PastWork = typeof pastWorks.$inferSelect;
export type NewPastWork = typeof pastWorks.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
