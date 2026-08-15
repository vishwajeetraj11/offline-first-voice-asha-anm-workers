"use client";

import { CloudOff, Footprints, ShieldCheck } from "lucide-react";
import { useShiftRecording } from "@/lib/recording/useShiftRecording";
import { AppHeader } from "@/components/ui/AppHeader";
import { LiveIndicator } from "@/components/shift/LiveIndicator";
import { RecordButton } from "@/components/shift/RecordButton";
import { MarkerButton } from "@/components/shift/MarkerButton";
import { ShiftSummary } from "@/components/shift/ShiftSummary";

export default function ShiftPage() {
  const { recordingState, elapsedMs, markerCount, start, stop, cancel, restart, hasCompletedRecording, markHousehold } =
    useShiftRecording();
  const isRecording = recordingState === "recording";

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppHeader current="shift" />
      <main className="page-shell flex flex-1 flex-col py-6 sm:py-10">
        <div className="grid flex-1 gap-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
          <section className={`relative flex min-h-[25rem] flex-col overflow-hidden rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8 ${isRecording ? "bg-[#173b37] text-[#fffdf7]" : "border border-[#d7ded4] bg-[#fffdf7]"}`}>
            <div aria-hidden="true" className={`absolute -right-16 -top-20 size-56 rounded-full border-[32px] ${isRecording ? "border-[#28554f]" : "border-[#e7eee9]"}`} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isRecording ? "text-[#a7d4c7]" : "text-[#176b5b]"}`}>
                  Today&apos;s field shift
                </p>
                <h1 className={`font-display mt-2 max-w-md text-3xl font-semibold leading-[1.08] sm:text-4xl ${isRecording ? "text-[#fffdf7]" : "text-[#173b37]"}`}>
                  {isRecording ? "Your register is listening." : "Ready when you are."}
                </h1>
              </div>
              <span className={`hidden rounded-full px-3 py-2 text-xs font-bold sm:inline-flex ${isRecording ? "bg-[#28554f] text-[#dceee7]" : "bg-[#dceee7] text-[#0c5146]"}`}>
                {isRecording ? "Live" : "Ready"}
              </span>
            </div>

            <div className="relative my-auto py-8">
              <LiveIndicator recordingState={recordingState} elapsedMs={elapsedMs} />
            </div>

            <div className="relative grid gap-3 sm:grid-cols-2">
              <ShiftSummary markerCount={markerCount} isRecording={isRecording} />
              <div className={`flex min-h-20 items-center gap-3 rounded-2xl px-4 py-3 ${isRecording ? "bg-[#28554f] text-[#dceee7]" : "bg-[#f0ede4] text-[#526762]"}`}>
                {isRecording ? <ShieldCheck aria-hidden="true" className="size-6 shrink-0 text-[#a7d4c7]" /> : <CloudOff aria-hidden="true" className="size-6 shrink-0 text-[#176b5b]" />}
                <p className="text-sm font-semibold leading-5">
                  {isRecording ? "Saved continuously on this device" : "Works even without internet"}
                </p>
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-end gap-4 rounded-[2rem] bg-[#efe8d8] p-5 sm:p-6">
            <div className="mb-auto hidden lg:block">
              <Footprints aria-hidden="true" className="size-7 text-[#b96d12]" />
              <h2 className="font-display mt-4 text-xl font-semibold text-[#173b37]">Keep moving.</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#60736e]">
                Tap once at every new household. Awaaz keeps the boundary with your recording.
              </p>
            </div>
            <MarkerButton recordingState={recordingState} onMark={markHousehold} />
            <RecordButton
              recordingState={recordingState}
              onStart={start}
              onStop={stop}
              onCancel={cancel}
              onRestart={restart}
              hasCompletedRecording={hasCompletedRecording}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
