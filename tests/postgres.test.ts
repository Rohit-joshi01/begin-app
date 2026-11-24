import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import {
  getDb,
  checkPostgresConnection,
  closePostgresPool,
  users,
} from "../src/database/index.ts";
import { exampleStartupPostgresRepository } from "../src/database/postgres/repositories/startup.example.repository.ts";

async function runPostgresTests() {
  console.log("Running PostgreSQL + Drizzle ORM Layer Tests...");
  const db = getDb();
  const testEmail = `pg-test-${Date.now()}@college.edu`;
  let createdUserId: string | null = null;

  try {
    // 1. Verify connection health
    const healthy = await checkPostgresConnection();
    assert.equal(healthy, true, "PostgreSQL health check should return true");

    // 2. Insert a test user
    const [insertedUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        isEmailVerified: true,
        role: "USER",
      })
      .returning();
    createdUserId = insertedUser.id;
    assert.ok(insertedUser.id, "Inserted user should have a UUID");

    // 3. Verify unique constraint on email
    await assert.rejects(
      async () => {
        await db.insert(users).values({ email: testEmail });
      },
      (err: unknown) => {
        const pgErr = err as { code?: string; cause?: { code?: string } };
        return pgErr.code === "23505" || pgErr.cause?.code === "23505";
      },
      "Duplicate email should trigger PostgreSQL unique constraint violation (23505)"
    );

    // 4. Verify foreign key constraint on startups.ownerId
    await assert.rejects(
      async () => {
        await exampleStartupPostgresRepository.createWithFounder({
          ownerId: "00000000-0000-0000-0000-000000000000",
          name: "Invalid FK Startup",
          pitch: "Should fail FK constraint",
        });
      },
      (err: unknown) => {
        const pgErr = err as { code?: string; cause?: { code?: string } };
        return pgErr.code === "23503" || pgErr.cause?.code === "23503";
      },
      "Non-existent ownerId should trigger PostgreSQL foreign key violation (23503)"
    );

    // 5. Transactional create via example repository
    const createdStartup = await exampleStartupPostgresRepository.createWithFounder({
      ownerId: createdUserId,
      name: "DrizzleCampus",
      pitch: "Testing Drizzle ORM relational layer",
      stage: "Idea",
      visibility: "PUBLIC",
      industryTags: ["EdTech", "SaaS"],
    });
    assert.ok(createdStartup.id, "Created startup should have a UUID");

    // 6. Fetch by ID and joined query
    const fetched = await exampleStartupPostgresRepository.findById(createdStartup.id);
    assert.equal(fetched?.name, "DrizzleCampus");

    const joined = await exampleStartupPostgresRepository.findWithOwnerAndMembers(
      createdStartup.id
    );
    assert.equal(joined?.ownerEmail, testEmail);
    assert.equal(joined?.members.length, 1);
    assert.equal(joined?.members[0].role, "Founder");

    // 7. Update record
    const updated = await exampleStartupPostgresRepository.updateById(createdStartup.id, {
      stage: "Building MVP",
    });
    assert.equal(updated?.stage, "Building MVP");

    // 8. Delete startup record
    const deleted = await exampleStartupPostgresRepository.deleteById(createdStartup.id);
    assert.equal(deleted, true);

    const afterDelete = await exampleStartupPostgresRepository.findById(createdStartup.id);
    assert.equal(afterDelete, null);

    console.log("PASS: All PostgreSQL + Drizzle connection, CRUD, join, transaction, and constraint tests succeeded!");
  } finally {
    if (createdUserId) {
      await db.delete(users).where(eq(users.id, createdUserId));
    }
    await closePostgresPool();
  }
}

runPostgresTests().catch((error) => {
  console.error("PostgreSQL tests failed:", error);
  process.exit(1);
});
