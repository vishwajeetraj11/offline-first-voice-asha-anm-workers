import Link from "next/link";
import { CloudOff, Mic2 } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center px-6 py-12 sm:items-center sm:text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#f4dba9] text-[#7c470c]"><CloudOff aria-hidden="true" className="size-7" /></span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">No connection</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-[#173b37]">This page needs internet once.</h1>
      <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-[#60736e]">
        This page hasn&apos;t been visited before, so it can&apos;t load without a
        connection. Recordings already in progress are unaffected — your
        shift keeps recording locally.
      </p>
      <Link href="/shift" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#176b5b] px-5 text-sm font-semibold text-[#fffdf7] shadow-[0_4px_0_#0c5146]"><Mic2 aria-hidden="true" className="size-4" /> Return to shift</Link>
    </main>
  );
}
