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
      className="min-h-11 rounded-xl border-2 border-[#176b5b] bg-[#fffdf7] px-4 text-sm font-semibold text-[#176b5b] active:bg-[#dceee7] disabled:border-[#b9c5c0] disabled:text-[#899590]"
    >
      {isRetrying ? "Retrying…" : "Retry now"}
    </button>
  );
}
