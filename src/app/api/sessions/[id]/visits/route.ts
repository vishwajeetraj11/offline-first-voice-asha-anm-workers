import { NextResponse } from "next/server";
import { appDb } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const visits = appDb.prepare(`SELECT v.id, v.household_name as householdName, v.symptoms_json as symptomsJson, v.action_taken as actionTaken, v.next_visit_at as nextVisitAt, v.confidence, v.status, v.source_excerpt as sourceExcerpt FROM visit_record v JOIN app_session s ON s.id = v.session_id WHERE v.session_id = ? AND s.user_id = ? ORDER BY v.created_at`).all(id, session.user.id) as Array<Record<string, unknown>>;
    return NextResponse.json(visits.map((visit) => ({ ...visit, symptoms: JSON.parse(String(visit.symptomsJson)), symptomsJson: undefined })));
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "visits_failed", message: "Could not read visit records" }, { status: 500 });
  }
}
