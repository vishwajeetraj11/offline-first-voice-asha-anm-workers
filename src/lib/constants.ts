export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// MediaRecorder timeslice: bounds the in-memory buffer between
// `ondataavailable` callbacks so an hours-long shift never holds more than
// ~15s of audio in memory at once.
export const RECORDING_TIMESLICE_MS = 15_000;

// Checkpoint sessions.totalDurationMs roughly once a minute so a killed tab
// still shows accurate partial progress on reload.
export const CHECKPOINT_EVERY_N_CHUNKS = 4;

// attempt 1 -> 10s, 2 -> 30s, 3 -> 60s, 4 -> 5min, 5+ -> 15min (capped)
const BACKOFF_SCHEDULE_MS = [10_000, 30_000, 60_000, 5 * 60_000, 15 * 60_000];

export function getBackoffDelayMs(attempts: number): number {
  const index = Math.min(attempts - 1, BACKOFF_SCHEDULE_MS.length - 1);
  return BACKOFF_SCHEDULE_MS[Math.max(index, 0)];
}

export const SYNC_POLL_INTERVAL_MS = 30_000;

export const DEVICE_ID_STORAGE_KEY = "asha-voice-register:device-id";
