/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Progressive enhancement only (Chrome/Edge Android): nudge any open tab to
// run the sync queue sooner when the browser fires a background sync event.
// The tab-open `online` event listener + manual retry (src/lib/sync/engine.ts)
// remain the primary, universally-supported sync triggers.
self.addEventListener("sync", (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag !== "upload-queue") return;

  syncEvent.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: "PROCESS_UPLOAD_QUEUE" });
      }
    })
  );
});

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}
