"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session) router.replace("/shift");
  }, [session, router]);

  if (isPending || session) return null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
        <p className="text-sm text-neutral-500">Set up Voice Register for your field visits.</p>
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
        <p className="mt-5 text-center text-sm text-neutral-500">Already registered? <Link className="font-semibold text-teal-700" href="/login">Log in</Link></p>
      </div>
    </main>
  );
}
