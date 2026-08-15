"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useShiftRecording } from "@/lib/recording/useShiftRecording";
import { LiveIndicator } from "@/components/shift/LiveIndicator";
import { RecordButton } from "@/components/shift/RecordButton";
import { MarkerButton } from "@/components/shift/MarkerButton";
import { ShiftSummary } from "@/components/shift/ShiftSummary";

export default function ShiftPage() {
  const worker = useAuthStore((state) => state.worker);
  const { recordingState, elapsedMs, markerCount, start, stop, markHousehold } =
    useShiftRecording();

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <span className="text-sm font-medium text-neutral-700">
          {worker?.name ?? "Field worker"}
        </span>
        <Link
          href="/sync"
          className="text-sm font-semibold text-teal-700 underline-offset-2 hover:underline"
        >
          Sync status
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
        <LiveIndicator recordingState={recordingState} elapsedMs={elapsedMs} />
        <ShiftSummary markerCount={markerCount} />
      </div>

      <div className="flex flex-col gap-3 px-6 pb-10">
        <MarkerButton recordingState={recordingState} onMark={markHousehold} />
        <RecordButton
          recordingState={recordingState}
          onStart={start}
          onStop={stop}
        />
      </div>
    </main>
  );
}
