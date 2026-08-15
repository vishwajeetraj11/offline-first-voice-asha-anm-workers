import type { ReactNode } from "react";
import { Mic2, ShieldCheck, WifiOff } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh flex-1 bg-[#f7f3e9] lg:grid-cols-[minmax(24rem,0.9fr)_minmax(28rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[#173b37] p-10 text-[#fffdf7] lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden="true" className="absolute -right-28 -top-28 size-96 rounded-full border-[54px] border-[#28554f]" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#e29b2d] text-[#3e2a0d] shadow-[0_4px_0_#b96d12]"><Mic2 className="size-6" /></span>
          <div><p className="font-display text-2xl font-bold">Awaaz</p><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a7d4c7]">Field register</p></div>
        </div>

        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f3bd5e]">Made for the field</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.08] xl:text-5xl">Your visits, remembered as you work.</h2>
          <p className="mt-5 max-w-md text-base font-semibold leading-7 text-[#c8ddd7]">Record naturally, mark each household with one tap, and review the register when you are ready.</p>
        </div>

        <div className="relative flex flex-wrap gap-3 text-sm font-bold text-[#dceee7]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#28554f] px-4 py-2"><WifiOff className="size-4 text-[#f3bd5e]" /> Works offline</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#28554f] px-4 py-2"><ShieldCheck className="size-4 text-[#a7d4c7]" /> Saved on your device</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[15px] bg-[#176b5b] text-[#fffdf7] shadow-[0_3px_0_#0c5146]"><Mic2 className="size-5" /></span>
              <p className="font-display text-2xl font-bold text-[#173b37]">Awaaz</p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">{eyebrow}</p>
          <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-[#173b37] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-[#60736e]">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 flex items-start gap-2 border-t border-[#d7ded4] pt-5 text-xs font-semibold leading-5 text-[#7b8a85]"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#176b5b]" /> Your account protects access to sensitive field records. Never share your password.</p>
        </div>
      </section>
    </main>
  );
}
