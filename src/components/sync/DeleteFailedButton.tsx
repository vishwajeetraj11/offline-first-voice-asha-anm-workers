"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteFailedSession } from "@/lib/db/queries";

export function DeleteFailedButton({ sessionId }: { sessionId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm("Delete this failed recording and its local audio?")) return;

    setIsDeleting(true);
    try {
      await deleteFailedSession(sessionId);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDeleting}
      aria-label="Delete failed recording"
      title="Delete failed recording"
      className="inline-flex items-center gap-2 rounded-lg border-2 border-red-700 px-4 py-2 text-sm font-semibold text-red-700 active:bg-red-50 disabled:border-neutral-300 disabled:text-neutral-400"
    >
      {isDeleting ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Trash2 aria-hidden="true" className="size-4" />
      )}
      {isDeleting ? "Deleting…" : "Delete"}
    </button>
  );
}
