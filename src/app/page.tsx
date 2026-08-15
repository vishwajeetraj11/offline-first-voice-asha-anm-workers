"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { useAuthHydration } from "@/lib/auth/useAuthHydration";

export default function RootPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const worker = useAuthStore((state) => state.worker);
  const hasHydrated = useAuthHydration();

  useEffect(() => {
    if (session || (hasHydrated && worker)) {
      router.replace("/shift");
    } else if (!isPending) {
      router.replace("/login");
    }
  }, [hasHydrated, isPending, session, worker, router]);

  return null;
}
