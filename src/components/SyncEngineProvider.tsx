"use client";

import { useEffect, type ReactNode } from "react";
import { useSyncEngine } from "@/lib/sync/useSyncEngine";
import { useAuthStore } from "@/store/authStore";

export function SyncEngineProvider({ children }: { children: ReactNode }) {
  useSyncEngine();

  // Auth store hydration is skipped by default (see authStore.ts) to avoid
  // crashing on the server; trigger it once here, client-side only.
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
