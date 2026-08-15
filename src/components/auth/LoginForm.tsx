"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";

export function LoginForm() {
  const router = useRouter();
  const storeLogin = useAuthStore((state) => state.login);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await login({ phoneNumber, pin });
      storeLogin(response.token, response.worker);
      router.push("/shift");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof TypeError) {
        setError("Can't reach the server. Check your connection and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="phoneNumber" className="text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          className="min-h-14 rounded-xl border-2 border-neutral-300 px-4 text-lg focus:border-teal-700 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pin" className="text-sm font-medium text-neutral-700">
          PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          required
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="min-h-14 rounded-xl border-2 border-neutral-300 px-4 text-lg focus:border-teal-700 focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
