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
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        {isRecording && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff7d70] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff7d70]" />
          </span>
        )}
        <span className={`text-sm font-semibold ${isRecording ? "text-[#dceee7]" : "text-[#60736e]"}`}>
          {isRecording ? "Recording now" : "Recording has not started"}
        </span>
      </div>
      <span className={`text-[clamp(3rem,10vw,5.5rem)] font-bold leading-none tracking-[-0.04em] tabular-nums ${isRecording ? "text-[#fffdf7]" : "text-[#173b37]"}`}>
        {formatDuration(elapsedMs)}
      </span>
      <span className={`text-xs font-medium uppercase tracking-[0.14em] ${isRecording ? "text-[#a7d4c7]" : "text-[#87938f]"}`}>
        Hours · minutes · seconds
      </span>
    </div>
  );
}
