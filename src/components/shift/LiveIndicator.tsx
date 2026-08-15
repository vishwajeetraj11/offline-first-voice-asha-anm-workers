"use client";

import type { RecordingState } from "@/store/recordingStore";
import { formatDuration } from "@/lib/format";

export function LiveIndicator({
  recordingState,
  elapsedMs,
}: {
  recordingState: RecordingState;
  elapsedMs: number;
}) {
  const isRecording = recordingState === "recording";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {isRecording && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          </span>
        )}
        <span className="text-sm font-medium text-neutral-500">
          {isRecording ? "Recording" : "Not recording"}
        </span>
      </div>
      <span className="font-mono text-5xl font-semibold tabular-nums text-neutral-900">
        {formatDuration(elapsedMs)}
      </span>
    </div>
  );
}
