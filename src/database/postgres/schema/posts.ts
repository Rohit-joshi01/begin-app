import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { startups } from "./startups.ts";

export const postTypeEnum = pgEnum("post_type", ["Update", "Milestone", "Looking For"]);
export const reactionTypeEnum = pgEnum("reaction_type", ["LIKE", "CELEBRATE", "SUPPORT", "INSIGHTFUL"]);

/**
 * Maps Mongoose Post model (`src/modules/posts/models/post.model.js`).
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    startupId: uuid("startup_id").references(() => startups.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    postType: postTypeEnum("post_type").notNull().default("Update"),
    body: text("body").notNull(),
    coverImageUrl: text("cover_image_url"),
    profileImageUrl: text("profile_image_url").notNull(),
    startupName: varchar("startup_name", { length: 255 }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_posts_author_id").on(table.authorId),
    index("idx_posts_startup_id").on(table.startupId),
    index("idx_posts_post_type").on(table.postType),
    index("idx_posts_published_at").on(table.publishedAt),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_comments_post_id").on(table.postId),
    index("idx_comments_author_id").on(table.authorId),
  ]
);

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull().default("LIKE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_reactions_post_user_type").on(table.postId, table.userId, table.type),
    index("idx_reactions_user_id").on(table.userId),
  ]
);

/**
 * Tracks uploaded files currently persisted via Multer (`src/infrastructure/storage/multer.storage.js`).
 */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploaderId: uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: uuid("entity_id"),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_media_assets_uploader_id").on(table.uploaderId),
    index("idx_media_assets_entity").on(table.entityType, table.entityId),
  ]
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
