"use client";

import { useToastStore } from "@/store/toastStore";

export function Toast() {
  const message = useToastStore((state) => state.message);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}
