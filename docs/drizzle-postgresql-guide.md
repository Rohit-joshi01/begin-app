# Drizzle ORM and PostgreSQL Database Layer Guide

## 1. Why Drizzle ORM Was Introduced

Begin currently runs on MongoDB with Mongoose, while the long-term relational data model (users, student profiles, colleges, skills, startups, projects, teams, communities, and notifications) benefits from strict foreign-key integrity, atomic multi-table transactions, and SQL join queries. Drizzle ORM was chosen because it provides a lightweight, SQL-first TypeScript schema and query builder with zero runtime magic, automatic type inference (`$inferSelect` and `$inferInsert`), and deterministic SQL migration files via Drizzle Kit.

Introducing Drizzle ORM and the PostgreSQL schema layer now establishes the relational foundation without disrupting production MongoDB + Mongoose execution.

---

## 2. PostgreSQL Configuration

PostgreSQL configuration is completely isolated from the existing Mongoose setup (`src/infrastructure/database/mongodb/connection.js`).

- **Environment variables** (`.env.example`):
  - `DATABASE_URL`: Standard PostgreSQL connection URI (e.g., `postgresql://begin_user:begin_secure_dev_password@localhost:5432/begin_db`).
  - `PG_POOL_MAX`: Maximum connections in the shared pool (default `10`).
  - `PG_IDLE_TIMEOUT_MS`: Idle client eviction timeout in milliseconds (default `30000`).
  - `PG_CONNECTION_TIMEOUT_MS`: Connection establishment timeout in milliseconds (default `5000`).
  - `PG_SSL`: Enables TLS (`"true"` or `"false"`).
- **Runtime config loader**: `src/database/config.ts` (`getPostgresConfig()`) validates `DATABASE_URL` lazily when PostgreSQL is initialized, so MongoDB-only startup does not fail if PostgreSQL is not active.
- **Drizzle Kit config**: `drizzle.config.ts` points to `./src/database/postgres/schema/index.ts` and outputs SQL migrations to `./src/database/postgres/migrations`.

---

## 3. Database Folder Structure

```text
begin-app/
├── drizzle.config.ts
├── tsconfig.json
└── src/
    └── database/
        ├── config.ts
        ├── index.ts
        └── postgres/
            ├── client.ts
            ├── migrations/
            │   ├── 0000_ambiguous_lyja.sql
            │   └── meta/
            ├── repositories/
            │   └── startup.example.repository.ts
            └── schema/
                ├── colleges.ts
                ├── communities.ts
                ├── index.ts
                ├── posts.ts
                ├── projects.ts
                ├── startups.ts
                ├── teams.ts
                └── users.ts
```

---

## 4. Schema Organization and Design Decisions

All schemas live in `src/database/postgres/schema/` and are re-exported with Drizzle `relations()` from `src/database/postgres/schema/index.ts`:

- `colleges.ts`: `colleges`
- `users.ts`: `users`, `emailOtps`, `studentProfiles`, `pastWorks`, `skills`, `userSkills`
- `startups.ts`: `startups`, `startupMembers`, `startupOpenRoles`, `startupMilestones`
- `projects.ts`: `projects`, `projectMembers`
- `teams.ts`: `invitations`, `collaborationRequests`, `follows`, `shortlists`
- `posts.ts`: `posts`, `comments`, `reactions`, `mediaAssets`
- `communities.ts`: `communities`, `communityMembers`, `notifications`

### Embedded Documents: Relational Tables vs. JSONB

- **Normalized into separate relational tables**: Multi-valued subdocument arrays that carry independent identities, foreign keys, or lifecycle states (`pastWorks`, `startupMembers`, `startupOpenRoles`, `startupMilestones`, `invitations`, `userSkills`, `projectMembers`, `communityMembers`).
- **Stored as typed JSONB columns**: Strict 1:1 scalar configuration objects (`socialLinks`, `privacy`, `founderDetails`, `joinerDetails` on `student_profiles`; `links` on `startups`). Keeping them as typed JSONB avoids unnecessary 1:1 joins while preserving exact Mongoose object structures.
- **Stored as PostgreSQL `text[]` arrays**: Simple tag lists (`interests`, `lookingFor`, `industryTags`, `skillsNeeded`) where separate join tables are unnecessary at this stage.

---

## 5. Migration Workflow

Migrations are the single source of truth for schema changes. Never use destructive auto-push in production.

```bash
# 1. Start local PostgreSQL container
docker compose up -d postgres

# 2. Generate SQL migration files after editing schema/*.ts
npm run db:generate

# 3. Review the generated SQL in src/database/postgres/migrations/

# 4. Apply pending migrations
npm run db:migrate

# 5. Verify schema and migration integrity
npm run db:check

# 6. Open Drizzle Studio in browser for local inspection
npm run db:studio
```

---

## 6. Connecting to PostgreSQL and Writing Queries

The shared singleton pool and Drizzle client live in `src/database/postgres/client.ts`:

- `getDb()`: Returns the singleton `NodePgDatabase<typeof schema>` instance backed by a single `pg.Pool`.
- `withTransaction(fn)`: Executes multiple operations inside an atomic PostgreSQL transaction.
- `checkPostgresConnection()`: Runs `SELECT 1` to verify connectivity.
- `closePostgresPool()`: Drains and closes the pool during graceful shutdown.

### Example Queries

```ts
import { eq } from "drizzle-orm";
import { getDb, withTransaction, startups, startupMembers, users } from "../database/index.ts";

const db = getDb();

// Fetch by ID with join
const rows = await db
  .select({ startup: startups, ownerEmail: users.email })
  .from(startups)
  .innerJoin(users, eq(startups.ownerId, users.id))
  .where(eq(startups.id, startupId));

// Atomic multi-table insert
await withTransaction(async (tx) => {
  const [created] = await tx.insert(startups).values(data).returning();
  await tx.insert(startupMembers).values({
    startupId: created.id,
    userId: data.ownerId,
    role: "Founder",
  });
});
```

See `src/database/postgres/repositories/startup.example.repository.ts` for the full reference implementation.

---

## 7. How to Add a New Table

1. Define the table with `pgTable` in the appropriate domain file under `src/database/postgres/schema/`.
2. Use `uuid("id").defaultRandom().primaryKey()`, explicit foreign keys with `onDelete` actions, indexes, and `createdAt`/`updatedAt` timestamps.
3. Export the table, inferred `$inferSelect` / `$inferInsert` types, and any Drizzle `relations()` in `src/database/postgres/schema/index.ts`.
4. Run `npm run typecheck:db` to verify TypeScript types.
5. Run `npm run db:generate`, review the generated SQL file, and apply it with `npm run db:migrate`.

---

## 8. Coexistence of MongoDB and PostgreSQL

- **Active production/runtime path**: All Express routes, controllers, services, and MongoDB repositories (`src/modules/*/*.repository.js` and `src/infrastructure/database/mongodb/`) continue to use Mongoose and `MONGO_URI` exclusively.
- **Prepared relational path**: `src/database/` (`DATABASE_URL`) initializes lazily only when explicitly called (such as during migrations or PostgreSQL tests). No active HTTP endpoints read or write to PostgreSQL, and no dual-writes exist.

---

## 9. Troubleshooting Connection Issues

- **`DATABASE_URL is not configured`**: Ensure `.env` defines `DATABASE_URL` (copy the format from `.env.example`).
- **`ECONNREFUSED 127.0.0.1:5432`**: Start the PostgreSQL Docker service via `docker compose up -d postgres` and verify with `docker compose ps`.
- **Authentication failure (`28P01`)**: Confirm `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `docker-compose.yml` match your `DATABASE_URL` in `.env`.
- **Migration fails due to existing tables**: Check `src/database/postgres/migrations/` and run `npm run db:check` to inspect migration state.
