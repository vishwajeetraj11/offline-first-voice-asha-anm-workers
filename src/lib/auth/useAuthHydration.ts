"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

// zustand's `persist` middleware rehydrates the auth token from localStorage
// asynchronously, so `token` reads null for one tick even on an
// already-logged-in reload. Callers that redirect based on auth state must
// wait for this before deciding.
export function useAuthHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  return hasHydrated;
}
