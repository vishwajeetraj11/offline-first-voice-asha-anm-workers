import { NextResponse } from "next/server";
import { appQuery, nowIso, withAppTransaction } from "@/lib/server/app-db";
import { requireAuth } from "@/lib/server/auth-session";
import { getStoredTranscript, parseVisits } from "@/lib/server/openai";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json()) as { totalChunks: number; totalDurationMs: number };
    const { rows: [record] } = await appQuery(
      "SELECT id FROM app_session WHERE id = $1 AND user_id = $2",
      [id, session.user.id],
    );
    if (!record) return NextResponse.json({ error: "not_found", message: "Session not found" }, { status: 404 });
    await appQuery(
      "UPDATE app_session SET total_duration_ms = $1, processing_status = 'processing', updated_at = $2 WHERE id = $3",
      [body.totalDurationMs, nowIso(), id],
    );

    const transcript = await getStoredTranscript(id);
    const { rows: markers } = await appQuery<{ sequenceNumber: number; offsetMs: number }>(
      `SELECT sequence_number AS "sequenceNumber", offset_ms AS "offsetMs"
       FROM app_marker WHERE session_id = $1 ORDER BY sequence_number`,
      [id],
    );
    const markerGuide = markers.length > 0
      ? `Explicit household markers (use these as boundary hints):\n${markers.map((marker) => `Marker ${marker.sequenceNumber} at ${marker.offsetMs}ms`).join("\n")}\n\n`
      : "No explicit household markers were captured; infer boundaries conservatively.\n\n";
    // A recording can contain only silence and still be uploaded correctly.
    // Complete it with no visit rows instead of asking the parser to infer
    // content from an empty transcript.
    const visits = transcript.trim()
      ? await parseVisits(`${markerGuide}Transcript:\n${transcript}`)
      : [];
    await withAppTransaction(async (client) => {
      await client.query("DELETE FROM visit_record WHERE session_id = $1", [id]);
      for (const visit of visits) {
        const status = visit.confidence < 0.75 || !visit.householdName || !visit.actionTaken ? "needs_review" : "ready";
        await client.query(
          `INSERT INTO visit_record
            (id, session_id, household_name, visit_category, symptoms_json, action_taken, next_visit_at, confidence, status, source_excerpt, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [crypto.randomUUID(), id, visit.householdName, visit.visitCategory, JSON.stringify(visit.symptoms), visit.actionTaken, visit.nextVisitAt, visit.confidence, status, visit.sourceExcerpt, nowIso()],
        );
      }
      await client.query(
        "UPDATE app_session SET transcript = $1, processing_status = 'done', updated_at = $2 WHERE id = $3",
        [transcript, nowIso(), id],
      );
      await client.query("DELETE FROM app_audio_chunk WHERE session_id = $1", [id]);
    });
    return NextResponse.json({ id, processingStatus: "done", visitCount: visits.length });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ error: "processing_failed", message }, { status: 500 });
  }
}
