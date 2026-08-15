import { db } from "@/lib/db/schema";
import type {
  AudioChunk,
  Marker,
  Session,
  UploadQueueJob,
} from "@/types/domain";

function nowIso(): string {
  return new Date().toISOString();
}

// --- sessions ---------------------------------------------------------

export async function createSession(params: {
  id: string;
  workerId: string;
  deviceId: string;
  startedAt: string;
}): Promise<Session> {
  const session: Session = {
    id: params.id,
    workerId: params.workerId,
    deviceId: params.deviceId,
    startedAt: params.startedAt,
    endedAt: null,
    status: "active",
    totalDurationMs: 0,
    syncStatus: "pending",
    syncError: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.sessions.add(session);
  return session;
}

export async function checkpointSessionDuration(
  sessionId: string,
  totalDurationMs: number
): Promise<void> {
  await db.sessions.update(sessionId, {
    totalDurationMs,
    updatedAt: nowIso(),
  });
}

export async function endSession(
  sessionId: string,
  totalDurationMs: number
): Promise<void> {
  await db.sessions.update(sessionId, {
    status: "ended",
    endedAt: nowIso(),
    totalDurationMs,
    syncStatus: "pending",
    updatedAt: nowIso(),
  });
}

export async function markSessionInterrupted(
  sessionId: string,
  lastKnownDurationMs: number
): Promise<void> {
  await db.sessions.update(sessionId, {
    status: "interrupted",
    endedAt: nowIso(),
    totalDurationMs: lastKnownDurationMs,
    syncStatus: "pending",
    updatedAt: nowIso(),
  });
}

export async function setSessionSyncStatus(
  sessionId: string,
  syncStatus: Session["syncStatus"],
  syncError: string | null = null
): Promise<void> {
  await db.sessions.update(sessionId, {
    syncStatus,
    syncError,
    updatedAt: nowIso(),
  });
}

export async function findActiveOrphanSessions(): Promise<Session[]> {
  return db.sessions.where("status").equals("active").toArray();
}

// --- markers ------------------------------------------------------------

export async function addMarker(params: {
  sessionId: string;
  offsetMs: number;
  sequenceNumber: number;
}): Promise<Marker> {
  const marker: Marker = {
    id: crypto.randomUUID(),
    sessionId: params.sessionId,
    offsetMs: params.offsetMs,
    capturedAt: nowIso(),
    sequenceNumber: params.sequenceNumber,
    source: "tap",
    syncStatus: "pending",
  };
  await db.markers.add(marker);
  return marker;
}

export async function countMarkers(sessionId: string): Promise<number> {
  return db.markers.where("sessionId").equals(sessionId).count();
}

export async function getMarkersForSession(
  sessionId: string
): Promise<Marker[]> {
  return db.markers
    .where("sessionId")
    .equals(sessionId)
    .sortBy("sequenceNumber");
}

export async function markMarkersSynced(sessionId: string): Promise<void> {
  await db.markers
    .where("sessionId")
    .equals(sessionId)
    .modify({ syncStatus: "synced" });
}

// --- audio chunks ---------------------------------------------------------

export async function addAudioChunk(params: {
  sessionId: string;
  chunkIndex: number;
  blob: Blob;
  mimeType: string;
  startOffsetMs: number;
}): Promise<void> {
  const chunk: AudioChunk = {
    id: `${params.sessionId}-${params.chunkIndex}`,
    sessionId: params.sessionId,
    chunkIndex: params.chunkIndex,
    blob: params.blob,
    mimeType: params.mimeType,
    sizeBytes: params.blob.size,
    startOffsetMs: params.startOffsetMs,
    capturedAt: nowIso(),
    uploaded: false,
  };
  await db.audioChunks.add(chunk);
}

export async function countChunks(sessionId: string): Promise<number> {
  return db.audioChunks.where("sessionId").equals(sessionId).count();
}

export async function getUnuploadedChunks(
  sessionId: string
): Promise<AudioChunk[]> {
  const chunks = await db.audioChunks
    .where("sessionId")
    .equals(sessionId)
    .sortBy("chunkIndex");
  return chunks.filter((chunk) => !chunk.uploaded);
}

export async function markChunkUploaded(chunkId: string): Promise<void> {
  await db.audioChunks.update(chunkId, { uploaded: true });
}

export async function deleteChunksForSession(
  sessionId: string
): Promise<void> {
  await db.audioChunks.where("sessionId").equals(sessionId).delete();
}

// --- upload queue ---------------------------------------------------------

export async function enqueueUpload(sessionId: string): Promise<void> {
  const existing = await db.uploadQueue
    .where("sessionId")
    .equals(sessionId)
    .first();
  if (existing) {
    await db.uploadQueue.update(existing.id, {
      status: "pending",
      updatedAt: nowIso(),
    });
    return;
  }

  const job: UploadQueueJob = {
    id: crypto.randomUUID(),
    sessionId,
    status: "pending",
    attempts: 0,
    lastAttemptAt: null,
    nextRetryAt: null,
    lastError: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.uploadQueue.add(job);
}

export async function getDueJobs(): Promise<UploadQueueJob[]> {
  const now = nowIso();
  const jobs = await db.uploadQueue
    .where("status")
    .anyOf("pending", "failed")
    .sortBy("createdAt");
  return jobs.filter((job) => !job.nextRetryAt || job.nextRetryAt <= now);
}

export async function markJobInProgress(jobId: string): Promise<void> {
  await db.uploadQueue.update(jobId, {
    status: "in-progress",
    lastAttemptAt: nowIso(),
    updatedAt: nowIso(),
  });
}

export async function markJobSynced(jobId: string): Promise<void> {
  await db.uploadQueue.update(jobId, {
    status: "synced",
    updatedAt: nowIso(),
  });
}

export async function markJobFailed(
  jobId: string,
  attempts: number,
  nextRetryAt: string,
  lastError: string
): Promise<void> {
  await db.uploadQueue.update(jobId, {
    status: "failed",
    attempts,
    nextRetryAt,
    lastError,
    updatedAt: nowIso(),
  });
}

export async function resetJobForRetry(jobId: string): Promise<void> {
  await db.uploadQueue.update(jobId, {
    status: "pending",
    nextRetryAt: null,
    updatedAt: nowIso(),
  });
}

export async function getJobForSession(
  sessionId: string
): Promise<UploadQueueJob | undefined> {
  return db.uploadQueue.where("sessionId").equals(sessionId).first();
}

export async function getAllFailedJobs(): Promise<UploadQueueJob[]> {
  return db.uploadQueue.where("status").equals("failed").toArray();
}
