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
import { users } from "./users.ts";
import { colleges } from "./colleges.ts";

export const startupStageEnum = pgEnum("startup_stage", [
  "Idea",
  "Building MVP",
  "Launched",
  "Has users",
]);
export const startupVisibilityEnum = pgEnum("startup_visibility", ["PUBLIC", "STEALTH"]);
export const openRoleTypeEnum = pgEnum("open_role_type", [
  "co-founder",
  "teammate",
  "short-term collaboration",
]);
export const openRoleStatusEnum = pgEnum("open_role_status", ["OPEN", "FILLED", "CLOSED"]);
export const milestoneTypeEnum = pgEnum("milestone_type", [
  "Idea validated",
  "Prototype ready",
  "First users",
  "Launched",
  "Won event",
  "Custom update",
]);

export interface StartupLinksJson {
  website: string;
  demo: string;
  github: string;
  pitchDeck: string;
}

/**
 * Maps Mongoose Startup model (`src/modules/startups/models/startup.model.js`).
 */
export const startups = pgTable(
  "startups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    pitch: varchar("pitch", { length: 200 }).notNull(),
    problem: text("problem").notNull().default(""),
    solution: text("solution").notNull().default(""),
    industryTags: text("industry_tags").array().notNull().default([]),
    stage: startupStageEnum("stage").notNull().default("Idea"),
    visibility: startupVisibilityEnum("visibility").notNull().default("PUBLIC"),
    links: jsonb("links")
      .$type<StartupLinksJson>()
      .notNull()
      .default({ website: "", demo: "", github: "", pitchDeck: "" }),
    isArchived: boolean("is_archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_startups_owner_id").on(table.ownerId),
    index("idx_startups_college_id").on(table.collegeId),
    index("idx_startups_stage").on(table.stage),
    index("idx_startups_visibility").on(table.visibility),
    index("idx_startups_is_archived").on(table.isArchived),
  ]
);

/**
 * Maps Startup.teamMembers[] and Profile.linkedStartups[] into a normalized join table.
 */
export const startupMembers = pgTable(
  "startup_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 100 }).notNull().default("Team Member"),
    joinedDate: timestamp("joined_date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_startup_members_startup_user").on(table.startupId, table.userId),
    index("idx_startup_members_user_id").on(table.userId),
  ]
);

/**
 * Maps Startup.openRoles[] embedded array.
 */
export const startupOpenRoles = pgTable(
  "startup_open_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    skillsNeeded: text("skills_needed").array().notNull().default([]),
    commitmentHours: integer("commitment_hours").notNull().default(0),
    roleType: openRoleTypeEnum("role_type").notNull().default("teammate"),
    equityOrCreditNote: text("equity_or_credit_note").notNull().default(""),
    status: openRoleStatusEnum("status").notNull().default("OPEN"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_startup_open_roles_startup_id").on(table.startupId),
    index("idx_startup_open_roles_status").on(table.status),
  ]
);

/**
 * Maps Startup.milestones[] embedded array.
 */
export const startupMilestones = pgTable(
  "startup_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    milestoneType: milestoneTypeEnum("milestone_type").notNull().default("Custom update"),
    description: text("description").notNull().default(""),
    completedDate: timestamp("completed_date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_startup_milestones_startup_id").on(table.startupId)]
);

export type Startup = typeof startups.$inferSelect;
export type NewStartup = typeof startups.$inferInsert;
export type StartupMember = typeof startupMembers.$inferSelect;
export type NewStartupMember = typeof startupMembers.$inferInsert;
export type StartupOpenRole = typeof startupOpenRoles.$inferSelect;
export type NewStartupOpenRole = typeof startupOpenRoles.$inferInsert;
export type StartupMilestone = typeof startupMilestones.$inferSelect;
export type NewStartupMilestone = typeof startupMilestones.$inferInsert;
