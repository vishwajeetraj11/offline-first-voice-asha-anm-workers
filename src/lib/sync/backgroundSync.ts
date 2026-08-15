const SYNC_TAG = "upload-queue";

interface SyncManager {
  register(tag: string): Promise<void>;
}

// Progressive enhancement only (Chrome/Edge Android). Absent on Safari/iOS
// and Firefox — the `online` event listener + manual retry in
// src/lib/sync/useSyncEngine.ts are the primary, universally-supported
// triggers and must never depend on this succeeding.
export async function registerBackgroundSync(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const syncRegistration = registration as ServiceWorkerRegistration & {
      sync?: SyncManager;
    };
    if (!syncRegistration.sync) return false;

    await syncRegistration.sync.register(SYNC_TAG);
    return true;
  } catch {
    return false;
  }
}
