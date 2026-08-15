"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthHydration } from "@/lib/auth/useAuthHydration";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthHydration();

  useEffect(() => {
    if (hasHydrated && token) router.replace("/shift");
  }, [hasHydrated, token, router]);

  if (!hasHydrated || token) return null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Voice Register</h1>
        <p className="text-sm text-neutral-500">
          Log in to start recording your shift.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
