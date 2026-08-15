import type { SyncStatus } from "@/types/domain";

const STATUS_STYLES: Record<SyncStatus, { label: string; className: string }> = {
  pending: {
    label: "Waiting to upload",
    className: "bg-neutral-200 text-neutral-700",
  },
  uploading: {
    label: "Uploading",
    className: "bg-sky-100 text-sky-800",
  },
  synced: {
    label: "Uploaded",
    className: "bg-emerald-100 text-emerald-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status === "uploading" && (
        <span className="h-2 w-2 animate-pulse rounded-full bg-sky-600" />
      )}
      {label}
    </span>
  );
}
