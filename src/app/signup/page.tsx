"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session) router.replace("/shift");
  }, [session, router]);

  if (isPending || session) return null;

  return (
    <AuthShell eyebrow="First-time setup" title="Create your secure register." description="Set up Awaaz once, then keep recording even when the network is unreliable.">
      <SignupForm />
      <p className="mt-6 text-sm font-semibold text-[#60736e]">Already registered? <Link className="font-semibold text-[#176b5b] underline decoration-2 underline-offset-4" href="/login">Log in</Link></p>
    </AuthShell>
  );
}
