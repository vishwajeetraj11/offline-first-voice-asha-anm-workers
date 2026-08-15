"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, LoaderCircle, LogOut, Mic2, UserRound } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export function AppHeader({ current }: { current: "shift" | "sync" | "review" }) {
  const router = useRouter();
  const worker = useAuthStore((state) => state.worker);
  const clearLocalAuth = useAuthStore((state) => state.logout);
  const showToast = useToastStore((state) => state.show);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message);
      clearLocalAuth();
      router.replace("/login");
      router.refresh();
    } catch {
      showToast("Could not log out. Check your connection and try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#d7ded4]/90 bg-[#f7f3e9]/95 backdrop-blur-sm">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/shift" className="group flex min-h-11 items-center gap-3 rounded-xl">
          <span className="grid size-10 place-items-center rounded-[14px] bg-[#176b5b] text-[#fffdf7] shadow-[0_3px_0_#0c5146]">
            <Mic2 aria-hidden="true" className="size-5" />
          </span>
          <span className="leading-none">
            <span className="font-display block text-lg font-semibold text-[#173b37]">Awaaz</span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.16em] text-[#60736e] sm:block">Field register</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-2xl bg-[#ebe8de] p-1">
          <Link
            href="/shift"
            aria-current={current === "shift" ? "page" : undefined}
            className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${current === "shift" ? "bg-[#fffdf7] text-[#173b37] shadow-sm" : "text-[#60736e] hover:text-[#173b37]"}`}
          >
            <Mic2 aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Shift</span>
          </Link>
          <Link
            href="/sync"
            aria-current={current === "sync" || current === "review" ? "page" : undefined}
            className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${current === "sync" || current === "review" ? "bg-[#fffdf7] text-[#173b37] shadow-sm" : "text-[#60736e] hover:text-[#173b37]"}`}
          >
            <Cloud aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Records</span>
          </Link>
        </nav>

        <div className="flex min-w-0 items-center gap-1 text-sm font-semibold text-[#526762]">
          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <UserRound aria-hidden="true" className="size-4" />
            <span className="max-w-28 truncate">{worker?.name ?? "Field worker"}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            aria-label={isSigningOut ? "Logging out" : "Log out"}
            title="Log out"
            className="ml-1 grid size-11 shrink-0 place-items-center rounded-xl text-[#526762] transition hover:bg-[#ebe8de] hover:text-[#173b37] disabled:cursor-wait disabled:text-[#9ca7a3]"
          >
            {isSigningOut ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <LogOut aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
