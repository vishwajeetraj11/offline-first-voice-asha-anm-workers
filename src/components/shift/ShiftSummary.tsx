"use client";

import { Home } from "lucide-react";

export function ShiftSummary({ markerCount, isRecording }: { markerCount: number; isRecording: boolean }) {
  return (
    <div className={`flex min-h-20 w-full items-center gap-3 rounded-2xl px-4 py-3 ${isRecording ? "bg-[#28554f] text-[#dceee7]" : "bg-[#f0ede4] text-[#526762]"}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${isRecording ? "bg-[#376a62]" : "bg-[#fffdf7]"}`}>
        <Home aria-hidden="true" className={`size-5 ${isRecording ? "text-[#f3bd5e]" : "text-[#b96d12]"}`} />
      </span>
      <span>
        <span className={`block text-2xl font-bold leading-none ${isRecording ? "text-[#fffdf7]" : "text-[#173b37]"}`}>{markerCount}</span>
        <span className="mt-1 block text-xs font-bold">household{markerCount === 1 ? "" : "s"} marked</span>
      </span>
    </div>
  );
}
