"use client";

export function ShiftSummary({ markerCount }: { markerCount: number }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-3">
      <span className="text-2xl font-bold text-neutral-900">{markerCount}</span>
      <span className="text-sm font-medium text-neutral-600">
        household{markerCount === 1 ? "" : "s"} marked this shift
      </span>
    </div>
  );
}
