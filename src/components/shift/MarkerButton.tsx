"use client";

import type { RecordingState } from "@/store/recordingStore";
import { MapPinPlus } from "lucide-react";

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
      className="flex min-h-20 w-full items-center justify-center gap-3 rounded-2xl bg-[#e29b2d] px-6 text-base font-semibold text-[#3e2a0d] shadow-[0_5px_0_#b96d12] transition hover:bg-[#e9a83e] active:translate-y-1 active:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#d7d4ca] disabled:text-[#8b918e] disabled:shadow-none"
    >
      <MapPinPlus aria-hidden="true" className="size-6" />
      Mark new household
    </button>
  );
}
