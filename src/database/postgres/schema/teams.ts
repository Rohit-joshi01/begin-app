import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { startups } from "./startups.ts";
import { projects } from "./projects.ts";

export const invitationStatusEnum = pgEnum("invitation_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
]);
export const collaborationStatusEnum = pgEnum("collaboration_status", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
]);
export const targetEntityTypeEnum = pgEnum("target_entity_type", ["USER", "STARTUP"]);

/**
 * Maps Startup.invitations[] and supports project team invitations.
 */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startupId: uuid("startup_id").references(() => startups.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    inviterId: uuid("inviter_id").references(() => users.id, { onDelete: "set null" }),
    inviteeEmail: varchar("invitee_email", { length: 255 }).notNull(),
    inviteeUserId: uuid("invitee_user_id").references(() => users.id, { onDelete: "set null" }),
    role: varchar("role", { length: 100 }).notNull().default("Team Member"),
    status: invitationStatusEnum("status").notNull().default("PENDING"),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow().notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_invitations_startup_id").on(table.startupId),
    index("idx_invitations_project_id").on(table.projectId),
    index("idx_invitations_email").on(table.inviteeEmail),
    index("idx_invitations_status").on(table.status),
  ]
);

/**
 * Collaboration and intro requests between builders, startups, and projects.
 */
export const collaborationRequests = pgTable(
  "collaboration_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startupId: uuid("startup_id").references(() => startups.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    message: text("message").notNull().default(""),
    status: collaborationStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_collab_requests_sender_id").on(table.senderId),
    index("idx_collab_requests_recipient_id").on(table.recipientId),
    index("idx_collab_requests_status").on(table.status),
  ]
);

/**
 * Maps Mongoose Follow model (`src/modules/discovery/models/follow.model.js`).
 */
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: targetEntityTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_follows_follower_target").on(
      table.followerId,
      table.targetType,
      table.targetId
    ),
    index("idx_follows_target").on(table.targetType, table.targetId),
  ]
);

/**
 * Maps Mongoose Shortlist model (`src/modules/discovery/models/shortlist.model.js`).
 */
export const shortlists = pgTable(
  "shortlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: targetEntityTypeEnum("item_type").notNull(),
    itemId: uuid("item_id").notNull(),
    note: varchar("note", { length: 300 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_shortlists_user_item").on(table.userId, table.itemType, table.itemId),
    index("idx_shortlists_item").on(table.itemType, table.itemId),
  ]
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type CollaborationRequest = typeof collaborationRequests.$inferSelect;
export type NewCollaborationRequest = typeof collaborationRequests.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type Shortlist = typeof shortlists.$inferSelect;
export type NewShortlist = typeof shortlists.$inferInsert;
