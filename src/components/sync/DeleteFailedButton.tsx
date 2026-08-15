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
      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#9a3b33] underline-offset-4 hover:underline disabled:text-[#a99a97]"
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
