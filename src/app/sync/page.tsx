"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { retryAllNow } from "@/lib/sync/engine";
import { SyncQueueList } from "@/components/sync/SyncQueueList";

export default function SyncPage() {
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const failedCount = useLiveQuery(
    () => db.sessions.where("syncStatus").equals("failed").count(),
    []
  );

  async function handleRetryAll() {
    setIsRetryingAll(true);
    try {
      await retryAllNow();
    } finally {
      setIsRetryingAll(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <Link
          href="/shift"
          className="text-sm font-semibold text-teal-700 underline-offset-2 hover:underline"
        >
          Back to shift
        </Link>
        <h1 className="text-sm font-medium text-neutral-700">Sync status</h1>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 py-6">
        {!!failedCount && failedCount > 0 && (
          <button
            type="button"
            onClick={handleRetryAll}
            disabled={isRetryingAll}
            className="self-end rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300"
          >
            {isRetryingAll ? "Retrying…" : `Retry all (${failedCount})`}
          </button>
        )}
        <SyncQueueList />
      </div>
    </main>
  );
}
