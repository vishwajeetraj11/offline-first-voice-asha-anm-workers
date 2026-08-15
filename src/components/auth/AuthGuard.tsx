"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const setWorker = useAuthStore((state) => state.setWorker);

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
    if (session?.user) setWorker({ id: session.user.id, name: session.user.name, phoneNumber: "", facilityId: "" });
  }, [isPending, session, router, setWorker]);

  if (isPending || !session) return null;

  return <>{children}</>;
}
