import "dotenv/config";

/**
 * PostgreSQL connection configuration for Drizzle ORM.
 * Kept separate from Mongoose/MongoDB configuration so both adapters coexist cleanly.
 */
export interface PostgresConfig {
  databaseUrl: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl: boolean;
}

export function getPostgresConfig(): PostgresConfig {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL in your environment to connect to PostgreSQL."
    );
  }

  return {
    databaseUrl,
    maxConnections: Number.parseInt(process.env.PG_POOL_MAX || "10", 10),
    idleTimeoutMillis: Number.parseInt(process.env.PG_IDLE_TIMEOUT_MS || "30000", 10),
    connectionTimeoutMillis: Number.parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || "5000", 10),
    ssl: process.env.PG_SSL === "true",
  };
}
