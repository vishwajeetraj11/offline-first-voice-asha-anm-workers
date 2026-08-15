"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session) router.replace("/shift");
  }, [session, router]);

  if (isPending || session) return null;

  return (
    <AuthShell eyebrow="Welcome back" title="Continue your field work." description="Log in to record today’s visits or check saved registers.">
        <LoginForm />
        <p className="mt-6 text-sm font-semibold text-[#60736e]">
          New here? <Link className="font-semibold text-[#176b5b] underline decoration-2 underline-offset-4" href="/signup">Create an account</Link>
        </p>
    </AuthShell>
  );
}
