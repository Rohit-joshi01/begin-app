import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const colleges = pgTable(
  "colleges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    shortName: varchar("short_name", { length: 64 }),
    domain: varchar("domain", { length: 255 }),
    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 120 }),
    country: varchar("country", { length: 120 }).notNull().default("India"),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_colleges_name").on(table.name),
    uniqueIndex("uq_colleges_domain").on(table.domain),
    index("idx_colleges_city").on(table.city),
  ]
);

export type College = typeof colleges.$inferSelect;
export type NewCollege = typeof colleges.$inferInsert;
