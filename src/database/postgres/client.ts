import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { getPostgresConfig } from "../config.ts";
import * as schema from "./schema/index.ts";

export type PostgresDatabase = NodePgDatabase<typeof schema>;

let poolInstance: Pool | null = null;
let dbInstance: PostgresDatabase | null = null;

/**
 * Returns the shared PostgreSQL connection pool, initializing it lazily
 * on first access so MongoDB-only runtime flows do not require PostgreSQL.
 */
export function getPostgresPool(): Pool {
  if (!poolInstance) {
    const pgConfig = getPostgresConfig();

    poolInstance = new Pool({
      connectionString: pgConfig.databaseUrl,
      max: pgConfig.maxConnections,
      idleTimeoutMillis: pgConfig.idleTimeoutMillis,
      connectionTimeoutMillis: pgConfig.connectionTimeoutMillis,
      ssl: pgConfig.ssl ? { rejectUnauthorized: false } : false,
    });

    poolInstance.on("error", (err: Error) => {
      console.error("Unexpected PostgreSQL pool error:", err.message);
    });
  }

  return poolInstance;
}

/**
 * Returns the singleton type-safe Drizzle ORM instance backed by the shared pg Pool.
 */
export function getDb(): PostgresDatabase {
  if (!dbInstance) {
    dbInstance = drizzle(getPostgresPool(), { schema });
  }
  return dbInstance;
}

/**
 * Executes a callback within a PostgreSQL transaction using the shared Drizzle client.
 */
export async function withTransaction<T>(
  callback: (tx: Parameters<Parameters<PostgresDatabase["transaction"]>[0]>[0]) => Promise<T>
): Promise<T> {
  const db = getDb();
  return db.transaction(callback);
}

/**
 * Verifies PostgreSQL connectivity using a lightweight SELECT 1 probe.
 */
export async function checkPostgresConnection(): Promise<boolean> {
  const db = getDb();
  await db.execute(sql`SELECT 1`);
  return true;
}

/**
 * Gracefully drains and closes the shared PostgreSQL connection pool.
 */
export async function closePostgresPool(): Promise<void> {
  if (poolInstance) {
    const pool = poolInstance;
    poolInstance = null;
    dbInstance = null;
    await pool.end();
  }
}
