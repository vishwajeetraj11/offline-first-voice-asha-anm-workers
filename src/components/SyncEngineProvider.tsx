"use client";

import type { ReactNode } from "react";
import { useSyncEngine } from "@/lib/sync/useSyncEngine";

export function SyncEngineProvider({ children }: { children: ReactNode }) {
  useSyncEngine();
  return <>{children}</>;
}
