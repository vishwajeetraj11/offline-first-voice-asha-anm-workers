"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const router = useRouter();
  const setWorker = useAuthStore((state) => state.setWorker);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await signUp.email({ name, email, password });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.user) {
        setWorker({ id: response.data.user.id, name: response.data.user.name, phoneNumber: "", facilityId: "" });
      }
      router.push("/shift");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Name
        <input required value={name} onChange={(event) => setName(event.target.value)} className="min-h-14 rounded-xl border-2 border-neutral-300 px-4 text-lg focus:border-teal-700 focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Email
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-14 rounded-xl border-2 border-neutral-300 px-4 text-lg focus:border-teal-700 focus:outline-none" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        Password
        <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-14 rounded-xl border-2 border-neutral-300 px-4 text-lg focus:border-teal-700 focus:outline-none" />
      </label>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</Button>
    </form>
  );
}
