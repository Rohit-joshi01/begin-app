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

export const projectStatusEnum = pgEnum("project_status", [
  "IDEA",
  "IN_PROGRESS",
  "LAUNCHED",
  "ARCHIVED",
]);
export const projectVisibilityEnum = pgEnum("project_visibility", ["PUBLIC", "PRIVATE"]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startupId: uuid("startup_id").references(() => startups.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    summary: varchar("summary", { length: 280 }).notNull().default(""),
    description: text("description").notNull().default(""),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    status: projectStatusEnum("status").notNull().default("IN_PROGRESS"),
    visibility: projectVisibilityEnum("visibility").notNull().default("PUBLIC"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_projects_owner_id").on(table.ownerId),
    index("idx_projects_startup_id").on(table.startupId),
    index("idx_projects_status").on(table.status),
  ]
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 100 }).notNull().default("Contributor"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_project_members_project_user").on(table.projectId, table.userId),
    index("idx_project_members_user_id").on(table.userId),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
