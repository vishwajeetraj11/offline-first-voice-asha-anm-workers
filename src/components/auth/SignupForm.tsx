"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const setWorker = useAuthStore((state) => state.setWorker);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#173b37]">
        Name
        <input required autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} className="field-control" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#173b37]">
        Email
        <input required type="email" autoComplete="email" placeholder="name@example.org" value={email} onChange={(event) => setEmail(event.target.value)} className="field-control" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#173b37]">
        Password
        <span className="relative">
          <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-control pr-14" />
          <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-[#60736e] hover:bg-[#ebe8de]">
            {showPassword ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
          </button>
        </span>
        <span className="text-xs font-semibold text-[#7b8a85]">Use at least 8 characters.</span>
      </label>
      {error && <p role="alert" className="rounded-xl bg-[#fff3f0] p-3 text-sm font-bold text-[#8e3029]">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? "Creating account…" : "Create account"}</Button>
    </form>
  );
}
