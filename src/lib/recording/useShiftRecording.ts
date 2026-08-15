"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useToastStore } from "@/store/toastStore";
import { ShiftRecorder } from "@/lib/recording/recorder";
import { markHouseholdBoundary } from "@/lib/recording/markers";
import {
  createSession,
  discardSessionLocally,
  endSession,
  enqueueUpload,
  findActiveOrphanSessions,
  markSessionInterrupted,
} from "@/lib/db/queries";
import { createSessionRemote, deleteSessionRemote } from "@/lib/api/sessions";
import { processQueue } from "@/lib/sync/engine";
import { getOrCreateDeviceId } from "@/lib/deviceId";

function formatMinutes(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function useShiftRecording() {
  const recorderRef = useRef<ShiftRecorder | null>(null);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const worker = useAuthStore((state) => state.worker);
  const showToast = useToastStore((state) => state.show);

  const recordingState = useRecordingStore((state) => state.recordingState);
  const activeSessionId = useRecordingStore((state) => state.activeSessionId);
  const sessionStartTimestamp = useRecordingStore(
    (state) => state.sessionStartTimestamp
  );
  const elapsedMs = useRecordingStore((state) => state.elapsedMs);
  const markerCount = useRecordingStore((state) => state.markerCount);
  const startRecordingAction = useRecordingStore((state) => state.startRecording);
  const tickElapsed = useRecordingStore((state) => state.tickElapsed);
  const incrementMarkerCount = useRecordingStore(
    (state) => state.incrementMarkerCount
  );
  const resetRecordingState = useRecordingStore((state) => state.reset);

  // Crash/reload recovery: a tab that was killed or evicted mid-recording
  // leaves a `sessions` row with status "active" and no `endedAt`, but the
  // in-memory recordingStore is reset to "idle" on reload. Sweep for those
  // orphans once on mount and hand off whatever was captured to the sync
  // queue rather than silently losing it.
  useEffect(() => {
    void (async () => {
      const orphans = await findActiveOrphanSessions();
      for (const orphan of orphans) {
        await markSessionInterrupted(orphan.id, orphan.totalDurationMs);
        await enqueueUpload(orphan.id);
        showToast(
          `Previous recording saved (${formatMinutes(orphan.totalDurationMs)}) — start a new shift to continue`
        );
      }
      if (orphans.length > 0) void processQueue();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recordingState !== "recording") return;
    const intervalId = window.setInterval(() => {
      const recorder = recorderRef.current;
      if (recorder) tickElapsed(recorder.getElapsedMs());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [recordingState, tickElapsed]);

  const start = useCallback(async () => {
    if (!worker || recorderRef.current) return;

    const sessionId = crypto.randomUUID();
    setCompletedSessionId(null);
    const sessionStart = Date.now();
    const startedAt = new Date(sessionStart).toISOString();
    const deviceId = getOrCreateDeviceId();

    await createSession({
      id: sessionId,
      workerId: worker.id,
      deviceId,
      startedAt,
    });

    // Best-effort — failure here is expected while offline. The sync engine
    // re-issues this idempotently once the shift ends and gets queued.
    void createSessionRemote({
      id: sessionId,
      workerId: worker.id,
      startedAt,
      deviceId,
    }).catch(() => {});

    const recorder = new ShiftRecorder(sessionId, sessionStart);
    await recorder.start();
    recorderRef.current = recorder;
    startRecordingAction(sessionId);
  }, [worker, startRecordingAction]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || !activeSessionId) return;

    await recorder.stop();
    await endSession(activeSessionId, recorder.getElapsedMs());
    await enqueueUpload(activeSessionId);

    recorderRef.current = null;
    setCompletedSessionId(activeSessionId);
    resetRecordingState();
    void processQueue();
  }, [activeSessionId, resetRecordingState]);

  const cancel = useCallback(async () => {
    const recorder = recorderRef.current;
    const sessionId = activeSessionId;
    if (!recorder || !sessionId) return;
    await recorder.stop();
    recorderRef.current = null;
    await discardSessionLocally(sessionId);
    void deleteSessionRemote(sessionId).catch(() => {});
    resetRecordingState();
  }, [activeSessionId, resetRecordingState]);

  const restart = useCallback(async () => {
    if (!completedSessionId) return;
    const sessionId = completedSessionId;
    await discardSessionLocally(sessionId);
    void deleteSessionRemote(sessionId).catch(() => {});
    setCompletedSessionId(null);
    await start();
  }, [completedSessionId, start]);

  const markHousehold = useCallback(async () => {
    if (!activeSessionId || !sessionStartTimestamp) return;
    await markHouseholdBoundary(activeSessionId, sessionStartTimestamp);
    incrementMarkerCount();
    showToast(`Household #${markerCount + 1} marked`);
  }, [
    activeSessionId,
    sessionStartTimestamp,
    incrementMarkerCount,
    markerCount,
    showToast,
  ]);

  return {
    recordingState,
    elapsedMs,
    markerCount,
    start,
    stop,
    cancel,
    restart,
    hasCompletedRecording: Boolean(completedSessionId),
    markHousehold,
  };
}
