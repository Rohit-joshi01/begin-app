import { eq } from "drizzle-orm";
import { getDb, withTransaction } from "../client.ts";
import {
  startups,
  startupMembers,
  users,
  type Startup,
  type NewStartup,
} from "../schema/index.ts";

/**
 * Example PostgreSQL + Drizzle repository demonstrating standard CRUD,
 * relational joins, and atomic transactions.
 *
 * Note: This is a reference implementation for future module migration.
 * Active application routes continue to use MongoDB + Mongoose.
 */
export class ExampleStartupPostgresRepository {
  /**
   * Inserts a startup and registers the owner as a founding team member
   * inside a single atomic PostgreSQL transaction.
   */
  async createWithFounder(data: NewStartup): Promise<Startup> {
    return withTransaction(async (tx) => {
      const [created] = await tx.insert(startups).values(data).returning();

      await tx.insert(startupMembers).values({
        startupId: created.id,
        userId: data.ownerId,
        role: "Founder",
      });

      return created;
    });
  }

  /**
   * Fetches a single startup record by UUID.
   */
  async findById(id: string): Promise<Startup | null> {
    const db = getDb();
    const [record] = await db.select().from(startups).where(eq(startups.id, id)).limit(1);
    return record ?? null;
  }

  /**
   * Queries a startup joined with its owner user and team member rows.
   */
  async findWithOwnerAndMembers(id: string) {
    const db = getDb();

    const rows = await db
      .select({
        startup: startups,
        ownerEmail: users.email,
        memberUserId: startupMembers.userId,
        memberRole: startupMembers.role,
      })
      .from(startups)
      .innerJoin(users, eq(startups.ownerId, users.id))
      .leftJoin(startupMembers, eq(startups.id, startupMembers.startupId))
      .where(eq(startups.id, id));

    if (rows.length === 0) {
      return null;
    }

    const { startup, ownerEmail } = rows[0];
    const members = rows
      .filter((r) => r.memberUserId !== null)
      .map((r) => ({
        userId: r.memberUserId as string,
        role: r.memberRole as string,
      }));

    return {
      ...startup,
      ownerEmail,
      members,
    };
  }

  /**
   * Updates mutable startup fields by ID.
   */
  async updateById(
    id: string,
    updates: Partial<Omit<NewStartup, "id" | "ownerId" | "createdAt">>
  ): Promise<Startup | null> {
    const db = getDb();
    const [updated] = await db
      .update(startups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(startups.id, id))
      .returning();

    return updated ?? null;
  }

  /**
   * Permanently deletes a startup record by ID (cascades to members/roles/milestones).
   */
  async deleteById(id: string): Promise<boolean> {
    const db = getDb();
    const deleted = await db
      .delete(startups)
      .where(eq(startups.id, id))
      .returning({ id: startups.id });

    return deleted.length > 0;
  }
}

export const exampleStartupPostgresRepository = new ExampleStartupPostgresRepository();
