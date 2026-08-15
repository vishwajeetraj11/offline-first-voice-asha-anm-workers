"use client";

import type { RecordingState } from "@/store/recordingStore";

// A single tap, no confirm step — this must stay true 1-tap so a worker can
// mark a household boundary without breaking stride between doorsteps.
export function MarkerButton({
  recordingState,
  onMark,
}: {
  recordingState: RecordingState;
  onMark: () => Promise<void>;
}) {
  const disabled = recordingState !== "recording";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void onMark()}
      className="min-h-16 w-full rounded-xl bg-amber-500 px-6 text-xl font-bold text-white shadow-sm transition-colors active:bg-amber-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      + New Household
    </button>
  );
}
