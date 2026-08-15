"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

type Visit = {
  id: string;
  householdName: string | null;
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

  useEffect(() => {
    fetch(`/api/sessions/${params.id}/visits`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load visit records");
        return response.json() as Promise<Visit[]>;
      })
      .then(setVisits)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load visit records"));
  }, [params.id]);

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 py-6">
      <header className="flex items-center justify-between">
        <Link href="/sync" className="text-sm font-semibold text-teal-700">Back to sync</Link>
        <h1 className="text-lg font-bold text-neutral-900">Visit register</h1>
      </header>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && visits.length === 0 && <p className="text-sm text-neutral-500">No parsed visits yet.</p>}
      <div className="flex flex-col gap-3">
        {visits.map((visit, index) => (
          <article key={visit.id} className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-neutral-900">{visit.householdName || `Household ${index + 1}`}</h2>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${visit.status === "needs_review" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                {visit.status === "needs_review" ? "Needs review" : "Ready"}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-700">Symptoms: {visit.symptoms.length ? visit.symptoms.join(", ") : "None captured"}</p>
            <p className="mt-1 text-sm text-neutral-700">Action: {visit.actionTaken || "Not captured"}</p>
            <p className="mt-1 text-xs text-neutral-500">Confidence: {Math.round(visit.confidence * 100)}%</p>
            {visit.status === "needs_review" && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Transcript excerpt: {visit.sourceExcerpt}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return <AuthGuard><ReviewContent /></AuthGuard>;
}
