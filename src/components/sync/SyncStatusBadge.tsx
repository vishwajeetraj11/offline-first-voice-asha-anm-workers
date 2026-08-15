import type { SyncStatus } from "@/types/domain";

const STATUS_STYLES: Record<SyncStatus, { label: string; className: string }> = {
  pending: {
    label: "Saved here",
    className: "bg-[#ebe8de] text-[#526762]",
  },
  uploading: {
    label: "Uploading",
    className: "bg-[#e8edf2] text-[#38556b]",
  },
  synced: {
    label: "Ready",
    className: "bg-[#dceee7] text-[#0c5146]",
  },
  failed: {
    label: "Needs help",
    className: "bg-[#f4dba9] text-[#7c470c]",
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${className}`}
    >
      {status === "uploading" && (
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#466b85]" />
      )}
      {label}
    </span>
  );
}
