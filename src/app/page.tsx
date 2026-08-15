"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthHydration } from "@/lib/auth/useAuthHydration";

export default function RootPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthHydration();

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(token ? "/shift" : "/login");
  }, [hasHydrated, token, router]);

  return null;
}
