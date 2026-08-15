export type SessionStatus = "active" | "ended" | "interrupted";
export type SyncStatus = "pending" | "uploading" | "synced" | "failed";
export type MarkerSyncStatus = "pending" | "synced" | "failed";
export type MarkerSource = "tap" | "voice";
export type UploadQueueStatus = "pending" | "in-progress" | "synced" | "failed";

export interface Session {
  id: string;
  workerId: string;
  deviceId: string;
  startedAt: string;
  endedAt: string | null;
  status: SessionStatus;
  totalDurationMs: number;
  syncStatus: SyncStatus;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Marker {
  id: string;
  sessionId: string;
  offsetMs: number;
  capturedAt: string;
  sequenceNumber: number;
  source: MarkerSource;
  syncStatus: MarkerSyncStatus;
}

export interface AudioChunk {
  id: string;
  sessionId: string;
  chunkIndex: number;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  startOffsetMs: number;
  capturedAt: string;
  uploaded: boolean;
}

export interface UploadQueueJob {
  id: string;
  sessionId: string;
  status: UploadQueueStatus;
  attempts: number;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phoneNumber: string;
  facilityId: string;
}
