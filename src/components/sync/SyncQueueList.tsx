"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { RetryButton } from "@/components/sync/RetryButton";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/format";

export function SyncQueueList() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy("startedAt").reverse().toArray(),
    []
  );
  const jobsBySessionId = useLiveQuery(async () => {
    const jobs = await db.uploadQueue.toArray();
    return new Map(jobs.map((job) => [job.sessionId, job]));
  }, []);

  if (!sessions) {
    return <p className="text-center text-sm text-neutral-500">Loading…</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className="text-center text-sm text-neutral-500">
        No shifts recorded yet.
      </p>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-3">
      {sessions.map((session) => {
        const job = jobsBySessionId?.get(session.id);
        return (
          <li
            key={session.id}
            className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-900">
                {formatDateTime(session.startedAt)}
              </span>
              <SyncStatusBadge status={session.syncStatus} />
            </div>
            <span className="text-sm text-neutral-500">
              Duration: {formatDuration(session.totalDurationMs)}
            </span>
            {session.syncStatus === "failed" && (
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500">
                  {session.syncError === "auth_expired"
                    ? "Log in again to sync"
                    : job?.nextRetryAt
                      ? `Next auto-retry ${formatRelativeTime(job.nextRetryAt)}`
                      : "Waiting to retry"}
                </span>
                <RetryButton sessionId={session.id} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
