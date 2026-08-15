import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForPostgres = globalThis as typeof globalThis & {
  awaazPostgresPool?: Pool;
};

export const postgres =
  globalForPostgres.awaazPostgresPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.awaazPostgresPool = postgres;
}
