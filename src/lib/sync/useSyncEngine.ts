"use client";

import { useEffect } from "react";
import { processQueue } from "@/lib/sync/engine";
import { registerBackgroundSync } from "@/lib/sync/backgroundSync";
import { SYNC_POLL_INTERVAL_MS } from "@/lib/constants";

// Mounted once at the app root. Wires up every trigger described in the
// sync engine plan: reconnect, foreground polling, SW background-sync
// nudges, and going-offline registration. Manual "Retry now" taps call
// processQueue()/retrySessionNow() directly from their own components.
export function useSyncEngine(): void {
  useEffect(() => {
    void processQueue();

    const handleOnline = () => {
      void processQueue();
    };
    const handleOffline = () => {
      void registerBackgroundSync();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const intervalId = window.setInterval(() => {
      void processQueue();
    }, SYNC_POLL_INTERVAL_MS);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PROCESS_UPLOAD_QUEUE") {
        void processQueue();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(intervalId);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);
}
