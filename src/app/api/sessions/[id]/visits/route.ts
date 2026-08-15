import { NextResponse } from "next/server";
import { appDb } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const visits = appDb.prepare(`SELECT v.id, v.household_name as householdName, v.visit_category as visitCategory, v.symptoms_json as symptomsJson, v.action_taken as actionTaken, v.next_visit_at as nextVisitAt, v.confidence, v.status, v.source_excerpt as sourceExcerpt FROM visit_record v JOIN app_session s ON s.id = v.session_id WHERE v.session_id = ? AND s.user_id = ? ORDER BY v.created_at`).all(id, session.user.id) as Array<Record<string, unknown>>;
    return NextResponse.json(visits.map((visit) => ({ ...visit, symptoms: JSON.parse(String(visit.symptomsJson)), symptomsJson: undefined })));
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "visits_failed", message: "Could not read visit records" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await request.json() as {
      visitId?: string;
      householdName?: string | null;
      visitCategory?: string;
      symptoms?: string[];
      actionTaken?: string | null;
      nextVisitAt?: string | null;
    };
    const validCategories = ["HBNC", "HBYC", "ANC", "PNC", "Immunization", "General"];
    if (!body.visitId || !Array.isArray(body.symptoms) || !validCategories.includes(body.visitCategory || "")) {
      return NextResponse.json({ error: "invalid_request", message: "visitId and symptoms are required" }, { status: 400 });
    }

    const owned = appDb.prepare(`
      SELECT v.id FROM visit_record v
      JOIN app_session s ON s.id = v.session_id
      WHERE v.id = ? AND v.session_id = ? AND s.user_id = ?
    `).get(body.visitId, id, session.user.id);
    if (!owned) return NextResponse.json({ error: "not_found", message: "Visit record not found" }, { status: 404 });

    const symptoms = body.symptoms
      .filter((symptom): symptom is string => typeof symptom === "string")
      .map((symptom) => symptom.trim())
      .filter(Boolean);
    appDb.prepare(`
      UPDATE visit_record
      SET household_name = ?, visit_category = ?, symptoms_json = ?, action_taken = ?, next_visit_at = ?, status = 'ready'
      WHERE id = ?
    `).run(
      body.householdName?.trim() || null,
      body.visitCategory,
      JSON.stringify(symptoms),
      body.actionTaken?.trim() || null,
      body.nextVisitAt?.trim() || null,
      body.visitId,
    );
    return NextResponse.json({ saved: true, status: "ready" });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "visit_update_failed", message: "Could not save visit record" }, { status: 500 });
  }
}
