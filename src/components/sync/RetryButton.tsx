"use client";

import { useState } from "react";
import { retrySessionNow } from "@/lib/sync/engine";

export function RetryButton({ sessionId }: { sessionId: string }) {
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleClick() {
    setIsRetrying(true);
    try {
      await retrySessionNow(sessionId);
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRetrying}
      className="rounded-lg border-2 border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 active:bg-teal-50 disabled:border-neutral-300 disabled:text-neutral-400"
    >
      {isRetrying ? "Retrying…" : "Retry now"}
    </button>
  );
}
