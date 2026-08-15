"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { useAuthHydration } from "@/lib/auth/useAuthHydration";
import { clearAllLocalData } from "@/lib/db/queries";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const setWorker = useAuthStore((state) => state.setWorker);
  const worker = useAuthStore((state) => state.worker);
  const authExpired = useAuthStore((state) => state.authExpired);
  const hasHydrated = useAuthHydration();
  const hasOfflineAuth = hasHydrated && Boolean(worker) && !authExpired;

  useEffect(() => {
    if (session?.user) {
      const incomingWorker = {
        id: session.user.id,
        name: session.user.name,
        phoneNumber: "",
        facilityId: "",
      };

      if (!worker || worker.id !== incomingWorker.id) {
        if (worker) {
          void clearAllLocalData();
        }
        setWorker(incomingWorker);
      }
    }

    if (!isPending && !session && !hasOfflineAuth) router.replace("/login");
  }, [hasOfflineAuth, isPending, session, router, setWorker, worker]);

  if (!hasOfflineAuth && (isPending || !session)) return null;

  return <>{children}</>;
}
