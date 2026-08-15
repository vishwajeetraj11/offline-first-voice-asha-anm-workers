import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { postgres } from "@/lib/server/postgres";

const globalForSchema = globalThis as typeof globalThis & {
  awaazAppSchemaReady?: Promise<void>;
};

async function createAppSchema(): Promise<void> {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS app_session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      total_duration_ms INTEGER NOT NULL DEFAULT 0,
      marker_count INTEGER NOT NULL DEFAULT 0,
      processing_status TEXT NOT NULL DEFAULT 'not_started',
      transcript TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_marker (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES app_session(id) ON DELETE CASCADE,
      offset_ms INTEGER NOT NULL,
      captured_at TEXT NOT NULL,
      sequence_number INTEGER NOT NULL,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_audio_chunk (
      session_id TEXT NOT NULL REFERENCES app_session(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      file_path TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      start_offset_ms INTEGER NOT NULL,
      captured_at TEXT NOT NULL,
      transcript_text TEXT,
      PRIMARY KEY (session_id, chunk_index)
    );

    CREATE TABLE IF NOT EXISTS visit_record (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES app_session(id) ON DELETE CASCADE,
      household_name TEXT,
      visit_category TEXT NOT NULL DEFAULT 'General',
      symptoms_json TEXT NOT NULL,
      action_taken TEXT,
      next_visit_at TEXT,
      confidence DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL,
      source_excerpt TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS app_session_user_created_idx
      ON app_session(user_id, created_at);
    CREATE INDEX IF NOT EXISTS app_marker_session_sequence_idx
      ON app_marker(session_id, sequence_number);
    CREATE INDEX IF NOT EXISTS visit_record_session_created_idx
      ON visit_record(session_id, created_at);
  `);
}

export function ensureAppSchema(): Promise<void> {
  globalForSchema.awaazAppSchemaReady ??= createAppSchema().catch((error) => {
    globalForSchema.awaazAppSchemaReady = undefined;
    throw error;
  });
  return globalForSchema.awaazAppSchemaReady;
}

export async function appQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  await ensureAppSchema();
  return postgres.query<T>(text, values);
}

export async function withAppTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await ensureAppSchema();
  const client = await postgres.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}
