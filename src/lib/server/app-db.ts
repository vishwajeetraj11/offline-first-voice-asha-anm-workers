import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";

mkdirSync("./data", { recursive: true });

export const appDb = new Database("./data/app.db");
appDb.pragma("journal_mode = WAL");
appDb.exec(`
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
    session_id TEXT NOT NULL,
    offset_ms INTEGER NOT NULL,
    captured_at TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    source TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS app_audio_chunk (
    session_id TEXT NOT NULL,
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
    session_id TEXT NOT NULL,
    household_name TEXT,
    symptoms_json TEXT NOT NULL,
    action_taken TEXT,
    next_visit_at TEXT,
    confidence REAL NOT NULL,
    status TEXT NOT NULL,
    source_excerpt TEXT,
    created_at TEXT NOT NULL
  );
`);

try {
  appDb.exec("ALTER TABLE app_audio_chunk ADD COLUMN transcript_text TEXT");
} catch {
  // Column already exists on an initialized local database.
}

export function nowIso(): string {
  return new Date().toISOString();
}
