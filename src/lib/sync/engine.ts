import {
  getAllFailedJobs,
  getDueJobs,
  getJobForSession,
  markJobFailed,
  markJobInProgress,
  markJobSynced,
  resetJobForRetry,
  setSessionSyncStatus,
} from "@/lib/db/queries";
import { uploadSession } from "@/lib/sync/uploader";
import { getBackoffDelayMs } from "@/lib/constants";
import { AuthExpiredError } from "@/lib/api/client";
import { canReachAppServer } from "@/lib/connectivity/network";
import type { UploadQueueJob } from "@/types/domain";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db/schema";

let isProcessing = false;

// Sequential, not parallel: mobile uplink is scarce and one flaky session
// should never block the rest of the queue, but two sessions racing for the
// same limited bandwidth doesn't help either. Also keeps the Pending ->
// Uploading -> Synced UI simple to reason about.
export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;
  try {
    if (!(await canReachAppServer())) return;

    const workerId = useAuthStore.getState().worker?.id;
    if (!workerId) return;
    const jobs = await getDueJobs(workerId);
    for (const job of jobs) {
      await processJob(job);
    }
  } finally {
    isProcessing = false;
  }
}

async function processJob(job: UploadQueueJob): Promise<void> {
  await markJobInProgress(job.id);
  await setSessionSyncStatus(job.sessionId, "uploading");

  try {
    await uploadSession(job.sessionId);
    await markJobSynced(job.id);
    await setSessionSyncStatus(job.sessionId, "synced");
  } catch (error) {
    if (error instanceof AuthExpiredError) {
      // Don't burn a backoff attempt on auth failures — recording is never
      // blocked by an expired token, only sync. Queue processing resumes
      // automatically once a fresh login succeeds (see AuthGuard / login flow).
      await resetJobForRetry(job.id);
      await setSessionSyncStatus(job.sessionId, "failed", "auth_expired");
      return;
    }

    const attempts = job.attempts + 1;
    const nextRetryAt = new Date(
      Date.now() + getBackoffDelayMs(attempts)
    ).toISOString();
    const message = error instanceof Error ? error.message : "Upload failed";

    await markJobFailed(job.id, attempts, nextRetryAt, message);
    await setSessionSyncStatus(job.sessionId, "failed", message);
  }
}

// Bypasses backoff for a manual "Retry now" tap on a specific session.
export async function retrySessionNow(sessionId: string): Promise<void> {
  const workerId = useAuthStore.getState().worker?.id;
  const localSession = await db.sessions.get(sessionId);
  if (!workerId || !localSession || localSession.workerId !== workerId) return;
  const job = await getJobForSession(sessionId);
  if (job) await resetJobForRetry(job.id);
  await setSessionSyncStatus(sessionId, "pending");
  await processQueue();
}

// Bypasses backoff for every currently-failed job at once ("Retry all").
export async function retryAllNow(): Promise<void> {
  const workerId = useAuthStore.getState().worker?.id;
  if (!workerId) return;
  const failedJobs = await getAllFailedJobs(workerId);
  for (const job of failedJobs) {
    await resetJobForRetry(job.id);
    await setSessionSyncStatus(job.sessionId, "pending");
  }
  await processQueue();
}
