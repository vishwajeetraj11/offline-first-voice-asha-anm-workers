"use client";

import { useToastStore } from "@/store/toastStore";

export function Toast() {
  const message = useToastStore((state) => state.message);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-[#173b37] px-5 py-4 text-center text-sm font-bold text-[#fffdf7] shadow-[0_12px_30px_rgba(23,59,55,0.24)]"
    >
      {message}
    </div>
  );
}
