"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, ClipboardCheck, LoaderCircle, Pencil, Save, ShieldAlert, UserRound, X } from "lucide-react";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftVisit, setDraftVisit] = useState<Visit | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}/visits`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load visit records");
        return response.json() as Promise<Visit[]>;
      })
      .then((records) => {
        setVisits(records);
        setSelectedId(records.find((visit) => visit.status === "needs_review")?.id ?? records[0]?.id ?? null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load visit records"))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const needsReview = useMemo(() => visits.filter((visit) => visit.status === "needs_review").length, [visits]);
  const selectedVisit = useMemo(() => visits.find((visit) => visit.id === selectedId) ?? null, [selectedId, visits]);
  const activeVisit = editingId === selectedId && draftVisit ? draftVisit : selectedVisit;
  const isEditing = editingId === selectedId && draftVisit !== null;

  function selectVisit(id: string) {
    if (editingId && editingId !== id) return;
    setSelectedId(id);
    setSavedId(null);
  }

  function startEditing(visit: Visit) {
    setDraftVisit({ ...visit, symptoms: [...visit.symptoms] });
    setEditingId(visit.id);
    setSavedId(null);
  }

  function cancelEditing() {
    setDraftVisit(null);
    setEditingId(null);
  }

  function updateDraft(patch: Partial<Visit>) {
    setDraftVisit((current) => current ? { ...current, ...patch } : current);
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
      setVisits((current) => current.map((item) => item.id === visit.id ? { ...visit, status: "ready" } : item));
      setSavedId(visit.id);
      setDraftVisit(null);
      setEditingId(null);
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
        <h1 className="font-display text-3xl font-semibold leading-tight text-[#173b37] sm:text-4xl">Review each patient.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#60736e]">
          Choose a name, check the details, and edit only when something needs correcting.
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

      {!isLoading && visits.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[#173b37]">Patients</h2>
              <span className="text-xs font-medium text-[#7b8a85]">{visits.length} total</span>
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {visits.map((visit, index) => {
                const isSelected = visit.id === selectedId;
                const isLocked = editingId !== null && editingId !== visit.id;
                return (
                  <li key={visit.id} className="shrink-0 lg:w-full">
                    <button
                      type="button"
                      onClick={() => selectVisit(visit.id)}
                      disabled={isLocked}
                      aria-pressed={isSelected}
                      className={`flex min-h-16 w-64 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition lg:w-full ${isSelected ? "border-[#176b5b] bg-[#e8f3ee]" : "border-[#d7ded4] bg-[#fffdf7] hover:border-[#9aaba5]"} disabled:cursor-not-allowed disabled:opacity-45`}
                    >
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${visit.status === "needs_review" ? "bg-[#f4dba9] text-[#7c470c]" : "bg-[#dceee7] text-[#0c5146]"}`}>
                        <UserRound aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#173b37]">{visit.householdName || `Unnamed patient ${index + 1}`}</span>
                        <span className="mt-1 block text-xs font-medium text-[#6f817c]">{visit.visitCategory} · {visit.status === "needs_review" ? "Needs review" : "Ready"}</span>
                      </span>
                      <ChevronRight aria-hidden="true" className={`size-4 shrink-0 ${isSelected ? "text-[#176b5b]" : "text-[#9aa5a1]"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
            {editingId && <p className="mt-3 text-xs font-medium leading-5 text-[#7c5a31]">Save or cancel this edit before choosing another patient.</p>}
          </aside>

          {activeVisit && (
            <section className={`min-w-0 rounded-[1.75rem] border bg-[#fffdf7] p-5 sm:p-7 ${activeVisit.status === "needs_review" ? "border-[#e5b77a]" : "border-[#d7ded4]"}`}>
              <header className="flex flex-col gap-4 border-b border-[#d7ded4] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8a85]">Patient details</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeVisit.status === "needs_review" ? "bg-[#f4dba9] text-[#7c470c]" : "bg-[#dceee7] text-[#0c5146]"}`}>{activeVisit.status === "needs_review" ? "Needs review" : "Ready"}</span>
                  </div>
                  <h2 className="font-display mt-2 truncate text-2xl font-semibold text-[#173b37]">{activeVisit.householdName || "Unnamed patient"}</h2>
                  <p className="mt-1 text-xs font-medium text-[#7b8a85]">{activeVisit.confidence >= 0.8 ? "Likely correct" : "Please confirm carefully"} · {Math.round(activeVisit.confidence * 100)}%</p>
                </div>
                {!isEditing ? (
                  <button type="button" onClick={() => startEditing(activeVisit)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#176b5b] px-4 text-sm font-semibold text-[#176b5b] hover:bg-[#e8f3ee] sm:w-auto">
                    <Pencil aria-hidden="true" className="size-4" /> Edit details
                  </button>
                ) : (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <button type="button" onClick={cancelEditing} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#60736e] hover:bg-[#ebe8de] sm:flex-none">
                      <X aria-hidden="true" className="size-4" /> Cancel
                    </button>
                    <button type="button" onClick={() => void saveVisit(activeVisit)} disabled={savingId === activeVisit.id} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#176b5b] px-5 text-sm font-semibold text-[#fffdf7] shadow-[0_3px_0_#0c5146] active:translate-y-1 active:shadow-none disabled:bg-[#b9c5c0] disabled:shadow-none sm:flex-none">
                      {savingId === activeVisit.id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}
                      {savingId === activeVisit.id ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                )}
              </header>

              {savedId === activeVisit.id && !isEditing && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-[#dceee7] px-4 py-3 text-sm font-semibold text-[#0c5146]"><ClipboardCheck aria-hidden="true" className="size-4" /> Changes saved</p>}

              <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
                <label className="text-sm font-semibold text-[#173b37]">
                  Patient / household name
                  <input readOnly={!isEditing} value={activeVisit.householdName || ""} onChange={(event) => updateDraft({ householdName: event.target.value })} placeholder="Enter name or household number" className="field-control mt-2 font-medium read-only:border-transparent read-only:bg-[#f0ede4] read-only:shadow-none" />
                </label>
                <label className="text-sm font-semibold text-[#173b37]">
                  Visit type
                  <select disabled={!isEditing} value={activeVisit.visitCategory} onChange={(event) => updateDraft({ visitCategory: event.target.value as Visit["visitCategory"] })} className="field-control mt-2 font-medium disabled:border-transparent disabled:bg-[#f0ede4] disabled:text-[#173b37] disabled:opacity-100">
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
                  <input readOnly={!isEditing} value={activeVisit.nextVisitAt || ""} onChange={(event) => updateDraft({ nextVisitAt: event.target.value })} placeholder="Not captured" className="field-control mt-2 font-medium read-only:border-transparent read-only:bg-[#f0ede4] read-only:shadow-none" />
                </label>
                <label className="text-sm font-semibold text-[#173b37] sm:col-span-2">
                  Symptoms
                  <textarea readOnly={!isEditing} value={activeVisit.symptoms.join(", ")} onChange={(event) => updateDraft({ symptoms: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="None captured" rows={2} className="field-control mt-2 resize-y font-medium read-only:border-transparent read-only:bg-[#f0ede4] read-only:shadow-none" />
                </label>
                <label className="text-sm font-semibold text-[#173b37] sm:col-span-2">
                  Action taken
                  <textarea readOnly={!isEditing} value={activeVisit.actionTaken || ""} onChange={(event) => updateDraft({ actionTaken: event.target.value })} placeholder="Not captured" rows={3} className="field-control mt-2 resize-y font-medium read-only:border-transparent read-only:bg-[#f0ede4] read-only:shadow-none" />
                </label>
              </form>

              {activeVisit.status === "needs_review" && activeVisit.sourceExcerpt && (
                <details className="mt-5 rounded-2xl bg-[#f4dba9]/55 p-4 text-sm text-[#653f0e]">
                  <summary className="min-h-8 cursor-pointer font-semibold">Show transcript evidence</summary>
                  <p className="mt-2 font-medium leading-6">{activeVisit.sourceExcerpt}</p>
                </details>
              )}
            </section>
          )}
        </div>
      )}
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return <AuthGuard><ReviewContent /></AuthGuard>;
}
