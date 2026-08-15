"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RecordingState } from "@/store/recordingStore";

export function RecordButton({
  recordingState,
  onStart,
  onStop,
}: {
  recordingState: RecordingState;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const isRecording = recordingState === "recording";

  async function handleClick() {
    setPermissionError(null);
    if (isRecording) {
      if (!window.confirm("End shift and stop recording?")) return;
      setIsBusy(true);
      try {
        await onStop();
      } finally {
        setIsBusy(false);
      }
      return;
    }

    setIsBusy(true);
    try {
      await onStart();
    } catch {
      setPermissionError(
        "Couldn't access the microphone. Check app permissions and try again."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={handleClick}
        disabled={isBusy}
      >
        {isBusy
          ? "Please wait…"
          : isRecording
            ? "End Shift"
            : "Start Shift"}
      </Button>
      {permissionError && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {permissionError}
        </p>
      )}
    </div>
  );
}
