import { NextResponse } from "next/server";
import { appQuery } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const { rows: visits } = await appQuery<Record<string, unknown>>(`
      SELECT
        v.id,
        v.household_name AS "householdName",
        v.visit_category AS "visitCategory",
        v.symptoms_json AS "symptomsJson",
        v.action_taken AS "actionTaken",
        v.next_visit_at AS "nextVisitAt",
        v.confidence,
        v.status,
        v.source_excerpt AS "sourceExcerpt"
      FROM visit_record v
      JOIN app_session s ON s.id = v.session_id
      WHERE v.session_id = $1 AND s.user_id = $2
      ORDER BY v.created_at
    `, [id, session.user.id]);
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

    const { rows: [owned] } = await appQuery(`
      SELECT v.id FROM visit_record v
      JOIN app_session s ON s.id = v.session_id
      WHERE v.id = $1 AND v.session_id = $2 AND s.user_id = $3
    `, [body.visitId, id, session.user.id]);
    if (!owned) return NextResponse.json({ error: "not_found", message: "Visit record not found" }, { status: 404 });

    const symptoms = body.symptoms
      .filter((symptom): symptom is string => typeof symptom === "string")
      .map((symptom) => symptom.trim())
      .filter(Boolean);
    await appQuery(`
      UPDATE visit_record
      SET household_name = $1, visit_category = $2, symptoms_json = $3, action_taken = $4, next_visit_at = $5, status = 'ready'
      WHERE id = $6
    `, [
      body.householdName?.trim() || null,
      body.visitCategory,
      JSON.stringify(symptoms),
      body.actionTaken?.trim() || null,
      body.nextVisitAt?.trim() || null,
      body.visitId,
    ]);
    return NextResponse.json({ saved: true, status: "ready" });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "visit_update_failed", message: "Could not save visit record" }, { status: 500 });
  }
}
