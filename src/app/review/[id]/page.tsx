"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ClipboardCheck, LoaderCircle, Save, ShieldAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/ui/AppHeader";

type Visit = {
  id: string;
  householdName: string | null;
  visitCategory: "HBNC" | "HBYC" | "ANC" | "PNC" | "Immunization" | "General";
  symptoms: string[];
  actionTaken: string | null;
  nextVisitAt: string | null;
  confidence: number;
  status: "ready" | "needs_review";
  sourceExcerpt: string;
};

function ReviewContent() {
  const params = useParams<{ id: string }>();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}/visits`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load visit records");
        return response.json() as Promise<Visit[]>;
      })
      .then(setVisits)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load visit records"))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const needsReview = useMemo(() => visits.filter((visit) => visit.status === "needs_review").length, [visits]);

  function updateVisit(id: string, patch: Partial<Visit>) {
    setVisits((current) => current.map((visit) => visit.id === id ? { ...visit, ...patch } : visit));
    setSavedId(null);
  }

  async function saveVisit(visit: Visit) {
    setSavingId(visit.id);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${params.id}/visits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: visit.id,
          householdName: visit.householdName,
          visitCategory: visit.visitCategory,
          symptoms: visit.symptoms,
          actionTaken: visit.actionTaken,
          nextVisitAt: visit.nextVisitAt,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message || "Could not save visit record");
      }
      setVisits((current) => current.map((item) => item.id === visit.id ? { ...item, status: "ready" } : item));
      setSavedId(visit.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save visit record");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppHeader current="review" />
      <main className="page-shell flex flex-1 flex-col gap-6 py-7 sm:py-10">
      <Link href="/sync" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl text-sm font-semibold text-[#176b5b] hover:underline hover:underline-offset-4">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to saved records
      </Link>

      <section className="grid gap-5 border-b border-[#d7ded4] pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Before submission</p>
        <h1 className="font-display text-3xl font-semibold leading-tight text-[#173b37] sm:text-4xl">Check the day&apos;s visits.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#60736e]">
          Confirm the highlighted records. Saving a correction marks that visit ready.
        </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#dceee7] px-4 py-2.5 text-[#0c5146]">
            <Check aria-hidden="true" className="size-4" /> {visits.length - needsReview} ready
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 ${needsReview ? "bg-[#f4dba9] text-[#7c470c]" : "bg-[#ebe8de] text-[#60736e]"}`}>
            <ShieldAlert aria-hidden="true" className="size-4" /> {needsReview} needs review
          </span>
        </div>
      </section>

      {error && <p role="alert" className="rounded-2xl bg-[#fff3f0] p-4 text-sm font-bold text-[#8e3029]">{error}</p>}
      {isLoading && <div className="h-48 animate-pulse rounded-[1.75rem] bg-[#ebe8de]" aria-label="Loading visit register" />}
      {!isLoading && !error && visits.length === 0 && <div className="rounded-[1.75rem] border border-dashed border-[#b8c5bf] bg-[#fffdf7] p-8"><h2 className="font-display text-2xl font-bold text-[#173b37]">No visits are ready yet.</h2><p className="mt-2 text-sm font-semibold text-[#60736e]">Processing can take a little time. Return to saved records and check again shortly.</p></div>}

      <div className="flex flex-col gap-5">
        {visits.map((visit, index) => {
          const isSaving = savingId === visit.id;
          const isNeedsReview = visit.status === "needs_review";
          return (
            <article key={visit.id} className={`rounded-[1.75rem] border p-5 sm:p-6 ${isNeedsReview ? "border-[#e5b77a] bg-[#fff8ed]" : "border-[#d7ded4] bg-[#fffdf7]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8a85]">Visit {index + 1}</p>
                  <h2 className="font-display mt-1 text-xl font-semibold text-[#173b37]">{visit.householdName || "Unnamed household"}</h2>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${isNeedsReview ? "bg-[#f4dba9] text-[#7c470c]" : "bg-[#dceee7] text-[#0c5146]"}`}>
                  {isNeedsReview ? "Needs review" : "Ready"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#173b37]">
                  Household / person name
                  <input
                    value={visit.householdName || ""}
                    onChange={(event) => updateVisit(visit.id, { householdName: event.target.value })}
                    placeholder="Enter name or household number"
                    className="field-control mt-2 font-medium"
                  />
                </label>
                <label className="text-sm font-semibold text-[#173b37]">
                  Visit type
                  <select
                    value={visit.visitCategory}
                    onChange={(event) => updateVisit(visit.id, { visitCategory: event.target.value as Visit["visitCategory"] })}
                    className="field-control mt-2 font-medium"
                  >
                    <option value="HBNC">HBNC — newborn/mother</option>
                    <option value="HBYC">HBYC — young-child follow-up</option>
                    <option value="ANC">ANC — antenatal care</option>
                    <option value="PNC">PNC — postnatal care</option>
                    <option value="Immunization">Immunization — vaccination</option>
                    <option value="General">General — other visit</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-[#173b37]">
                  Next visit
                  <input
                    value={visit.nextVisitAt || ""}
                    onChange={(event) => updateVisit(visit.id, { nextVisitAt: event.target.value })}
                    placeholder="e.g. 15 August"
                    className="field-control mt-2 font-medium"
                  />
                </label>
                <label className="text-sm font-semibold text-[#173b37] sm:col-span-2">
                  Symptoms
                  <textarea
                    value={visit.symptoms.join(", ")}
                    onChange={(event) => updateVisit(visit.id, { symptoms: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                    placeholder="Separate multiple symptoms with commas"
                    rows={2}
                    className="field-control mt-2 resize-y font-medium"
                  />
                </label>
                <label className="text-sm font-semibold text-[#173b37] sm:col-span-2">
                  Action taken
                  <textarea
                    value={visit.actionTaken || ""}
                    onChange={(event) => updateVisit(visit.id, { actionTaken: event.target.value })}
                    placeholder="What advice, medicine, referral, or follow-up was given?"
                    rows={2}
                    className="field-control mt-2 resize-y font-medium"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-[#d7ded4] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold text-[#7b8a85]">{visit.confidence >= 0.8 ? "Likely correct" : "Please confirm carefully"} · {Math.round(visit.confidence * 100)}%</p>
                <button type="button" onClick={() => void saveVisit(visit)} disabled={isSaving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176b5b] px-5 text-sm font-semibold text-[#fffdf7] shadow-[0_4px_0_#0c5146] transition active:translate-y-1 active:shadow-none disabled:bg-[#b9c5c0] disabled:shadow-none sm:w-auto">
                  {isSaving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : savedId === visit.id ? <ClipboardCheck aria-hidden="true" className="size-4" /> : <Save aria-hidden="true" className="size-4" />}
                  {isSaving ? "Saving…" : savedId === visit.id ? "Saved" : "Save correction"}
                </button>
              </div>

              {isNeedsReview && visit.sourceExcerpt && (
                <details className="mt-4 rounded-2xl bg-[#f4dba9]/55 p-4 text-sm text-[#653f0e]">
                  <summary className="min-h-8 cursor-pointer font-semibold">Listen to what was understood</summary>
                  <p className="mt-2 font-semibold leading-6">{visit.sourceExcerpt}</p>
                </details>
              )}
            </article>
          );
        })}
      </div>
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return <AuthGuard><ReviewContent /></AuthGuard>;
}
