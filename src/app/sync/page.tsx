"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, CloudUpload, RefreshCw, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db/schema";
import { retryAllNow } from "@/lib/sync/engine";
import { SyncQueueList } from "@/components/sync/SyncQueueList";
import { AppHeader } from "@/components/ui/AppHeader";

export default function SyncPage() {
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const counts = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray();
    return {
      total: sessions.length,
      failed: sessions.filter((session) => session.syncStatus === "failed").length,
      waiting: sessions.filter((session) => session.syncStatus === "pending" || session.syncStatus === "uploading").length,
      synced: sessions.filter((session) => session.syncStatus === "synced").length,
    };
  }, []);
  const failedCount = counts?.failed ?? 0;

  async function handleRetryAll() {
    setIsRetryingAll(true);
    try {
      await retryAllNow();
    } finally {
      setIsRetryingAll(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppHeader current="sync" />
      <main className="page-shell flex flex-1 flex-col py-7 sm:py-10">
        <section className="grid gap-6 border-b border-[#d7ded4] pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Saved records</p>
            <h1 className="font-display mt-2 text-3xl font-semibold leading-tight text-[#173b37] sm:text-4xl">
              {failedCount > 0 ? `${failedCount} recording${failedCount === 1 ? "" : "s"} need help.` : (counts?.waiting ?? 0) > 0 ? "Your work is on its way." : "Your work is safe."}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#60736e]">
              Recordings stay on this device until upload finishes. You can start another shift at any time.
            </p>
          </div>
          {failedCount > 0 && (
          <button
            type="button"
            onClick={handleRetryAll}
            disabled={isRetryingAll}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl bg-[#176b5b] px-5 text-sm font-semibold text-[#fffdf7] shadow-[0_4px_0_#0c5146] transition active:translate-y-1 active:shadow-none disabled:bg-[#b9c5c0] disabled:shadow-none lg:self-end"
          >
            <RefreshCw aria-hidden="true" className={`size-4 ${isRetryingAll ? "animate-spin" : ""}`} />
            {isRetryingAll ? "Retrying…" : `Retry all (${failedCount})`}
          </button>
        )}
        </section>

        <section aria-label="Record summary" className="grid gap-3 py-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#dceee7] p-4 text-[#0c5146]">
            <CheckCircle2 aria-hidden="true" className="size-6" />
            <div><strong className="block text-xl leading-none">{counts?.synced ?? 0}</strong><span className="text-xs font-bold">Ready to review</span></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#e8edf2] p-4 text-[#38556b]">
            <CloudUpload aria-hidden="true" className="size-6" />
            <div><strong className="block text-xl leading-none">{counts?.waiting ?? 0}</strong><span className="text-xs font-bold">Waiting or uploading</span></div>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl p-4 ${failedCount ? "bg-[#fff0df] text-[#7c470c]" : "bg-[#ebe8de] text-[#60736e]"}`}>
            <ShieldAlert aria-hidden="true" className="size-6" />
            <div><strong className="block text-xl leading-none">{failedCount}</strong><span className="text-xs font-bold">Need attention</span></div>
          </div>
        </section>

        <SyncQueueList />
      </main>
    </div>
  );
}
