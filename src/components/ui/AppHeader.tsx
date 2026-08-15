"use client";

import Link from "next/link";
import { Cloud, Mic2, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function AppHeader({ current }: { current: "shift" | "sync" | "review" }) {
  const worker = useAuthStore((state) => state.worker);

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

        <div className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-[#526762] md:flex">
          <UserRound aria-hidden="true" className="size-4" />
          <span className="max-w-36 truncate">{worker?.name ?? "Field worker"}</span>
        </div>
      </div>
    </header>
  );
}
