"use client";

import { useState } from "react";
import { CircleStop, LoaderCircle, Mic, RotateCcw, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RecordingState } from "@/store/recordingStore";

export function RecordButton({
  recordingState,
  onStart,
  onStop,
  onCancel,
  onRestart,
  hasCompletedRecording,
}: {
  recordingState: RecordingState;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onCancel: () => Promise<void>;
  onRestart: () => Promise<void>;
  hasCompletedRecording: boolean;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const isRecording = recordingState === "recording";

  async function handleClick() {
    setPermissionError(null);
    if (isRecording) {
      if (!isConfirmingStop) {
        setIsConfirmingStop(true);
        return;
      }
      setIsBusy(true);
      try {
        await onStop();
        setIsConfirmingStop(false);
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

  async function handleCancel() {
    if (!isConfirmingCancel) {
      setIsConfirmingCancel(true);
      return;
    }
    setIsBusy(true);
    try {
      await onCancel();
      setIsConfirmingCancel(false);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRestart() {
    if (!window.confirm("Discard this recording and start again?")) return;
    setIsBusy(true);
    try {
      await onRestart();
    } catch {
      setPermissionError("Couldn't restart the recording. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {isConfirmingStop && (
        <div className="mb-2 rounded-2xl border border-[#e1b0aa] bg-[#fff3f0] p-4 text-[#6e2d27]">
          <p className="font-display text-lg font-bold">Finish this shift?</p>
          <p className="mt-1 text-sm font-semibold leading-5">The recording will stop and move to your saved records.</p>
          <button type="button" onClick={() => setIsConfirmingStop(false)} className="mt-3 min-h-11 text-sm font-semibold underline underline-offset-4">
            Keep recording
          </button>
        </div>
      )}
      {isConfirmingCancel && (
        <div className="mb-2 rounded-2xl border border-[#e1b0aa] bg-[#fff3f0] p-4 text-[#6e2d27]">
          <p className="font-display text-lg font-bold">Discard this recording?</p>
          <p className="mt-1 text-sm font-semibold leading-5">The local audio and this shift will be permanently removed.</p>
          <button type="button" onClick={() => setIsConfirmingCancel(false)} className="mt-3 min-h-11 text-sm font-semibold underline underline-offset-4">
            Keep recording
          </button>
        </div>
      )}
      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={handleClick}
        disabled={isBusy}
        className="inline-flex items-center justify-center gap-3"
      >
        {isRecording ? <CircleStop aria-hidden="true" className="size-5" /> : <Mic aria-hidden="true" className="size-5" />}
        {isBusy
          ? "Please wait…"
          : isRecording
            ? isConfirmingStop ? "Yes, finish shift" : "Finish shift"
            : "Start recording"}
      </Button>
      {isRecording && (
        <button type="button" onClick={() => void handleCancel()} disabled={isBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 px-4 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:text-neutral-400">
          {isBusy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <X aria-hidden="true" className="size-4" />}
          {isConfirmingCancel ? "Yes, discard recording" : "Cancel recording"}
        </button>
      )}
      {!isRecording && hasCompletedRecording && (
        <button type="button" onClick={() => void handleRestart()} disabled={isBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-teal-700 px-4 text-sm font-bold text-teal-700 hover:bg-teal-50 disabled:border-neutral-300 disabled:text-neutral-400">
          {isBusy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <RotateCcw aria-hidden="true" className="size-4" />}
          Restart recording
        </button>
      )}
      {!isRecording && !permissionError && (
        <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs font-bold text-[#60736e]">
          <ShieldCheck aria-hidden="true" className="size-4 text-[#176b5b]" />
          Audio stays on this device until sync
        </p>
      )}
      {permissionError && (
        <p role="alert" className="rounded-xl bg-[#fff3f0] p-3 text-center text-sm font-bold text-[#8e3029]">
          {permissionError}
        </p>
      )}
    </div>
  );
}
