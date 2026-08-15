"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { ArrowUpRight, Clock3, Inbox, Radio } from "lucide-react";
import { db } from "@/lib/db/schema";
import { useAuthStore } from "@/store/authStore";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { RetryButton } from "@/components/sync/RetryButton";
import { DeleteFailedButton } from "@/components/sync/DeleteFailedButton";
import { LocalRecordingPreview } from "@/components/sync/LocalRecordingPreview";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/format";

export function SyncQueueList() {
  const workerId = useAuthStore((state) => state.worker?.id);
  const sessions = useLiveQuery(
    () => workerId ? db.sessions.where("workerId").equals(workerId).toArray() : [],
    [workerId]
  );
  const jobsBySessionId = useLiveQuery(async () => {
    if (!workerId) return new Map();
    const jobs = await db.uploadQueue.toArray();
    const sessionIds = new Set((await db.sessions.where("workerId").equals(workerId).primaryKeys()).map(String));
    return new Map(jobs.filter((job) => sessionIds.has(job.sessionId)).map((job) => [job.sessionId, job]));
  }, [workerId]);

  if (!sessions) {
    return <div className="h-40 animate-pulse rounded-[1.75rem] bg-[#ebe8de]" aria-label="Loading saved records" />;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-start rounded-[1.75rem] border border-dashed border-[#b8c5bf] bg-[#fffdf7] p-7 sm:p-10">
        <Inbox aria-hidden="true" className="size-8 text-[#176b5b]" />
        <h2 className="font-display mt-4 text-xl font-semibold text-[#173b37]">Your first recording will appear here.</h2>
        <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-[#60736e]">Start a shift, record your visits, and finish when the day is done. Awaaz will save it here automatically.</p>
        <Link href="/shift" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#176b5b] underline decoration-2 underline-offset-4">Go to shift</Link>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8a85]">History</p>
          <h2 className="font-display mt-1 text-xl font-semibold text-[#173b37]">Recent shifts</h2>
        </div>
        <span className="text-xs font-bold text-[#7b8a85]">{sessions.length} total</span>
      </div>
      <ul className="flex w-full flex-col gap-3">
      {[...sessions].sort((a, b) => Number(b.syncStatus === "failed") - Number(a.syncStatus === "failed")).map((session) => {
        const job = jobsBySessionId?.get(session.id);
        return (
          <li
            key={session.id}
            className={`flex flex-col gap-3 rounded-[1.5rem] border p-4 sm:p-5 ${session.syncStatus === "failed" ? "border-[#e5b77a] bg-[#fff8ed]" : "border-[#d7ded4] bg-[#fffdf7]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${session.syncStatus === "failed" ? "bg-[#f4dba9] text-[#7c470c]" : "bg-[#dceee7] text-[#176b5b]"}`}>
                  <Radio aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#173b37]">
                {formatDateTime(session.startedAt)}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#7b8a85]"><Clock3 aria-hidden="true" className="size-3.5" /> {formatDuration(session.totalDurationMs)}</span>
                </div>
              </div>
              <SyncStatusBadge status={session.syncStatus} />
            </div>
            {session.syncStatus !== "synced" && (
              <LocalRecordingPreview sessionId={session.id} />
            )}
            {session.syncStatus === "synced" && (
              <Link
                href={`/review/${session.id}`}
                className="mt-1 inline-flex min-h-11 items-center justify-between rounded-xl bg-[#e8f3ee] px-4 text-sm font-semibold text-[#0c5146] transition hover:bg-[#dceee7]"
              >
                Review visit register <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            )}
            {session.syncStatus === "failed" && (
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold leading-5 text-[#7c5a31]">
                  {session.syncError === "auth_expired"
                    ? "Log in again to sync"
                    : job?.nextRetryAt
                      ? `Next auto-retry ${formatRelativeTime(job.nextRetryAt)}`
                      : "Waiting to retry"}
                </span>
                <div className="flex items-center gap-2">
                  <RetryButton sessionId={session.id} />
                  <DeleteFailedButton sessionId={session.id} />
                </div>
              </div>
            )}
          </li>
        );
      })}
      </ul>
    </section>
  );
}
