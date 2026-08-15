import { db } from "@/lib/db/schema";
import {
  countMarkers,
  deleteChunksForSession,
  getMarkersForSession,
  getUnuploadedChunks,
  markChunkUploaded,
  markMarkersSynced,
} from "@/lib/db/queries";
import {
  createSessionRemote,
  endSessionRemote,
  finalizeSessionRemote,
  uploadMarkersRemote,
} from "@/lib/api/sessions";
import { uploadAudioChunkRemote } from "@/lib/api/uploads";
import type { Session } from "@/types/domain";

async function requireSession(sessionId: string): Promise<Session> {
  const session = await db.sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found locally`);
  }
  return session;
}

// Runs the full upload sequence for one session: idempotent session
// upsert -> resume unconfirmed audio chunks in order -> markers batch ->
// finalize. Every step is safe to re-run after a partial failure, since the
// contract requires each write endpoint to be idempotent.
export async function uploadSession(sessionId: string): Promise<void> {
  const session = await requireSession(sessionId);

  await createSessionRemote({
    id: session.id,
    workerId: session.workerId,
    startedAt: session.startedAt,
    deviceId: session.deviceId,
  });

  if (session.status !== "active") {
    const markerCount = await countMarkers(sessionId);
    await endSessionRemote(sessionId, {
      endedAt: session.endedAt ?? new Date().toISOString(),
      totalDurationMs: session.totalDurationMs,
      markerCount,
    });
  }

  const unuploadedChunks = await getUnuploadedChunks(sessionId);
  for (const chunk of unuploadedChunks) {
    await uploadAudioChunkRemote(sessionId, chunk);
    await markChunkUploaded(chunk.id);
  }

  const markers = await getMarkersForSession(sessionId);
  if (markers.length > 0) {
    await uploadMarkersRemote(sessionId, {
      markers: markers.map((marker) => ({
        id: marker.id,
        offsetMs: marker.offsetMs,
        capturedAt: marker.capturedAt,
        sequenceNumber: marker.sequenceNumber,
        source: marker.source,
      })),
    });
    await markMarkersSynced(sessionId);
  }

  // Total chunk count for the finalize call must reflect everything ever
  // captured for this session, not just what this run uploaded — a resumed
  // retry may have already confirmed earlier chunks in a prior attempt.
  const totalChunksSeen = await db.audioChunks
    .where("sessionId")
    .equals(sessionId)
    .count();

  await finalizeSessionRemote(sessionId, {
    totalChunks: totalChunksSeen,
    totalDurationMs: session.totalDurationMs,
  });

  await deleteChunksForSession(sessionId);
}
